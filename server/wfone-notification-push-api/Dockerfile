FROM tomcat:9.0.85-jdk17-openjdk
ENV TOMCAT_MAJOR=9 \
JAVA_OPTS="$JAVA_OPTS -Djavax.net.debug=all" \
TOMCAT_VERSION=9.0.85 \
TOMCAT_HOME=/usr/local/tomcat \
CATALINA_HOME=/usr/local/tomcat \
CATALINA_OUT=/usr/local/tomcat/logs
COPY /wfone-notification-push-api-rest-endpoints/target/wfone-notification-push-api-rest-endpoints-*.war /temp/
RUN unzip /temp/wfone-notification-push-api-rest-endpoints-*.war -d /usr/local/tomcat/webapps/wfone-notification-push-api/
RUN adduser --system tomcat
RUN chown -R tomcat:0 `readlink -f ${CATALINA_HOME}` &&\
chmod -R 770 `readlink -f ${CATALINA_HOME}` &&\
chown -h tomcat:0 ${CATALINA_HOME}

RUN chmod 766 /usr/local/tomcat/logs && chmod 766 /usr/local/tomcat/work  && chmod 766 /usr/local/tomcat/temp
VOLUME /usr/local/tomcat/logs /usr/local/tomcat/work /usr/local/tomcat/temp

# run as tomcat user
USER tomcat

EXPOSE 8080
CMD ["catalina.sh", "run"]