Title:              Wildfire One Spatial Services - PointID API
Application:        WFSS PointID API
Version:            1.8.1
Author:             Vivid Solutions (mbdavis@vividsolutions.com)


Description
-------------------------------------------------------------------------------

Wildfire Spatial Services PointID REST web service.

Deployment Links
---------------------------------------------------------------------------------

Source Repo:  	https://apps.nrs.gov.bc.ca/int/stash/projects/WFSS/repos/wfss-pointid-api/browse
SDK Config: 	https://apps.nrs.gov.bc.ca/int/stash/projects/SDK/repos/sdk-config/browse/WFSS
Ansible config:	https://apps.nrs.gov.bc.ca/int/stash/projects/INFRA/repos/dev-all-in-one/browse/playbooks/jenkins/WFSS/wfss-pointid-api?at=refs%2Fheads%2Ffeature%2Fwfss-api

Jenkins Job:  https://apps.nrs.gov.bc.ca/int/jenkins/job/WFSS/job/wfss-pointid-api/

Configuration
------------------------------------------------------------------------------

Currently app configuration is done via an application.properties file.
This is a template in the Ansible configuration:

https://apps.nrs.gov.bc.ca/int/stash/projects/INFRA/repos/dev-all-in-one/browse/playbooks/jenkins/WFSS/wfss-pointid-api/templates/application.properties.j2?at=refs%2Fheads%2Ffeature%2Fwfss-api

The template contains properties which are populated from the SDK-Config properties files:

https://apps.nrs.gov.bc.ca/int/stash/projects/SDK/repos/sdk-config/browse/WFSS

These in turn pull database credentials from Jenkins.

Testing
--------------------------------------------------------------

Testing consists of hitting application URLs and verifying the results are error-free

INT

https://intapps.nrs.gov.bc.ca/pub/wfss-pointid-api/v1/ownership?lat=50&lon=-123
https://intapps.nrs.gov.bc.ca/pub/wfss-pointid-api/v1/weather?lat=49&lon=-123

