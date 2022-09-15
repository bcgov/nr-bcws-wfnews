terraform {
  source = ".."
}

include {
  path = find_in_parent_folders()
}

locals {
  sec_group = "Web_sg"
  db_pass = get_env("DB_PASS")
  server_image = get_env("SERVER_IMAGE")
  client_image = get_env("CLIENT_IMAGE")
  liquibase_image = get_env("LIQUIBASE_IMAGE")
  target_env = get_env("TARGET_ENV")
  alb_name = get_env("ALB_NAME")
  vpc_name = get_env("VPC_NAME")
  subnet_filter = get_env("SUBNET_FILTER")
  license_plate = get_env("TFC_PROJECT")
}


generate "dev_tfvars" {
  path              = "terragrunt.auto.tfvars"
  if_exists         = "overwrite"
  disable_signature = true
  contents          = <<-EOF
    cert_domain = "*.dev.bcwildfireservices.com"
    cloudfront = true
    cloudfront_origin_domain = "cfront_test.html"
    app_image = "tomcat:jdk8-corretto"
    fargate_cpu = 1024
    fargate_memory = 2048
    service_names = ["wfnews-project"]
    aws_sec_group = "App_sg"
    target_env = "${local.target_env}"
    target_aws_account_id = "718963518348"
    server_image     = "${local.server_image}"
    client_image     = "${local.client_image}"
    db_image     = "${local.liquibase_image}"
    db_pass = "${local.db_pass}"
    alb_name = "${local.alb_name}"
    client_port = 8080
    server_port=8080
    vpc_name = "${local.vpc_name}"
    subnet_filter = "${local.subnet_filter}"
    license_plate = "${local.license_plate}"
    certificate_arn = "arn:aws:acm:us-east-1:718963518348:certificate/81262c52-5967-48ce-a4ee-dec3cd67a0b4"
  EOF
}
