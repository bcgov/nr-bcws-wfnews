data "aws_route53_zone" "zone" {
    name = "bcwildfireservices.com"
}

# resource "aws_route53_record" "wfnews_server" {
#     zone_id = data.aws_route53_zone.zone.id
#     name = "wf1-wfnews-${var.target_env}.bcwildfireservices.com"
#     type = "CNAME"
#     ttl = "300"
#     records = [aws_cloudfront_distribution.wfnews_geofencing_client.domain_name]

# }

#  resource "aws_route53_record" "wfnews_client" {
#      zone_id = data.aws_route53_zone.zone.id
#      name = "wf1-wfnews-client-${var.target_env}.bcwildfireservices.com"
#      type = "CNAME"
#      ttl = "300"
#      records = [aws_cloudfront_distribution.wfnews_geofencing_server.domain_name]
#  }
