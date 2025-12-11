data "aws_route53_zone" "zone" {
  name = "${local.PMNamesMap[var.target_env]}.bcwildfireservices.com"
}

resource "aws_route53_record" "wfnews_server" {
  zone_id = data.aws_route53_zone.zone.id
  name    = "wfnews-server.${local.PMNamesMap[var.target_env]}.bcwildfireservices.com"
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.wfnews_geofencing_server.domain_name
    zone_id                = aws_cloudfront_distribution.wfnews_geofencing_server.hosted_zone_id
    evaluate_target_health = true
  }

}

resource "aws_route53_record" "wfnews_client" {
  //We will eventually phase out old URLs, but use them for now
  //count = var.target_env == "prod" ? 0 : 1

  zone_id = data.aws_route53_zone.zone.id
  name    = "wfnews-client.${local.PMNamesMap[var.target_env]}.bcwildfireservices.com"
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.wfnews_geofencing_client.domain_name
    zone_id                = aws_cloudfront_distribution.wfnews_geofencing_client.hosted_zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "wfnews_client_uat" {
  //We will eventually phase out old URLs, but use them for now
  //count = var.target_env == "prod" ? 0 : 1

  zone_id = data.aws_route53_zone.zone.id
  name    = "wfnews-client-uat-2022.${local.PMNamesMap[var.target_env]}.bcwildfireservices.com"
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.wfnews_geofencing_client.domain_name
    zone_id                = aws_cloudfront_distribution.wfnews_geofencing_client.hosted_zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "wfnews_nginx" {
  //We will eventually phase out old URLs, but use them for now
  //count = var.target_env == "prod" ? 0 : 1

  zone_id = data.aws_route53_zone.zone.id
  name    = "wfnews-api.${local.PMNamesMap[var.target_env]}.bcwildfireservices.com"
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.wfnews_geofencing_nginx.domain_name
    zone_id                = aws_cloudfront_distribution.wfnews_geofencing_nginx.hosted_zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "wfss_pointid" {
  //We will eventually phase out old URLs, but use them for now
  //count = var.target_env == "prod" ? 0 : 1

  zone_id = data.aws_route53_zone.zone.id
  name    = "wfss-pointid-api.${local.PMNamesMap[var.target_env]}.bcwildfireservices.com"
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.wfss_pointid_api.domain_name
    zone_id                = aws_cloudfront_distribution.wfss_pointid_api.hosted_zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "wfone-notifications-api" {
  //We will eventually phase out old URLs, but use them for now
  //count = var.target_env == "prod" ? 0 : 1

  zone_id = data.aws_route53_zone.zone.id
  name    = "wfone-notifications-api.${local.PMNamesMap[var.target_env]}.bcwildfireservices.com"
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.wfone_notifications_api.domain_name
    zone_id                = aws_cloudfront_distribution.wfone_notifications_api.hosted_zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "wfnews_openmaps_cache" {
  //We will eventually phase out old URLs, but use them for now
  //count = var.target_env == "prod" ? 0 : 1

  zone_id = data.aws_route53_zone.zone.id
  name    = "maps.${local.PMNamesMap[var.target_env]}.bcwildfireservices.com"
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.wfnews_openmaps_cache.domain_name
    zone_id                = aws_cloudfront_distribution.wfnews_openmaps_cache.hosted_zone_id
    evaluate_target_health = true
  }
}

resource "aws_route53_record" "wfnews_services6_cache" {
  //We will eventually phase out old URLs, but use them for now
  //count = var.target_env == "prod" ? 0 : 1

  zone_id = data.aws_route53_zone.zone.id
  name    = "services6.${local.PMNamesMap[var.target_env]}.bcwildfireservices.com"
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.wfnews_services6_cache.domain_name
    zone_id                = aws_cloudfront_distribution.wfnews_services6_cache.hosted_zone_id
    evaluate_target_health = true
  }
}