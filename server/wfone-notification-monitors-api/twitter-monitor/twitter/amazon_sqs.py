import logging
import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger()

sqs_client = boto3.client("sqs")


def send_queue_message(queue_url, msg_body):
    """
    Sends a message to the specified queue.
    """
    try:
        response = sqs_client.send_message(QueueUrl=queue_url, MessageBody=msg_body, MessageAttributes={
          'monitorType': {
            'StringValue': 'twitter',
            'DataType': 'String'
          }
        })
    except ClientError:
        logger.exception(f'Could not send message to the - {queue_url}.')
        raise
    else:
        return response
