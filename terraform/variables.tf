# variables.tf

variable "target_env" {
  description = "AWS workload account env (e.g. dev, test, prod, sandbox, unclass)"
  type        = string
}

variable "github_release_name" {
  description = "Name of github release, if it exists"
  type        = string
  default     = ""
}

#Access key ID and secret access key are not used with container-based authentication
variable "aws_access_key_id" {
  type    = string
  default = ""
}

variable "aws_secret_access_key" {
  type    = string
  default = ""
}

variable "target_aws_account_id" {
  description = "AWS workload account id"
  type        = string
}

variable "aws_region" {
  description = "The AWS region things are created in"
  default     = "ca-central-1"
}

variable "ecs_task_execution_role_name" {
  description = "ECS task execution role name"
  default     = "wfnewsEcsTaskExecutionRole"
}

variable "ecs_auto_scale_role_name" {
  description = "ECS auto scale role Name"
  default     = "wfnewsEcsAutoScaleRole"
}

variable "az_count" {
  description = "Number of AZs to cover in a given region"
  default     = "2"
}

variable "server_name" {
  description = "Name of the server"
  type        = string
  default     = "wfnews-server-app"
}

variable "client_name" {
  description = "Name of the client"
  type        = string
  default     = "wfnews-client-app"
}

variable "server_image" {
  description = "Docker image to run in the ECS cluster. _Note_: there is a blank default value, which will cause service and task resource creation to be supressed unless an image is specified."
  type        = string
  default     = ""
}

variable "client_image" {
  description = "Docker image to run in the ECS cluster. _Note_: there is a blank default value, which will cause service and task resource creation to be supressed unless an image is specified."
  type        = string
  default     = ""
}

variable "server_port" {
  description = "Port exposed by the docker image to redirect traffic to"
  default     = 443
}

variable "client_port" {
  description = "Port exposed by the docker image to redirect traffic to"
  default     = 8081
}

variable "api_key" {
  description = "value for api key"
  type        = string
}

variable "app_count" {
  description = "Number of docker containers to run"
  default     = 2
}

variable "server_container_name" {
  description = "Server container name"
  default     = "wfnews-server-app"
}

variable "client_container_name" {
  description = "Container name"
  default     = "wfnews-client-app"
}

variable "health_check_path" {
  default = "/"
}

variable "client_cpu_units" {
  description = "client instance CPU units to provision (1 vCPU = 1024 CPU units)"
  type        = number
}

variable "client_memory" {
  description = "client instance memory to provision (in MiB)"
  type        = number
}

variable "server_cpu_units" {
  description = "server CPU units to provision (1 vCPU = 1024 CPU units)"
  type        = number
}

variable "server_memory" {
  description = "server memory to provision (in MiB)"
  type        = number
}

variable "pointid_cpu_units" {
  description = "server CPU units to provision (1 vCPU = 1024 CPU units)"
  type        = number
  default     = "512"
}

variable "pointid_memory" {
  description = "server memory to provision (in MiB)"
  type        = number
  default     = 1024
}

variable "pointid_port" {
  type    = number
  default = 8080
}

variable "wfone_notifications_api_cpu_units" {
  description = "server CPU units to provision (1 vCPU = 1024 CPU units)"
  type        = number
  default     = "512"
}

variable "wfone_notifications_api_memory" {
  description = "server memory to provision (in MiB)"
  type        = number
  default     = 2048
}

variable "wfone_notifications_api_port" {
  type    = number
  default = 8080
}

variable "wfone_notifications_push_api_port" {
  type    = number
  default = 8080
}

variable "db_instance_type" {
  description = "Instance type to use for database vm"
  type        = string
}

variable "logging_level" {
  type        = string
  description = "Logging level for components"
}

variable "FIREBASE_CONFIG_JSON" {
  type = string
  description = "stringified json of firebase config file"
}

# variable "db_name" {
#   description = "DynamoDB DB Name"
#   default     = "ssp-greetings"
# }

# variable "repository_name" {
#   description = "Name for the container repository to be provisioned."
#   type        = string
#   default     = "ssp"
# }

# variable "budget_amount" {
#   description = "The amount of spend for the budget. Example: enter 100 to represent $100"
#   default     = "100.0"
# }

# variable "budget_tag" {
#   description = "The Cost Allocation Tag that will be used to build the monthly budget. "
#   default     = "Project=WFNEWS"
# }

variable "common_tags" {
  description = "Common tags for created resources"
  default = {
    Application = "WFNEWS"
  }
}

variable "server_names" {
  description = "List of service names to use as subdomains"
  default     = ["wfnews-server"]
  type        = list(string)
}

variable "client_names" {
  description = "List of service names to use as subdomains"
  default     = ["wfnews-client"]
  type        = list(string)
}

variable "liquibase_names" {
  description = "List of service names to use as subdomains"
  default     = ["wfnews-liquibase"]
  type        = list(string)
}

variable "notifications_liquibase_names" {
  description = "List of service names to use as subdomains"
  default     = ["notifications-liquibase"]
  type        = list(string)
}

variable "nginx_names" {
  description = "List of service names to use as subdomains"
  default     = ["wfnews-api"]
  type        = list(string)
}

variable "redirect_names" {
  description = "List of service names to use as subdomains"
  default     = ["wfnews-redirect"]
  type        = list(string)
}

variable "pointid_names" {
  description = "List of service names to use as subdomains"
  default     = ["wfss-pointid-api"]
  type        = list(string)
}

variable "wfone_notifications_api_names" {
  description = "List of service names to use as subdomains"
  default     = ["wfone-notifications-api"]
  type        = list(string)
}


variable "alb_name" {
  description = "Name of the internal alb"
  default     = "default"
  type        = string
}

variable "cloudfront" {
  description = "enable or disable the cloudfront distrabution creation"
  type        = bool
}

variable "cloudfront_origin_domain" {
  description = "domain name of the ssp"
  default     = ""
  type        = string
}

variable "gov_client_url" {
  description = "domain name if using *.nrs.gov.bc.ca url"
  default     = ""
  type        = string
}

variable "gov_api_url" {
  description = "domain name if using *-api.nrs.gov.bc.ca url"
  default     = ""
  type        = string
}

variable "cloudfront_gov_origin_name" {
  description = "base for the gov url"
  default     = "wildfiresituation"
  type        = string
}

variable "cloudfront_gov_origin_tail" {
  description = "common element on gov urls"
  default     = "nrs.gov.bc.ca"
  type        = string
}

variable "gov_certificate_arn" {
  description = "ARN of certificate to use on .nrs.gov.bc.ca certs"
  default     = ""
  type        = string
}

variable "gov_api_certificate_arn" {
  description = "ARN of certificate to use on -api.nrs.gov.bc.ca certs"
  default     = ""
  type        = string
}

variable "cloudfront_header" {
  description = "Header added when passing through cloudfront"
  default     = ""
  type        = string
}

/*variable "cf_origin_id" {
  description = "id"
  type        = string
}*/

variable "aws_sec_group" {
  description = "Security group limiting access to app"
  type        = string
}

variable "db_pass" {
  description = "db password, passed in as env variable at runtime"
  type        = string
}

variable "db_size" {
  description = "size of db, in GB"
  type        = number
  default     = 10
}

variable "vpc_name" {
  description = "name of VPC to use"
  type        = string
}

variable "subnet_filter" {
  description = "Text to filter subnet on"
  type        = string
}

variable "license_plate" {
  description = "license plate number to use"
  type        = string
}

variable "certificate_arn" {
  description = "ARN of *.env.bcwildfireservices.com certificate"
  type        = string
}

variable "base_certificate_arn" {
  description = "ARN of *.bcwildfireservices.com certificate"
  type        = string
}

variable "liquibase_container_name" {
  description = "Name of DB container"
  default     = "wfnews-liquibase-app"
  type        = string
}

variable "notifications_liquibase_container_name" {
  description = "Name of DB container"
  default     = "notifications-liquibase-app"
  type        = string
}

variable "liquibase_image" {
  description = "Full name of liquibase image"
  type        = string
  default     = ""
}

variable "liquibase_cpu" {
  description = "number of milliCPUs to allocate to liquibase instances"
  type = number
  default = 256
}

variable "liquibase_memory" {
  description = "Amount of memory to allocate to liquibase instances, in MB"
  type = number
  default = 512
}

variable "pointid_image" {
  description = "Full name of liquibase image"
  type        = string
  default     = ""
}

variable "wfone_notifications_api_image" {
  description = "Full name of notifications api image"
  type = string
  default = "wfone_notifications_api"
}

variable "nginx_name" {
  description = "Name of nginx app"
  type        = string
  default     = "wfnews-nginx-app"
}

variable "nginx_container_name" {
  description = "Name of nginx container"
  default     = "wfnews-nginx-app"
  type        = string
}

variable "max_upload_size" {
  description = "Maximum upload size permitted"
  default     = "100M"
  type        = string
}

variable "api_health_check_path" {
  description = "Endpoint to use for health checks on API"
  default     = "/checkHealth?callstack=test"
  type        = string
}

variable "client_health_check_path" {
  description = "Endpoint to use for health checks on client"
  default     = "/config.jsp"
  type        = string
}

variable pointid_health_check_path {
  description = "Endpoint to use for health checks on pointid API"
  default = "/weather?lat=50&lon=-127&duration=3"
  type = string
}

variable "nginx_image" {
  description = "Full name of nginx image"
  default     = ""
  type        = string
}

variable "etcd_image" {
  description = "Full name of etcd image"
  default     = ""
  type        = string
}

variable "nginx_ports" {
  description = "Port nginx listens on"
  default     = [8080]
  type        = list(number)
}

variable "db_port" {
  description = "Port used to communicate with database"
  type        = number
  default     = 8080
}

variable "health_check_port" {
  type    = number
  default = 8080
}

variable "db_names" {
  description = "List of service names to use as subdomains"
  default     = ["wfnews-db"]
  type        = list(string)
}

variable "db_multi_az" {
  description = "Whether to make db deployment a multi-AZ deployment"
  default     = false
  type        = bool
}

variable "db_postgres_version" {
  description = "Which version of Postgres to use"
  default     = "15.4"
  type        = string
}

variable "sns_email_targets" {
  description = "Emails to use for SNS"
  default     = ""
  type        = string
}

//wfnews server property variables
variable "WEBADE-OAUTH2_TOKEN_CLIENT_URL" {
  type    = string
  default = ""
}
variable "WEBADE-OAUTH2_TOKEN_URL" {
  type    = string
  default = ""
}

variable "YOUTUBE_API_KEY" {
  type = string
  default = ""
}

variable "YOUTUBE_CHANNEL_ID" {
  type = string
  default = ""
}

variable "WEBADE_OAUTH2_REST_CLIENT_ID" {
  type    = string
  default = ""
}

variable "WEBADE_OAUTH2_UI_CLIENT_ID" {
  type    = string
  default = ""
}

variable "WEBADE_OAUTH2_WFNEWS_REST_CLIENT_SECRET" {
  type    = string
  default = ""
}

variable "WEBADE_OAUTH2_AUTHORIZE_URL" {
  type    = string
  default = ""
}

variable "WFDM_REST_URL" {
  type    = string
  default = ""
}

variable "FIRE_REPORT_API_URL" {
  type  = string
  default = ""
}

variable "NOTIFICATION_API_URL" {
  type = string
  default = ""
}

variable "POINT_ID_URL" {
  type = string
  default = ""
}

variable "WFIM_CLIENT_URL" {
  type    = string
  default = ""
}
variable "WFIM_REST_URL" {
  type    = string
  default = ""
}
variable "WFIM_CODE_TABLES_URL" {
  type    = string
  default = ""
}
variable "WEBADE-OAUTH2_CHECK_TOKEN_URL" {
  type    = string
  default = ""
}
variable "WFNEWS_EMAIL_NOTIFICATIONS_ENABLED" {
  type    = string
  default = ""
}
variable "SMTP_HOST_NAME" {
  type    = string
  default = ""
}
variable "SMTP_PASSWORD" {
  type    = string
  default = ""
}
variable "SMTP_FROM_EMAIL" {
  type    = string
  default = ""
}
variable "SMTP_ADMIN_EMAIL" {
  type    = string
  default = ""
}
variable "SMTP_EMAIL_SYNC_ERROR_FREQ" {
  type    = string
  default = ""
}
variable "SMTP_EMAIL_FREQ" {
  type    = string
  default = ""
}
variable "SMTP_EMAIL_ERROR_SUBJECT" {
  type    = string
  default = ""
}
variable "SMTP_EMAIL_SUBJECT" {
  type    = string
  default = ""
}
variable "DEFAULT_APPLICATION_ENVIRONMENT" {
  type    = string
  default = ""
}
variable "WFNEWS_AGOL_QUERY_URL" {
  type    = string
  default = ""
}

variable "WFNEWS_USERNAME" {
  type    = string
  default = ""
}

variable "WFNEWS_MAX_CONNECTIONS" {
  type    = string
  default = "10"
}

//Client-only variables

variable "agolUrl" {
  type    = string
  default = ""
}

variable "drivebcBaseUrl" {
  type    = string
  default = ""
}

variable "openmapsBaseUrl" {
  type    = string
  default = ""
}

variable "siteMinderURLPrefix" {
  type    = string
  default = ""
}

variable "syncIntervalMinutes" {
  type  = string
  default = ""
}

variable "agolAreaRestrictions" {
  type    = string
  default = ""
}

variable "agolBansAndProhibitions" {
  type    = string
  default = ""
}

variable "agolDangerRatings" {
  type  = string
  default = ""
}

variable "WEBADE_OAUTH2_WFNEWS_UI_CLIENT_SECRET" {
  type    = string
  default = ""
}



# Added from Public Mobile for Lambda/S3/SQS
#SQS-specific variables

variable "MAX_RECEIVED_COUNT" {
  type        = number
  description = "How many messages can be placed into the deadletter queue"
  default     = 100
}

variable "VISIBILITY_TIMEOUT_SECONDS" {
  type        = number
  description = "Suffix appended to all managed resource names"
  default     = 60
}

variable "ACCEPTED_IPS" {
  type        = string
  description = "IPs allowed to send to queue"
  #TODO: Make wfone-notification-push-api use AWS credentials and remove this
  default = ""
}

variable "PUSH_NOTIFICATION_AWS_USER" {
  type        = string
  description = "User used by wfone-notification-push-api"
  default     = ""
}

#Lambda-related variables
variable "EVENT_BRIDGE_ARN" {
  type    = string
  default = ""
}

variable "WFNEWS_URL" {
  type    = string
  default = ""
}

variable "SECRET_NAME" {
  type    = string
  default = ""
}

variable "BAN_PROHIBITION_MONITOR_KEY" {
  type    = string
  default = ""
}

variable "ACTIVE_FIRE_MONITOR_KEY" {
  type    = string
  default = ""
}

variable "AREA_RESTRICTIONS_MONITOR_KEY" {
  type    = string
  default = ""
}

variable "EVACUATION_MONITOR_KEY" {
  type    = string
  default = ""
}

variable "LAMBDA_LAYER_KEY" {
  type    = string
  default = ""
}

variable "MAPS_CLOUDFRONT_DISTRIBUTION_IDS" {
  type    = string
  default = ""
}



variable "UNIQUE_DEPLOY_ID" {
  type = number
  default = 0
}

//WFSS-POINTID-API Environment Variables

variable "pointid_container_name" {
  description = "Name of DB container"
  default     = "wfss-pointid-api"
  type        = string
}

variable "wfone_notifications_api_container_name" {
  default     = "wfone-notifications-api"
  type        = string
}

variable "DATABASE_WEATHER_URL" {
  type    = string
  default = ""
}

variable "DATABASE_WEATHER_USER" {
  type    = string
  default = ""
}

variable "DATABASE_WEATHER_PWD" {
  type    = string
  default = ""
}

variable "BCGW_URL" {
  type    = string
  default = ""
}

variable "WFGS_URL" {
  type    = string
  default = ""
}

variable "MAX_ALLOWED_RADIUS" {
  type    = string
  default = ""
}

variable "POINTID_ASYNC_JOB_INTERVAL" {
  type    = number
  default = 1000
}

variable "POINTID_ASYNC_JOB_REF_LAT" {
  type    = string
  default = ""
}

variable "POINTID_ASYNC_JOB_REF_LONG" {
  type    = string
  default = ""
}

variable "POINTID_ASYNC_JOB_REF_RADIUS" {
  type    = string
  default = ""
}

variable "WEATHER_HOST" {
  type    = string
  default = ""
}

variable "WEATHER_USER" {
  type    = string
  default = ""
}

variable "WEATHER_PASSWORD" {
  type    = string
  default = ""
}

variable "WFARCGIS_URL" {
  type    = string
  default = ""
}

variable "WFARCGIS_LAYER_AREA_RESTRICTIONS" {
  type    = string
  default = ""
}

variable "WFARCGIS_LAYER_BANS_PROHIBITION_AREAS" {
  type    = string
  default = ""
}

variable "WFARCGIS_LAYER_DANGER_RATING" {
  type    = string
  default = ""
}

variable "WFARCGIS_LAYER_ACTIVE_FIRES" {
  type    = string
  default = ""
}

variable "WFARCGIS_LAYER_EVACUATION_ORDERS_ALERTS" {
  type    = string
  default = ""
}

variable "WFARCGIS_LAYER_FIRE_CENTRE_BOUNDARIES" {
  type    = string
  default = ""
}

variable "POINTID_WEBADE_OAUTH2_CLIENT_ID" {
  type    = string
  default = ""
}

variable "POINTID_WEBADE_OAUTH2_TOKEN_URL" {
  type    = string
  default = ""
}

variable "POINTID_WEBADE_OAUTH2_CLIENT_SCOPES" {
  type    = string
  default = ""
}

variable "FIREWEATHER_BASEURL" {
  type    = string
  default = ""
}

variable "FIREWEATHER_STATIONS_KEY" {
  type    = string
  default = ""
}

variable "WFNEWS_QUEUESIZE" {
  type    = string
  default = ""
}

variable "WEBADE_OAUTH2_CLIENT_SECRET" {
  type    = string
  default = ""
}

# WFONE-NOTIFICATIONS-API Environment Variables

variable "WFONE_NOTIFICATIONS_API_DATASOURCE_MAX_CONNECTIONS" {
  type    = string
  default = ""
}

variable "WFONE_NOTIFICATIONS_API_DATASOURCE_USER" {
  type    = string
  default = ""
}

variable "WFONE_NOTIFICATIONS_API_EMAIL_ADMIN_EMAIL" {
  type    = string
  default = ""
}

variable "WFONE_NOTIFICATIONS_API_EMAIL_FROM_EMAIL" {
  type    = string
  default = ""
}

variable "WFONE_NOTIFICATIONS_API_EMAIL_NOTIFICATIONS_ENABLED" {
  type    = string
  default = ""
}

variable "WFONE_NOTIFICATIONS_API_EMAIL_SYNC_SEND_ERROR_FREQ" {
  type    = string
  default = ""
}

variable "WFONE_NOTIFICATIONS_API_EMAIL_SYNC_SEND_ERROR_SUBJECT" {
  type    = string
  default = ""
}

variable "WFONE_NOTIFICATIONS_API_EMAIL_SYNC_SEND_FREQ" {
  type    = string
  default = ""
}

variable "WFONE_NOTIFICATIONS_API_EMAIL_SYNC_SUBJECT" {
  type    = string
  default = ""
}

variable "WFONE_NOTIFICATIONS_API_PUSH_ITEM_EXPIRE_HOURS" {
  type    = string
  default = ""
}

variable "WFONE_NOTIFICATIONS_API_QUARTZ_CONSUMER_INTERVAL_SECONDS" {
  type    = string
  default = ""
}

variable "WFONE_NOTIFICATIONS_API_SMTP_CREDENTIALS_PASSWORD" {
  type    = string
  default = ""
}

variable "WFONE_NOTIFICATIONS_API_SMTP_CREDENTIALS_USER" {
  type    = string
  default = ""
}

variable "WFONE_NOTIFICATIONS_API_SMTP_HOST_NAME" {
  type    = string
  default = ""
}

variable "WFONE_NOTIFICATIONS_API_WEBADE_OAUTH2_CLIENT_ID" {
  type    = string
  default = ""
}

variable "WFONE_NOTIFICATIONS_API_WEBADE_OAUTH2_REST_CLIENT_SECRET" {
  type    = string
  default = ""
}

variable "WFONE_NOTIFICATIONS_API_WEBADE_OAUTH2_WFIM_CLIENT_ID" {
  type    = string
  default = ""
}



//WFONE-PUSH-NOTIFICATION-API Environment Variables

variable wfone_notifications_push_api_container_name {
  type = string
  default = "wfone-notifications-push-api"
}

variable "WFONE_MONITORS_NAME_MAP" {
  type = map(object({
    EXPIRE_HOURS = number
  }))
}

variable "WFONE_NOTIFICATIONS_PUSH_MAX_CONNECTIONS" {
  type    = number
  default = 25
}

variable "WFONE_NOTIFICATIONS_PUSH_EXPIRE_HOURS" {
  type    = number
  default = 24
}

variable "WFONE_NOTIFICATIONS_PUSH_SQS_MONITOR_ATTRIBUTE" {
  type    = string
  default = ""
}

variable "WFONE_NOTIFICATIONS_PUSH_SQS_MAX_MESSAGES" {
  type    = number
  default = 10
}

variable "WFONE_NOTIFICATIONS_PUSH_SQS_WAIT_SECONDS" {
  type    = number
  default = 20
}

variable "WFONE_NOTIFICATIONS_PUSH_CONSUMER_INTERVAL_SECONDS" {
  type    = number
  default = 120
}

variable "WFONE_FIREBASE_DB_URL" {
  type    = string
  default = ""

}

variable "WFONE_NOTIFICATIONS_PUSH_PREFIX" {
  type    = string
  default = ""

}

variable "WFONE_NOTIFICATIONS_PUSH_NEAR_ME_INTERVAL_SECONDS" {
  type    = number
  default = 300

}

variable "WFONE_NOTIFICATIONS_PUSH_AWS_ACCESS_KEY" {
  type    = string
  default = ""

}

variable "WFONE_NOTIFICATIONS_PUSH_AWS_SECRET_KEY" {
  type    = string
  default = ""

}

variable "WFONE_DB_PASS" {
  type    = string
  default = ""

}

variable "WFONE_NOTIFICATIONS_PUSH_API_IMAGE" {
  type = string
  default = ""
}

variable "POINTID_WEBADE_OAUTH2_CLIENT_SECRET" {
  type = string
  default = ""
}


variable "WFONE_NOTIFICATIONS_API_WEBADE_OAUTH2_CHECK_TOKEN_URL" {
  type = string
  default = ""
}

variable "WFONE_NOTIFICATIONS_API_WEBADE_OAUTH2_TOKEN_CLIENT_URL" {
  type = string
  default = ""
}

variable "WFONE_NOTIFICATIONS_API_WEBADE_OAUTH2_TOKEN_URL" {
   type = string
   default = ""
}