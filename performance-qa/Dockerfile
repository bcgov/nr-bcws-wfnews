FROM adoptopenjdk/openjdk8:jdk8u252-b09-alpine
LABEL maintainer="Nithin Kuruba"
ENV JMETER_VERSION 5.2.1
ENV JMETER_HOME /opt/apache-jmeter-${JMETER_VERSION}
ENV JMETER_BIN ${JMETER_HOME}/bin
ENV ALPN_VERSION 8.1.13.v20181017
ENV PATH ${JMETER_BIN}:$PATH
COPY run.sh /usr/local/bin/
COPY /tests/*.jmx /usr/local/bin/
RUN mkdir -p ${JMETER_HOME}/results
COPY /binaries/apache-jmeter-${JMETER_VERSION}.tgz /tmp/
RUN chmod +x /usr/local/bin/run.sh \
 && apk add --no-cache \
 su-exec \
 curl \
 net-tools \
 ttf-dejavu \
 && cd /tmp/ \
 && mkdir -p /opt/ \
 && tar x -z -f apache-jmeter-${JMETER_VERSION}.tgz -C /opt \
 && rm -R -f apache* \
 && chmod +x ${JMETER_HOME}/bin/*.sh \
 && jmeter -n -t  /usr/local/bin/public-mobile-tests.jmx -l ${JMETER_HOME}/results/public-mobile-tests.jtl \
 && rm -fr /tmp/*
WORKDIR /jmeter
ENTRYPOINT ["/usr/local/bin/run.sh"]
CMD ["jmeter", "--?"]