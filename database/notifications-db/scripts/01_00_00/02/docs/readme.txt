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
Create database objects for the wildfire one Notifications system in the 
public schema contained in the "app" database.
  - Add spatial columns to Notification table
  - Create Monitor_Process_Tracker table.
  - Create Report_Of_Fire_Cache table 
  - Create Report_Of_Fire_Attachment_Cache table

-------------------------------------------------------------------------------
1. Connect to database as "postgresql": Create Extensions
-------------------------------------------------------------------------------
1.1 For all database environments, Connect to the database as "postgres"

1.2 Create extensions "uuid-ossp" and "postgis" by running the following script
    from the ddl folder
        wfone.ddl.create_extensions.sql
        
-------------------------------------------------------------------------------
2. Connect to database as "app": Create Database objects.
-------------------------------------------------------------------------------
 
2.1 For all database environments, connect to the database as "app" 

2.2 Execute the following DDL script in order from ddl folder:
      /ddl/wfone.ddl.modify_notification.sql
      /ddl/wfone.ddl.monitor_process_tracker.sql
      /ddl/wfone.ddl.report_of_fire_cache.sql
      /ddl/wfone.ddl.report_of_fire_attachment_cache.sql

2.3 Execute the following DML scripts in order from the dml folder:
      /dml/wfone.dml.set_lat_long_geometry.sql       
      
2.4 Commit data loaded into database:
      Commit;      
    
2.5 Release completed.    

-------------------------------------------------------------------------------
3. NOTIFICATION
-------------------------------------------------------------------------------
3.1 Update RFD Sub-Tasks to mark release as completed.      

