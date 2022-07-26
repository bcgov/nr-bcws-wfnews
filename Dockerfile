FROM tomcat:8.5.47-jdk11-openjdk

ENV ENV TOMCAT_HOME=/usr/local/tomcat \
  CATALINA_HOME=/usr/local/tomcat \
  CATALINA_OUT=/usr/local/tomcat/logs \
  TOMCAT_MAJOR=8 \
  JAVA_OPTS="$JAVA_OPTS -Djavax.net.debug=all" 

WORKDIR staging

RUN echo "CURRENT DIR CONTENTS ARE:\n" && ls . && echo "PWD IS: \n" &&pwd && find / -name "wfnews-api-rest-endpoints-*.war" && find / -name "Package*"

#COPY /tmp/wfnews-api-rest-endpoints-*.war /temp/

RUN apt-get update &&\
  apt-get install -y telnet &&\
  rm -rf /usr/local/tomcat/webapps/ROOT  &&\
  find . -name "*wfnews-api-rest-endpoints-*.war" | xargs unzip -d /usr/local/tomcat/webapps/nr-bcws-wfnews/ &&\
  adduser --system tomcat &&\
  chown -R tomcat:0 `readlink -f ${CATALINA_HOME}` &&\
  chmod -R 770 `readlink -f ${CATALINA_HOME}` &&\
  chown -h tomcat:0 ${CATALINA_HOME}

# run as tomcat user
USER tomcat

EXPOSE 8080
CMD ["catalina.sh", "run"]
