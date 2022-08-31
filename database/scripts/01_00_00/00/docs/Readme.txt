Application:          WFNEWS (Wildfire Public News Management System)
Repository:           
Version:              1.0.0-00
Author:               Vivid Solutions (kcguise@vividsolutions.com)

Requirements
-------------------------------------------------------------------------------
PostgreSQL Host Servers: Integration: volatile   
                         Delivery:    transform
                         Test:        convert
                         Prod:        translate
Description
-------------------------------------------------------------------------------
Assisted Delivery.
 - Create "wildfire" database
 - Create "proxy_wf1_news" login account
 - Create "proxy_wf1_news_rest" login account
 - Create "wfnews" schema
 - Create "app_wf1_news_rest_proxy" role
 - Create "app_wf1_news_custodian" role
 - Create extensions

This release will create a database called "wfnews". 

Prerequisites
-------------------------------------------------------------------------------
None


-------------------------------------------------------------------------------
1. Assisted Delivery
  A DBA is required to:
 - Create "wildfire" database
 - Create "proxy_wf1_news" login account
 - Create "proxy_wf1_news_rest" login account
 - Create "wfnews" schema
 - Create "app_wf1_news_rest_proxy" role
 - Create "app_wf1_news_custodian" role
 - Create extensions
-------------------------------------------------------------------------------

1.1 Change to the scripts directory. 

    cd ../

1.2 Connect to the target PostgreSQL host server as the postgres user 
    (or equivalent DBA account) for the target environment. You can use either the
    psql terminal or PGAdmin tool.
    
    Where host server is one of the following:
      Integration: volatile   
      Delivery:    transform
      Test:        convert
      Prod:        translate

1.3 Create the "wildfire" database by running the following script:
    /ddl/database/wfnews.ddl.create_database.sql;
    
1.4 Create the wfnews account. 
    Please edit the following scripts to set an md5 hash password for each account:
    
    /ddl/logins/wfnews.ddl.create_login_APP_WF1_NEWS.sql;
    /ddl/logins/wfnews.ddl.create_login_PROXY_WF1_NEWS_REST.sql;

    After the scripts have been updated with a password run the scripts above 
    to create the logins.
    
1.5 Create the  roles by running the 
    following script:
    /ddl/roles/wfnews.ddl.create_roles.sql;

1.6 Create the "wfnews" schema within the new "wildfire" database by running the 
    following script:
    /ddl/schema/wfnews.ddl.create_wfnews_schema.sql;
    
    The script will make both the postgres and app_wf1_news accounts owners of 
     the "wfnews" schema.
    The script will make proxy_wf1_news_rest a user of the "wfnes" schema.
    

1.7 Confirm that the app_wf1_news has owner privileges for the "wfnews" schema in the
    "wildfire" database.

1.8 Store the passwords for the app_wf1_news and proxy_wf1_news_rest in KeyPass.
    
1.9 Release completed.    

  
  
-------------------------------------------------------------------------------
2. NOTIFICATION
-------------------------------------------------------------------------------
2.1 For Integration and Delivery environments please contact Kevin Guise with the 
     proxy account passwords.
      Kevin Guise
      kcguise@VividSolutions.Com
      
2.2 Update RFD Sub-Tasks to mark release as completed.      


 
