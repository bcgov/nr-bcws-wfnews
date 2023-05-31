terraform {
  source = ".."
}

include {
  path = find_in_parent_folders()
}

locals {
  sec_group = "Web_sg"
  github_release_name = get_env("GITHUB_RELEASE_NAME")
  db_pass = get_env("DB_PASS")
  db_size = get_env("DB_SIZE")
  server_image = get_env("SERVER_IMAGE")
  client_image = get_env("CLIENT_IMAGE")
  liquibase_image = get_env("LIQUIBASE_IMAGE")
  apisix_image = get_env("APISIX_IMAGE")

  client_cpu_units = get_env("CLIENT_CPU_UNITS")
  client_memory = get_env("CLIENT_MEMORY")
  server_cpu_units = get_env("SERVER_CPU_UNITS")
  server_memory = get_env("SERVER_MEMORY")
  db_instance_type = get_env("DB_INSTANCE_TYPE")

  logging_level = get_env("LOGGING_LEVEL")
  app_count = get_env("INSTANCE_COUNT")

  api_key = get_env("API_KEY")
  target_env = get_env("TARGET_ENV")
  max_upload_size = get_env("MAX_UPLOAD_SIZE")
  alb_name = get_env("ALB_NAME")
  vpc_name = get_env("VPC_NAME")
  subnet_filter = get_env("SUBNET_FILTER")
  license_plate = get_env("TFC_PROJECT")
  sns_email_targets = get_env("SNS_EMAIL_TARGETS")
  cloudfront_header = get_env("CLOUDFRONT_HEADER")
  #server env vars
  WEBADE-OAUTH2_TOKEN_CLIENT_URL = get_env("WEBADE-OAUTH2_TOKEN_CLIENT_URL")
  WEBADE-OAUTH2_TOKEN_URL = get_env("WEBADE-OAUTH2_TOKEN_URL")
  WEBADE_OAUTH2_WFNEWS_REST_CLIENT_SECRET = get_env("WEBADE_OAUTH2_WFNEWS_REST_CLIENT_SECRET")
  WFDM_REST_URL = get_env("WFDM_REST_URL")
  WFIM_CLIENT_URL = get_env("WFIM_CLIENT_URL")
  WFIM_CODE_TABLES_URL = get_env("WFIM_CODE_TABLES_URL")
  WEBADE-OAUTH2_CHECK_TOKEN_URL = get_env("WEBADE-OAUTH2_CHECK_TOKEN_URL")
  WFNEWS_EMAIL_NOTIFICATIONS_ENABLED= get_env("WFNEWS_EMAIL_NOTIFICATIONS_ENABLED")
  SMTP_HOST_NAME = get_env("SMTP_HOST_NAME")
  SMTP_PASSWORD = get_env("SMTP_PASSWORD")
  SMTP_FROM_EMAIL = get_env("SMTP_FROM_EMAIL")
  SMTP_ADMIN_EMAIL = get_env("SMTP_ADMIN_EMAIL")
  SMTP_EMAIL_SYNC_ERROR_FREQ= get_env("SMTP_EMAIL_SYNC_ERROR_FREQ")
  SMTP_EMAIL_FREQ = get_env("SMTP_EMAIL_FREQ")
  SMTP_EMAIL_ERROR_SUBJECT = get_env("SMTP_EMAIL_ERROR_SUBJECT")
  SMTP_EMAIL_SUBJECT = get_env("SMTP_EMAIL_SUBJECT")
  DEFAULT_APPLICATION_ENVIRONMENT= get_env("DEFAULT_APPLICATION_ENVIRONMENT")
  WFNEWS_AGOL_QUERY_URL = get_env("WFNEWS_AGOL_QUERY_URL")
  WFNEWS_USERNAME = get_env("WFNEWS_USERNAME")
  WFNEWS_MAX_CONNECTIONS = get_env("WFNEWS_MAX_CONNECTIONS")
  WEBADE_OAUTH2_REST_CLIENT_ID = get_env("WEBADE_OAUTH2_REST_CLIENT_ID")
  WEBADE_OAUTH2_UI_CLIENT_ID = get_env("WEBADE_OAUTH2_UI_CLIENT_ID")
  WEBADE_OAUTH2_AUTHORIZE_URL = get_env("WEBADE_OAUTH2_AUTHORIZE_URL")
  #client-only env vars
  //Client-only variables
  agolUrl = get_env("agolUrl")
  drivebcBaseUrl = get_env("drivebcBaseUrl")
  openmapsBaseUrl = get_env("openmapsBaseUrl")
  siteMinderURLPrefix = get_env("siteMinderURLPrefix")
  agolAreaRestrictions = get_env("agolAreaRestrictions")
  agolBansAndProhibitions = get_env("agolBansAndProhibitions")
  WEBADE_OAUTH2_WFNEWS_UI_CLIENT_SECRET = get_env("WEBADE_OAUTH2_WFNEWS_UI_CLIENT_SECRET")
}

generate "test_tfvars" {
  path              = "terragrunt.auto.tfvars"
  if_exists         = "overwrite"
  disable_signature = true
  contents          = <<-EOF
    gov_client_url = "wildfiresituation.nrs.gov.bc.ca"
    gov_api_url = "wildfiresituation-api.nrs.gov.bc.ca"
    cloudfront = true
    cloudfront_origin_domain = "cfront_test.html"
    cloudfront_header = "${local.cloudfront_header}"
    app_image = "tomcat:jdk8-corretto"
    service_names = ["wfnews-project"]
    aws_sec_group = "App_sg"
    github_release_name = "${local.github_release_name}"
    target_env = "${local.target_env}"
    target_aws_account_id = "598317316742"
    server_image     = "${local.server_image}"
    client_image     = "${local.client_image}"
    liquibase_image     = "${local.liquibase_image}"
    apisix_image = "${local.apisix_image}"
    client_cpu_units = "${local.client_cpu_units}"
    client_memory = "${local.client_memory}"
    server_cpu_units = "${local.server_cpu_units}"
    server_memory = "${local.server_memory}"
    db_instance_type = "${local.db_instance_type}"
    db_size = "${local.db_size}"
    app_count = "${local.app_count}"
    logging_level = "${local.logging_level}"
    api_key = "${local.api_key}"
    db_pass = "${local.db_pass}"
    max_upload_size ="${local.max_upload_size}"
    db_multi_az = true
    alb_name = "${local.alb_name}"
    client_port = 8080
    server_port=8080
    vpc_name = "${local.vpc_name}"
    subnet_filter = "${local.subnet_filter}"
    license_plate = "${local.license_plate}"
    sns_email_targets = "${local.sns_email_targets}"
    certificate_arn = "arn:aws:acm:us-east-1:598317316742:certificate/cb36048d-70e1-45e9-b2eb-2e0ea7e808cf"
    gov_certificate_arn = "arn:aws:acm:us-east-1:598317316742:certificate/c127327c-295a-4afd-8545-5b47c4891b91"
    gov_api_certificate_arn = "arn:aws:acm:us-east-1:598317316742:certificate/c9661e46-ee96-40f2-8fe7-de9e0cf1497b"
    WEBADE-OAUTH2_TOKEN_CLIENT_URL = "${local.WEBADE-OAUTH2_TOKEN_CLIENT_URL}"
    WEBADE-OAUTH2_TOKEN_URL ="${local.WEBADE-OAUTH2_TOKEN_URL}"
    WEBADE_OAUTH2_WFNEWS_REST_CLIENT_SECRET ="${local.WEBADE_OAUTH2_WFNEWS_REST_CLIENT_SECRET}"
    WFDM_REST_URL ="${local.WFDM_REST_URL}"
    WFIM_CLIENT_URL ="${local.WFIM_CLIENT_URL}"
    WFIM_CODE_TABLES_URL ="${local.WFIM_CODE_TABLES_URL}"
    WEBADE-OAUTH2_CHECK_TOKEN_URL ="${local.WEBADE-OAUTH2_CHECK_TOKEN_URL}"
    WFNEWS_EMAIL_NOTIFICATIONS_ENABLED="${local.WFNEWS_EMAIL_NOTIFICATIONS_ENABLED}"
    SMTP_HOST_NAME ="${local.SMTP_HOST_NAME}"
    SMTP_PASSWORD ="${local.SMTP_PASSWORD}"
    SMTP_FROM_EMAIL ="${local.SMTP_FROM_EMAIL}"
    SMTP_ADMIN_EMAIL ="${local.SMTP_ADMIN_EMAIL}"
    SMTP_EMAIL_SYNC_ERROR_FREQ="${local.SMTP_EMAIL_SYNC_ERROR_FREQ}"
    SMTP_EMAIL_FREQ ="${local.SMTP_EMAIL_FREQ}"
    SMTP_EMAIL_ERROR_SUBJECT ="${local.SMTP_EMAIL_ERROR_SUBJECT}"
    SMTP_EMAIL_SUBJECT ="${local.SMTP_EMAIL_SUBJECT}"
    DEFAULT_APPLICATION_ENVIRONMENT="${local.DEFAULT_APPLICATION_ENVIRONMENT}"
    WFNEWS_AGOL_QUERY_URL ="${local.WFNEWS_AGOL_QUERY_URL}"
    WFNEWS_USERNAME = "${local.WFNEWS_USERNAME}"
    WFNEWS_MAX_CONNECTIONS ="${local.WFNEWS_MAX_CONNECTIONS}"
    WEBADE_OAUTH2_REST_CLIENT_ID = "${local.WEBADE_OAUTH2_REST_CLIENT_ID}"
    WEBADE_OAUTH2_UI_CLIENT_ID = "${local.WEBADE_OAUTH2_UI_CLIENT_ID}"
    WEBADE_OAUTH2_AUTHORIZE_URL = "${local.WEBADE_OAUTH2_AUTHORIZE_URL}"
    agolUrl = "${local.agolUrl}"
    drivebcBaseUrl = "${local.drivebcBaseUrl}"
    openmapsBaseUrl = "${local.openmapsBaseUrl}"
    siteMinderURLPrefix = "${local.siteMinderURLPrefix}"
    agolAreaRestrictions = "${local.agolAreaRestrictions}"
    agolBansAndProhibitions = "${local.agolBansAndProhibitions}"
    WEBADE_OAUTH2_WFNEWS_UI_CLIENT_SECRET = "${local.WEBADE_OAUTH2_WFNEWS_UI_CLIENT_SECRET}"
  EOF
}
