data "aws_caller_identity" "current" {}
# ECS task execution role data
data "aws_iam_policy_document" "ecs_task_execution_role" {
  version = "2012-10-17"
  statement {
    sid     = ""
    effect  = "Allow"
    actions = ["sts:AssumeRole"]

    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
  }
}

data "aws_iam_role" "wfnews_automation_role" {
  name = "BCGOV_${var.target_env}_Automation_Admin_Role"
}

# ECS task execution role
resource "aws_iam_role" "wfnews_ecs_task_execution_role" {
  name               = var.ecs_task_execution_role_name
  assume_role_policy = data.aws_iam_policy_document.ecs_task_execution_role.json

  tags = local.common_tags
}

# ECS task execution role policy attachment
# resource "aws_iam_role_policy_attachment" "wfnews_efs_access_role" {
#   role       = aws_iam_role.wfnews_ecs_task_execution_role.name
#   policy_arn = "arn:aws:iam::aws:policy/AmazonElasticFileSystemClientReadWriteAccess"
# }

# Access EFS role policy attachment
resource "aws_iam_role_policy_attachment" "wfnews_ecs_task_execution_role" {
  role       = aws_iam_role.wfnews_ecs_task_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role_policy" "wfnews_ecs_task_execution_cwlogs" {
  name = "ecs_task_execution_cwlogs"
  role = aws_iam_role.wfnews_ecs_task_execution_role.id

  policy = <<-EOF
  {
      "Version": "2012-10-17",
      "Statement": [
          {
              "Effect": "Allow",
              "Action": [
                  "logs:CreateLogGroup"
              ],
              "Resource": [
                  "arn:aws:logs:*:*:*"
              ]
          }
      ]
  }
EOF
}

resource "aws_iam_role" "wfnews_app_container_role" {
  name = "wfnews_app_container_role"

  assume_role_policy = <<EOF
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Action": "sts:AssumeRole",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Effect": "Allow",
      "Sid": ""
    }
  ]
}
EOF

  tags = local.common_tags
}

resource "aws_iam_role_policy" "wfnews_app_container_cwlogs" {
  name = "wfnews_app_container_cwlogs"
  role = aws_iam_role.wfnews_app_container_role.id

  policy = <<-EOF
  {
      "Version": "2012-10-17",
      "Statement": [
          {
              "Effect": "Allow",
              "Action": [
                  "logs:CreateLogGroup",
                  "logs:CreateLogStream",
                  "logs:PutLogEvents",
                  "logs:DescribeLogStreams"
              ],
              "Resource": [
                  "arn:aws:logs:*:*:*"
              ]
          }
      ]
  }
EOF
}
resource "aws_iam_role_policy" "wfnews_ssp_bucket_policy" {
  name   = "upload_bucket_policy"
  role   = aws_iam_role.wfnews_app_container_role.id
  policy = <<-EOF
  {
    "Version": "2012-10-17",
    "Statement": [
      {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "kms:Decrypt",
                "kms:Encrypt",
                "s3:PutBucketCORS"
            ],
            "Resource": [
                "${aws_s3_bucket.wfnews_upload_bucket.arn}",
                "${aws_s3_bucket.wfnews_upload_bucket.arn}/*",
                "${aws_s3_bucket.wfnews_log_bucket.arn}",
                "${aws_s3_bucket.wfnews_log_bucket.arn}/*",
                "arn:aws:kms:*:${data.aws_caller_identity.current.account_id}:key/*"
            ]
        }
        
    ]
  }
  EOF
}

resource "aws_iam_role_policy" "wfnews_task_execution_bucket_policy" {
  name   = "wfnews_task_execution_bucket_policy_${var.target_env}"
  role   = aws_iam_role.wfnews_ecs_task_execution_role.id
  policy = <<-EOF
  {
    "Version": "2012-10-17",
    "Statement": [
      {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "kms:Decrypt",
                "kms:Encrypt",
                "s3:PutBucketCORS"
            ],
            "Resource": [
                "${aws_s3_bucket.wfnews_upload_bucket.arn}",
                "${aws_s3_bucket.wfnews_upload_bucket.arn}/*",
                "${aws_s3_bucket.wfnews_log_bucket.arn}",
                "${aws_s3_bucket.wfnews_log_bucket.arn}/*",
                "arn:aws:kms:*:${data.aws_caller_identity.current.account_id}:key/*"
            ]
        }
        
    ]
  }
  EOF
}

resource "aws_iam_role_policy" "wfnews_sns_policy" {
  name   = "wfnews_sns_policy_${var.target_env}"
  role   = aws_iam_role.wfnews_app_container_role.id
  policy = <<-EOF
  {
    "Version": "2012-10-17",
    "Statement": [
      {
            "Effect": "Allow",
            "Action": [
              "SNS:Subscribe",
              "SNS:Receive",
              "SNS:Publish",
              "SNS:ListSubscriptionsByTopic",
              "SNS:GetTopicAttributes"
            ],
            "Resource": [
                "${aws_sns_topic.wfnews_sns_topic.arn}"
            ]
        }
        
    ]
  }
  EOF
}

resource "aws_iam_role_policy" "wfnews_task_execution_sns_policy" {
  name   = "wfnews_task_execution_sns_policy_${var.target_env}"
  role   = aws_iam_role.wfnews_ecs_task_execution_role.id
  policy = <<-EOF
  {
    "Version": "2012-10-17",
    "Statement": [
      {
            "Effect": "Allow",
            "Action": [
              "SNS:Subscribe",
              "SNS:Receive",
              "SNS:Publish",
              "SNS:ListSubscriptionsByTopic",
              "SNS:GetTopicAttributes"
            ],
            "Resource": [
                "${aws_sns_topic.wfnews_sns_topic.arn}"
            ]
        }
        
    ]
  }
  EOF
}


# resource "aws_iam_role_policy" "wfnews_app_dynamodb" {
#   name = "wfnews_app_dynamodb"
#   role = aws_iam_role.wfnews_app_container_role.id

#   policy = <<-EOF
#   {
#     "Version": "2012-10-17",
#     "Statement": [
#       {
#           "Effect": "Allow",
#           "Action": [
#               "dynamodb:BatchGet*",
#               "dynamodb:DescribeStream",
#               "dynamodb:DescribeTable",
#               "dynamodb:Get*",
#               "dynamodb:Query",
#               "dynamodb:Scan",
#               "dynamodb:BatchWrite*",
#               "dynamodb:CreateTable",
#               "dynamodb:Delete*",
#               "dynamodb:Update*",
#               "dynamodb:PutItem"
#           ],
#           "Resource": "${aws_dynamodb_table.wfnews_table.arn}"
#         }
#     ]
#   }
#   EOF  
# }