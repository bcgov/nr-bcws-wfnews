import json
import requests
import logging
import amazon_sqs
from datetime import datetime, timedelta
import pytz
import postgre_database
from config import config_sqs, config_agol

logger = logging.getLogger(__name__)


def lambda_handler(event, context):
    gmt = pytz.timezone('GMT')
    monitor_name = "Bans and Prohibitions"
    # mm/dd/YY H:M:S
    last_fetched_time_stamp = postgre_database.get_last_fetched_time_stamp(monitor_name)
    
    # To capture the latest timestamp of the features found
    latest_feature_time_stamp = None
    
    current_time_stamp = datetime.now(gmt)

    if last_fetched_time_stamp is None:
        postgre_database.insert_current_fetched_time_stamp(monitor_name, current_time_stamp)
    else:
        last_fetched_time_stamp_string = last_fetched_time_stamp.strftime("%m/%d/%Y %H:%M:%S")
        current_time_stamp_string = current_time_stamp.strftime("%m/%d/%Y %H:%M:%S")
        try:
            agol = config_agol()
            ip = requests.get( agol["layer_url"] + "/query?where=ACCESS_STATUS_EFFECTIVE_DATE >'" +
                              last_fetched_time_stamp_string + "'+and+ACCESS_STATUS_EFFECTIVE_DATE <='" + current_time_stamp_string +
                              "'&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel"
                              "=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter"
                              "&returnGeodetic=false&outFields=*&returnGeometry=true&featureEncoding=esriDefault"
                              "&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=4326&defaultSR"
                              "=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false"
                              "&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false"
                              "&returnQueryGeometry=false&returnDistinctValues=false&cacheHint=false&orderByFields"
                              "=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount"
                              "=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters"
                              "=&sqlFormat=standard&f=pjson&token=", timeout=15)

        except requests.RequestException as e:
            # Send some context about this error to Lambda Logs
            print(e)

            raise e

        if ip is not None:
            # send message to queue
            sqs_params = config_sqs()
            queue_url = sqs_params["queue_url"]
            message_body = ip.json()

            responses = []
            for message in message_body["features"]:
                feature_date = datetime(1970, 1, 1) + timedelta(milliseconds=message['attributes']['ACCESS_STATUS_EFFECTIVE_DATE'])
                if ((latest_feature_time_stamp is None) or (latest_feature_time_stamp < feature_date)):
                    latest_feature_time_stamp = feature_date
                
                response = amazon_sqs.send_queue_message(queue_url, json.dumps(message))
                responses.append(response)

        if responses:
            print(f"Updating last fetched to {latest_feature_time_stamp}")
            postgre_database.update_last_fetched_time_stamp(monitor_name, latest_feature_time_stamp)
            
            return {
                "statusCode": responses[0]["ResponseMetadata"]["HTTPStatusCode"],
                "body": json.dumps(responses[0]["ResponseMetadata"])
            }
        # Handle case where successful, but no new messages
        elif "features" in message_body and message_body["features"] == []:
            return {
                "statusCode": "204"
            }
        else:
            return {
                "statusCode": 400,
                "body": "Bad Request"
            }
