Application:          WFONE_NOTIFICATIONS_DB 
Repository:           https://apps.nrs.gov.bc.ca/int/stash/projects/WFONE/repos/wfone-notifications-db/browse
Version:              1.0.0
Author:               Vivid Solutions - Henry Saldyga (hsaldyga@vividsolutions.com)

Requirements
-------------------------------------------------------------------------------------
PostgreSQL Database: PostgreSQL 10.7

|------------------------------------------------------------------------------------|
| Database Environments                                                              |
|------------------------------------------------------------------------------------|
|   Env         | Instance                                                           |
|------------------------------------------------------------------------------------|
|    DEV        | wfone-public-mobile-db-dev-2                                       |
|    TEST       | wfone-public-mobile-db-test                                        |
|    PROD       | wfone-public-mobile-db-prod                                        |
|    PROD-AWS   | wfone-public-mobile-db.caw9xhtwiyin.ca-central-1.rds.amazonaws.com |
|------------------------------------------------------------------------------------|

Description
-------------------------------------------------------------------------------------
Tables creation  of Wildfire Public Mobile 


Prerequisites :
------------------------------------------------------------------------------------
1. The postgres server was previously installed  is running in OpenShift Container.
2. You have an access for https://console.pathfinder.gov.bc.ca:8443/console
3. You have Downloaded and installed the OC command line for v 3.x: https://www.okd.io/download.html#oc-platforms

Required Steps:                                                                1. 
-------------------------------------------------------------------------------
For OpenShift only:
 1. From https://console.pathfinder.gov.bc.ca:8443/console in right coner under your name menu
   choose menu item <Copy Login Command>
 2. Login to OpenShift using copied command 
 3. Switch to the corresponding namespace:    oc project fytirg-<NAMESPACE>
 4. Setup the local proxy at localhost:15432 to OpenShift container where PostgReSQL runs:   oc port-forward <service-name> 15432:5432

For all database environments:
 5. Connect to the database as "app" 
 6. execute DDL script from ddl folder:
 	 wfone-notifications-create-tables.sql 
 7. Connect to the database as "postgres"
 6: Install uuid extension using the following sql command:  
     create extension if not exists "uuid-ossp";

Notes: 
Deatils about PostGreSQL on OpenShift
https://www.openshift.com/blog/openshift-connecting-database-using-port-forwarding