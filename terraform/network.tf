data aws_vpc main_vpc {
  filter {
    name = "tag:Name"
    values = [var.vpc_name]
	}
}


resource aws_subnet wfnews_subnet_public_a {
  vpc_id = aws_vpc.wfnews_vpc.id
  cidr_block = "10.0.160.0/24"
  tags = local.common_tags
}

resource aws_subnet wfnews_subnet_public_b {
  vpc_id = aws_vpc.wfnews_vpc.id
  cidr_block = "10.0.161.0/24"
  tags = local.common_tags
}

resource aws_subnet wfnews_subnet_private {
  vpc_id = aws_vpc.wfnews_vpc.id
  cidr_block = "10.0.162.0/24"
  tags = local.common_tags
}

resource aws_internet_gateway wfnews_gateway {
  vpc_id = aws_vpc.wfnews_vpc.id
  tags = local.common_tags
}

resource aws_route_table wfnews_route_table {
  vpc_id = aws_vpc.wfnews_vpc.id
  route {
    cidr_block = aws_subnet.wfnews_subnet_public_a.cidr_block
    gateway_id = aws_internet_gateway.wfnews_gateway.id
  }
  route {
    cidr_block = aws_subnet.wfnews_subnet_public_b.cidr_block
    gateway_id = aws_internet_gateway.wfnews_gateway.id
  }
  tags = local.common_tags
}