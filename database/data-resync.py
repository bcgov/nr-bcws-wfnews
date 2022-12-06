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

# Lambda definition, required by AWS Lambda setup
# Currently the trigger event and context are
# ignored, but we could use them for passing in
# request information
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
    data_flush = True if datetime.datetime.now().hour == 1 and datetime.datetime.now().minute < 15 else False
    # update threshold. If we're not flushing, only process records where the update age is less than the limit
    update_limit = 1200000 # 20 minutes in milliseconds

    print('Fetching a token from OAUTH...')
    token_response = requests.get(token_service, auth=HTTPBasicAuth(client_name, client_secret))
    # verify 200 or fail out
    if token_response.status_code != 200:
      return {
          'statusCode': 401,
          'body': json.dumps('Failed to fetch a token for WFIM. Response code was: ' + str(token_response.status_code))
        }

    token = token_response.json()['access_token']
    del token_response

    print('Load data from WFIM')
    # Determine the fire year
    fire_year = datetime.date.today().year
    if datetime.date.today().month <= 3:
      fire_year = fire_year - 1 
    print('... Using fire year: ' + str(fire_year))
    # And off we go, start by loading incidents from WFIM
    print('... Loading incident details')
    wfim_incidents = []
    page_number = 0
    total_pages = 1
    page_size = 100
    exit_while = False
    while page_number < total_pages and exit_while == False:
      page_number = page_number + 1
      # there is currently no way to filter by update timestamp. Otherwise we would just fetch
      # data from the last 10 mins
      wfim_response = requests.get(wfim_api + 'incidents?wildfireYear=' + str(fire_year) + '&pageNumber=' + str(page_number)+ '&pageRowCount=' + str(page_size),  headers={'Authorization': 'Bearer ' + token})

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
    # This will delete incidents, externalURI and attachment data from
    # The AWS Cache
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
      modified_incident = True
      modified_published_incident = True
      if not data_flush:
        # check update timestamp, ignore if older than 10 mins
        if incident['lastUpdatedTimestamp'] is not None and round(time.time() * 1000) - incident['lastUpdatedTimestamp'] > update_limit:
          modified_incident = False

      curr_time = round(time.time()*1000)
      published_incident = None

      # check for existing published data and fetch that
      # We need to create all incidents, but we want to ensure we
      # supply published details where available
      wfim_response = requests.get(wfim_api + 'publishedIncidents/byIncident/' + incident['wildfireIncidentGuid'],  headers={'Authorization': 'Bearer ' + token})
      if wfim_response.status_code != 200:
        print('Failed to load published info. Response code was: ' + str(wfim_response.status_code))
        modified_published_incident = False
      else:
        published_incident = wfim_response.json()
        if not data_flush:
          # check update timestamp, ignore if older than 10 mins
          if round(time.time() * 1000) - published_incident['updateDate'] > update_limit:
            modified_published_incident = False

      del wfim_response

      if not modified_incident and not modified_published_incident:
        print('... No Changes, Skipping ' + incident['incidentLabel'])
        continue

      print('... Processesing ' + incident['incidentLabel'])
      # This will contain the final feature attributes
      feature = {
        "publishedIncidentDetailGuid": published_incident['publishedIncidentDetailGuid'] if published_incident is not None else incident['wildfireIncidentGuid'], #str(uuid.uuid4()),
        "incidentGuid": incident['wildfireIncidentGuid'],
        "incidentNumberLabel": incident['incidentLabel'], # number sequence or incidentLabel?
        "newsCreatedTimestamp": curr_time,
        "stageOfControlCode": incident['incidentSituation']['stageOfControlCode'],
        "fireCentre": incident['fireCentreOrgUnitIdentifier'],
        "generalIncidentCauseCatId": 2 if incident['suspectedCauseCategoryCode'] == 'Natural' else 3 if incident['suspectedCauseCategoryCode'] == 'Undetermined' else 1,
        "declaredOutDate": incident['incidentSituation']['fireOutDate'],
        "discoveryDate": incident['discoveryTimestamp'],
        "fireZoneUnitIdentifier": incident['zoneOrgUnitIdentifier'],
        "fireOfNoteInd": incident['fireOfNotePublishedInd'],
        "incidentName": incident['incidentName'] if incident['incidentName'] is not None else incident['incidentLabel'],
        "incidentLocation": published_incident['incidentLocation'] if published_incident is not None else incident['incidentLocation']['geographicDescription'],
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
        "responseTypeCode": incident['responseTypeCode'],
        #"responseTypeDetail": published_incident['responseTypeDetail'] if published_incident is not None else None,
        "fireYear": fire_year
      }

      # The API will update if the posted resource exists
      # so this event can handle updates and inserts
      wfnews_response = requests.post(wfnews_api + 'publishedIncident', json=feature, headers={'Authorization': 'Bearer ' + token, 'content-type': 'application/json'})
      # verify 200
      if wfnews_response.status_code != 201:
        print(wfnews_response.status_code)
        print('Failed to insert fire ' + incident['incidentLabel'])
      del wfnews_response

      # if the fire is "out", ignore the attachment stuff, we wont display it anyway
      if incident['incidentSituation']['stageOfControlCode'] != 'OUT':

        # fetch WFNEWS uris, fetch wfim uris
        wfnews_response = requests.get(wfnews_api + 'publicExternalUri?sourceObjectUniqueId=' + str(incident['incidentLabel']) + '&pageNumber=1&pageRowCount=100')
        wfnews_uris = wfnews_response.json()['collection'] if wfnews_response.status_code == 200 else []
        del wfnews_response

        # this will only add/update but it won't delete
        # This means only a flush will currently remove documents
        print('... Check for Attachments and External URIs for ' + incident['incidentLabel'])
        print('... Loading External URI')
        # Load the URIs from WFIM
        wfim_response = requests.get(wfim_api + 'externalUri?sourceObjectUniqueId=' + str(incident['wildfireIncidentGuid']) + '&pageNumber=1&pageRowCount=100',  headers={'Authorization': 'Bearer ' + token})
        if wfim_response.status_code != 200:
          print(wfim_response.status_code)
          print('Failed to fetch external URI: ' + incident['incidentLabel'])
        else:
          # and if there are any to store, push them up into WFNEWS
          external_uris = wfim_response.json()
          for uri in external_uris['collection']:
            del uri['@type'] 
            del uri['links']
            uri['sourceObjectNameCode'] = 'PUB_INC_DT'
            uri['sourceObjectUniqueId'] = incident['incidentLabel']
            wfnews_response = requests.post(wfnews_api + 'externalUri', json=uri, headers={'Authorization': 'Bearer ' + token, 'content-type': 'application/json'})
            if wfnews_response.status_code != 201:
              print('Failed to upload external URI')
              del wfnews_response
              wfnews_response = requests.put(wfnews_api + 'externalUri', json=uri, headers={'Authorization': 'Bearer ' + token, 'content-type': 'application/json'})
            del wfnews_response
          # delete any that have been removed
          for uri in wfnews_uris:
            for_delete = True
            for wfim_uri in external_uris['collection']:
              if (uri['externalUriGuid'] == wfim_uri['externalUriGuid']):
                for_delete = False
                break
            if for_delete:
              wfnews_response = requests.delete(wfnews_api + 'externalUri/' + uri['externalUriGuid'], headers={'Authorization': 'Bearer ' + token, 'content-type': 'application/json'})
              del wfnews_response
          del wfnews_uris

        del wfim_response
        # Similar to external URI's above, load attachments and push
        # them to WFNEWS. Difference here is that we might have
        # binary data to pull from WFDM

        #first, lets get the attachments existing resources, for deletes later
        wfnews_response = requests.get(wfnews_api + 'publicPublishedIncidentAttachment/' + str(incident['incidentLabel']) + '/attachments')
        wfnews_attachments = wfnews_response.json()['collection'] if wfnews_response.status_code == 200 else []
        print('... Loading Attachments')
        wfim_response = requests.get(wfim_api + 'incidents/' + str(fire_year) + '/' + str(incident['incidentNumberSequence']) + '/attachments?pageNumber=1&pageRowCount=100&archived=false&privateIndicator=false&orderBy=attachmentTitle%2CDESC',  headers={'Authorization': 'Bearer ' + token})
        if wfim_response.status_code != 200:
          print(wfim_response.status_code)
          print('Failed to fetch attachments for: ' + incident['incidentLabel'])
        else:
          attachments = wfim_response.json()
          for attachment in attachments['collection']:
            # ignore any attachment that isn't flagged as commsSuitable
            if attachment['commsSuitable'] == None or attachment['commsSuitable'] == False:
              continue

            attachment['@type'] = 'AttachmentResource'
            attachment['imageURL'] = '/' + str(incident['incidentLabel']) + '/' + attachment['fileName']
            attachment['attachmentTypeCode'] = 'DOCUMENT'
            attachment['sourceObjectNameCode'] = 'PUB_INC_DT'
            attachment['sourceObjectUniqueId'] = incident['incidentLabel']
            attachment['primary'] = attachment['primaryInd']

            wfnews_response = requests.post(wfnews_api + 'publishedIncidentAttachment/' + str(incident['incidentLabel']) + '/attachments', json=attachment, headers={'Authorization': 'Bearer ' + token, 'content-type': 'application/json'})
            if wfnews_response.status_code != 201 and wfnews_response.status_code != 200:
              print('Failed to upload attachment')
            else:
              print('... Attachment ref created. Fetching from WFDM and writing to bucket...')
              new_attachment = wfnews_response.json()
              # Fetch attachment from WFDM
              wfdm_response = requests.get(wfdm_api + 'documents/' + str(attachment['fileIdentifier']) + '/bytes', headers={'Authorization': 'Bearer ' + token })
              doc_bytes = wfdm_response.content
              del wfdm_response
              wfnews_response = requests.post(wfnews_api + 'publishedIncidentAttachment/' + str(incident['incidentLabel']) + '/attachments/' + new_attachment['attachmentGuid'] + '/bytes', files=dict(file = io.BytesIO(doc_bytes)), headers={'Authorization': 'Bearer ' + token})
              if wfnews_response.status_code != 200:
                print('Write to bucket failed: ' + str(wfnews_response.status_code))
              else:
                print('... File pushed to bucket.')
              # Handle thumbnails
              if attachment['thumbnailIdentifier'] != None:
                # the same as above, but for the thumbnail
                # Fetch attachment from WFDM
                wfdm_response = requests.get(wfdm_api + 'documents/' + str(attachment['thumbnailIdentifier']) + '/bytes', headers={'Authorization': 'Bearer ' + token })
                doc_bytes = wfdm_response.content
                del wfdm_response
                wfnews_response = requests.post(wfnews_api + 'publishedIncidentAttachment/' + str(incident['incidentLabel']) + '/attachments/' + new_attachment['attachmentGuid'] + '/bytes?thumbnail=true', files=dict(file = io.BytesIO(doc_bytes)), headers={'Authorization': 'Bearer ' + token})
                if wfnews_response.status_code != 200:
                  print('Write to bucket failed: ' + str(wfnews_response.status_code))
                else:
                  print('... Thumbail created')
            del wfnews_response
          
          # delete any that have been removed
          for wfnews_attachment in wfnews_attachments:
            for_delete = True
            for wfim_attch in attachments['collection']:
              # delete if not comms suitable no matter what
              if wfim_attch['commsSuitable'] == False:
                break
              # otherwise, if the guids match, we can exit and not delete
              elif (wfnews_attachment['attachmentGuid'] == wfim_attch['attachmentGuid']):
                for_delete = False
                break
            if for_delete:
              wfnews_response = requests.delete(wfnews_api + 'publishedIncidentAttachment/' + str(incident['incidentLabel']) + '/attachments/' + wfnews_attachment['attachmentGuid'], headers={'Authorization': 'Bearer ' + token, 'content-type': 'application/json'})
              del wfnews_response
          del wfnews_attachments

        del wfim_response
      else:
        print('... Ignoring attachments for fire that is OUT')

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
