# Welcome to Bitbucket #

Layer required to run Python Lambda's for our monitors.

To Create the layer zip file, install your requirements locally:

pip3 install -t python --no-user requests==1.29.0
pip3 install -t python --no-user pytz
pip3 install -t python --no-user sqs_extended_client
pip3 install -t python --no-user tweepy --no-dependencies
pip3 install -t python --no-user oauthlib==3.2.0 --no-dependencies
pip3 install -t python --no-user requests-oauthlib==1.3.1 --no-dependencies
pip3 install -t python --no-user aws-secretsmanager-caching
pip3 install -t python --no-user jmespath==0.10.0 --upgrade
pip3 install -t python --no-user awslogs==0.14.0 --upgrade
pip3 install -t python --no-user urllib3==1.26.18 --upgrade

Next, clone the https://github.com/jkehler/awslambda-psycopg2 repository and add the appropriate psycopg2-3.x folder to the `python` folder containing the other modules. Rename `psycopg2-3.x` to just `psycopg2`

Zip up the `python` folder into a zip file called `python.zip`
