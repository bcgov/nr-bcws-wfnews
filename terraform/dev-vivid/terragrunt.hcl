terraform {
  source = ".."
}

locals {
  aws_vpc="vpc-2b1c6443"
  sec_group = "Prod-Public-Mobile-Hosts"
  db_pass = get_env("DB_PASS")
  project = "nr-bcws-wfnews"
  tfc_hostname     = "app.terraform.io"
  tfc_organization = "nr-bcws-wfnews"
  environment      = "dev"
  workspace        = "test_workspace"
  deploy_role      = "terraform-test"
}

generate "remote_state" {
  path      = "backend.tf"
  if_exists = "overwrite"
  contents  = <<EOF
terraform {
  backend "remote" {
    hostname = "${local.tfc_hostname}"
    organization = "${local.tfc_organization}"
    workspaces {
      name = "${local.project}-${local.environment}"
    }
  }
}
EOF
}

generate "dev_tfvars" {
  path              = "terragrunt.auto.tfvars"
  if_exists         = "overwrite"
  disable_signature = true
  contents          = <<-EOF
    cloudfront = true
    cloudfront_origin_domain = "cfront_test.html"
    app_image = "tomcat:jdk17-corretto"
    fargate_cpu = 1024
    fargate_memory = 2048
    service_names = ["wfnews-project"]
    aws_vpc="vpc-2b1c6443"
    subnet_filter = "Public"
    aws_sec_group = "Prod-Public-Mobile-Hosts"
    target_env = "dev"
    target_aws_account_id = "460053263286"
    server_image     = "ghcr.io/vivid-cpreston/nr-bcws-wfnews-server:main"
    client_image     = "ghcr.io/vivid-cpreston/nr-bcws-wfnews-client:main"
    db_pass = "${local.db_pass}"
    client_port = 8080
    server_port=8080

  EOF
}

generate "provider" {
  path      = "provider.tf"
  if_exists = "overwrite"
  contents  = <<EOF
provider "aws" {
  region  = var.aws_region
  assume_role {
    role_arn = "arn:aws:iam::$${var.target_aws_account_id}:role/terraform-test"
  }
}
EOF
}