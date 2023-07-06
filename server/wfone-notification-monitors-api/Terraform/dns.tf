//Route53 DNS Records

resource "aws_route53_record" "notifications_api_route53_record" {
  name    = "wfone-notifications-api-${module.vars.env.env_lowercase}.${var.custom_endpoint_url}"
  type    = "CNAME"
  zone_id = data.aws_route53_zone.main_route53_zone.id
  ttl     = 600
  records = [module.vars.env.NotificationsAPIURL]
}

resource "aws_route53_record" "wfss_pointid_api_record" {
  zone_id = data.aws_route53_zone.main_route53_zone.id
  name    = "wfss-pointid-api-${module.vars.env.env_lowercase}.${var.custom_endpoint_url}"
  type    = "CNAME"
  ttl     = 600
  records = [module.vars.env.WFSSPointIDAPIURL]
}

resource "aws_route53_record" "wfone_public_mobile_war_record" {
  zone_id = data.aws_route53_zone.main_route53_zone.id
  name    = "publicmobile-${module.vars.env.env_lowercase}.${var.custom_endpoint_url}"
  type    = "CNAME"
  ttl     = 600
  records = [module.vars.env.WFONEPublicMobileWarURL]
}

data "aws_lb_hosted_zone_id" "main" {
  load_balancer_type = "network"
}

resource "aws_route53_record" "ingress_api_gateway_record" {
  name    = "publicmobile-api-${module.vars.env.env_lowercase}.${var.custom_endpoint_url}"
  type    = "A"
  zone_id = data.aws_route53_zone.main_route53_zone.id
  alias {
    name = module.vars.env.IngressURL
    zone_id = data.aws_lb_hosted_zone_id.main.id
    evaluate_target_health = false
  }
}