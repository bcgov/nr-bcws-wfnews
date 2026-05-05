//NOTE: US certificate is needed for cloudfront
resource "aws_acm_certificate" "wfnews_us_certificate" {
  domain_name = "wfnews-${local.PMNamesMap[var.target_env]}.bcwildfireservices.com"
  validation_method = "DNS"
  provider = aws.aws-us
}

resource "aws_route53_record" "wfnews_us_certificate_validation" {
  for_each = {
    for dvo in aws_acm_certificate.wfnews_us_certificate.domain_validation_options: dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.zone.zone_id
}

resource "aws_acm_certificate_validation" "wfnews_us_certificate_validation" {
  certificate_arn = aws_acm_certificate.wfnews_us_certificate.arn
  validation_record_fqdns = [ for record in aws_route53_record.wfnews_us_certificate_validation : record.fqdn]
  provider = aws.aws-us
  timeouts {
    create = "15m"
  }
}

//NOTE: CA certificate is needed for ALB listener
resource "aws_acm_certificate" "wfnews_ca_certificate" {
  domain_name = "wfnews-${local.PMNamesMap[var.target_env]}.bcwildfireservices.com"
  validation_method = "DNS"
  provider = aws
}

resource "aws_route53_record" "wfnews_ca_certificate_validation" {
  for_each = {
    for dvo in aws_acm_certificate.wfnews_ca_certificate.domain_validation_options: dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = data.aws_route53_zone.zone.zone_id
}

resource "aws_acm_certificate_validation" "wfnews_ca_certificate_validation" {
  certificate_arn = aws_acm_certificate.wfnews_ca_certificate.arn
  validation_record_fqdns = [ for record in aws_route53_record.wfnews_ca_certificate_validation : record.fqdn]
  timeouts {
    create = "15m"
  }
}



//Prod-only legacy certificate, wfnews-prod
resource "aws_acm_certificate" "wfnews_legacy_us_certificate" {
  count = var.target_env == "prod" ? 1 : 0
  domain_name = "wfnews-prod.bcwildfireservices.com"
  validation_method = "DNS"
  provider = aws.aws-us
}

resource "aws_route53_record" "wfnews_legacy_us_certificate_validation" {
  count = var.target_env == "prod" ? 1 : 0

  zone_id = data.aws_route53_zone.legacy_zone[0].id

  name = aws_acm_certificate.wfnews_legacy_us_certificate[0].domain_validation_options[0].resource_record_name
  records = [ aws_acm_certificate.wfnews_legacy_us_certificate[0].domain_validation_options[0].resource_record_value ]
  type = aws_acm_certificate.wfnews_legacy_us_certificate[0].domain_validation_options[0].resource_record_type

  allow_overwrite = true
  ttl             = 60
}

resource "aws_acm_certificate_validation" "wfnews_legacy_us_certificate_validation" {
  count = var.target_env == "prod" ? 1 : 0
  certificate_arn = aws_acm_certificate.wfnews_legacy_us_certificate[0].arn
  validation_record_fqdns = [ for record in aws_route53_record.wfnews_us_certificate_validation[0] : record.fqdn]
  provider = aws.aws-us
  timeouts {
    create = "15m"
  }
}