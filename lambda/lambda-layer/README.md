# Welcome to Bitbucket #

Layer required to run Python Lambda's for our monitors.

To Create the layer zip file, install your requirements locally:

pip3 install -t python requests
pip3 install -t python pytz
pip3 install -t python psycopg2-binary
pip3 install -t python tweepy
pip3 install -t python sqs_extended_client

And zip up the resulting `python` folder into a zip file called `python.zip`
