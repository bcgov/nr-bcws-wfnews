data "aws_route53_zone" "zone" {
    name = "${var.target_env}.bcwildfireservices.com"
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

 resource "aws_route53_record" "wfnews_client_uat" {
     zone_id = data.aws_route53_zone.zone.id
     name = "wfnews-client-uat-2022.${var.target_env}.bcwildfireservices.com"
     type = "A"
     alias { 
        name = aws_cloudfront_distribution.wfnews_geofencing_client[0].domain_name
        zone_id = aws_cloudfront_distribution.wfnews_geofencing_client[0].hosted_zone_id
        evaluate_target_health = true
    }
 }

  resource "aws_route53_record" "wfnews_apisix" {
     zone_id = data.aws_route53_zone.zone.id
     name = "wfnews-api.${var.target_env}.bcwildfireservices.com"
     type = "A"
     alias { 
        name = aws_cloudfront_distribution.wfnews_geofencing_apisix[0].domain_name
        zone_id = aws_cloudfront_distribution.wfnews_geofencing_apisix[0].hosted_zone_id
        evaluate_target_health = true
    }
 }

/*
 resource "aws_route53_record" "wfnews_apisix_admin" {
     zone_id = data.aws_route53_zone.zone.id
     name = "wfnews-api-admin.${var.target_env}.bcwildfireservices.com"
     type = "A"
     alias { 
        name = aws_cloudfront_distribution.wfnews_geofencing_apisix_admin[0].domain_name
        zone_id = aws_cloudfront_distribution.wfnews_geofencing_apisix_admin[0].hosted_zone_id
        evaluate_target_health = true
    }
 }

  resource "aws_route53_record" "wfnews_apisix_gui" {
     zone_id = data.aws_route53_zone.zone.id
     name = "wfnews-api-gui.${var.target_env}.bcwildfireservices.com"
     type = "A"
     alias { 
        name = aws_cloudfront_distribution.wfnews_geofencing_apisix_gui[0].domain_name
        zone_id = aws_cloudfront_distribution.wfnews_geofencing_apisix_gui[0].hosted_zone_id
        evaluate_target_health = true
    }
 }
*/

