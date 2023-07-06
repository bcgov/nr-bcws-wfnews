### Configure Git for the first time ###

```
git config --global user.name "Last, First IIT:EX"
git config --global user.email "First.Last@gov.bc.ca"
```

### Build wfone notification push api ###

mvn clean install -DskipTests

### Running wfone notification push api locally ###

1.Update wfone-notification-push-api\wfone-notification-push-api-rest-endpoints\src\main\resources\application.properties 

datasource fields that marked with * can be found in lastpass, look for wfone-public-mobile-db-dev

```
wfone.datasource.url=jdbc:postgresql://[public mobile DEV db host*]/[public mobile DEV db name*]
wfone.datasource.username=[public mobile DEV db user*]
wfone.datasource.max.connections=25
wfone.push.item.expire.hours.evacuation=24
wfone.push.item.expire.hours.fire=48
wfone.push.item.expire.hours.ban=8760
wfone.push.item.expire.hours.restricted.area=8760
wfone.aws.sqs.queue.public.mobile.notification.url=[get it from aws sqs queue console, look for Public-Mobile-Notification-Queue]
wfone.aws.sqs.queue.public.mobile.notification.monitor.attribute=monitorType
wfone.aws.sqs.queue.receive.max.num.messages=10
wfone.aws.sqs.queue.receive.wait.time.seconds=20
wfone.aws.sqs.queue.s3.bucket.name=[get it from aws bucket console, look for public-mobile and get the dev one]
wfone.aws.access.key=[get access key from Chris P]
wfone.aws.secret.key=[get secret key from Chris P]
push.notification.event.consumer.interval.seconds=120 (configure it to any number you like, this is the interval between job run)
push.notification.prefix=[dev]
firebase.db.url=https://wildlife-push-test.firebaseio.com
```

2.Update wfone-notification-push-api\wfone-notification-push-api-rest-endpoints\src\main\resources\application-secrets.properties

datasource fields that marked with * can be found in lastpass, look for wfone-public-mobile-db-dev

```
wfone.datasource.password=[public mobile DEV db password*]
```
3.Build api and configure your IDE with Tomcat v8.5 server, run wfone-notification-push-api-rest-endpoints on server

### Running unit test ###

1.Before running any unit test, update wfone-notification-push-api\wfone-notification-push-api-rest-endpoints\src\test\resources\test.properties

datasource fields that marked with * can be found in lastpass, look for wfone-public-mobile-db-dev

```
wfone.datasource.url=jdbc:postgresql://[public mobile DEV db host*]/[public mobile DEV db name*]
wfone.datasource.username=[public mobile DEV db user*]
wfone.datasource.password=[public mobile DEV db password*]
wfone.datasource.max.connections=25

wfone.push.item.expire.hours.evacuation=24
wfone.push.item.expire.hours.fire=48
wfone.push.item.expire.hours.ban=8760
wfone.push.item.expire.hours.restricted.area=8760

wfone.aws.sqs.queue.public.mobile.notification.url=[get it from aws sqs queue console, look for Public-Mobile-Notification-Queue]
wfone.aws.sqs.queue.public.mobile.notification.monitor.attribute=monitorType
wfone.aws.sqs.queue.receive.max.num.messages=10
wfone.aws.sqs.queue.receive.wait.time.seconds=20
wfone.aws.sqs.queue.s3.bucket.name=[get it from aws bucket console, look for public-mobile and get the dev one]
wfone.aws.access.key=[get access key from Chris P]
wfone.aws.secret.key=[get secret key from Chris P]

push.notification.event.consumer.interval.seconds=300 (configure it to any number you like, this is the interval between job run)
push.notification.prefix=[dev]

firebase.db.url=https://wildlife-push-test.firebaseio.com
```

### Build and deploy wfone notification push api to DEV ###

wfone notification push api never deploys to DEV, follow above (Running wfone notification push api locally) instructions 
to point configurations to DEV and run api locally

### Build and deploy wfone notification push api to INT ###

Pull request targeting master will trigger an automatic deployment to INT, any subsequent updates to this pull request 
will trigger automatic deployment to INT

Example:  'feature/1.3.0' -> 'release/1.3.0' wouldn't automatically trigger a deploy, but 'release/1.3.0'->'master' 
would deploy on creation and when release/1.3.0 is updated

### Code Formatting ###

If your IDE supports [EditorConfig](https://editorconfig.org/) it should apply the correct formatting automatically.  If not, look at the `.editorconfig` file and configure your IDE to match.

v1.2.0
