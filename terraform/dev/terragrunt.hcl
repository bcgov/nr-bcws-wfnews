terraform {
  source = ".."
}

include {
  path = find_in_parent_folders()
}

locals {
  aws_vpc="vpc-2b1c6443"
  sec_group = "Vivid-developers"
  db_pass = get_env("DB_PASS")
}


generate "dev_tfvars" {
  path              = "terragrunt.auto.tfvars"
  if_exists         = "overwrite"
  disable_signature = true
  contents          = <<-EOF
    cloudfront = true
    cloudfront_origin_domain = "cfront_test.html"
    app_image = "tomcat:jdk8-corretto"
    fargate_cpu = 1024
    fargate_memory = 2048
    service_names = ["wfnews-project"]
    aws_vpc="vpc-2b1c6443"
    aws_sec_group = "Vivid-developers"
    target_env = "dev"
    target_aws_account_id = "460053263286"
    server_image     = "ghcr.io/vivid-cpreston/nr-bcws-wfnews-server:main"
    client_image     = "ghcr.io/vivid-cpreston/nr-bcws-wfnews-client:main"
    db_pass = "${local.db_pass}"
    client_port = 8080
    server_port=8080

  EOF
}
