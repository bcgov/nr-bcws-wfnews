FROM tomcat:8.5.47-jdk11-openjdk
ENV ENV TOMCAT_HOME=/usr/local/tomcat \
  CATALINA_HOME=/usr/local/tomcat \
  CATALINA_OUT=/usr/local/tomcat/logs
ENV TOMCAT_MAJOR=8 
ENV JAVA_OPTS="$JAVA_OPTS -Djavax.net.debug=all" 
COPY server/wfnews-api-rest-endpoints/target/nr-bcws-wfnews-api-rest-endpoints-*.war /temp/
RUN apt-get update
RUN apt-get install -y telnet
RUN rm -rf /usr/local/tomcat/webapps/ROOT
RUN unzip /temp/nr-bcws-wfnews-api-rest-endpoints-*.war -d /usr/local/tomcat/webapps/nr-bcws-wfnews/
RUN adduser --system tomcat
RUN chown -R tomcat:0 `readlink -f ${CATALINA_HOME}` &&\
chmod -R 770 `readlink -f ${CATALINA_HOME}` &&\
chown -h tomcat:0 ${CATALINA_HOME}

# run as tomcat user
USER tomcat

EXPOSE 8080
CMD ["catalina.sh", "run"]
