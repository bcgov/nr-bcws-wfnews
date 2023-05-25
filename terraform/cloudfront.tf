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
  }

  ordered_cache_behavior {
    path_pattern    = "/static/*"
    allowed_methods = ["GET", "HEAD"]
    cached_methods  = ["GET", "HEAD"]

    target_origin_id = "wfnews_client_${var.target_env}"

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

resource "aws_cloudfront_distribution" "wfnews_geofencing_apisix" {

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

    domain_name = "${var.apisix_names[0]}.${var.license_plate}-${var.target_env}.nimbus.cloud.gov.bc.ca"
    origin_id   = "wfnews_apisix_${var.target_env}"

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

    target_origin_id = "wfnews_apisix_${var.target_env}"

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

  ordered_cache_behavior {
    path_pattern    = "/static/*"
    allowed_methods = ["GET", "HEAD"]
    cached_methods  = ["GET", "HEAD"]

    target_origin_id = "wfnews_apisix_${var.target_env}"

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

    domain_name = "${var.apisix_names[0]}.${var.license_plate}-${var.target_env}.nimbus.cloud.gov.bc.ca"
    origin_id   = "wfnews_apisix_gov_${var.target_env}"
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

    target_origin_id = "wfnews_apisix_gov_${var.target_env}"

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
    path_pattern    = "/static/*"
    allowed_methods = ["GET", "HEAD"]
    cached_methods  = ["GET", "HEAD"]

    target_origin_id = "wfnews_apisix_gov_${var.target_env}"

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

/*
resource "aws_cloudfront_distribution" "wfnews_geofencing_apisix_admin" {

  count = var.cloudfront ? 1 : 0

  aliases = ["wfnews-api-admin.${var.target_env}.bcwildfireservices.com"]

  origin {
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols = [
      "TLSv1.2"]
    }

    domain_name = "wfnews-apisix-admin.${var.license_plate}-${var.target_env}.nimbus.cloud.gov.bc.ca"
    origin_id   = "wfnews_apisix_${var.target_env}"
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

    target_origin_id = "wfnews_apisix_${var.target_env}"

    forwarded_values {
      query_string = true
      headers = ["Origin", "Authorization", "X-API-KEY"]

      cookies {
        forward = "all"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  ordered_cache_behavior {
    path_pattern    = "/static/*"
    allowed_methods = ["GET", "HEAD"]
    cached_methods  = ["GET", "HEAD"]

    target_origin_id = "wfnews_apisix_${var.target_env}"

    forwarded_values {
      query_string = true
      headers = ["Origin", "Authorization", "X-API-KEY"]

      cookies {
        forward = "all"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  price_class = "PriceClass_100"

  restrictions {
    geo_restriction {
      restriction_type = "whitelist"
      locations = [
      "CA",
      "AR"
      ]
    }
  }

  tags = local.common_tags

  viewer_certificate {
    acm_certificate_arn = var.certificate_arn
    ssl_support_method = "sni-only"
  }
}

resource "aws_cloudfront_distribution" "wfnews_geofencing_apisix_gui" {

  count = var.cloudfront ? 1 : 0

  aliases = ["wfnews-api-gui.${var.target_env}.bcwildfireservices.com"]

  origin {
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols = [
      "TLSv1.2"]
    }

    domain_name = "wfnews-api-gui.${var.license_plate}-${var.target_env}.nimbus.cloud.gov.bc.ca"
    origin_id   = "wfnews_apisix_gui_${var.target_env}"
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

    target_origin_id = "wfnews_apisix_gui_${var.target_env}"

    forwarded_values {
      query_string = true
      headers = ["Origin", "Authorization", "X-API-KEY"]

      cookies {
        forward = "all"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  ordered_cache_behavior {
    path_pattern    = "/static/*"
    allowed_methods = ["GET", "HEAD"]
    cached_methods  = ["GET", "HEAD"]

    target_origin_id = "wfnews_apisix_gui_${var.target_env}"

    forwarded_values {
      query_string = true
      headers = ["Origin", "Authorization", "X-API-KEY"]

      cookies {
        forward = "all"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
  }

  price_class = "PriceClass_100"

  restrictions {
    geo_restriction {
      restriction_type = "whitelist"
      locations = [
      "CA",
      "AR"
      ]
    }
  }

  tags = local.common_tags

  viewer_certificate {
    acm_certificate_arn = var.certificate_arn
    ssl_support_method = "sni-only"
  }
}
*/

output "wfnews_cloudfront_client_url" {
  value = "https://${aws_cloudfront_distribution.wfnews_geofencing_client[0].domain_name}"
}

output "wfnews_cloudfront_server_url" {
  value = "https://${aws_cloudfront_distribution.wfnews_geofencing_server[0].domain_name}"
}

output "wfnews_cloudfront_apisix_url" {
  value = "https://${aws_cloudfront_distribution.wfnews_geofencing_apisix[0].domain_name}"
}



