Application:          WFNEWS (Wildfire Public News Management System)
Repository:           
Version:              1.0.0-00
Author:               Vivid Solutions (lli@vividsolutions.com)

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
 - Create "wfnotification" schema

This release will create a database called "wfnotification". 

Prerequisites
-------------------------------------------------------------------------------
None


-------------------------------------------------------------------------------
1. Assisted Delivery
  A DBA is required to:
 - Create "wildfire" database
 - Create "wfnotification" schema
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
    /ddl/database/wfnotification.ddl.create_database.sql;

1.4 Create the "wfnotification" schema within the new "wildfire" database by running the 
    following script:
    /ddl/schema/wfnotification.ddl.create_wfnotification_schema.sql;
    
    
1.5 Release completed.    

  
  
-------------------------------------------------------------------------------
2. NOTIFICATION
-------------------------------------------------------------------------------
2.1 For Integration and Delivery environments please contact Kevin Guise with the 
     proxy account passwords.
      Kevin Guise
      kcguise@VividSolutions.Com
      
2.2 Update RFD Sub-Tasks to mark release as completed.      


 
