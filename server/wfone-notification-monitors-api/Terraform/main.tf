terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "4.58.0"
    }
  }
  required_version = ">= 1.1.0"
}

locals {
  environment = terraform.workspace
}

module "vars" {
  source      = "./modules/vars"
  environment = local.environment
}

data "aws_caller_identity" "current" {}

data "aws_acm_certificate" "wildfirecert" {
  domain = "*.${var.custom_endpoint_url}"
}

data "aws_route53_zone" "main_route53_zone" {
  name = "${var.custom_endpoint_url}."
}




/*

//API GATEWAY RESOURCES

//API Gateway Role

resource "aws_api_gateway_rest_api" "notifications_reports_api" {
  name        = "wfone-notification-request-api-${module.vars.env.env_lowercase}"
  description = "Check for API Key, then pass to API"
}

resource "aws_api_gateway_domain_name" "gateway_custom_domain" {
  domain_name              = "wfone-notifications-reports-api-${module.vars.env.env_lowercase}.${var.custom_endpoint_url}"
  regional_certificate_arn = data.aws_acm_certificate.wildfirecert.arn
  endpoint_configuration {
    types = ["REGIONAL"]
  }
}

//  /{PROXY+} ENDPOINT
resource "aws_api_gateway_resource" "gateway_root_proxy_resource" {
  rest_api_id = aws_api_gateway_rest_api.notifications_reports_api.id
  parent_id   = aws_api_gateway_rest_api.notifications_reports_api.root_resource_id
  path_part   = "{proxy+}"
}

resource "aws_api_gateway_method" "root_proxy_post_method" {
  rest_api_id   = aws_api_gateway_rest_api.notifications_reports_api.id
  resource_id   = aws_api_gateway_resource.gateway_root_proxy_resource.id
  http_method   = "ANY"
  authorization = "NONE"
  request_parameters = {
    "method.request.path.proxy" = true
  }
  api_key_required = false
}

resource "aws_api_gateway_integration" "api" {
  rest_api_id             = aws_api_gateway_rest_api.notifications_reports_api.id
  resource_id             = aws_api_gateway_resource.gateway_root_proxy_resource.id
  http_method             = aws_api_gateway_method.root_proxy_post_method.http_method
  type                    = "HTTP_PROXY"
  integration_http_method = "ANY"
  uri                     = "http://${module.vars.env.NotificationsAPIURL}/{proxy}"
  request_parameters      = { "integration.request.path.proxy" = "method.request.path.proxy" }
}

//  /push ENDPOINT
resource "aws_api_gateway_resource" "push_resource" {
  rest_api_id = aws_api_gateway_rest_api.notifications_reports_api.id
  parent_id   = aws_api_gateway_rest_api.notifications_reports_api.root_resource_id
  path_part   = "push"
}

resource "aws_api_gateway_method" "push_method" {
  rest_api_id   = aws_api_gateway_rest_api.notifications_reports_api.id
  resource_id   = aws_api_gateway_resource.push_resource.id
  http_method   = "ANY"
  authorization = "NONE"
  request_parameters = {
    "method.request.path.proxy" = false
  }
  api_key_required = false
}

resource "aws_api_gateway_integration" "api_push" {
  rest_api_id             = aws_api_gateway_rest_api.notifications_reports_api.id
  resource_id             = aws_api_gateway_resource.push_resource.id
  http_method             = aws_api_gateway_method.push_method.http_method
  type                    = "HTTP_PROXY"
  integration_http_method = "ANY"
  uri                     = "http://${module.vars.env.NotificationPushAPIURL}"
}

//  /push/{proxy+} 
resource "aws_api_gateway_resource" "push_proxy_resource" {
  rest_api_id = aws_api_gateway_rest_api.notifications_reports_api.id
  parent_id   = aws_api_gateway_resource.push_resource.id
  path_part   = "{proxy+}"
}

resource "aws_api_gateway_method" "push_proxy_method" {
  rest_api_id   = aws_api_gateway_rest_api.notifications_reports_api.id
  resource_id   = aws_api_gateway_resource.push_proxy_resource.id
  http_method   = "ANY"
  authorization = "NONE"
  request_parameters = {
    "method.request.path.proxy" = true
  }
  api_key_required = false
}

resource "aws_api_gateway_integration" "api_push_proxy" {
  rest_api_id             = aws_api_gateway_rest_api.notifications_reports_api.id
  resource_id             = aws_api_gateway_resource.push_proxy_resource.id
  http_method             = aws_api_gateway_method.push_proxy_method.http_method
  type                    = "HTTP_PROXY"
  integration_http_method = "ANY"
  uri                     = "http://${module.vars.env.NotificationPushAPIURL}/{proxy}"
  request_parameters      = { "integration.request.path.proxy" = "method.request.path.proxy" }
}


//  /pointid ENDPOINT
resource "aws_api_gateway_resource" "pointid_resource" {
  rest_api_id = aws_api_gateway_rest_api.notifications_reports_api.id
  parent_id   = aws_api_gateway_rest_api.notifications_reports_api.root_resource_id
  path_part   = "pointid"
}

resource "aws_api_gateway_method" "pointid_method" {
  rest_api_id   = aws_api_gateway_rest_api.notifications_reports_api.id
  resource_id   = aws_api_gateway_resource.pointid_resource.id
  http_method   = "ANY"
  authorization = "NONE"
  request_parameters = {
    "method.request.path.proxy" = false
  }
  api_key_required = false
}

resource "aws_api_gateway_integration" "api_pointid" {
  rest_api_id             = aws_api_gateway_rest_api.notifications_reports_api.id
  resource_id             = aws_api_gateway_resource.pointid_resource.id
  http_method             = aws_api_gateway_method.pointid_method.http_method
  type                    = "HTTP_PROXY"
  integration_http_method = "ANY"
  uri                     = "http://${module.vars.env.WFSSPointIDAPIURL}"
}

//  /pointid/{proxy+} 
resource "aws_api_gateway_resource" "pointid_proxy_resource" {
  rest_api_id = aws_api_gateway_rest_api.notifications_reports_api.id
  parent_id   = aws_api_gateway_resource.pointid_resource.id
  path_part   = "{proxy+}"
}

resource "aws_api_gateway_method" "pointid_proxy_method" {
  rest_api_id   = aws_api_gateway_rest_api.notifications_reports_api.id
  resource_id   = aws_api_gateway_resource.pointid_proxy_resource.id
  http_method   = "ANY"
  authorization = "NONE"
  request_parameters = {
    "method.request.path.proxy" = true
  }
  api_key_required = false
}

resource "aws_api_gateway_integration" "api_pointid_proxy" {
  rest_api_id             = aws_api_gateway_rest_api.notifications_reports_api.id
  resource_id             = aws_api_gateway_resource.pointid_proxy_resource.id
  http_method             = aws_api_gateway_method.pointid_proxy_method.http_method
  type                    = "HTTP_PROXY"
  integration_http_method = "ANY"
  uri                     = "http://${module.vars.env.WFSSPointIDAPIURL}/{proxy}"
  request_parameters      = { "integration.request.path.proxy" = "method.request.path.proxy" }
}


resource "aws_api_gateway_deployment" "notifications_reports_api_deployment" {
  rest_api_id = aws_api_gateway_rest_api.notifications_reports_api.id
  stage_name  = module.vars.env.env
  depends_on = [
    aws_api_gateway_integration.api,
    aws_api_gateway_integration.api_push,
    aws_api_gateway_integration.api_push_proxy,
    aws_api_gateway_integration.api_pointid,
    aws_api_gateway_integration.api_pointid_proxy
  ]

  triggers = {
    redeployment = sha1(jsonencode(aws_api_gateway_rest_api.notifications_reports_api.body))
  }

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_api_gateway_base_path_mapping" "api_gateway_base_path_mapping" {
  api_id      = aws_api_gateway_rest_api.notifications_reports_api.id
  stage_name  = aws_api_gateway_deployment.notifications_reports_api_deployment.stage_name
  domain_name = aws_api_gateway_domain_name.gateway_custom_domain.domain_name
}
*/


