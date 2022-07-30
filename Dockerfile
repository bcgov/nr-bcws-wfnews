FROM tomcat:8.5.47-jdk11-openjdk

COPY *.war .

ENV ENV TOMCAT_HOME=/usr/local/tomcat \
  CATALINA_HOME=/usr/local/tomcat \
  CATALINA_OUT=/usr/local/tomcat/logs \
  TOMCAT_MAJOR=8 \
  JAVA_OPTS="$JAVA_OPTS -Djavax.net.debug=all" 

RUN apt-get update &&\
  apt-get install -y telnet &&\
  #rm -rf /usr/local/tomcat/webapps/ROOT  &&\
  unzip -d /usr/local/tomcat/webapps/nr-bcws-wfnews/ '*.war' &&\
  adduser --system tomcat &&\
  chown -R tomcat:0 `readlink -f ${CATALINA_HOME}` &&\
  chmod -R 770 `readlink -f ${CATALINA_HOME}` &&\
  chown -h tomcat:0 ${CATALINA_HOME} &&\
  find /usr/local/tomcat/ -name server.xml | xargs cat &&\
  sed -i 's/<\/tomcat-users>/<role rolename="manager-gui"\/><user username="vivid-support" password="TOMCAT_PASSWORD" roles="manager-gui"\/><\/tomcat-users>/' /usr/local/tomcat/conf/tomcat-users.xml

# run as tomcat user
USER tomcat

EXPOSE 8080
CMD ["catalina.sh", "run"]
