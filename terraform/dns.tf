data "aws_route53_zone" "zone" {
    name = "bcwildfireservices.com"
}

resource "aws_route53_record" server {
    zone_id = data.aws_route53_zone.zone.id
    name = "wfnews-server-${var.target_env}.bcwildfireservices.com"
    type = "CNAME"
    ttl = "300"
    records = [aws_lb.main.dns_name]

}

resource "aws_route53_record" client {
    zone_id = data.aws_route53_zone.zone.id
    name = "wfnews-client-${var.target_env}.bcwildfireservices.com"
    type = "CNAME"
    ttl = "300"
    records = [aws_lb.client.dns_name]
}