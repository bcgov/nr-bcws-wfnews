# data aws_vpc main_vpc {
#   filter {
#     name = "tag:Name"
#     values = [var.vpc_name]
# 	}
# }

# data aws_subnets my_subnets {
#   filter {
#     name   = "vpc-id"
#     values = [data.aws_vpc.main_vpc.id]
#   }
#   filter {
#     name = "tag:Name"
#     values = ["*${var.subnet_filter}*"]
#   }
# }

resource aws_vpc wfnews_vpc {
  cidr_block = "10.0.0.0/16"
  tags = local.common_tags
}

resource aws_vpc_subnet wfnews_subnet_public_a {
  vpc_id = aws_vpc.wfnews_vpc.id
  cidr_block = "10.0.1.0/24"
  tags = local.common_tags
}

resource aws_vpc_subnet wfnews_subnet_public_b {
  vpc_id = aws_vpc.wfnews_vpc.id
  cidr_block = "10.0.2.0/24"
  tags = local.common_tags
}

resource aws_vpc_subnet wfnews_subnet_private {
  vpc_id = aws_vpc.wfnews_vpc.id
  cidr_block = "10.0.20.0/24"
  tags = local.common_tags
}

resource aws_internet_gateway wfnews_gateway {
  vpc_id = aws_vpc.wfnews_vpc.id
  tags = local.common_tags
}

resource aws_route_table wfnews_route_table {
  vpc_id = aws_vpc.wfnews_vpc.id
  route {
    cidr_block = aws_vpc_subnet.wfnews_subnet_public_a.cidr_block
    gateway_id = aws_internet_gateway.wfnews_gateway.id
  }
  route {
    cidr_block = aws_vpc_subnet.wfnews_subnet_public_b.cidr_block
    gateway_id = aws_internet_gateway.wfnews_gateway.id
  }
  tags = local.common_tags
}