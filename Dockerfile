FROM tomcat:8.5.47-jdk11-openjdk

COPY *.war .

ENV TOMCAT_HOME=/usr/local/tomcat \
  CATALINA_HOME=/usr/local/tomcat \
  CATALINA_OUT=/usr/local/tomcat/logs \
  TOMCAT_MAJOR=8 \
  JAVA_OPTS="$JAVA_OPTS -Djavax.net.debug=all" 


# TODO: REVERT CHOWN COMMAND TO 770 ONCE DONE TESTING
RUN apt-get update &&\
  apt-get install -y telnet &&\
  apt-get install -y sed  &&\
  rm -rf /usr/local/tomcat/webapps/ROOT  &&\
  mkdir /usr/local/tomcat/webapps/ROOT &&\
  unzip -d /usr/local/tomcat/webapps/ROOT/ '*.war' &&\
  find /usr/local/tomcat/conf -type f -name 'server.xml' | xargs sed -i 's/<\/Host>/<Valve className="org.apache.catalina.valves.rewrite.RewriteValve" \/><\/Host>/' &&\
  mkdir -p /usr/local/tomcat/conf/Catalina/localhost &&\
  echo 'RewriteCond %{REQUEST_PATH} !-f' > /usr/local/tomcat/conf/Catalina/localhost/rewrite.config &&\
  echo 'RewriteRule ^/(.*) / ' >> /usr/local/tomcat/conf/Catalina/localhost/rewrite.config &&\
  adduser --system tomcat &&\
  chown -R tomcat:0 `readlink -f ${CATALINA_HOME}` &&\
  chmod -R 770 `readlink -f ${CATALINA_HOME}` &&\
  chown -h tomcat:0 ${CATALINA_HOME}

# run as tomcat user
USER tomcat

EXPOSE 8080
CMD ["catalina.sh", "run"]
