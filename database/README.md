First, create your postgres DB instance:

```
docker pull postgis/postgis:13-3.3
```

Then start the DB image:

docker run --name wfnews-postgres -e POSTGRES_USER=wfnews -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgis/postgis:13-3.3

If you want to mount a data directory, add this additional config:

```
-v /data:/var/lib/postgresql/data
```

Note: We're piping the image port 5432 to our local port 5432. If you are already using the port locally, be sure to change it

Where the /data: is the path on your local machine where DB files will live
If you don't mount a local data path, when your image is turned of your data will be lost.

If you need to customize the postgres install, you can create your own dockerfile using the pulled image.

Once you have an image up and running, you'll want to build a DB that matches the wfnews environment.
You can use the liquibase scripts to do this, which will match up with how the build happens in our AWS environment

First, pull the liquibase image

```
docker pull liquibase/liquibase
```

Then run the image. 
IMPORTANT: You will need the IP address of the Postgres Docker image first

Run: `docker ps`
Copy the container ID of your postgres image
`run docker inspect <container id>`

Down at the bottom in IP settings, you can copy the IP address out and use that in the postgres connection instead of localhost. Or, use docker desktop to inspect and get it from there.

```
docker run --rm -v <path to database dir in wfnews repo>:/liquibase/changelog liquibase/liquibase --url=jdbc:postgresql://<container IP>:5432/wfnews?currentSchema=wfnews --changelog-file=/liquibase/changelog/main-changelog.json --username=wfnews --password=password update
```

note: ${PWD} is the current dirctory in powershell. Change as needed to mount the database folder

Alternatively, you can build the dockerfile in the database folder, which will build a liquibase image and auto-mount the database folder for you

```
docker build -t liquibase -f Dockerfile.liquibase.local .
docker run --rm liquibase --url=jdbc:postgresql://<container ip>:5432/wfnews --changelog-file=main-changelog.json --username=wfnews --password=password update
```
