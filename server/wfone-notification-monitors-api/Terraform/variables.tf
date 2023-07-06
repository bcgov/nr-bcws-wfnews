#VARIABLES USED ACROSS ALL RESOURCES
variable "application" {
  type        = string
  description = "name of application"
  default     = "wfone-public-mobile"
}

variable "customer" {
  type        = string
  description = "name of customer"
  default     = "WildFireOne"
}

variable "region" {
  type        = string
  description = "AWS Region, where to deploy cluster."
  default     = "ca-central-1"
}

variable "accountNum" {
  type        = string
  description = "account number of AWS account running script"
  default     = null
}

variable "custom_endpoint_url" {
  type        = string
  description = "URL matching custom endpoint cert"
  default     = "bcwildfireservices.com"
}

variable "env" {
  type        = string
  description = "Suffix appended to all managed resource names to indicate their environment"
  default     = ""
}

variable "env_lowercase" {
  type        = string
  description = "env in lowercase"
  default     = ""
}

variable "env_full" {
  type        = string
  description = "full name of environment (i.e. INTEGRATION)"
  default     = ""
}


#SQS-specific variables



variable "maxReceivedCount" {
  type        = number
  description = "How many messages can be placed into the deadletter queue"
  default     = 100
}

variable "visibilityTimeoutSeconds" {
  type        = number
  description = "Suffix appended to all managed resource names"
  default     = 60
}

variable "acceptedIPs" {
  type        = string
  description = "IPs allowed to send to queue"
  #TODO: Make wfone-notification-push-api use AWS credentials and remove this
  default = ""
}

variable "PushNotificationAwsUser" {
  type = string
  description = "User used by wfone-notification-push-api"
  default=""
}


#DNS-RELATED VARIABLES

variable "NotificationsAPIURL" {
  type        = string
  description = "URL for the wfone-notifications-api load balancer"
  default     = ""
}

variable "NotificationPushAPIURL" {
  type        = string
  description = "URL for the wfone-notification-push-api load balancer"
  default     = ""
}

variable "WFSSPointIDAPIURL" {
  type        = string
  description = "URL for the wfss-pointid-api load balancer"
  default     = ""
}

variable "WFONEPublicMobileWarURL" {
  type        = string
  description = "URL for the wfone-public-mobile-war load balancer"
  default     = ""
}

variable "IngressURL" {
  type = string
  description = "URL for ingress NLB"
  default = ""
}

variable "wfnewsUrl" {
  type = string
  description = "URL for WFNEWS api"
  default = ""
}

#Lambda-related variables
variable "EventBridgeARN" {
  type    = string
  default = ""
}

variable "BanProhibitionMonitorKey" {
  type    = string
  default = ""
}

variable "ActiveFireMonitorKey" {
  type    = string
  default = ""
}

variable "AreaRestrictionsMonitorKey" {
  type    = string
  default = ""
}

variable "EvacuationMonitorKey" {
  type    = string
  default = ""
}

variable "TwitterMonitorKey" {
  type    = string
  default = ""
}

variable "LambdaLayerKey" {
  type    = string
  default = ""
}
