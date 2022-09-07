data "aws_route53_zone" "zone" {
    name = "dev.bcwildfireservices.com"
}

resource "aws_route53_record" "wfnews_server" {
    zone_id = data.aws_route53_zone.zone.id
    name = "wfnews-server.${var.target_env}.bcwildfireservices.com"
    type = "A"
    alias { 
        name = aws_cloudfront_distribution.wfnews_geofencing_server[0].domain_name
        zone_id = aws_cloudfront_distribution.wfnews_geofencing_server[0].hosted_zone_id
        evaluate_target_health = true
    }

}

 resource "aws_route53_record" "wfnews_client" {
     zone_id = data.aws_route53_zone.zone.id
     name = "wfnews-client.${var.target_env}.bcwildfireservices.com"
     type = "A"
     alias { 
        name = aws_cloudfront_distribution.wfnews_geofencing_client[0].domain_name
        zone_id = aws_cloudfront_distribution.wfnews_geofencing_client[0].hosted_zone_id
        evaluate_target_health = true
    }
 }

  resource "aws_route53_record" "wfnews_db" {
     zone_id = data.aws_route53_zone.zone.id
     name = "wfnews-client.${var.target_env}.bcwildfireservices.com"
     type = "A"
     alias { 
        name = aws_cloudfront_distribution.wfnews_geofencing_db[0].domain_name
        zone_id = aws_cloudfront_distribution.wfnews_geofencing_db[0].hosted_zone_id
        evaluate_target_health = true
    }
 }
