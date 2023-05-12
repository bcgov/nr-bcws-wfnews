WFNEWS Client v2.0.21

To locally test the build:

```
mvn clean install (option -DskipTests if you want to ignore tests)
```

Then, once the build is complete,

```
docker build -t wfnews .
docker run -p 1337:8080 --env WFIM_API_URL=https://i1bcwsapi.nrs.gov.bc.ca/wfim-incidents-api/ --env WFDM_API_URL=https://i1bcwsapi.nrs.gov.bc.ca/wfim-incidents-api/ --env WFNEWS_API_URL= http://localhost:1338 --env WEBADE-OAUTH2_CHECK_TOKEN_V2_URL=https://intapps.nrs.gov.bc.ca/pub/oauth2/v1/check_token?disableDeveloperFilter=true --env WEBADE-OAUTH2_TOKEN_URL=https://intapps.nrs.gov.bc.ca/pub/oauth2/v1/oauth/token?disableDeveloperFilter=true --env WEBADE_OAUTH2_WFNEWS_REST_CLIENT_SECRET=*** wfnews
```

You can use --env for environment variables, or pass in a list (see the docker documentation for instructions)
Look in the deploy-dev.yml for Dev env variable configs.

If you've deployed an API image, you can supply that as your WFNEWS_API_URL, but you can't wire it to "localhost", as your client container won't find it. You will need to change it to the IP of your API container. You can find this by:

`docker ps`
then, Copy the container ID of your wfnews-api container and:
`run docker inspect <container id>`

Down at the bottom in IP settings, you can copy the IP address out and use that in the postgres connection instead of localhost. Or, use docker desktop to inspect and get it from there.

The admin screen will fail unless you use HTTPS, so to test logins may need to add

-v /path/to/server.xml:/usr/local/tomcat/conf/server.xml \
-v /path/to/ssl.crt:/usr/local/tomcat/conf/ssl.crt \
-v /path/to/ssl.key:/usr/local/tomcat/conf/ssl.key \

Where the path/to/server.xml is a server XML you've updated to add the required https/ssl stuff
