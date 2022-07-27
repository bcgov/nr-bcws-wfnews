terraform {
  source = ".."
}

include {
  path = find_in_parent_folders()
}

locals {
  aws_vpc="vpc-2b1c6443"
  sec_group = "Vivid-developers"
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
  EOF
}
