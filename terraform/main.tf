locals {
  common_tags        = var.common_tags
  #create_ecs_service = var.server_image == "" ? 0 : 1
  create_ecs_service = 1
}

