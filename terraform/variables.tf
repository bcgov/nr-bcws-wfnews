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

variable "db_instance_type" {
  description = "Instance type to use for database vm"
  type        = string
}

variable "logging_level" {
  type        = string
  description = "Logging level for components"
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

variable "apisix_names" {
  description = "List of service names to use as subdomains"
  default     = ["wfnews-api"]
  type        = list(string)
}

# variable "apisix_admin_names" {
#   description = "List of service names to use as subdomains"
#   default     = ["wfnews-api-admin"]
#   type        = list(string)
# }

# variable "etcd_names" {
#   description = "List of service names to use as subdomains"
#   default     = ["wfnews-etcd"]
#   type        = list(string)
# }

# variable "etcd_password" {
#   description = "Password to use for etcd access"
#   type = string
# }

# variable "apisix_gui_names" {
#   description = "List of service names to use as subdomains"
#   default     = ["wfnews-api-gui"]
#   type        = list(string)
# }

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
  description = "ARN of bcwildfire certificate"
  type        = string
}

variable "liquibase_container_name" {
  description = "Name of DB container"
  default     = "wfnews-liquibase-app"
  type        = string
}

variable "liquibase_image" {
  description = "Full name of liquibase image"
  type        = string
  default     = ""
}

variable "apisix_name" {
  description = "Name of apisix app"
  type        = string
  default     = "wfnews-apisix-app"
}

variable "apisix_container_name" {
  description = "Name of apisix container"
  default     = "wfnews-apisix-app"
  type        = string
}

variable "max_upload_size" {
  description = "Maximum upload size permitted"
  default = "10M"
  type = string
}

# variable etcd_container_name {
#   description = "Name of etcd container"
#   default = "wfnews-etcd-app"
#   type = string
# } 

# variable apisix_gui_container_name {
#   description = "Name of apisix gui container"
#   default = "wfnews-apisix-gui-app"
#   type = string
# } 

variable "apisix_image" {
  description = "Full name of apisix image"
  default     = ""
  type        = string
}

variable "etcd_image" {
  description = "Full name of etcd image"
  default     = ""
  type        = string
}

variable "apisix_gui_image" {
  description = "Full name of apisix gui image"
  default     = ""
  type        = string
}

variable "apisix_ports" {
  description = "Port apisix listens on"
  default     = [8080, 9080, 9443]
  type        = list(number)
}

variable "apisix_admin_port" {
  description = "Port apisix listens on for config updates/changes"
  default     = 9180
  type        = number
}

variable "etcd_port" {
  description = "Port etcd listens on"
  default     = 2379
}

variable "apisix_gui_port" {
  description = "Port the apisix gui listens on"
  default     = 9000
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
variable "WFIM_CLIENT_URL" {
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

variable "agolAreaRestrictions" {
  type    = string
  default = ""
}

variable "agolBansAndProhibitions" {
  type    = string
  default = ""
}

variable "WEBADE_OAUTH2_WFNEWS_UI_CLIENT_SECRET" {
  type    = string
  default = ""
}