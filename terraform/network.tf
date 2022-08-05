data aws_vpc main_vpc {
    id = var.aws_vpc
}

data aws_subnets my_subnets {
  filter {
    name   = "vpc-id"
    values = [var.aws_vpc]
  }
  filter {
    name = "tag:Name"
    values = ["*${var.subnet_filter}*"]
  }
}