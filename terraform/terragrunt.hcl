locals {
  tfc_hostname     = "app.terraform.io"
  tfc_organization = "bcgov"
}

generate "remote_state" {
  path      = "backend.tf"
  if_exists = "overwrite"
  contents  = <<EOF
terraform {
  backend "s3" {
    bucket         = "terraform-remote-state-${get_env("TFC_PROJECT")}-${reverse(split("/", get_terragrunt_dir()))[0]}"  # Replace with either generated or custom bucket name
    key            = "terraform.${get_env("TFC_PROJECT")}-${reverse(split("/", get_terragrunt_dir()))[0]}-state"           # Path and name of the state file within the bucket
    region         = "ca-central-1"                   # AWS region where the bucket is located
    dynamodb_table = "terraform-remote-state-lock-${get_env("TFC_PROJECT")}"  # Replace with either generated or custom DynamoDB table name
    encrypt        = true                              # Enable encryption for the state file
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
    role_arn = "arn:aws:iam::$${var.target_aws_account_id}:role/Terraform_Deploy_Role"
  }
}
EOF
}
