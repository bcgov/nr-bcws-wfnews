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
  count = var.target_env == "prod" ? 1 : 0
  name = "prod.bcwildfireservices.com"
}

resource "aws_route53_record" "wfnews_legacy_record" {
  zone_id = data.aws_route53_zone.legacy_zone[0].id
  name    = data.aws_route53_zone.legacy_zone[0].name
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.wfnews_legacy_nginx[0].domain_name
    zone_id                = aws_cloudfront_distribution.wfnews_legacy_nginx[0].hosted_zone_id
    evaluate_target_health = true
  }
}
