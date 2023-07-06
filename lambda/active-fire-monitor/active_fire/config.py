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


def config_agol(filename='configuration.ini', section='AGOL'):
    # create a parser
    parser = ConfigParser(interpolation=None)
    # read config file
    parser.read(filename)

    # get section, default to AGOL
    agol = {}
    if parser.has_section(section):
        params = parser.items(section)
        for param in params:
            agol[param[0]] = param[1]
    else:
        raise Exception('Section {0} not found in the {1} file'.format(section, filename))

    return agol
  
def buffer(filename='configuration.ini', section='buffer'):
    # create a parser
    parser = ConfigParser(interpolation=None)
    # read config file
    parser.read(filename)

    # get section, default to amazon sqs
    buffer = {}
    if parser.has_section(section):
        params = parser.items(section)
        for param in params:
            buffer[param[0]] = param[1]

    return buffer

def config_news(filename='configuration.ini', section='news api'):

    # get section, default to amazon sqs
    news = {}
    news['wfnews_api']=os.environ.get('WFNEWS_API')

    return news