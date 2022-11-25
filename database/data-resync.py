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
import boto3
import io

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
    # S3 bucket
    bucket_name = 'wfnews-dev-uploads'
    aws_key = ''
    aws_secret = ''
    # Flush all data first?
    data_flush = False

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

    # Flush the existing cache, if desired
    if data_flush:
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
      wfim_response = requests.get(wfim_api + 'publishedIncidents/byIncident/' + incident['wildfireIncidentGuid'],  headers={'Authorization': 'Bearer ' + token})
      if wfim_response.status_code != 200:
        print('Failed to load published info. Response code was: ' + str(wfim_response.status_code))
      else:
        published_incident = wfim_response.json()

      del wfim_response

      feature = {
        "publishedIncidentDetailGuid": published_incident['publishedIncidentDetailGuid'] if published_incident is not None else incident['wildfireIncidentGuid'], #str(uuid.uuid4()),
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
        "incidentSizeType": '',
        "incidentSizeDetail": published_incident['incidentSizeDetail'] if published_incident is not None else None,
        "incidentCauseDetail": published_incident['incidentCauseDetail'] if published_incident is not None else None,
        "contactOrgUnitIdentifer": published_incident['contactOrgUnitIdentifer'] if published_incident is not None else '',
        "contactPhoneNumber": published_incident['contactPhoneNumber'] if published_incident is not None else '',
        "contactEmailAddress": published_incident['contactEmailAddress'] if published_incident is not None else '',
        "resourceDetail": published_incident['resourceDetail'] if published_incident is not None else None,
        "wildfireCrewResourcesInd": True if published_incident is not None and published_incident['wildfireCrewResourcesInd'] == True else False,
        "wildfireCrewResourcesDetail": published_incident['wildfireCrewResourcesDetail'] if published_incident is not None else None,
        "wildfireAviationResourceInd": True if published_incident is not None and published_incident['wildfireAviationResourceInd'] == True else False,
        "wildfireAviationResourceDetail": published_incident['wildfireAviationResourceDetail'] if published_incident is not None else None,
        "heavyEquipmentResourcesInd": True if published_incident is not None and published_incident['heavyEquipmentResourcesInd'] == True else False,
        "heavyEquipmentResourcesDetail": published_incident['heavyEquipmentResourcesDetail'] if published_incident is not None else None,
        "incidentMgmtCrewRsrcInd": True if published_incident is not None and published_incident['incidentMgmtCrewRsrcInd'] == True else False,
        "incidentMgmtCrewRsrcDetail": published_incident['incidentMgmtCrewRsrcDetail'] if published_incident is not None else None,
        "structureProtectionRsrcInd": True if published_incident is not None and published_incident['structureProtectionRsrcInd'] == True else False,
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

      # The API will update if the posted resource exists
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
          attachment['@type'] = 'AttachmentResource'
          attachment['imageURL'] = '/' + str(incident['incidentNumberSequence']) + '/' + attachment['fileName']
          attachment['attachmentTypeCode'] = 'DOCUMENT'
          attachment['sourceObjectNameCode'] = 'PUB_INC_DT'
          attachment['sourceObjectUniqueId'] = incident['incidentNumberSequence']
          # apply the mime type correctly - not coming accross

          wfnews_response = requests.post(wfnews_api + 'publishedIncidentAttachment/' + str(incident['incidentNumberSequence']) + '/attachments', json=attachment, headers={'Authorization': 'Bearer ' + token, 'content-type': 'application/json'})
          if wfnews_response.status_code != 201:
            print('Failed to upload attachment')
          else:
            print('... Attachment ref created. Fetching from WFDM and writing to bucket...')
            new_attachment = wfnews_response.json()
            # Fetch attachment from WFDM
            wfdm_response = requests.get(wfdm_api + 'documents/' + str(attachment['fileIdentifier']) + '/bytes', headers={'Authorization': 'Bearer ' + token })
            doc_bytes = wfdm_response.content
            del wfdm_response
            wfnews_response = requests.post(wfnews_api + 'publishedIncidentAttachment/' + str(incident['incidentNumberSequence']) + '/attachments/' + new_attachment['attachmentGuid'] + '/bytes', files=dict(file = io.BytesIO(doc_bytes)), headers={'Authorization': 'Bearer ' + token})
          del wfnews_response

      del wfim_response

    # Once the Inserts and updates are complete, see if anything needs to be removed
    # note, this is only needed if we did not flush data
    if not data_flush:
      # load the data from the public api
      wfnews_incidents = []
      page_number = 0
      total_pages = 1
      page_size = 100
      exit_while = False
      while page_number < total_pages and exit_while == False:
        page_number = page_number + 1
        wfnews_response = requests.get(wfnews_api + 'publicPublishedIncident?&pageNumber=' + str(page_number)+ '&pageRowCount=' + str(page_size))
        if wfnews_response.status_code != 200:
          return {
            'statusCode': wfnews_response.status_code,
            'body': json.dumps('Failed to fetch data from WFNEWS. Response code was: ' + str(wfnews_response.status_code))
          } 

        cache_data = wfnews_response.json()

        total_pages = cache_data['totalPageCount']
        wfnews_incidents = wfnews_incidents + cache_data['collection']

        if cache_data['pageRowCount'] == 0 or len(cache_data['collection']) < page_size:
          exit_while = True

        del wfnews_response

      if len(wfnews_incidents) != len(wfim_incidents):
        # different lengths, so we need to delete things
        print('... Deleting unmatched incidents')
        for incident in wfnews_incidents:
          found_match = False
          for wfim_incident in wfim_incidents:
            if wfim_incident['wildfireIncidentGuid'] == incident['incidentGuid']:
              found_match = True
              break
          if not found_match:
            #incident doesn't have a match, so we can delete it
            wfnews_response = requests.delete(wfnews_api + 'publishedIncident/' + incident['publishedIncidentDetailGuid'], headers={'Authorization': 'Bearer ' + token})
            if wfnews_response.status_code != 200:
              print('Failed to delete')
            del wfnews_response

    return {
      'statusCode': 200,
      'body': json.dumps('Executed successfully')
    }
  except:
    return {
      'statusCode': 500,
      'body': json.dumps('Execution Failed: ' + sys.exc_info()[0])
    }
