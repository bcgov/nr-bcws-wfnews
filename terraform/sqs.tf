resource "aws_sqs_queue" "deadletters" {
  for_each = var.WFONE_MONITORS_NAME_MAP
  name = "wfnews-${each.key}-deadletter-queue-${var.target_env}"

  tags = {
    Application = "wfnews"
    Customer    = "BCWS"
    Environment = var.target_env
  }
}

resource "aws_sqs_queue" "queues" {
  for_each = var.WFONE_MONITORS_NAME_MAP
  depends_on = [aws_sqs_queue.deadletters]
  name = "wfnews-${each.key}-queue-${var.target_env}"

  tags = {
    Application = "wfnews"
    Customer    = "BCWS"
    Environment = var.target_env
  }

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.deadletters[each.key].arn
    maxReceiveCount     = "${var.MAX_RECEIVED_COUNT}"
  })
  redrive_allow_policy = jsonencode({
    redrivePermission = "byQueue",
    sourceQueueArns   = ["${aws_sqs_queue.deadletters[each.key].arn}"]
  })

  policy = <<POLICY
{
  "Version": "2012-10-17",
  "Id": "Policy1640124887139",
  "Statement": [
    {
      "Sid": "Stmt1640121864964",
      "Effect": "Allow",
      "Principal": "*",
      "Action": [
        "sqs:ListDeadLetterSourceQueues",
        "sqs:ListQueueTags",
        "sqs:ListQueues",
        "sqs:ReceiveMessage",
        "sqs:SendMessage",
        "sqs:DeleteMessage"
      ],
      "Condition": {
        "IpAddress": {"aws:SourceIP": ["${var.ACCEPTED_IPS}"]}
      },
      "Resource": "arn:aws:sqs:*:${var.target_aws_account_id}:wfnews-${each.key}-queue-${var.target_env}"
    },
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": [
        "sqs:ListDeadLetterSourceQueues",
        "sqs:ListQueueTags",
        "sqs:ListQueues",
        "sqs:ReceiveMessage",
        "sqs:SendMessage",
        "sqs:DeleteMessage"
      ],
      "Condition": {
        "ArnLike": {"aws:SourceArn":"arn:aws:*::${var.target_aws_account_id}:*/*"}
      },
      "Resource": "arn:aws:sqs:*:${var.target_aws_account_id}:wfnews-${each.key}-queue-${var.target_env}"
    }
  ]
}
POLICY

}


# resource "aws_sqs_queue" "deadletter_evacs" {
#   name = "wfnews-evacuation-deadletter-queue-${var.target_env}"

#   tags = {
#     Application = "wfnews"
#     Customer    = "BCWS"
#     Environment = var.target_env
#   }
# }

# resource "aws_sqs_queue" "queue_evacs" {
#   name = "wfnews-evacuation-queue-${var.target_env}"
#   redrive_policy = jsonencode({
#     deadLetterTargetArn = aws_sqs_queue.deadletter_evacs.arn
#     maxReceiveCount     = "${var.MAX_RECEIVED_COUNT}"
#   })
#   redrive_allow_policy = jsonencode({
#     redrivePermission = "byQueue",
#     sourceQueueArns   = ["${aws_sqs_queue.deadletter_evacs.arn}"]
#   })
#   tags = {
#     Application = "wfnews"
#     Customer    = "BCWS"
#     Environment = var.target_env
#   }

#   policy = <<POLICY
# {
#   "Version": "2012-10-17",
#   "Id": "Policy1640124887139",
#   "Statement": [
#     {
#       "Sid": "Stmt1640121864964",
#       "Effect": "Allow",
#       "Principal": "*",
#       "Action": [
#         "sqs:ListDeadLetterSourceQueues",
#         "sqs:ListQueueTags",
#         "sqs:ListQueues",
#         "sqs:ReceiveMessage",
#         "sqs:SendMessage",
#         "sqs:DeleteMessage"
#       ],
#       "Condition": {
#         "IpAddress": {"aws:SourceIP": ["${var.ACCEPTED_IPS}"]}
#       },
#       "Resource": "arn:aws:sqs:*:${var.target_aws_account_id}:wfnews-evacuation-queue-${var.target_env}"
#     },
#     {
#       "Effect": "Allow",
#       "Principal": "*",
#       "Action": [
#         "sqs:ListDeadLetterSourceQueues",
#         "sqs:ListQueueTags",
#         "sqs:ListQueues",
#         "sqs:ReceiveMessage",
#         "sqs:SendMessage",
#         "sqs:DeleteMessage"
#       ],
#       "Condition": {
#         "ArnLike": {"aws:SourceArn":"arn:aws:iam::${var.target_aws_account_id}:*/*"}
#       },
#       "Resource": "arn:aws:sqs:*:${var.target_aws_account_id}:wfnews-evacuation-queue-${var.target_env}"
#     }
#   ]
# }
# POLICY

# }


# resource "aws_sqs_queue" "deadletter_bans" {
#   name = "wfnews-bans-deadletter-queue-${var.target_env}"

#   tags = {
#     Application = "wfnews"
#     Customer    = "BCWS"
#     Environment = var.target_env
#   }
# }

# resource "aws_sqs_queue" "queue_bans" {
#   name = "wfnews-bans-queue-${var.target_env}"

#   redrive_policy = jsonencode({
#     deadLetterTargetArn = aws_sqs_queue.deadletter_bans.arn
#     maxReceiveCount     = "${var.MAX_RECEIVED_COUNT}"
#   })
#   redrive_allow_policy = jsonencode({
#     redrivePermission = "byQueue",
#     sourceQueueArns   = ["${aws_sqs_queue.deadletter_bans.arn}"]
#   })

#   tags = {
#     Application = "wfnews"
#     Customer    = "BCWS"
#     Environment = var.target_env
#   }

#   policy = <<POLICY
# {
#   "Version": "2012-10-17",
#   "Id": "Policy1640124887139",
#   "Statement": [
#     {
#       "Sid": "Stmt1640121864964",
#       "Effect": "Allow",
#       "Principal": "*",
#       "Action": [
#         "sqs:ListDeadLetterSourceQueues",
#         "sqs:ListQueueTags",
#         "sqs:ListQueues",
#         "sqs:ReceiveMessage",
#         "sqs:SendMessage",
#         "sqs:DeleteMessage"
#       ],
#       "Condition": {
#         "IpAddress": {"aws:SourceIP": ["${var.ACCEPTED_IPS}"]}
#       },
#       "Resource": "arn:aws:sqs:*:${var.target_aws_account_id}:wfnews-bans-queue-${var.target_env}"
#     },
#     {
#       "Effect": "Allow",
#       "Principal": "*",
#       "Action": [
#         "sqs:ListDeadLetterSourceQueues",
#         "sqs:ListQueueTags",
#         "sqs:ListQueues",
#         "sqs:ReceiveMessage",
#         "sqs:SendMessage",
#         "sqs:DeleteMessage"
#       ],
#       "Condition": {
#         "ArnLike": {"aws:SourceArn":"arn:aws:iam::${var.target_aws_account_id}:*/*"}
#       },
#       "Resource": "arn:aws:sqs:*:${var.target_aws_account_id}:wfnews-bans-queue-${var.target_env}"
#     }
#   ]
# }
# POLICY

# }


# resource "aws_sqs_queue" "deadletter_restrictions" {
#   name = "wfnews-area-restrictions-deadletter-queue-${var.target_env}"

#   tags = {
#     Application = "wfnews"
#     Customer    = "BCWS"
#     Environment = var.target_env
#   }
# }

# resource "aws_sqs_queue" "queue_restrictions" {
#   name = "wfnews-area-restrictions-queue-${var.target_env}"

#   redrive_policy = jsonencode({
#     deadLetterTargetArn = aws_sqs_queue.deadletter_restrictions.arn
#     maxReceiveCount     = "${var.MAX_RECEIVED_COUNT}"
#   })
#   redrive_allow_policy = jsonencode({
#     redrivePermission = "byQueue",
#     sourceQueueArns   = ["${aws_sqs_queue.deadletter_restrictions.arn}"]
#   })

#   tags = {
#     Application = "wfnews"
#     Customer    = "BCWS"
#     Environment = var.target_env
#   }

#   policy = <<POLICY
# {
#   "Version": "2012-10-17",
#   "Id": "Policy1640124887139",
#   "Statement": [
#     {
#       "Sid": "Stmt1640121864964",
#       "Effect": "Allow",
#       "Principal": "*",
#       "Action": [
#         "sqs:ListDeadLetterSourceQueues",
#         "sqs:ListQueueTags",
#         "sqs:ListQueues",
#         "sqs:ReceiveMessage",
#         "sqs:SendMessage",
#         "sqs:DeleteMessage"
#       ],
#       "Condition": {
#         "IpAddress": {"aws:SourceIP": ["${var.ACCEPTED_IPS}"]}
#       },
#       "Resource": "arn:aws:sqs:*:${var.target_aws_account_id}:wfnews-area-restrictions-queue-${var.target_env}"
#     },
#     {
#       "Effect": "Allow",
#       "Principal": "*",
#       "Action": [
#         "sqs:ListDeadLetterSourceQueues",
#         "sqs:ListQueueTags",
#         "sqs:ListQueues",
#         "sqs:ReceiveMessage",
#         "sqs:SendMessage",
#         "sqs:DeleteMessage"
#       ],
#       "Condition": {
#         "ArnLike": {"aws:SourceArn":"arn:aws:iam::${var.target_aws_account_id}:*/*"}
#       },
#       "Resource": "arn:aws:sqs:*:${var.target_aws_account_id}:wfnews-area-restrictions-queue-${var.target_env}"
#     }
#   ]
# }
# POLICY

# }


# resource "aws_sqs_queue" "deadletter_notifications" {
#   name = "wfnews-notifications-deadletter-queue-${var.target_env}"

#   tags = {
#     Application = "wfnews"
#     Customer    = "BCWS"
#     Environment = var.target_env
#   }
# }

# resource "aws_sqs_queue" "queue_notifications" {
#   name = "wfnews-notifications-queue-${var.target_env}"

#   redrive_policy = jsonencode({
#     deadLetterTargetArn = aws_sqs_queue.deadletter_notifications.arn
#     maxReceiveCount     = "${var.MAX_RECEIVED_COUNT}"
#   })
#   redrive_allow_policy = jsonencode({
#     redrivePermission = "byQueue",
#     sourceQueueArns   = ["${aws_sqs_queue.deadletter_notifications.arn}"]
#   })

#   tags = {
#     Application = "wfnews"
#     Customer    = "BCWS"
#     Environment = var.target_env
#   }

#   policy = <<POLICY
# {
#   "Version": "2012-10-17",
#   "Id": "Policy1640124887139",
#   "Statement": [
#     {
#       "Sid": "Stmt1640121864964",
#       "Effect": "Allow",
#       "Principal": "*",
#       "Action": [
#         "sqs:ListDeadLetterSourceQueues",
#         "sqs:ListQueueTags",
#         "sqs:ListQueues",
#         "sqs:ReceiveMessage",
#         "sqs:SendMessage",
#         "sqs:DeleteMessage"
#       ],
#       "Condition": {
#         "IpAddress": {"aws:SourceIP": ["${var.ACCEPTED_IPS}"]}
#       },
#       "Resource": "arn:aws:sqs:*:${var.target_aws_account_id}:wfnews-notifications-queue-${var.target_env}"
#     },
#     {
#       "Effect": "Allow",
#       "Principal": "*",
#       "Action": [
#         "sqs:ListDeadLetterSourceQueues",
#         "sqs:ListQueueTags",
#         "sqs:ListQueues",
#         "sqs:ReceiveMessage",
#         "sqs:SendMessage",
#         "sqs:DeleteMessage"
#       ],
#       "Condition": {
#         "ArnLike": {"aws:SourceArn":"arn:aws:iam::${var.target_aws_account_id}:*/*"}
#       },
#       "Resource": "arn:aws:sqs:*:${var.target_aws_account_id}:wfnews-notifications-queue-${var.target_env}"
#     }
#   ]
# }
# POLICY

# }
