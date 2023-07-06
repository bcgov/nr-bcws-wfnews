import logging
import boto3
import json
import sqs_extended_client
from botocore.exceptions import ClientError
from config import config_sqs

logger = logging.getLogger()

sqs_params = config_sqs()
s3_bucket_name = sqs_params["s3_bucket_name"]

sqs_client = boto3.client("sqs")
sqs_client.large_payload_support = s3_bucket_name
sqs_client.always_through_s3 = True


def send_queue_message(queue_url, msg_body):
    """
    Sends a message to the specified queue.
    """
    try:
        response = sqs_client.send_message(QueueUrl=queue_url, MessageBody=msg_body, MessageAttributes={
          'monitorType': {
            'StringValue': 'evacuation-orders-alerts',
            'DataType': 'String'
          }
        })
        message = json.loads(msg_body)
        event_name = get_attribute(message['attributes'], 'EVENT_NAME', "no such information")
        issuing_agency = get_attribute(message['attributes'], 'ISSUING_AGENCY', "no such information")
        print(f"Sending evacuation-orders-alerts message to queue {queue_url} with event name [{event_name}], issuing agency [{issuing_agency}]")
    except ClientError:
        logger.exception(f'Could not send evacuation-orders-alerts message to the - {queue_url}.')
        raise
    else:
        return response


def get_attribute(data, attribute, default_value):
    if attribute in data and data[attribute] is not None:
        return data[attribute]
    else:
        return default_value
