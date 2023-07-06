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
            'StringValue': 'bans-prohibitions',
            'DataType': 'String'
          }
        })
        message = json.loads(msg_body)
        fire_centre_name = get_attribute(message['attributes'], 'FIRE_CENTRE_NAME', "no such information")
        fire_zone_name = get_attribute(message['attributes'], 'FIRE_ZONE_NAME', "no such information")
        access_prohibition_description = get_attribute(message['attributes'], 'ACCESS_PROHIBITION_DESCRIPTION', "no such information")
        type = get_attribute(message['attributes'], 'TYPE', "no such information")
        print(f"Sending bans-prohibitions message to queue {queue_url} with fire centre name [{fire_centre_name}], fire zone name [{fire_zone_name}], access prohibition description [{access_prohibition_description}], type [{type}]")
    except ClientError:
        logger.exception(f'Could not send bans-prohibitions message to the - {queue_url}.')
        raise
    else:
        return response


def get_attribute(data, attribute, default_value):
    if attribute in data and data[attribute] is not None:
        return data[attribute]
    else:
        return default_value
