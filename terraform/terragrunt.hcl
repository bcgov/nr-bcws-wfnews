locals {
  project = "nr-bcws-wfnews"
  tfc_hostname     = "app.terraform.io"
  tfc_organization = "bcgov"
  environment      = reverse(split("/", get_terragrunt_dir()))[0]
  alb_name = "wfnews-alb-${local.environment}"
  server_image     = get_env("server_image", "")
  client_image     = get_env("app_image", "")
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

/*
generate "tfvars" {
  path              = "terragrunt.auto.tfvars"
  if_exists         = "overwrite"
  disable_signature = true
  contents          = <<-EOF
app_image = "${local.app_image}"
EOF
}
*/

generate "provider" {
  path      = "provider.tf"
  if_exists = "overwrite"
  contents  = <<EOF
provider "aws" {
  region  = var.aws_region
  assume_role {
    role_arn = "arn:aws:iam::$${var.target_aws_account_id}:role/${local.deploy_role}"
  }
}
EOF
}
