resource aws_cloud9_environment_ec2 wfnews_cloud9 {
    name = "wfnews-cloud9-${var.target_env}"
    instance_type = "t2.micro"
    connection_type = "CONNECT_SSM"
    image_id = "amazonlinux-2-x86_64"
    subnet_id = tolist(module.network.aws_subnet_ids.app.ids)[0]
}