data "aws_route53_zone" "zone" {
  name = "wfnews-${local.PMNamesMap[var.target_env]}.bcwildfireservices.com"
}



resource "aws_route53_record" "wfnews_record" {
  zone_id = data.aws_route53_zone.zone.id
  name    = data.aws_route53_zone.zone.name
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.wfnews_distribution.domain_name
    zone_id                = aws_cloudfront_distribution.wfnews_distribution.hosted_zone_id
    evaluate_target_health = true
  }
}


data "aws_route53_zone" "legacy_zone" {
  name = "${var.target_env}.bcwildfireservices.com"
}

resource "aws_route53_record" "wfnews_legacy_nginx_record" {
  zone_id = data.aws_route53_zone.legacy_zone.id
  name    = "wfnews-api.${data.aws_route53_zone.legacy_zone.name}"
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.wfnews_legacy_nginx.domain_name
    zone_id                = aws_cloudfront_distribution.wfnews_legacy_nginx.hosted_zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "wfnews_legacy_pointid_record" {
  count = var.target_env == "prod" ? 1 : 0
  zone_id = data.aws_route53_zone.legacy_zone.id
  name    = "wfss-pointid-api.${data.aws_route53_zone.legacy_zone.name}"
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.wfnews_legacy_pointid[0].domain_name
    zone_id                = aws_cloudfront_distribution.wfnews_legacy_pointid[0].hosted_zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "wfnews_legacy_services6_record" {
  count = var.target_env == "prod" ? 1 : 0
  zone_id = data.aws_route53_zone.legacy_zone.id
  name    = "services6.${data.aws_route53_zone.legacy_zone.name}"
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.wfnews_legacy_services6[0].domain_name
    zone_id                = aws_cloudfront_distribution.wfnews_legacy_services6[0].hosted_zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "wfnews_legacy_maps_record" {
  count = var.target_env == "prod" ? 1 : 0
  zone_id = data.aws_route53_zone.legacy_zone.id
  name    = "maps.${data.aws_route53_zone.legacy_zone.name}"
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.wfnews_legacy_maps[0].domain_name
    zone_id                = aws_cloudfront_distribution.wfnews_legacy_maps[0].hosted_zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "wfnews_legacy_notifications_record" {
  count = var.target_env == "prod" ? 1 : 0
  zone_id = data.aws_route53_zone.legacy_zone.id
  name    = "wfone-notifications-api.${data.aws_route53_zone.legacy_zone.name}"
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.wfnews_legacy_notifications[0].domain_name
    zone_id                = aws_cloudfront_distribution.wfnews_legacy_notifications[0].hosted_zone_id
    evaluate_target_health = true
  }
}

