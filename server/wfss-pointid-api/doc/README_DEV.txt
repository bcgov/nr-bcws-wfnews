Notes for WFSS Developers
=========================

Developing in Eclipse
======================

1. Generate an Eclipse project

At a command prompt run

    cd source\ear
    mvn eclipse:eclipse

The build artifacts are NOT commited and should be in the SVN ignore list.
In an Eclipse workspace import the project.

Local Configuring
==========================
The following files need to be configured manually:

	src/main/resources/application.properties

One way to do this is to keep a DEV-only file, and overwrite the local copy
when needed.  See Appendix for an template.

May slso be useful to increase log level in log4j.xml

Local Build
=======================
Builds are be done by executing Maven goals in the pom.xml (either in Eclipse or cmdline).


Eclipse Run
=======================
Main entry class is PointIdServiceApplication.  
Run this as a Spring Boot project.

Service can be invoked from a browser or other client, e.g.:

	http://localhost:8080/v1/geography?lat=49&lon=-124.2

	http://localhost:8080/v1/ownership?lat=50&lon=-123

	http://localhost:8080/v1/weather?lat=45&lon=-123
	http://localhost:8080/v1/weather?lat=50.1&lon=-126.9&hour=2017020612

Testing
=======================

* Primary integration tests are

	PointIdGeographyTester.java
	PointIdOwnershipTester.java
	PointIdWeatherTester.java

(These are named to avoid automatic running by Maven, since they take a while to execute)

* Unit tests are named *Tests and will run when doing Maven build

* Performance tests are in 

	PointIdPerfTester.java

* A browser-based test harness is provided in

	source/test-app/testmap/index.html

* A browser-based text-only test harness is provided in

	source/test-app/nomap/index.html
	
Enhancing
=======================

* To add a simple query property, see documentation in 

	GeographyQuery.java

Appendix A:  application.properties
===================================

An application.properties contents for testing (VPN required)

wfgs.url=https://wf1geop.nrs.gov.bc.ca/geoserver
bcgw.url=https://openmaps.gov.bc.ca/geo/pub
weather.host=sechelt.idir.bcgov:1001
weather.user=proxy_geoviewer
weather.password=<PASSWORD>
