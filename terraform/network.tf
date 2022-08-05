data aws_vpc wfnews_main_vpc {
    id = var.aws_vpc
}

data aws_subnets wfnews_subnets {
  filter {
    name   = "vpc-id"
    values = [var.aws_vpc]
  }
  filter {
    name = "tag:Name"
    values = ["*${var.subnet_filter}*"]
  }
}