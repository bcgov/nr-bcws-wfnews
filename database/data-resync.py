import requests
from requests.auth import HTTPBasicAuth
import sys
import time
import uuid
import datetime
import json
import os
import botocore 
import botocore.session 
from aws_secretsmanager_caching import SecretCache, SecretCacheConfig

def lambda_handler(event, context):
  try:
    # load configurations from aws secrets manager
    client = botocore.session.get_session().create_client('secretsmanager')
    cache_config = SecretCacheConfig()
    cache = SecretCache( config = cache_config, client = client)

    secret = json.loads(cache.get_secret_string(os.environ.get('SECRET_NAME')))

    # Token service, for fetching a token
    token_service = secret['token-service']
    # Client, use Basic Auth
    client_name = secret['client-name']
    client_secret = secret['client-secret']
    # WFIM API
    wfim_api = secret['wfim-api']
    # WFNEWS API
    wfnews_api = secret['wfnews-api']
    # WFDM API
    wfdm_api = 'https://i1bcwsapi.nrs.gov.bc.ca/wfdm-document-management-api/'

    print('Fetching a token from OAUTH...')
    token_response = requests.get(token_service, auth=HTTPBasicAuth(client_name, client_secret))
    # verify 200
    if token_response.status_code != 200:
      return {
          'statusCode': 401,
          'body': json.dumps('Failed to fetch a token for WFIM. Response code was: ' + str(token_response.status_code))
        }

    token = token_response.json()['access_token']
    del token_response

    print('Load data from WFIM')

    fire_year = datetime.date.today().year
    if datetime.date.today().month <= 3:
      fire_year = fire_year - 1 
    print('... Using fire year: ' + str(fire_year))

    print('... Loading incident details')
    wfim_incidents = []
    page_number = 0
    total_pages = 1
    page_size = 100
    exit_while = False
    while page_number < total_pages and exit_while == False:
      page_number = page_number + 1
      wfim_response = requests.get(wfim_api + 'incidents?wildfireYear=' + str(fire_year) + '&pageNumber=' + str(page_number)+ '&pageRowCount=' + str(page_size),  headers={'Authorization': 'Bearer ' + token})
      # agol_response 200
      if wfim_response.status_code != 200:
        return {
          'statusCode': wfim_response.status_code,
          'body': json.dumps('Failed to fetch data from WFIM. Response code was: ' + str(wfim_response.status_code))
        } 

      wfim_data = wfim_response.json()

      total_pages = wfim_data['totalPageCount']
      wfim_incidents = wfim_incidents + wfim_data['collection']

      if wfim_data['pageRowCount'] == 0 or wfim_data['pageRowCount'] < page_size:
        exit_while = True

      del wfim_response

    # Flush the existing cache
    print('Flushing the WFNEWS AWS cache')
    wfnews_del_response = requests.delete(wfnews_api + 'publishedIncident/flush', headers={'Authorization': 'Bearer ' + token})
    if wfnews_del_response.status_code != 204:
      print(wfnews_del_response)
      print('... Failed to flush')
      return {
          'statusCode': wfnews_del_response.status_code,
          'body': json.dumps('Failed to fetch data from WFIM. Response code was: ' + str(wfnews_del_response.status_code))
      }
    del wfnews_del_response

    print('... Create Inserts for WFNEWS')
    # iterate incidents, push to WFNEWS API with some random data
    for incident in wfim_incidents:
      curr_time = round(time.time()*1000)
      published_incident = None

      # check for existing published data and fetch that
      wfim_response = requests.get(wfim_api + '/publishedIncidents/byIncident/' + incident['wildfireIncidentGuid'],  headers={'Authorization': 'Bearer ' + token})
      if wfim_response.status_code != 200 and wfim_response.status_code != 404:
        print('Failed to load published info. Response code was: ' + str(wfim_response.status_code))
      elif wfim_response.status_code == 200:
        published_incident = wfim_response.json()
        print(published_incident)

      del wfim_response

      feature = {
        "publishedIncidentDetailGuid": str(uuid.uuid4()),
        "incidentGuid": incident['wildfireIncidentGuid'],
        "incidentNumberLabel": incident['incidentNumberSequence'], # number sequence or incidentLabel?
        "newsCreatedTimestamp": curr_time,
        "stageOfControlCode": incident['incidentSituation']['stageOfControlCode'] ,
        "fireCentre": incident['fireCentreOrgUnitIdentifier'],
        "generalIncidentCauseCatId": 2 if incident['suspectedCauseCategoryCode'] == 'Lightning' else 3 if incident['suspectedCauseCategoryCode'] == 'Undetermined' else 1,
        "declaredOutDate": incident['incidentSituation']['fireOutDate'],
        "discoveryDate": incident['discoveryTimestamp'],
        "fireZoneUnitIdentifier": incident['zoneOrgUnitIdentifier'],
        "fireOfNoteInd": incident['fireOfNotePublishedInd'],
        "incidentName": incident['incidentName'] if incident['incidentName'] is not None else incident['incidentLabel'],
        "incidentLocation": incident['incidentLocation']['geographicDescription'],
        "incidentSizeEstimatedHa": incident['incidentSituation']['fireSizeHectares'],
        "incidentSizeMappedHa": incident['incidentSituation']['fireSizeHectares'],
        "newsPublicationStatusCode": published_incident['newsPublicationStatusCode'] if published_incident is not None else 'DRAFT',
        "incidentOverview": published_incident['incidentOverview'] if published_incident is not None else '',
        "traditionalTerritoryDetail": published_incident['traditionalTerritoryDetail'] if published_incident is not None else None,
        "incidentSizeType": published_incident['incidentSizeType'] if published_incident is not None else '',
        "incidentSizeDetail": published_incident['incidentSizeDetail'] if published_incident is not None else None,
        "incidentCauseDetail": published_incident['incidentCauseDetail'] if published_incident is not None else None,
        "contactOrgUnitIdentifer": published_incident['contactOrgUnitIdentifer'] if published_incident is not None else '',
        "contactPhoneNumber": published_incident['contactPhoneNumber'] if published_incident is not None else '',
        "contactEmailAddress": published_incident['contactEmailAddress'] if published_incident is not None else '',
        "resourceDetail": published_incident['resourceDetail'] if published_incident is not None else None,
        "wildfireCrewResourcesInd": True if published_incident is not None and published_incident['wildfireCrewResourcesInd'] == 'true' else False,
        "wildfireCrewResourcesDetail": published_incident['wildfireCrewResourcesDetail'] if published_incident is not None else None,
        "wildfireAviationResourceInd": True if published_incident is not None and published_incident['wildfireAviationResourceInd'] == 'true' else False,
        "wildfireAviationResourceDetail": published_incident['wildfireAviationResourceDetail'] if published_incident is not None else None,
        "heavyEquipmentResourcesInd": True if published_incident is not None and published_incident['heavyEquipmentResourcesInd'] == 'true' else False,
        "heavyEquipmentResourcesDetail": published_incident['heavyEquipmentResourcesDetail'] if published_incident is not None else None,
        "incidentMgmtCrewRsrcInd": True if published_incident is not None and published_incident['incidentMgmtCrewRsrcInd'] == 'true' else False,
        "incidentMgmtCrewRsrcDetail": published_incident['incidentMgmtCrewRsrcDetail'] if published_incident is not None else None,
        "structureProtectionRsrcInd": True if published_incident is not None and published_incident['structureProtectionRsrcInd'] == 'true' else False,
        "structureProtectionRsrcDetail": published_incident['structureProtectionRsrcDetail'] if published_incident is not None else None,
        "publishedTimestamp": published_incident['publishedTimestamp'] if published_incident is not None else curr_time,
        "publishedUserTypeCode": published_incident['publishedUserTypeCode'] if published_incident is not None else 'GOV', 
        "publishedUserGuid": published_incident['publishedUserGuid'] if published_incident is not None else 'LOADER',
        "publishedUserUserId": published_incident['publishedUserUserId'] if published_incident is not None else 'LOADER',
        "publishedUserName": published_incident['publishedUserName'] if published_incident is not None else 'LOADER',
        "lastUpdatedTimestamp": incident['lastUpdatedTimestamp'] if incident['lastUpdatedTimestamp'] is not None else curr_time ,
        "latitude": str(incident['incidentLocation']['latitude']),
        "longitude": str(incident['incidentLocation']['longitude']),
        "fireYear": fire_year
      }

      wfnews_response = requests.post(wfnews_api + 'publishedIncident', json=feature, headers={'Authorization': 'Bearer ' + token, 'content-type': 'application/json'})
      # verify 200
      if wfnews_response.status_code != 201:
        print(wfnews_response.status_code)
        print('Failed to insert fire ' + incident['incidentLabel'])
      del wfnews_response

      print('... Check for Attachments and External URIs for ' + incident['incidentLabel'])
      print('... Loading External URI')
      wfim_response = requests.get(wfim_api + 'externalUri?sourceObjectUniqueId=' + str(incident['incidentNumberSequence']) + '&pageNumber=1&pageRowCount=100',  headers={'Authorization': 'Bearer ' + token})
      if wfim_response.status_code != 200:
        print(wfim_response.status_code)
        print('Failed to fetch external URI: ' + incident['incidentLabel'])
      else:
        external_uris = wfim_response.json()
        for uri in external_uris['collection']:
          del uri['@type'] 
          del uri['links']
          uri['sourceObjectNameCode'] = 'PUB_INC_DT'
          wfnews_response = requests.post(wfnews_api + 'externalUri', json=uri, headers={'Authorization': 'Bearer ' + token, 'content-type': 'application/json'})
          if wfnews_response.status_code != 201:
            print('Failed to upload external URI')
            del wfnews_response
            wfnews_response = requests.put(wfnews_api + 'externalUri', json=uri, headers={'Authorization': 'Bearer ' + token, 'content-type': 'application/json'})
          del wfnews_response

      del wfim_response

      print('... Loading Attachments')
      wfim_response = requests.get(wfim_api + 'incidents/' + str(fire_year) + '/' + str(incident['incidentNumberSequence']) + '/attachments?pageNumber=1&pageRowCount=100&attachmentTypeCode=INFO&archived=false&privateIndicator=false&orderBy=attachmentTitle%2CDESC',  headers={'Authorization': 'Bearer ' + token})
      if wfim_response.status_code != 200:
        print(wfim_response.status_code)
        print('Failed to fetch attachments for: ' + incident['incidentLabel'])
      else:
        attachments = wfim_response.json()
        for attachment in attachments['collection']:
          print(attachment)
          attachment['@type'] = 'AttachmentResource'
          attachment['imageURL'] = '/' + attachment['fileName']
          attachment['attachmentTypeCode'] = 'DOCUMENT'
          attachment['sourceObjectNameCode'] = 'PUB_INC_DT'
          wfnews_response = requests.post(wfnews_api + 'publishedIncidentAttachment/' + str(incident['incidentNumberSequence']) + '/attachments', json=attachment, headers={'Authorization': 'Bearer ' + token, 'content-type': 'application/json'})
          if wfnews_response.status_code != 201:
            print('Failed to upload attachment')
          else:
            print('... Attachment ref created. Fetching from WFDM and writing to bucket...')
            # Fetch attachment from WFDM
            wfdm_response = requests.get(wfdm_api + 'documents/' + attachment['fileIdentifier'] + '/bytes', headers={'Authorization': 'Bearer ' + token })
            bytes = wfdm_response.content
            # write bytes to s3 bucket
            del wfdm_response
          del wfnews_response

      del wfim_response

    return {
      'statusCode': 200,
      'body': json.dumps('Executed successfully')
    }
  except:
    return {
      'statusCode': 500,
      'body': json.dumps('Execution Failed: ' + sys.exc_info()[0])
    }
