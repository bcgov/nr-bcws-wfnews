data "aws_route53_zone" "zone" {
  name = "wfnews-${local.PMNamesMap[var.target_env]}.bcwildfireservices.com"
}



resource "aws_route53_record" "wfnews_server" {
  zone_id = data.aws_route53_zone.zone.id
  name    = data.aws_route53_zone.zone.name
  type    = "A"
  alias {
    name                   = aws_cloudfront_distribution.wfnews_geofencing_server.domain_name
    zone_id                = aws_cloudfront_distribution.wfnews_geofencing_server.hosted_zone_id
    evaluate_target_health = true
  }
}
