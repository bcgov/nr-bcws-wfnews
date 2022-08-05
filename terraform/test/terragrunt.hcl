terraform {
  source = ".."
}

include {
  path = find_in_parent_folders()
}

locals {
  aws_vpc="vpc-018906cab60cf165b"
  sec_group = "Web_sg"
  db_pass = get_env("DB_PASS")
  server_image = get_env("SERVER_IMAGE")
  client_image = get_env("CLIENT_IMAGE")
  target_env = get_env("TARGET_ENV")
}


generate "dev_tfvars" {
  path              = "terragrunt.auto.tfvars"
  if_exists         = "overwrite"
  disable_signature = true
  contents          = <<-EOF
    cert_domain = "*.example.ca"
    cloudfront = true
    cloudfront_origin_domain = "cfront_test.html"
    app_image = "tomcat:jdk8-corretto"
    fargate_cpu = 1024
    fargate_memory = 2048
    service_names = ["wfnews-project"]
    aws_vpc="vpc-018906cab60cf165b"
    subnet_filter = "Web"
    aws_sec_group = "Web_sg"
    target_env = "${local.target_env}"
    target_aws_account_id = "718963518348"
    server_image     = "${local.server_image}"
    client_image     = "${local.client_image}"
    db_pass = "${local.db_pass}"
    client_port = 8080
    server_port=8080

  EOF
}
