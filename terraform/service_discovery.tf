
resource "aws_service_discovery_private_dns_namespace" "wfnews_namespace" {
    name = "services-${var.target_env}.com"
    vpc = module.network.aws_vpc.id
}

/*
resource "aws_service_discovery_service" "wfnews_service_discovery_service" {
  name = "wfnews-service-discovery-${var.target_env}"

  dns_config {
    namespace_id = aws_service_discovery_private_dns_namespace.wfnews_namespace.id

    dns_records {
      ttl  = 10
      type = "A"
    }

    routing_policy = "MULTIVALUE"
  }

  health_check_custom_config {
    failure_threshold = 2
  }
}
*/
