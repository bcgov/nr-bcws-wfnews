-----------------------------------------------------------------------------------
Application:          WFONE_NOTIFICATIONS_DB 
Repository:           
Version:              1.0.1-00
Author:               Vivid Solutions (kcguise@vividsolutions.com)
-----------------------------------------------------------------------------------

 Database Environments                                                             
-----------------------------------------------------------------------------------
   Env        | Instance                                                           
-----------------------------------------------------------------------------------
   DEV        | wfone-public-mobile-db-dev-2                                       
   TEST       | wfone-public-mobile-db-test                                        
   PROD       | wfone-public-mobile-db-prod                                        
   PROD-AWS   | wfone-public-mobile-db.caw9xhtwiyin.ca-central-1.rds.amazonaws.com 
-----------------------------------------------------------------------------------


Description
-------------------------------------------------------------------------------
Assisted Delivery.
 - Create proxy_wf1_notification_rest account
 - Create app_wf1_notification_custodian role
 - Create app_wf1_notification_rest_proxy role 

The release will create a proxy_wf1_notification_rest account that will be used by 
the Notification System to access the database objects in the "public" schema.

The release will create roles app_wf1_notification_custodian and app_wf1_notification_rest_proxy.
The app_wf1_notification_custodian role can be granted to application administrators 
to view data in the notification "public" schema.

The app_wf1_notification_rest_proxy role will be used to manage grants for tables, 
views, sequences, etc... The role will be granted to the proxy account.

-------------------------------------------------------------------------------
1. Connect to database as "postgresql": Create Extensions
-------------------------------------------------------------------------------
1.1 For all database environments, Connect to the database as "postgres"
    (or equivalent DBA account) for the target environment. You can use either the
    psql terminal or PGAdmin tool.
    
    Where host server is one of the following:
      Integration: wfone-public-mobile-db-dev-2                                       
      Delivery:    wfone-public-mobile-db-test                                        
      Test:        wfone-public-mobile-db-prod                                        
      Prod:        wfone-public-mobile-db.caw9xhtwiyin.ca-central-1.rds.amazonaws.com 

1.2 Create the app_wf1_dm and proxy_wf1_dm_rest accounts. 
    Please edit the following scripts to set an md5 hash password for each account:
    
    /ddl/logins/wfone.ddl.create_login_proxy_wf1_notification_rest.sql

    After the scripts have been updated with a password run the scripts above 
    to create the logins.
    
1.3 Create the app_wf1_notification_custodian and app_wf1_notification_rest_proxy roles 
    by running the following script:
    /ddl/roles/wfone.ddl.create_roles.sql;


-------------------------------------------------------------------------------
2. Connect to database as "app": Create Database objects.
-------------------------------------------------------------------------------
 
2.1 For all database environments, connect to the database as "app" 

2.2 Execute the following DDL script in order from ddl folder:
      /ddl/wfone.ddl.apply_grants.sql

2.3 Release completed.    

-------------------------------------------------------------------------------
3. NOTIFICATION
-------------------------------------------------------------------------------
3.1 Update RFD Sub-Tasks to mark release as completed.      
