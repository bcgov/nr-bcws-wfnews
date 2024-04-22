data "aws_route53_zone" "zone" {
  name = "${var.target_env}.bcwildfireservices.com"
}

data "aws_route53_zone" "base_zone" {
  name = "bcwildfireservices.com"
}

resource "aws_route53_record" "wfnews_server" {
  zone_id = data.aws_route53_zone.zone.id
  name    = "wfnews-server.${var.target_env}.bcwildfireservices.com"
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.wfnews_geofencing_server[0].domain_name
    zone_id                = aws_cloudfront_distribution.wfnews_geofencing_server[0].hosted_zone_id
    evaluate_target_health = true
  }

}

resource "aws_route53_record" "wfnews_client" {
  //We will eventually phase out old URLs, but use them for now
  //count = var.target_env == "prod" ? 0 : 1

  zone_id = data.aws_route53_zone.zone.id
  name    = "wfnews-client.${var.target_env}.bcwildfireservices.com"
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.wfnews_geofencing_client[0].domain_name
    zone_id                = aws_cloudfront_distribution.wfnews_geofencing_client[0].hosted_zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "wfnews_client_uat" {
  //We will eventually phase out old URLs, but use them for now
  //count = var.target_env == "prod" ? 0 : 1

  zone_id = data.aws_route53_zone.zone.id
  name    = "wfnews-client-uat-2022.${var.target_env}.bcwildfireservices.com"
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.wfnews_geofencing_client[0].domain_name
    zone_id                = aws_cloudfront_distribution.wfnews_geofencing_client[0].hosted_zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "wfnews_nginx" {
  //We will eventually phase out old URLs, but use them for now
  //count = var.target_env == "prod" ? 0 : 1

  zone_id = data.aws_route53_zone.zone.id
  name    = "wfnews-api.${var.target_env}.bcwildfireservices.com"
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.wfnews_geofencing_nginx[0].domain_name
    zone_id                = aws_cloudfront_distribution.wfnews_geofencing_nginx[0].hosted_zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "wfss_pointid" {
  //We will eventually phase out old URLs, but use them for now
  //count = var.target_env == "prod" ? 0 : 1

  zone_id = data.aws_route53_zone.zone.id
  name    = "wfss-pointid-api.${var.target_env}.bcwildfireservices.com"
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.wfss_pointid_api[0].domain_name
    zone_id                = aws_cloudfront_distribution.wfss_pointid_api[0].hosted_zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "wfone-notifications-api" {
  //We will eventually phase out old URLs, but use them for now
  //count = var.target_env == "prod" ? 0 : 1

  zone_id = data.aws_route53_zone.zone.id
  name    = "wfone-notifications-api.${var.target_env}.bcwildfireservices.com"
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.wfone_notifications_api[0].domain_name
    zone_id                = aws_cloudfront_distribution.wfone_notifications_api[0].hosted_zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "wfnews_openmaps_cache" {
  //We will eventually phase out old URLs, but use them for now
  //count = var.target_env == "prod" ? 0 : 1

  zone_id = data.aws_route53_zone.zone.id
  name    = "maps.${var.target_env}.bcwildfireservices.com"
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.wfnews_openmaps_cache[0].domain_name
    zone_id                = aws_cloudfront_distribution.wfnews_openmaps_cache[0].hosted_zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "wfnews_services6_cache" {
  //We will eventually phase out old URLs, but use them for now
  //count = var.target_env == "prod" ? 0 : 1

  zone_id = data.aws_route53_zone.zone.id
  name    = "services6.${var.target_env}.bcwildfireservices.com"
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.wfnews_services6_cache[0].domain_name
    zone_id                = aws_cloudfront_distribution.wfnews_services6_cache[0].hosted_zone_id
    evaluate_target_health = true
  }
}