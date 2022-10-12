import requests
from requests.auth import HTTPBasicAuth
import sys
import time
import random
import uuid

# Token service, for fetching a token
token_service = 'https://intapps.nrs.gov.bc.ca/pub/oauth2/v1/oauth/token?disableDeveloperFilter=true&response_type=token&grant_type=client_credentials'
# Client, use Basic Auth
client_name = '***'
client_secret = '***'
# WFNEWS API
wfnews_api = 'http://localhost:1338/'
# AGOL
agol_api = 'https://services6.arcgis.com/ubm4tcTYICKBpist/ArcGIS/rest/services/BCWS_ActiveFires_PublicView/FeatureServer/0/query?where=1%3D1&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&relationParam=&returnGeodetic=false&outFields=*&returnGeometry=true&featureEncoding=esriDefault&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=4326&defaultSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pjson&token='

print('Fetching a token from OAUTH...')
token_response = requests.get(token_service, auth=HTTPBasicAuth(client_name, client_secret))
# verify 200
if token_response.status_code != 200:
  sys.exit("Failed to fetch a token for WFDM. Response code was: " + str(token_response.status_code)) 

token = token_response.json()['access_token']
del token_response

print('Load data from AGOL')
agol_response = requests.get(agol_api)
# agol_response 200
if agol_response.status_code != 200:
  sys.exit("Failed to fetch a data from AGOL. Response code was: " + str(agol_response.status_code)) 

incidents = agol_response.json()['features']
del agol_response

print('Create Inserts for WFNEWS')
# iterate incidents, push to WFNEWS API with some random data
for incident in incidents:
  curr_time = round(time.time()*1000)
  feature = {
    "publishedIncidentDetailGuid": str(uuid.uuid4()),
    "incidentGuid": "this-is-a-guid?",
    "incidentNumberLabel": incident['attributes']['FIRE_NUMBER'],
    "newsCreatedTimestamp": curr_time,
	  "stageOfControlCode": 'OUT_CNTRL' if incident['attributes']['FIRE_STATUS'] == 'Out Of Control' else 'HOLDING' if incident['attributes']['FIRE_STATUS'] == 'Being Held' else 'UNDR_CNTRL' if incident['attributes']['FIRE_STATUS'] == 'Under Control' else 'OUT',
    "generalIncidentCauseCatId": 1 if incident['attributes']['FIRE_CAUSE'] == 'Lightning' else 9,
	  "newsPublicationStatusCode": "PUBLISHED",
    "discoveryDate": incident['attributes']['IGNITION_DATE'],
    "fireZoneUnitIdentifier": incident['attributes']['ZONE'],
    "fireOfNoteInd": 'T' if incident['attributes']['FIRE_OF_NOTE_ID'] is not None else 'F',
    "incidentName": incident['attributes']['FIRE_OF_NOTE_NAME'] if incident['attributes']['FIRE_OF_NOTE_NAME'] is not None else incident['attributes']['FIRE_NUMBER'],
    "incidentLocation": incident['attributes']['GEOGRAPHIC_DESCRIPTION'],
    "incidentOverview": "This is the incident overview. Not much interesting here as this is just test data, but it can be edited or whatever later",
    "traditionalTerritoryDetail": "Ucluelet First Nation",
    "incidentSizeType": "",
    "incidentSizeEstimatedHa": incident['attributes']['CURRENT_SIZE'],
    "incidentSizeMappedHa": incident['attributes']['CURRENT_SIZE'],
    "incidentSizeDetail": None,
    "incidentCauseDetail": None,
    "contactOrgUnitIdentifer": None,
    "contactPhoneNumber": "123-456-7890",
    "contactEmailAddress": "noaddress@fake.nope",
    "resourceDetail": None,
    "wildfireCrewResourcesInd": 'T' if bool(random.getrandbits(1)) else 'F',
    "wildfireCrewResourcesDetail": None,
    "wildfireAviationResourceInd": 'T' if bool(random.getrandbits(1)) else 'F',
    "wildfireAviationResourceDetail": None,
    "heavyEquipmentResourcesInd": 'T' if bool(random.getrandbits(1)) else 'F',
    "heavyEquipmentResourcesDetail": None,
    "incidentMgmtCrewRsrcInd": 'T' if bool(random.getrandbits(1)) else 'F',
    "incidentMgmtCrewRsrcDetail": None,
    "structureProtectionRsrcInd": 'T' if bool(random.getrandbits(1)) else 'F',
    "structureProtectionRsrcDetail": None,
    "publishedTimestamp": curr_time,
    "publishedUserTypeCode": "GOV", 
    "publishedUserGuid": "TEST",
    "publishedUserUserId": "TEST",
    "publishedUserName": "TEST",
    "lastUpdatedTimestamp": curr_time,
    "latitude": str(incident['geometry']['y']),
    "longitude": str(incident['geometry']['x'])
  }
  wfnews_response = requests.post(wfnews_api + 'publishedIncident', json=feature, headers={'Authorization': 'Bearer ' + token})
  # verify 200
  if wfnews_response.status_code != 201:
    print(wfnews_response)
  del wfnews_response
