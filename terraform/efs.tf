
# resource "aws_efs_file_system" "wfnews_efs" {
#   creation_token = "wfnews-efs-${var.target_env}"
#   tags = local.common_tags
# }

# resource "aws_efs_mount_target" "wfnews_efs_mount" {
#   for_each = module.network.aws_subnet_ids.data.ids
#   subnet_id = each.value
#   file_system_id = aws_efs_file_system.wfnews_efs.id
#   security_groups = [data.aws_security_group.data.id, aws_security_group.wfnews_efs_access.id]
# }

# resource "aws_efs_file_system_policy" "policy" {
#   file_system_id = aws_efs_file_system.wfnews_efs.id

#   bypass_policy_lockout_safety_check = true

#   policy = <<POLICY
# {
#     "Version": "2012-10-17",
#     "Id": "WfnewsEfsPolicy",
#     "Statement": [
#         {
#             "Sid": "WfnewsEfsStatement01",
#             "Effect": "Allow",
#             "Principal": {
#                 "AWS": [
#                     "${aws_iam_role.wfnews_ecs_task_execution_role.arn}",
#                     "${aws_iam_role.wfnews_app_container_role.arn}"
#                 ]
#             },
#             "Resource": "${aws_efs_file_system.wfnews_efs.arn}",
#             "Action": [
#                 "elasticfilesystem:*"
#             ]
#         }
#     ]
# }
# POLICY
# }
