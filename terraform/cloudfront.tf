locals {
  PMNamesMap = {
    dev = "int"
    test = "tst"
    prod = "prod"
  }
} 

resource "aws_cloudfront_distribution" "wfnews_geofencing_client" {

  count = var.cloudfront ? 1 : 0

  aliases = ["wfnews-client.${var.target_env}.bcwildfireservices.com", "wfnews-client-uat-2022.${var.target_env}.bcwildfireservices.com"]

  origin {
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols = [
      "TLSv1.2"]
    }

    domain_name = "wfnews-client.${var.license_plate}-${var.target_env}.nimbus.cloud.gov.bc.ca"
    origin_id   = "wfnews_client_${var.target_env}"
    custom_header {
      name  = "X-Cloudfront-Header"
      value = var.cloudfront_header
    }
  }

  enabled         = true
  is_ipv6_enabled = true
  comment         = "geofencing"

  //	- logging should probably be in a central location (centralized-logging account?) - in an aggregated/shared bucket and perhaps also synced into a bucket within the account where the aws-login app is deployed
  //	- prefix should follow SEA convention like <account>/<region>/<service name> eg. 12345678/ca-central-1/cloudfront
  //
  //  logging_config {
  //    include_cookies = false
  //    bucket          = "<mylogs>.s3.amazonaws.com"
  //    prefix          = "geofencing"
  //  }

  default_cache_behavior {
    allowed_methods = [
      "DELETE",
      "GET",
      "HEAD",
      "OPTIONS",
      "PATCH",
      "POST",
    "PUT"]
    cached_methods = ["GET", "HEAD"]

    target_origin_id = "wfnews_client_${var.target_env}"

    forwarded_values {
      query_string = true
      headers      = ["Origin", "Authorization"]

      cookies {
        forward = "all"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 300
    max_ttl                = 86400

    response_headers_policy_id = aws_cloudfront_response_headers_policy.cache_control_reponse_headers.id
  }

  ordered_cache_behavior {
    path_pattern           = "/assets/*"
    allowed_methods        = ["GET", "OPTIONS", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    response_headers_policy_id=aws_cloudfront_response_headers_policy.strip-vulnerable-headers.id
    target_origin_id       = "wfnews_client_${var.target_env}"
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6"
  }

  ordered_cache_behavior {
    path_pattern           = "/*.js"
    allowed_methods        = ["GET", "OPTIONS", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    response_headers_policy_id=aws_cloudfront_response_headers_policy.strip-vulnerable-headers.id
    target_origin_id       = "wfnews_client_${var.target_env}"
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6"
  }

  ordered_cache_behavior {
    path_pattern           = "/*.css"
    allowed_methods        = ["GET", "OPTIONS", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    response_headers_policy_id=aws_cloudfront_response_headers_policy.strip-vulnerable-headers.id
    target_origin_id       = "wfnews_client_${var.target_env}"
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6"
  }

  ordered_cache_behavior {
    path_pattern           = "/youtube.jsp"
    allowed_methods        = ["GET", "OPTIONS", "HEAD"]
    cached_methods         = ["GET", "OPTIONS", "HEAD"]
    target_origin_id       = "wfnews_client_${var.target_env}"
    response_headers_policy_id=aws_cloudfront_response_headers_policy.strip-vulnerable-headers.id
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 86400
    max_ttl                = 86400
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6"
  }

  ordered_cache_behavior {
    path_pattern    = "/static/*"
    allowed_methods = ["GET", "HEAD"]
    cached_methods  = ["GET", "HEAD"]

    target_origin_id = "wfnews_client_${var.target_env}"

    response_headers_policy_id=aws_cloudfront_response_headers_policy.strip-vulnerable-headers.id

    forwarded_values {
      query_string = false
      headers      = ["Origin", "Authorization"]
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 300
    max_ttl                = 86400
  }

  price_class = "PriceClass_100"

  restrictions {
    geo_restriction {
      restriction_type = var.target_env == "prod" ? "none" : "whitelist"
      locations        = var.target_env == "prod" ? [] : ["CA", "US", "AR"]
    }
  }

  tags = local.common_tags

  viewer_certificate {
    acm_certificate_arn = var.certificate_arn
    ssl_support_method  = "sni-only"
  }

}

resource "aws_cloudfront_distribution" "wfnews_geofencing_server" {

  count = var.cloudfront ? 1 : 0

  aliases = ["wfnews-server.${var.target_env}.bcwildfireservices.com"]

  origin {
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols = [
      "TLSv1.2"]
    }

    domain_name = "wfnews-server.${var.license_plate}-${var.target_env}.nimbus.cloud.gov.bc.ca"
    origin_id   = "wfnews_server_${var.target_env}"

    custom_header {
      name  = "X-Cloudfront-Header"
      value = var.cloudfront_header
    }
  }

  enabled         = true
  is_ipv6_enabled = true
  comment         = "geofencing"

  //	- logging should probably be in a central location (centralized-logging account?) - in an aggregated/shared bucket and perhaps also synced into a bucket within the account where the aws-login app is deployed
  //	- prefix should follow SEA convention like <account>/<region>/<service name> eg. 12345678/ca-central-1/cloudfront
  //
  //  logging_config {
  //    include_cookies = false
  //    bucket          = "<mylogs>.s3.amazonaws.com"
  //    prefix          = "geofencing"
  //  }

  default_cache_behavior {
    allowed_methods = [
      "DELETE",
      "GET",
      "HEAD",
      "OPTIONS",
      "PATCH",
      "POST",
    "PUT"]
    cached_methods = ["GET", "HEAD"]

    target_origin_id = "wfnews_server_${var.target_env}"

    forwarded_values {
      query_string = true
      headers      = ["Origin"]

      cookies {
        forward = "all"
      }
    }

    response_headers_policy_id = aws_cloudfront_response_headers_policy.cache_control_reponse_headers.id

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 300
    max_ttl                = 86400
  }

  ordered_cache_behavior {
    path_pattern    = "/static/*"
    allowed_methods = ["GET", "HEAD"]
    cached_methods  = ["GET", "HEAD"]

    target_origin_id = "wfnews_server_${var.target_env}"
    response_headers_policy_id=aws_cloudfront_response_headers_policy.strip-vulnerable-headers.id

    forwarded_values {
      query_string = false
      headers      = ["Origin"]

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 300
    max_ttl                = 86400
  }

  price_class = "PriceClass_100"

  restrictions {
    geo_restriction {
      restriction_type = var.target_env == "prod" ? "none" : "whitelist"
      locations        = var.target_env == "prod" ? [] : ["CA", "US", "AR"]
    }
  }

  tags = local.common_tags

  viewer_certificate {
    acm_certificate_arn = var.certificate_arn
    ssl_support_method  = "sni-only"
  }
}

resource "aws_cloudfront_distribution" "wfnews_geofencing_nginx" {

  count = var.cloudfront ? 1 : 0

  aliases = ["wfnews-api.${var.target_env}.bcwildfireservices.com"]

  origin {
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols = [
        "TLSv1.2"
      ]
    }

    domain_name = "${var.nginx_names[0]}.${var.license_plate}-${var.target_env}.nimbus.cloud.gov.bc.ca"
    origin_id   = "wfnews_nginx_${var.target_env}"

    custom_header {
      name  = "X-Cloudfront-Header"
      value = var.cloudfront_header
    }
  }

  enabled         = true
  is_ipv6_enabled = true
  comment         = "geofencing"

  //	- logging should probably be in a central location (centralized-logging account?) - in an aggregated/shared bucket and perhaps also synced into a bucket within the account where the aws-login app is deployed
  //	- prefix should follow SEA convention like <account>/<region>/<service name> eg. 12345678/ca-central-1/cloudfront
  //
  //  logging_config {
  //    include_cookies = false
  //    bucket          = "<mylogs>.s3.amazonaws.com"
  //    prefix          = "geofencing"
  //  }

  default_cache_behavior {
    allowed_methods = [
      "DELETE",
      "GET",
      "HEAD",
      "OPTIONS",
      "PATCH",
      "POST",
    "PUT"]
    cached_methods = ["GET", "HEAD"]

    target_origin_id = "wfnews_nginx_${var.target_env}"

    forwarded_values {
      query_string = true
      headers      = ["Origin", "Authorization", "X-API-KEY", "apikey"]

      cookies {
        forward = "all"
      }
    }

    response_headers_policy_id = aws_cloudfront_response_headers_policy.cache_control_reponse_headers.id

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 300
    max_ttl                = 86400
  }

  ordered_cache_behavior {
    path_pattern           = "/publicPublishedIncidentAttachment/*/attachments/*"
    allowed_methods        = ["GET", "OPTIONS", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "wfnews_nginx_${var.target_env}"
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6"

    response_headers_policy_id = aws_cloudfront_response_headers_policy.cache_control_reponse_headers.id
  }

  ordered_cache_behavior {
    path_pattern    = "/static/*"
    allowed_methods = ["GET", "HEAD"]
    cached_methods  = ["GET", "HEAD"]

    target_origin_id = "wfnews_nginx_${var.target_env}"

    response_headers_policy_id=aws_cloudfront_response_headers_policy.strip-vulnerable-headers.id

    forwarded_values {
      query_string = true
      headers      = ["Origin", "Authorization", "X-API-KEY", "apikey"]

      cookies {
        forward = "all"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 300
    max_ttl                = 86400
  }

  price_class = "PriceClass_100"

  restrictions {
    geo_restriction {
      restriction_type = var.target_env == "prod" ? "none" : "whitelist"
      locations        = var.target_env == "prod" ? [] : ["CA", "US", "AR"]
    }
  }

  tags = local.common_tags

  viewer_certificate {
    acm_certificate_arn = var.certificate_arn
    ssl_support_method  = "sni-only"
  }
}

resource "aws_cloudfront_distribution" "wfnews_geofencing_gov_client" {
  // only generate in prod environment
  count = var.target_env == "prod" ? 1 : 0


  aliases = ["${var.cloudfront_gov_origin_name}.${var.cloudfront_gov_origin_tail}"]

  origin {
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols = [
      "TLSv1.2"]
    }

    domain_name = "wfnews-client.${var.license_plate}-${var.target_env}.nimbus.cloud.gov.bc.ca"
    origin_id   = "wfnews_client_gov_${var.target_env}"
    custom_header {
      name  = "X-Cloudfront-Header"
      value = var.cloudfront_header
    }
  }

  enabled         = true
  is_ipv6_enabled = true
  comment         = "geofencing"

  //	- logging should probably be in a central location (centralized-logging account?) - in an aggregated/shared bucket and perhaps also synced into a bucket within the account where the aws-login app is deployed
  //	- prefix should follow SEA convention like <account>/<region>/<service name> eg. 12345678/ca-central-1/cloudfront
  //
  //  logging_config {
  //    include_cookies = false
  //    bucket          = "<mylogs>.s3.amazonaws.com"
  //    prefix          = "geofencing"
  //  }

  default_cache_behavior {
    allowed_methods = [
      "DELETE",
      "GET",
      "HEAD",
      "OPTIONS",
      "PATCH",
      "POST",
    "PUT"]
    cached_methods = ["GET", "HEAD"]

    target_origin_id = "wfnews_client_gov_${var.target_env}"

    forwarded_values {
      query_string = true
      headers      = ["Origin", "Authorization"]

      cookies {
        forward = "all"
      }
    }

    response_headers_policy_id = aws_cloudfront_response_headers_policy.cache_control_reponse_headers.id

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 300
    max_ttl                = 86400
  }

  ordered_cache_behavior {
    path_pattern    = "/static/*"
    allowed_methods = ["GET", "HEAD"]
    cached_methods  = ["GET", "HEAD"]

    target_origin_id = "wfnews_client_gov_${var.target_env}"

    response_headers_policy_id=aws_cloudfront_response_headers_policy.strip-vulnerable-headers.id

    forwarded_values {
      query_string = false
      headers      = ["Origin", "Authorization"]
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 300
    max_ttl                = 86400
  }

  price_class = "PriceClass_100"

  restrictions {
    geo_restriction {
      restriction_type = var.target_env == "prod" ? "none" : "whitelist"
      locations        = var.target_env == "prod" ? [] : ["CA", "US", "AR"]
    }
  }

  tags = local.common_tags

  viewer_certificate {
    acm_certificate_arn = var.gov_certificate_arn
    ssl_support_method  = "sni-only"
  }
}

resource "aws_cloudfront_distribution" "wfnews_geofencing_gov_api" {
  // only generate in prod environment
  count = var.target_env == "prod" ? 1 : 0


  aliases = ["${var.cloudfront_gov_origin_name}-api.${var.cloudfront_gov_origin_tail}"]

  origin {
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols = [
      "TLSv1.2"]
    }

    domain_name = "${var.nginx_names[0]}.${var.license_plate}-${var.target_env}.nimbus.cloud.gov.bc.ca"
    origin_id   = "wfnews_nginx_gov_${var.target_env}"
    custom_header {
      name  = "X-Cloudfront-Header"
      value = var.cloudfront_header
    }
  }

  enabled         = true
  is_ipv6_enabled = true
  comment         = "geofencing"

  //	- logging should probably be in a central location (centralized-logging account?) - in an aggregated/shared bucket and perhaps also synced into a bucket within the account where the aws-login app is deployed
  //	- prefix should follow SEA convention like <account>/<region>/<service name> eg. 12345678/ca-central-1/cloudfront
  //
  //  logging_config {
  //    include_cookies = false
  //    bucket          = "<mylogs>.s3.amazonaws.com"
  //    prefix          = "geofencing"
  //  }

  default_cache_behavior {
    allowed_methods = [
      "DELETE",
      "GET",
      "HEAD",
      "OPTIONS",
      "PATCH",
      "POST",
    "PUT"]
    cached_methods = ["GET", "HEAD"]

    target_origin_id = "wfnews_nginx_gov_${var.target_env}"

    response_headers_policy_id = aws_cloudfront_response_headers_policy.cache_control_reponse_headers.id

    forwarded_values {
      query_string = true
      headers      = ["Origin", "Authorization"]

      cookies {
        forward = "all"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 300
    max_ttl                = 86400
  }

  ordered_cache_behavior {
    path_pattern           = "/publicPublishedIncidentAttachment/*/attachments/*"
    allowed_methods        = ["GET", "OPTIONS", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "wfnews_nginx_gov_${var.target_env}"
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6"
  }

  ordered_cache_behavior {
    path_pattern    = "/static/*"
    allowed_methods = ["GET", "HEAD"]
    cached_methods  = ["GET", "HEAD"]

    target_origin_id = "wfnews_nginx_gov_${var.target_env}"

    response_headers_policy_id=aws_cloudfront_response_headers_policy.strip-vulnerable-headers.id

    forwarded_values {
      query_string = false
      headers      = ["Origin", "Authorization"]
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 300
    max_ttl                = 86400
  }

  price_class = "PriceClass_100"

  restrictions {
    geo_restriction {
      restriction_type = var.target_env == "prod" ? "none" : "whitelist"
      locations        = var.target_env == "prod" ? [] : ["CA", "US", "AR"]
    }
  }

  tags = local.common_tags

  viewer_certificate {
    acm_certificate_arn = var.gov_api_certificate_arn
    ssl_support_method  = "sni-only"
  }
}

resource "aws_cloudfront_distribution" "wfss_pointid_api" {

  count = var.cloudfront ? 1 : 0

  aliases = ["wfss-pointid-api.${var.target_env}.bcwildfireservices.com"]

  origin {
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols = [
      "TLSv1.2"]
    }

    domain_name = "wfss-pointid-api.${var.license_plate}-${var.target_env}.nimbus.cloud.gov.bc.ca"
    origin_id   = "wfss_pointid_api_${var.target_env}"

    custom_header {
      name  = "X-Cloudfront-Header"
      value = var.cloudfront_header
    }
  }

  enabled         = true
  is_ipv6_enabled = true

  //	- logging should probably be in a central location (centralized-logging account?) - in an aggregated/shared bucket and perhaps also synced into a bucket within the account where the aws-login app is deployed
  //	- prefix should follow SEA convention like <account>/<region>/<service name> eg. 12345678/ca-central-1/cloudfront
  //
  //  logging_config {
  //    include_cookies = false
  //    bucket          = "<mylogs>.s3.amazonaws.com"
  //    prefix          = "geofencing"
  //  }

  default_cache_behavior {
    allowed_methods = [
      "DELETE",
      "GET",
      "HEAD",
      "OPTIONS",
      "PATCH",
      "POST",
    "PUT"]
    cached_methods = ["GET", "HEAD"]

    target_origin_id = "wfss_pointid_api_${var.target_env}"

    response_headers_policy_id = aws_cloudfront_response_headers_policy.cache_control_reponse_headers.id

    forwarded_values {
      query_string = true
      headers      = ["Origin"]

      cookies {
        forward = "all"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 300
    max_ttl                = 86400
  }

  ordered_cache_behavior {
    path_pattern    = "/static/*"
    allowed_methods = ["GET", "HEAD"]
    cached_methods  = ["GET", "HEAD"]

    target_origin_id = "wfss_pointid_api_${var.target_env}"

    response_headers_policy_id=aws_cloudfront_response_headers_policy.strip-vulnerable-headers.id

    forwarded_values {
      query_string = false
      headers      = ["Origin"]

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 300
    max_ttl                = 86400
  }

  price_class = "PriceClass_100"

  restrictions {
    geo_restriction {
      restriction_type = var.target_env == "prod" ? "none" : "whitelist"
      locations        = var.target_env == "prod" ? [] : ["CA", "US", "AR"]
    }
  }

  tags = local.common_tags

  viewer_certificate {
    acm_certificate_arn = var.certificate_arn
    ssl_support_method  = "sni-only"
  }
}

resource "aws_cloudfront_distribution" "wfone_notifications_api" {

  count = var.cloudfront ? 1 : 0

  aliases = ["wfone-notifications-api.${var.target_env}.bcwildfireservices.com"]

  origin {
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols = [
      "TLSv1.2"]
    }

    domain_name = "wfone-notifications-api.${var.license_plate}-${var.target_env}.nimbus.cloud.gov.bc.ca"
    origin_id   = "wfone_notifications_api_${var.target_env}"

    custom_header {
      name  = "X-Cloudfront-Header"
      value = var.cloudfront_header
    }
  }

  enabled         = true
  is_ipv6_enabled = true

  default_cache_behavior {
    allowed_methods = [
      "DELETE",
      "GET",
      "HEAD",
      "OPTIONS",
      "PATCH",
      "POST",
      "PUT"
    ]
    cached_methods = ["GET", "HEAD"]

    target_origin_id = "wfone_notifications_api_${var.target_env}"

    response_headers_policy_id = aws_cloudfront_response_headers_policy.cache_control_reponse_headers.id

    forwarded_values {
      query_string = true
      headers      = ["Origin"]

      cookies {
        forward = "all"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 0
  }

  price_class = "PriceClass_100"

  restrictions {
    geo_restriction {
      restriction_type = var.target_env == "prod" ? "none" : "whitelist"
      locations        = var.target_env == "prod" ? [] : ["CA", "US", "AR"]
    }
  }

  tags = local.common_tags

  viewer_certificate {
    acm_certificate_arn = var.certificate_arn
    ssl_support_method  = "sni-only"
  }
}

resource "aws_cloudfront_distribution" "wfnews_redirect_receiver" {
  #NOTE: This points at the same resource as wfnews_geofencing_nginx, but listens to a different URL and uses a different SSL cert
  #      If we stop supporting the old Public Mobile application, this can be removed
  #
  #      'IF' statement is because public mobile used 'tst' instead of 'test' for environment name

  count = var.cloudfront ? 1 : 0

  aliases = ["wfnews-redirect-${var.target_env}.bcwildfireservices.com", "publicmobile-api-${local.PMNamesMap[var.target_env]}.bcwildfireservices.com"]

  origin {
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols = [
      "TLSv1.2"
      ]
    }

    domain_name = "wfnews-redirect.${var.license_plate}-${var.target_env}.nimbus.cloud.gov.bc.ca"
    origin_id   = "wfnews_redirect_${var.target_env}"

    custom_header {
      name  = "X-Cloudfront-Header"
      value = var.cloudfront_header
    }
  }

  enabled         = true
  is_ipv6_enabled = true

  default_cache_behavior {
    allowed_methods = [
      "DELETE",
      "GET",
      "HEAD",
      "OPTIONS",
      "PATCH",
      "POST",
    "PUT"]
    cached_methods = ["GET", "HEAD"]

    target_origin_id = "wfnews_redirect_${var.target_env}"

    forwarded_values {
      query_string = true
      headers      = ["Origin", "Authorization", "X-API-KEY", "apikey"]

      cookies {
        forward = "all"
      }
    }

    response_headers_policy_id = aws_cloudfront_response_headers_policy.cache_control_reponse_headers.id

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 300
    max_ttl                = 86400
  }

  price_class = "PriceClass_100"

  restrictions {
    geo_restriction {
      restriction_type = var.target_env == "prod" ? "none" : "whitelist"
      locations        = var.target_env == "prod" ? [] : ["CA", "US", "AR"]
    }
  }

  tags = local.common_tags

  viewer_certificate {
    acm_certificate_arn = var.base_certificate_arn
    ssl_support_method  = "sni-only"
  }
}

resource "aws_cloudfront_distribution" "wfnews_openmaps_cache" {
  #NOTE: This points at the government openmaps service

  count = var.cloudfront ? 1 : 0

  aliases = ["maps.${var.target_env}.bcwildfireservices.com"]

  origin {
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols = [
      "TLSv1.2"
      ]
    }

    domain_name = var.target_env == "prod" ? "openmaps.gov.bc.ca" : "test.openmaps.gov.bc.ca" 
    origin_id   = "wfnews_openmaps_cache_${var.target_env}"

  }

  enabled         = true
  is_ipv6_enabled = true

  default_cache_behavior {
    allowed_methods = [
      "GET",
      "HEAD",
      "OPTIONS"
    ]
    cached_methods = ["GET", "HEAD"]

    target_origin_id = "wfnews_openmaps_cache_${var.target_env}"

    forwarded_values {
      query_string = true
      headers      = ["Origin", "Authorization"]

      cookies {
        forward = "all"
      }
    }

    response_headers_policy_id = aws_cloudfront_response_headers_policy.cache_control_reponse_headers.id

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 300
    max_ttl                = 300
  }

  price_class = "PriceClass_100"

  restrictions {
    geo_restriction {
      restriction_type = var.target_env == "prod" ? "none" : "whitelist"
      locations        = var.target_env == "prod" ? [] : ["CA", "US", "AR"]
    }
  }

  tags = local.common_tags

  viewer_certificate {
    acm_certificate_arn = var.certificate_arn
    ssl_support_method  = "sni-only"
  }
}

resource "aws_cloudfront_distribution" "wfnews_services6_cache" {
  #NOTE: This points at the government openmaps service

  count = var.cloudfront ? 1 : 0

  aliases = ["maps.${var.target_env}.bcwildfireservices.com"]

  origin {
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols = [
      "TLSv1.2"
      ]
    }

    domain_name = "services6.arcgis.com" 
    origin_id   = "wfnews_services6_cache_${var.target_env}"

  }

  enabled         = true
  is_ipv6_enabled = true

  default_cache_behavior {
    allowed_methods = [
      "GET",
      "HEAD",
      "OPTIONS"
    ]
    cached_methods = ["GET", "HEAD"]

    target_origin_id = "wfnews_services6_cache_${var.target_env}"

    forwarded_values {
      query_string = true
      headers      = ["Origin", "Authorization"]

      cookies {
        forward = "all"
      }
    }

    response_headers_policy_id = aws_cloudfront_response_headers_policy.cache_control_reponse_headers.id

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 300
    max_ttl                = 300
  }

  price_class = "PriceClass_100"

  restrictions {
    geo_restriction {
      restriction_type = var.target_env == "prod" ? "none" : "whitelist"
      locations        = var.target_env == "prod" ? [] : ["CA", "US", "AR"]
    }
  }

  tags = local.common_tags

  viewer_certificate {
    acm_certificate_arn = var.certificate_arn
    ssl_support_method  = "sni-only"
  }
}

output "wfnews_cloudfront_client_url" {
  value = "https://${aws_cloudfront_distribution.wfnews_geofencing_client[0].domain_name}"
}

output "wfnews_cloudfront_server_url" {
  value = "https://${aws_cloudfront_distribution.wfnews_geofencing_server[0].domain_name}"
}

output "wfnews_cloudfront_nginx_url" {
  value = "https://${aws_cloudfront_distribution.wfnews_geofencing_nginx[0].domain_name}"
}

resource "aws_cloudfront_response_headers_policy" "cache_control_reponse_headers" {
  name = "cache-control-response-headers-${var.target_env}"

  custom_headers_config {
    items {
      header   = "Cache-Control"
      override = true
      value    = "stale-while-revalidate=600"
    }
  }

  remove_headers_config {
    items {
      header = "X-Forwarded-Server"
    }

    items {
      header = "X-Forwarded-Host"
    }

    items {
      header = "X-Host"
    }
  }
}

resource "aws_cloudfront_response_headers_policy" "strip-vulnerable-headers" {
  name = "strip-vulnerable-headers-${var.target_env}"

  remove_headers_config {
    items {
      header = "X-Forwarded-Server"
    }

    items {
      header = "X-Forwarded-Host"
    }

    items {
      header = "X-Host"
    }
  }
}

