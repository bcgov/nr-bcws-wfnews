import json
import logging
import amazon_sqs
from datetime import datetime
import pytz
import postgre_database
from config import config_sqs, config_twitter
import tweepy

logger = logging.getLogger(__name__)


def lambda_handler(event, context):
    gmt = pytz.timezone('GMT')
    monitor_name = "Twitter"
    # mm/dd/YY H:M:S
    last_fetched_time_stamp = postgre_database.get_last_fetched_time_stamp(monitor_name)
    current_time_stamp = datetime.now(gmt)

    if last_fetched_time_stamp is None:
        postgre_database.insert_current_fetched_time_stamp(monitor_name, current_time_stamp)
    else:
        try:
          twitter_params = config_twitter()
          consumer_key = twitter_params["consumer_key"]
          consumer_secret = twitter_params["consumer_secret"]
          access_token = twitter_params["access_token"]
          access_token_secret = twitter_params["access_token_secret"]
          handle = twitter_params["handle"]

          # OAuth process, using the keys and tokens
          auth = tweepy.OAuthHandler(consumer_key, consumer_secret)
          auth.set_access_token(access_token, access_token_secret)
          api = tweepy.API(auth)

          timeline = api.user_timeline(screen_name=handle, count=100, tweet_mode="extended")

          postgre_database.update_last_fetched_time_stamp(monitor_name, current_time_stamp)
        except Exception as e:
            # Send some context about this error to Lambda Logs
            print(e)

            raise e

        if timeline is not None:
            # send message to queue
            sqs_params = config_sqs()
            sqs_response = None
            queue_url = sqs_params["queue_url"]

            for tweet in timeline:
                # only keep tweets between the polling times?
                if tweet.created_at >= pytz.utc.localize(last_fetched_time_stamp):
                  sqs_response = amazon_sqs.send_queue_message(queue_url, json.dumps(json.dumps(tweet._json, indent=2, sort_keys=True)))

            if sqs_response:
                return {
                    "statusCode": sqs_response["ResponseMetadata"]["HTTPStatusCode"],
                    "body": json.dumps(sqs_response["ResponseMetadata"])
                }

        return {
            "statusCode": 400,
            "body": "Bad Request or no new data in past monitor cycle"
        }

