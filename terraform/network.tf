data aws_vpc main_vpc {
  filter {
    name = "tag:Name"
    values = [var.vpc_name]
	}
}

data aws_subnets my_subnets {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.main_vpc.id]
  }
  filter {
    name = "tag:Name"
    values = ["*${var.subnet_filter}*"]
  }
}