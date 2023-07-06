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
            'StringValue': 'active-fires',
            'DataType': 'String'
          }
        })
        message = json.loads(msg_body)
        fire_number = get_attribute(message, 'incidentNumberLabel', "no such information")
        fire_year = get_attribute(message, 'fireYear', "no such information")
        print(f"Sending active-fires message to queue {queue_url} with fire number [{fire_number}], fire year [{fire_year}]")
    except ClientError:
        logger.exception(f'Could not send active-fires message to the - {queue_url}.')
        raise
    else:
        return response


def get_attribute(data, attribute, default_value):
    if attribute in data and data[attribute] is not None:
        return data[attribute]
    else:
        return default_value
