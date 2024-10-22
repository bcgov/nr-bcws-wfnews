import json
import requests
import logging
import amazon_sqs
from datetime import datetime, timedelta
import pytz
import postgre_database
from config import config_sqs, config_agol, buffer, config_news

logger = logging.getLogger(__name__)


def lambda_handler(event, context):
    gmt = pytz.timezone('GMT')
    monitor_name = "Active Fire"
    # yyyy-mm-dd HH:MM:SS.SSSSSS
    last_fetched_time_stamp = postgre_database.get_last_fetched_time_stamp(monitor_name)
    
    # To capture the latest timestamp of the features found
    latest_feature_time_stamp = None
    
    current_time_stamp = datetime.now(gmt)
    news_config = config_news()
    news_api = news_config['wfnews_api']

    if last_fetched_time_stamp is None:
        postgre_database.insert_current_fetched_time_stamp(monitor_name, current_time_stamp)
    else:
        last_fetched_time_stamp_string = last_fetched_time_stamp.strftime("%Y-%m-%d %H:%M:%S.%f")
        try:
            ip = requests.get(news_api + "/publicPublishedIncident?stageOfControlList=OUT_CNTRL"
                              "&stageOfControlList=HOLDING&stageOfControlList=UNDR_CNTRL&fromCreateDate=" +
                              last_fetched_time_stamp_string + "&orderBy=createDate ASC", timeout=15)

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
            fire_buffer = buffer()
            buffer_interval = fire_buffer["fire_buffer"]
            utc=pytz.UTC
            if "collection" in message_body:
                for message in message_body["collection"]:

                    feature_date = datetime(1970, 1, 1) + timedelta(milliseconds=message['createDate'])
                    if (utc.localize(feature_date) <= (current_time_stamp - timedelta(minutes = int(buffer_interval)))):
                        if ((latest_feature_time_stamp is None) or (latest_feature_time_stamp < feature_date)):
                            # add 1 millisecond to last createDate of fire to avoid get same fire again in the next monitor cycle
                            latest_feature_time_stamp = feature_date + timedelta(seconds=1)
                            latest_feature_time_stamp = latest_feature_time_stamp.replace(microsecond=0)
    
                        response = amazon_sqs.send_queue_message(queue_url, json.dumps(message))
                        responses.append(response)
            else:
                print("Bad Request")


        if responses:
            print(f"Updating last fetched to {latest_feature_time_stamp}")
            postgre_database.update_last_fetched_time_stamp(monitor_name, latest_feature_time_stamp)

            return {
                "statusCode": responses[0]["ResponseMetadata"]["HTTPStatusCode"],
                "body": json.dumps(responses[0]["ResponseMetadata"])
            }
        # Handle case where successful, but no new messages
        elif "collection" in message_body and message_body["collection"] == []:
            return {
                "statusCode": "204"
            }
        else:
            return {
                "statusCode": 400,
                "body": "Bad Request"
            }
