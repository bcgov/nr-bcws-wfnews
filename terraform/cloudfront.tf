resource "aws_cloudfront_function" "trim_path" {
  name    = "TrimPath"
  runtime = "cloudfront-js-1.0"

  comment = "Remove '-api, services6' or 'maps' from path"

  code = <<EOF
    function handler(event) {
        var pathToRemove = /(\/services6\/?|\/maps\/?|\/[^\/]+-api\/?)/;
        var request = event.request;

        var match = request.uri.match(pathToRemove);
        if (match) {
            request.headers['x-original-path'] = { value: match[0] };
        } else {
            request.headers['x-original-path'] = { value: 'unchanged' };
        }

        request.uri = request.uri.replace(pathToRemove,"/")
        return request;
    }
  EOF
}



resource "aws_cloudfront_distribution" "wfnews_distribution" {

  aliases = [data.aws_route53_zone.zone.name]

  origin {
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols = [
      "TLSv1.2"]
    }

    domain_name = "default.${var.license_plate}-${var.target_env}.stratus.cloud.gov.bc.ca"
    origin_id   = "wfnews_${var.target_env}"
    custom_header {
      name  = "X-Cloudfront-Header"
      value = var.cloudfront_header
    }
  }

  origin {
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols = [
      "TLSv1.2"]
    }

    domain_name = "wfnews-api.${var.license_plate}-${var.target_env}.stratus.cloud.gov.bc.ca"
    origin_id   = "wfnews_nginx_${var.target_env}"
    custom_header {
      name  = "X-Cloudfront-Header"
      value = var.cloudfront_header
    }
  }

  origin {
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols = [
      "TLSv1.2"]
    }

    domain_name = "pointid-api.${var.license_plate}-${var.target_env}.stratus.cloud.gov.bc.ca"
    origin_id   = "pointid_api_${var.target_env}"
    custom_header {
      name  = "X-Cloudfront-Header"
      value = var.cloudfront_header
    }
  }

  origin {
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols = [
      "TLSv1.2"]
    }

    domain_name = "notifications-api.${var.license_plate}-${var.target_env}.stratus.cloud.gov.bc.ca"
    origin_id   = "notifications_api_${var.target_env}"
    custom_header {
      name  = "X-Cloudfront-Header"
      value = var.cloudfront_header
    }
  }

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
    origin_path = "/geo/pub/ows"
  }

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
  comment         = "geofencing"

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

    target_origin_id = "wfnews_${var.target_env}"

    forwarded_values {
      query_string = true
      headers      = ["Origin", "Authorization", "x-original-path"]

      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 300
    max_ttl                = 86400

    response_headers_policy_id = aws_cloudfront_response_headers_policy.cache_control_response_headers.id
  }

  ordered_cache_behavior {
    path_pattern               = "/assets/*"
    allowed_methods            = ["GET", "OPTIONS", "HEAD"]
    cached_methods             = ["GET", "HEAD"]
    response_headers_policy_id = aws_cloudfront_response_headers_policy.strip-vulnerable-headers.id
    target_origin_id           = "wfnews_${var.target_env}"
    compress                   = true
    viewer_protocol_policy     = "redirect-to-https"
    cache_policy_id            = "658327ea-f89d-4fab-a63d-7e88639e58f6"
  }

  ordered_cache_behavior {
    path_pattern               = "/*.js"
    allowed_methods            = ["GET", "OPTIONS", "HEAD"]
    cached_methods             = ["GET", "HEAD"]
    response_headers_policy_id = aws_cloudfront_response_headers_policy.strip-vulnerable-headers.id
    target_origin_id           = "wfnews_${var.target_env}"
    compress                   = true
    viewer_protocol_policy     = "redirect-to-https"
    cache_policy_id            = "658327ea-f89d-4fab-a63d-7e88639e58f6"
  }

  ordered_cache_behavior {
    path_pattern               = "/*.css"
    allowed_methods            = ["GET", "OPTIONS", "HEAD"]
    cached_methods             = ["GET", "HEAD"]
    response_headers_policy_id = aws_cloudfront_response_headers_policy.strip-vulnerable-headers.id
    target_origin_id           = "wfnews_${var.target_env}"
    compress                   = true
    viewer_protocol_policy     = "redirect-to-https"
    cache_policy_id            = "658327ea-f89d-4fab-a63d-7e88639e58f6"
  }

  ordered_cache_behavior {
    path_pattern               = "/youtube.jsp"
    allowed_methods            = ["GET", "OPTIONS", "HEAD"]
    cached_methods             = ["GET", "OPTIONS", "HEAD"]
    target_origin_id           = "wfnews_${var.target_env}"
    response_headers_policy_id = aws_cloudfront_response_headers_policy.strip-vulnerable-headers.id
    compress                   = true
    viewer_protocol_policy     = "redirect-to-https"
    min_ttl                    = 0
    default_ttl                = 86400
    max_ttl                    = 86400

    forwarded_values {
      query_string = true
      headers      = ["Origin", "x-original-path"]

      cookies {
        forward = "none"
      }
    }
  }

  ordered_cache_behavior {
    path_pattern               = "/youtube-embed"
    allowed_methods            = ["GET", "OPTIONS", "HEAD"]
    cached_methods             = ["GET", "OPTIONS", "HEAD"]
    target_origin_id           = "wfnews_${var.target_env}"
    response_headers_policy_id = aws_cloudfront_response_headers_policy.strip-vulnerable-headers.id
    compress                   = true
    viewer_protocol_policy     = "redirect-to-https"
    min_ttl                    = 0
    default_ttl                = 86400
    max_ttl                    = 86400

    forwarded_values {
      query_string = true
      headers      = ["Origin", "x-original-path"]

      cookies {
        forward = "none"
      }
    }
  }

  ordered_cache_behavior {
    path_pattern    = "/static/*"
    allowed_methods = ["GET", "HEAD"]
    cached_methods  = ["GET", "HEAD"]

    target_origin_id = "wfnews_${var.target_env}"

    response_headers_policy_id = aws_cloudfront_response_headers_policy.strip-vulnerable-headers.id

    forwarded_values {
      query_string = false
      headers      = ["Origin", "Authorization", "x-original-path"]
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 300
    max_ttl                = 86400
  }
  ordered_cache_behavior {
    path_pattern    = "/wfnews-api/static/*"
    allowed_methods = ["GET", "HEAD"]
    cached_methods  = ["GET", "HEAD"]

    target_origin_id           = "wfnews_nginx_${var.target_env}"
    response_headers_policy_id = aws_cloudfront_response_headers_policy.strip-vulnerable-headers.id

    forwarded_values {
      query_string = false
      headers      = ["Origin", "x-original-path"]

      cookies {
        forward = "none"
      }
    }

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.trim_path.arn
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 300
    max_ttl                = 86400
  }
  ordered_cache_behavior {
    path_pattern           = "/wfnews-api/publicPublishedIncidentAttachment/*/attachments/*"
    allowed_methods        = ["GET", "OPTIONS", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "wfnews_nginx_${var.target_env}"
    compress               = true
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = true
      headers      = ["Origin", "x-original-path"]

      cookies {
        forward = "none"
      }
    }

    response_headers_policy_id = aws_cloudfront_response_headers_policy.cache_control_response_headers.id

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.trim_path.arn
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/wfnews-api/statistics"
    allowed_methods        = ["GET", "OPTIONS", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "wfnews_nginx_${var.target_env}"
    compress               = true
    viewer_protocol_policy = "redirect-to-https"

    min_ttl     = 3600
    default_ttl = 3600
    max_ttl     = 43200

    forwarded_values {
      query_string = true
      headers      = ["Origin", "x-original-path"]

      cookies {
        forward = "none"
      }
    }

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.trim_path.arn
    }

    response_headers_policy_id = aws_cloudfront_response_headers_policy.cache_control_response_headers.id
  }

  ordered_cache_behavior {
    path_pattern = "/wfnews-api/*"
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
      headers      = ["Origin", "Authorization", "X-API-KEY", "apikey", "x-original-path"]

      cookies {
        forward = "none"
      }
    }

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.trim_path.arn
    }

    response_headers_policy_id = aws_cloudfront_response_headers_policy.cache_control_response_headers.id

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 300
    max_ttl                = 86400
  }

  ordered_cache_behavior {
    path_pattern = "/wfnews-api"
    allowed_methods = [
      "GET",
      "HEAD",
    "OPTIONS"]
    cached_methods = ["GET", "HEAD"]

    target_origin_id = "wfnews_nginx_${var.target_env}"

    forwarded_values {
      query_string = true
      headers      = ["Origin", "Authorization", "X-API-KEY", "apikey", "x-original-path"]

      cookies {
        forward = "none"
      }
    }

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.trim_path.arn
    }

    response_headers_policy_id = aws_cloudfront_response_headers_policy.cache_control_response_headers.id

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 300
    max_ttl                = 86400
  }

  ordered_cache_behavior {
    path_pattern    = "/pointid-api/static/*"
    allowed_methods = ["GET", "HEAD"]
    cached_methods  = ["GET", "HEAD"]

    target_origin_id = "pointid_api_${var.target_env}"

    response_headers_policy_id = aws_cloudfront_response_headers_policy.strip-vulnerable-headers.id

    forwarded_values {
      query_string = false
      headers      = ["Origin", "x-original-path"]

      cookies {
        forward = "none"
      }
    }

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.trim_path.arn
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 300
    max_ttl                = 86400
  }

  ordered_cache_behavior {
    path_pattern = "/pointid-api/*"
    allowed_methods = [
      "DELETE",
      "GET",
      "HEAD",
      "OPTIONS",
      "PATCH",
      "POST",
    "PUT"]
    cached_methods = ["GET", "HEAD"]

    target_origin_id = "pointid_api_${var.target_env}"

    response_headers_policy_id = aws_cloudfront_response_headers_policy.cache_control_response_headers.id

    forwarded_values {
      query_string = true
      headers      = ["Origin", "x-original-path"]

      cookies {
        forward = "none"
      }
    }

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.trim_path.arn
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 300
    max_ttl                = 86400
  }

  ordered_cache_behavior {
    path_pattern = "/notifications-api/*"
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

    target_origin_id = "notifications_api_${var.target_env}"

    response_headers_policy_id = aws_cloudfront_response_headers_policy.cache_control_response_headers.id

    forwarded_values {
      query_string = true
      headers      = ["Origin", "x-original-path"]

      cookies {
        forward = "none"
      }
    }

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.trim_path.arn
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 0
  }

  ordered_cache_behavior {
    path_pattern = "/maps/*"

    allowed_methods = [
      "HEAD", "DELETE", "POST", "GET", "OPTIONS", "PUT", "PATCH"
    ]
    cached_methods = ["GET", "HEAD"]

    target_origin_id = "wfnews_openmaps_cache_${var.target_env}"

    forwarded_values {
      query_string = true
      headers      = ["Origin", "Authorization", "x-original-path"]

      cookies {
        forward = "none"
      }
    }

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.trim_path.arn
    }

    response_headers_policy_id = aws_cloudfront_response_headers_policy.cache_control_response_headers_no_auth_cors.id

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 300
    max_ttl                = 300
  }

  ordered_cache_behavior {
    path_pattern = "/maps"

    allowed_methods = [
      "HEAD", "DELETE", "POST", "GET", "OPTIONS", "PUT", "PATCH"
    ]
    cached_methods = ["GET", "HEAD"]

    target_origin_id = "wfnews_openmaps_cache_${var.target_env}"

    forwarded_values {
      query_string = true
      headers      = ["Origin", "Authorization", "x-original-path"]

      cookies {
        forward = "none"
      }
    }

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.trim_path.arn
    }

    response_headers_policy_id = aws_cloudfront_response_headers_policy.cache_control_response_headers_no_auth_cors.id

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 300
    max_ttl                = 300
  }

  ordered_cache_behavior {
    path_pattern = "/services6/*"
    allowed_methods = [
      "HEAD", "DELETE", "POST", "GET", "OPTIONS", "PUT", "PATCH"
    ]
    cached_methods = ["GET", "HEAD"]

    target_origin_id = "wfnews_services6_cache_${var.target_env}"

    forwarded_values {
      query_string = true
      headers      = ["Origin", "Authorization", "x-original-path"]

      cookies {
        forward = "none"
      }
    }

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.trim_path.arn
    }

    response_headers_policy_id = aws_cloudfront_response_headers_policy.cache_control_response_headers.id

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
    acm_certificate_arn = aws_acm_certificate.wfnews_us_certificate.arn
    ssl_support_method  = "sni-only"
  }
}



resource "aws_cloudfront_response_headers_policy" "cache_control_response_headers" {
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

resource "aws_cloudfront_response_headers_policy" "cache_control_response_headers_no_auth_cors" {
  name = "cache-control-response-headers-no-auth-cors-${var.target_env}"
  cors_config {
    access_control_allow_credentials = false

    access_control_allow_headers {
      items = ["*"]
    }

    access_control_allow_methods {
      items = ["GET", "POST", "PUT", "HEAD", "OPTIONS", "PATCH", "DELETE"]
    }

    access_control_allow_origins {
      items = ["*"]
    }

    access_control_max_age_sec = 300

    origin_override = true
  }

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

resource "aws_cloudfront_response_headers_policy" "cache_control_response_headers_auth_cors" {
  name = "cache-control-response-headers-auth-cors-${var.target_env}"
  cors_config {
    access_control_allow_credentials = true

    access_control_allow_headers {
      items = [
        "Accept",
        "Accept-Encoding",
        "Accept-Language",
        "Cache-Control",
        "Origin",
        "Pragma",
        "Priority",
        "Referer",
        "Apikey",
        "Authorization",
        "Content-Type"
      ]
    }

    access_control_allow_methods {
      items = ["GET", "POST", "PUT", "HEAD", "OPTIONS", "PATCH", "DELETE"]
    }

    access_control_allow_origins {
      items = [
        "capacitor://localhost",
        "http://localhost",
        "https://localhost",
        "https://wfnews-client.${local.PMNamesMap[var.target_env]}.bcwildfireservices.com",
        "https://wildfiresituation.nrs.gov.bc.ca"
      ]
    }

    access_control_max_age_sec = 300

    origin_override = true
  }

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

    domain_name = "default.${var.license_plate}-${var.target_env}.stratus.cloud.gov.bc.ca"
    origin_id   = "wfnews_${var.target_env}"
    custom_header {
      name  = "X-Cloudfront-Header"
      value = var.cloudfront_header
    }
  }

  origin {
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols = [
      "TLSv1.2"]
    }

    domain_name = "wfnews-api.${var.license_plate}-${var.target_env}.stratus.cloud.gov.bc.ca"
    origin_id   = "wfnews_nginx_${var.target_env}"
    custom_header {
      name  = "X-Cloudfront-Header"
      value = var.cloudfront_header
    }
  }

  enabled         = true
  is_ipv6_enabled = true
  comment         = "geofencing"


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

    target_origin_id = "wfnews_${var.target_env}"

    forwarded_values {
      query_string = true
      headers      = ["Origin", "Authorization", "x-original-path"]

      cookies {
        forward = "none"
      }
    }

    response_headers_policy_id = aws_cloudfront_response_headers_policy.cache_control_response_headers.id

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 300
    max_ttl                = 86400
  }

  ordered_cache_behavior {
    path_pattern    = "/static/*"
    allowed_methods = ["GET", "HEAD"]
    cached_methods  = ["GET", "HEAD"]

    target_origin_id = "wfnews_${var.target_env}"

    response_headers_policy_id = aws_cloudfront_response_headers_policy.strip-vulnerable-headers.id

    forwarded_values {
      query_string = false
      headers      = ["Origin", "Authorization", "x-original-path"]
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

  ordered_cache_behavior {
    path_pattern               = "/youtube.jsp"
    allowed_methods            = ["GET", "OPTIONS", "HEAD"]
    cached_methods             = ["GET", "OPTIONS", "HEAD"]
    target_origin_id           = "wfnews_${var.target_env}"
    response_headers_policy_id = aws_cloudfront_response_headers_policy.strip-vulnerable-headers.id
    compress                   = true
    viewer_protocol_policy     = "redirect-to-https"
    min_ttl                    = 0
    default_ttl                = 86400
    max_ttl                    = 86400

    forwarded_values {
      query_string = true
      headers      = ["Origin", "x-original-path"]

      cookies {
        forward = "none"
      }
    }
  }

  ordered_cache_behavior {
    path_pattern               = "/youtube-embed"
    allowed_methods            = ["GET", "OPTIONS", "HEAD"]
    cached_methods             = ["GET", "OPTIONS", "HEAD"]
    target_origin_id           = "wfnews_${var.target_env}"
    response_headers_policy_id = aws_cloudfront_response_headers_policy.strip-vulnerable-headers.id
    compress                   = true
    viewer_protocol_policy     = "redirect-to-https"
    min_ttl                    = 0
    default_ttl                = 86400
    max_ttl                    = 86400

    forwarded_values {
      query_string = true
      headers      = ["Origin", "x-original-path"]

      cookies {
        forward = "none"
      }
    }
  }

  ordered_cache_behavior {
    path_pattern    = "/wfnews-api/static/*"
    allowed_methods = ["GET", "HEAD"]
    cached_methods  = ["GET", "HEAD"]

    target_origin_id           = "wfnews_nginx_${var.target_env}"
    response_headers_policy_id = aws_cloudfront_response_headers_policy.strip-vulnerable-headers.id

    forwarded_values {
      query_string = false
      headers      = ["Origin", "x-original-path"]

      cookies {
        forward = "none"
      }
    }

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.trim_path.arn
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 300
    max_ttl                = 86400
  }
  ordered_cache_behavior {
    path_pattern           = "/wfnews-api/publicPublishedIncidentAttachment/*/attachments/*"
    allowed_methods        = ["GET", "OPTIONS", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "wfnews_nginx_${var.target_env}"
    compress               = true
    viewer_protocol_policy = "redirect-to-https"

    forwarded_values {
      query_string = true
      headers      = ["Origin", "x-original-path"]

      cookies {
        forward = "none"
      }
    }

    response_headers_policy_id = aws_cloudfront_response_headers_policy.cache_control_response_headers.id

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.trim_path.arn
    }
  }

  ordered_cache_behavior {
    path_pattern           = "/wfnews-api/statistics"
    allowed_methods        = ["GET", "OPTIONS", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "wfnews_nginx_${var.target_env}"
    compress               = true
    viewer_protocol_policy = "redirect-to-https"

    min_ttl     = 3600
    default_ttl = 3600
    max_ttl     = 43200

    forwarded_values {
      query_string = true
      headers      = ["Origin", "x-original-path"]

      cookies {
        forward = "none"
      }
    }

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.trim_path.arn
    }

    response_headers_policy_id = aws_cloudfront_response_headers_policy.cache_control_response_headers.id
  }

  ordered_cache_behavior {
    path_pattern = "/wfnews-api/*"
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
      headers      = ["Origin", "Authorization", "X-API-KEY", "apikey", "x-original-path"]

      cookies {
        forward = "none"
      }
    }

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.trim_path.arn
    }

    response_headers_policy_id = aws_cloudfront_response_headers_policy.cache_control_response_headers.id

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 300
    max_ttl                = 86400
  }

  ordered_cache_behavior {
    path_pattern = "/wfnews-api"
    allowed_methods = [
      "GET",
      "HEAD",
    "OPTIONS"]
    cached_methods = ["GET", "HEAD"]

    target_origin_id = "wfnews_nginx_${var.target_env}"

    forwarded_values {
      query_string = true
      headers      = ["Origin", "Authorization", "X-API-KEY", "apikey", "x-original-path"]

      cookies {
        forward = "none"
      }
    }

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.trim_path.arn
    }

    response_headers_policy_id = aws_cloudfront_response_headers_policy.cache_control_response_headers.id

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 300
    max_ttl                = 86400
  }

  tags = local.common_tags
  viewer_certificate {
    acm_certificate_arn = var.gov_certificate_arn
    ssl_support_method  = "sni-only"
  }

}



//Legacy URLs
resource "aws_cloudfront_distribution" "wfnews_legacy_nginx" {

  aliases = ["wfnews-api.${var.target_env}.bcwildfireservices.com"]

  origin {
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols = [
      "TLSv1.2"]
    }

    domain_name = "wfnews-api.${var.license_plate}-${var.target_env}.stratus.cloud.gov.bc.ca"
    origin_id   = "wfnews_nginx_legacy_${var.target_env}"
    custom_header {
      name  = "X-Cloudfront-Header"
      value = var.cloudfront_header
    }
  }

  enabled         = true
  is_ipv6_enabled = true
  comment         = "geofencing"

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

    target_origin_id = "wfnews_nginx_legacy_${var.target_env}"

    forwarded_values {
      query_string = true
      headers      = ["Origin", "Authorization", "X-API-KEY", "apikey"]

      cookies {
        forward = "none"
      }
    }

    response_headers_policy_id = aws_cloudfront_response_headers_policy.cache_control_response_headers.id

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 300
    max_ttl                = 86400
  }

  ordered_cache_behavior {
    path_pattern           = "/publicPublishedIncidentAttachment/*/attachments/*"
    allowed_methods        = ["GET", "OPTIONS", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "wfnews_nginx_legacy_${var.target_env}"
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6"

    response_headers_policy_id = aws_cloudfront_response_headers_policy.cache_control_response_headers.id
  }

  ordered_cache_behavior {
    path_pattern           = "/statistics"
    allowed_methods        = ["GET", "OPTIONS", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "wfnews_nginx_legacy_${var.target_env}"
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
    
    min_ttl                = 3600
    default_ttl            = 3600
    max_ttl                = 43200

    forwarded_values {
      query_string = true
      headers      = ["Origin"]

      cookies {
        forward = "none"
      }
    }

    response_headers_policy_id = aws_cloudfront_response_headers_policy.cache_control_response_headers.id
  }

  ordered_cache_behavior {
    path_pattern    = "/static/*"
    allowed_methods = ["GET", "HEAD"]
    cached_methods  = ["GET", "HEAD"]

    target_origin_id = "wfnews_nginx_legacy_${var.target_env}"

    response_headers_policy_id=aws_cloudfront_response_headers_policy.strip-vulnerable-headers.id

    forwarded_values {
      query_string = true
      headers      = ["Origin", "Authorization", "X-API-KEY", "apikey"]

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
      restriction_type = "none"
      locations        = []
    }
  }

  tags = local.common_tags

  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate.wfnews_legacy_us_certificate.arn
    ssl_support_method  = "sni-only"
  }
}

resource "aws_cloudfront_distribution" "wfnews_legacy_pointid" {
  // only generate in prod environment
  count = var.target_env == "prod" ? 1 : 0
  aliases = ["wfss-pointid-api.${var.target_env}.bcwildfireservices.com"]

  origin {
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols = [
      "TLSv1.2"]
    }
    domain_name = "pointid-api.${var.license_plate}-${var.target_env}.stratus.cloud.gov.bc.ca"
    origin_id   = "wfnews_pointid_legacy_${var.target_env}"
    custom_header {
      name  = "X-Cloudfront-Header"
      value = var.cloudfront_header
    }
  }

  enabled         = true
  is_ipv6_enabled = true
  comment         = "geofencing"

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
    cached_methods  = ["GET", "HEAD"]

    target_origin_id = "wfnews_pointid_legacy_${var.target_env}"

    response_headers_policy_id = aws_cloudfront_response_headers_policy.cache_control_response_headers.id

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
  
  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate.wfnews_legacy_us_certificate.arn
    ssl_support_method  = "sni-only"
  }


}

resource "aws_cloudfront_distribution" "wfnews_legacy_services6" {
  count = var.target_env == "prod" ? 1 : 0
  aliases = ["services6.${var.target_env}.bcwildfireservices.com"]

  origin {
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols = [
      "TLSv1.2"]
    }

    domain_name = "services6.arcgis.com"
    origin_id   = "wfnews_services6_legacy_${var.target_env}"
  }

  enabled         = true
  is_ipv6_enabled = true
  comment         = "geofencing"

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
    cached_methods  = ["GET", "HEAD"]

    target_origin_id = "wfnews_services6_legacy_${var.target_env}"

    response_headers_policy_id = aws_cloudfront_response_headers_policy.cache_control_response_headers.id

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
    max_ttl                = 300
  }

  price_class = "PriceClass_100"

  restrictions {
    geo_restriction {
      restriction_type = var.target_env == "prod" ? "none" : "whitelist"
      locations        = var.target_env == "prod" ? [] : ["CA", "US", "AR"]
    }
  }
  
  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate.wfnews_legacy_us_certificate.arn
    ssl_support_method  = "sni-only"
  }
}

resource "aws_cloudfront_distribution" "wfnews_legacy_maps" {
  count = var.target_env == "prod" ? 1 : 0
  aliases = ["maps.${var.target_env}.bcwildfireservices.com"]

  origin {
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols = [
      "TLSv1.2"]
    }

    domain_name = "openmaps.gov.bc.ca"
    origin_path = "/geo/pub/ows"
    origin_id   = "wfnews_maps_legacy_${var.target_env}"
  }

  enabled         = true
  is_ipv6_enabled = true
  comment         = "geofencing"

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
    cached_methods  = ["GET", "HEAD"]

    target_origin_id = "wfnews_maps_legacy_${var.target_env}"

    response_headers_policy_id = aws_cloudfront_response_headers_policy.cache_control_response_headers.id

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
    max_ttl                = 300
  }

  price_class = "PriceClass_100"

  restrictions {
    geo_restriction {
      restriction_type = var.target_env == "prod" ? "none" : "whitelist"
      locations        = var.target_env == "prod" ? [] : ["CA", "US", "AR"]
    }
  }
  
  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate.wfnews_legacy_us_certificate.arn
    ssl_support_method  = "sni-only"
  }
}

resource "aws_cloudfront_distribution" "wfnews_legacy_notifications" {
  count = var.target_env == "prod" ? 1 : 0
  aliases = ["wfone-notifications-api.${var.target_env}.bcwildfireservices.com"]

  origin {
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "https-only"
      origin_ssl_protocols = [
      "TLSv1.2"]
    }

    domain_name = "notifications-api.${var.license_plate}-${var.target_env}.stratus.cloud.gov.bc.ca"
    origin_id   = "wfnews_notifications_legacy_${var.target_env}"
    custom_header {
      name  = "X-Cloudfront-Header"
      value = var.cloudfront_header
    }
  }

  enabled         = true
  is_ipv6_enabled = true
  comment         = "geofencing"

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
    cached_methods  = ["GET", "HEAD"]

    target_origin_id = "wfnews_notifications_legacy_${var.target_env}"

    response_headers_policy_id = aws_cloudfront_response_headers_policy.cache_control_response_headers.id

    forwarded_values {
      query_string = true
      headers      = ["Origin", "x-original-path"]

      cookies {
        forward = "none"
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
  
  viewer_certificate {
    acm_certificate_arn = aws_acm_certificate.wfnews_legacy_us_certificate.arn
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

    domain_name = "${var.nginx_names[0]}.${var.license_plate}-${var.target_env}.stratus.cloud.gov.bc.ca"
    origin_id   = "wfnews_nginx_legacy_gov_${var.target_env}"
    custom_header {
      name  = "X-Cloudfront-Header"
      value = var.cloudfront_header
    }
  }

  enabled         = true
  is_ipv6_enabled = true
  comment         = "geofencing"

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

    target_origin_id = "wfnews_nginx_legacy_gov_${var.target_env}"

    response_headers_policy_id = aws_cloudfront_response_headers_policy.cache_control_response_headers.id

    forwarded_values {
      query_string = true
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

  ordered_cache_behavior {
    path_pattern           = "/publicPublishedIncidentAttachment/*/attachments/*"
    allowed_methods        = ["GET", "OPTIONS", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "wfnews_nginx_legacy_gov_${var.target_env}"
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
    cache_policy_id        = "658327ea-f89d-4fab-a63d-7e88639e58f6"
  }

  ordered_cache_behavior {
    path_pattern           = "/statistics"
    allowed_methods        = ["GET", "OPTIONS", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "wfnews_nginx_legacy_gov_${var.target_env}"
    compress               = true
    viewer_protocol_policy = "redirect-to-https"
    
    min_ttl                = 3600
    default_ttl            = 3600
    max_ttl                = 43200

    forwarded_values {
      query_string = true
      headers      = ["Origin"]

      cookies {
        forward = "none"
      }
    }

    response_headers_policy_id = aws_cloudfront_response_headers_policy.cache_control_response_headers.id
  }

  ordered_cache_behavior {
    path_pattern    = "/static/*"
    allowed_methods = ["GET", "HEAD"]
    cached_methods  = ["GET", "HEAD"]

    target_origin_id = "wfnews_nginx_legacy_gov_${var.target_env}"

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
    acm_certificate_arn = var.GOV_API_LEGACY_CERTIFICATE_ARN
    ssl_support_method  = "sni-only"
  }
}

