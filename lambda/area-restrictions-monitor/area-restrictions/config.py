from configparser import ConfigParser
import os
import json
import botocore 
import botocore.session 
from aws_secretsmanager_caching import SecretCache, SecretCacheConfig 


def config_db(filename='configuration.ini', section='postgresql'):
    region_name = "ca-central-1"

    client = botocore.session.get_session().create_client('secretsmanager')
    cache_config = SecretCacheConfig()
    cache = SecretCache( config = cache_config, client = client)

    secret = json.loads(cache.get_secret_string(os.environ.get('SECRET_NAME')))

    db = {}
    db['host']=secret['host']
    db['database']=secret['dbInstanceIdentifier']
    db['user']=secret['username']
    db['password']=secret['password']
    return db


def config_sqs(filename='configuration.ini', section='amazon sqs'):

    # get section, default to amazon sqs
    sqs = {}
    sqs['s3_bucket_name']=os.environ.get('S3_BUCKET')
    sqs['queue_url']=os.environ.get('QUEUE_URL')

    return sqs


def config_agol():
    
    # get section, default to AGOL
    agol = {}
    agol['layer_url']=os.environ.get('LAYER_URL')

    return agol
