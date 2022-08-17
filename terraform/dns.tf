data "aws_route53_zone" "zone" {
    name = "bcwildfireservices.com"
}

#resource "aws_route53_record" "wfnews_server" {
#    zone_id = data.aws_route53_zone.zone.id
#    name = "wfnews-${var.target_env}.bcwildfireservices.com"
#    type = "CNAME"
#    ttl = "300"
#    records = [data.aws_lb.wfnews_main.dns_name]
#
#}

# resource "aws_route53_record" "wfnews_client" {
#     zone_id = data.aws_route53_zone.zone.id
#     name = "wfnews-client-${var.target_env}.bcwildfireservices.com"
#     type = "CNAME"
#     ttl = "300"
#     records = [aws_lb.wfnews_client.dns_name]
# }
