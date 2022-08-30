module "network" {
  source      = "git::https://github.com/BCDevOps/terraform-octk-aws-sea-network-info.git//?ref=master"
  environment = var.target_env
}


# #GET MINISTRY VPC AND SUBNETS
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

# data "aws_subnet" "web_subnet" {
#   for_each = toset(data.aws_subnets.my_subnets.ids)
#   id       = each.value
# }




#CREATE OWN SUBNETS

# resource aws_subnet wfnews_subnet_public_a {
#   vpc_id = data.aws_vpc.main_vpc.id
#   cidr_block = "10.0.160.0/24"
#   tags = local.common_tags
# }

# resource aws_subnet wfnews_subnet_public_b {
#   vpc_id = data.aws_vpc.main_vpc.id
#   cidr_block = "10.0.161.0/24"
#   tags = local.common_tags
# }

# resource aws_subnet wfnews_subnet_private {
#   vpc_id = data.aws_vpc.main_vpc.id
#   cidr_block = "10.0.162.0/24"
#   tags = local.common_tags
# }

# resource aws_internet_gateway wfnews_gateway {
#   vpc_id = data.aws_vpc.main_vpc.id
#   tags = local.common_tags
# }

# resource aws_route_table wfnews_route_table {
#   vpc_id = data.aws_vpc.main_vpc.id
#   route {
#     cidr_block = aws_subnet.wfnews_subnet_public_a.cidr_block
#     gateway_id = aws_internet_gateway.wfnews_gateway.id
#   }
#   route {
#     cidr_block = aws_subnet.wfnews_subnet_public_b.cidr_block
#     gateway_id = aws_internet_gateway.wfnews_gateway.id
#   }
#   tags = local.common_tags
# }

# resource aws_route_table_association wfnews_route_table_a_association{
#   subnet_id = aws_subnet.wfnews_subnet_public_a.id
#   route_table_id = aws_route_table.wfnews_route_table.id
# }

# resource aws_route_table_association wfnews_route_table_b_association{
#   subnet_id = aws_subnet.wfnews_subnet_public_b.id
#   route_table_id = aws_route_table.wfnews_route_table.id
# }

# resource aws_route_table_association wfnews_route_table_gw_association{
#   gateway_id = aws_internet_gateway.wfnews_gateway.id
#   route_table_id = aws_route_table.wfnews_route_table.id
# }