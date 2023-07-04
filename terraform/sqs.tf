resource "aws_sqs_queue" "deadletter" {
  name = "wfnews-notification-api-deadletter-queue-${var.target_env}"

  tags = {
    Application = "wfnews"
    Customer    = "BCWS"
    Environment = var.target_env
  }
}

resource "aws_sqs_queue" "queue" {
  visibility_timeout_seconds = var.visibilityTimeoutSeconds
  name                       = "wfnews-notification-api-queue-${var.target_env}"

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.deadletter.arn
    maxReceiveCount     = "${var.maxReceivedCount}"
  })
  redrive_allow_policy = jsonencode({
    redrivePermission = "byQueue",
    sourceQueueArns   = ["${aws_sqs_queue.deadletter.arn}"]
  })

  tags = {
    Application = "wfnews"
    Customer    = "BCWS"
    Environment = var.target_env
  }

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
        "IpAddress": {"aws:SourceIP": [${module.vars.env.acceptedIPs}]}
      },
      "Resource": "arn:aws:sqs:*:${var.target_aws_account_id}:wfnews-notification-api-queue-${var.target_env}"
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
        "ArnLike": {"aws:SourceArn":"arn:aws:iam::${var.target_aws_account_id}:*/*"}
      },
      "Resource": "arn:aws:sqs:*:${var.target_aws_account_id}:wfnews-notification-api-queue-${var.target_env}"
    }
  ]
}
POLICY
}


resource "aws_sqs_queue" "deadletter_fires" {
  name = "wfnews-active-fires-deadletter-queue-${var.target_env}"

  tags = {
    Application = "wfnews"
    Customer    = "BCWS"
    Environment = var.target_env
  }
}

resource "aws_sqs_queue" "queue_fires" {
  name = "wfnews-active-fires-queue-${var.target_env}"

  tags = {
    Application = "wfnews"
    Customer    = "BCWS"
    Environment = var.target_env
  }

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.deadletter_fires.arn
    maxReceiveCount     = "${var.maxReceivedCount}"
  })
  redrive_allow_policy = jsonencode({
    redrivePermission = "byQueue",
    sourceQueueArns   = ["${aws_sqs_queue.deadletter_fires.arn}"]
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
        "IpAddress": {"aws:SourceIP": [${module.vars.env.acceptedIPs}]}
      },
      "Resource": "arn:aws:sqs:*:${var.target_aws_account_id}:wfnews-active-fires-queue-${var.target_env}"
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
        "ArnLike": {"aws:SourceArn":"arn:aws:iam::${var.target_aws_account_id}:*/*"}
      },
      "Resource": "arn:aws:sqs:*:${var.target_aws_account_id}:wfnews-active-fires-queue-${var.target_env}"
    }
  ]
}
POLICY

}


resource "aws_sqs_queue" "deadletter_evacs" {
  name = "wfnews-evacuation-deadletter-queue-${var.target_env}"

  tags = {
    Application = "wfnews"
    Customer    = "BCWS"
    Environment = var.target_env
  }
}

resource "aws_sqs_queue" "queue_evacs" {
  name = "wfnews-evacuation-queue-${var.target_env}"
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.deadletter_evacs.arn
    maxReceiveCount     = "${var.maxReceivedCount}"
  })
  redrive_allow_policy = jsonencode({
    redrivePermission = "byQueue",
    sourceQueueArns   = ["${aws_sqs_queue.deadletter_evacs.arn}"]
  })
  tags = {
    Application = "wfnews"
    Customer    = "BCWS"
    Environment = var.target_env
  }

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
        "IpAddress": {"aws:SourceIP": [${module.vars.env.acceptedIPs}]}
      },
      "Resource": "arn:aws:sqs:*:${var.target_aws_account_id}:wfnews-evacuation-queue-${var.target_env}"
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
        "ArnLike": {"aws:SourceArn":"arn:aws:iam::${var.target_aws_account_id}:*/*"}
      },
      "Resource": "arn:aws:sqs:*:${var.target_aws_account_id}:wfnews-evacuation-queue-${var.target_env}"
    }
  ]
}
POLICY

}


resource "aws_sqs_queue" "deadletter_bans" {
  name = "wfnews-bans-deadletter-queue-${var.target_env}"

  tags = {
    Application = "wfnews"
    Customer    = "BCWS"
    Environment = var.target_env
  }
}

resource "aws_sqs_queue" "queue_bans" {
  name = "wfnews-bans-queue-${var.target_env}"

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.deadletter_bans.arn
    maxReceiveCount     = "${var.maxReceivedCount}"
  })
  redrive_allow_policy = jsonencode({
    redrivePermission = "byQueue",
    sourceQueueArns   = ["${aws_sqs_queue.deadletter_bans.arn}"]
  })

  tags = {
    Application = "wfnews"
    Customer    = "BCWS"
    Environment = var.target_env
  }

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
        "IpAddress": {"aws:SourceIP": [${module.vars.env.acceptedIPs}]}
      },
      "Resource": "arn:aws:sqs:*:${var.target_aws_account_id}:wfnews-bans-queue-${var.target_env}"
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
        "ArnLike": {"aws:SourceArn":"arn:aws:iam::${var.target_aws_account_id}:*/*"}
      },
      "Resource": "arn:aws:sqs:*:${var.target_aws_account_id}:wfnews-bans-queue-${var.target_env}"
    }
  ]
}
POLICY

}


resource "aws_sqs_queue" "deadletter_restrictions" {
  name = "wfnews-area-restrictions-deadletter-queue-${var.target_env}"

  tags = {
    Application = "wfnews"
    Customer    = "BCWS"
    Environment = var.target_env
  }
}

resource "aws_sqs_queue" "queue_restrictions" {
  name = "wfnews-area-restrictions-queue-${var.target_env}"

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.deadletter_restrictions.arn
    maxReceiveCount     = "${var.maxReceivedCount}"
  })
  redrive_allow_policy = jsonencode({
    redrivePermission = "byQueue",
    sourceQueueArns   = ["${aws_sqs_queue.deadletter_restrictions.arn}"]
  })

  tags = {
    Application = "wfnews"
    Customer    = "BCWS"
    Environment = var.target_env
  }

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
        "IpAddress": {"aws:SourceIP": [${module.vars.env.acceptedIPs}]}
      },
      "Resource": "arn:aws:sqs:*:${var.target_aws_account_id}:wfnews-area-restrictions-queue-${var.target_env}"
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
        "ArnLike": {"aws:SourceArn":"arn:aws:iam::${var.target_aws_account_id}:*/*"}
      },
      "Resource": "arn:aws:sqs:*:${var.target_aws_account_id}:wfnews-area-restrictions-queue-${var.target_env}"
    }
  ]
}
POLICY

}
