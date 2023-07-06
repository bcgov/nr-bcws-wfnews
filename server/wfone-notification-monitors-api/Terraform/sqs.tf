resource "aws_sqs_queue" "deadletter" {
  name = "${var.application}-${module.vars.env.env_lowercase}-notification-api-deadletter-queue"

  tags = {
    Application = var.application
    Customer    = var.customer
    Environment = module.vars.env.env
  }
}

resource "aws_sqs_queue" "queue" {
  visibility_timeout_seconds = var.visibilityTimeoutSeconds
  name                       = "${var.application}-${module.vars.env.env_lowercase}-notification-api-queue"

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.deadletter.arn
    maxReceiveCount     = "${var.maxReceivedCount}"
  })
  redrive_allow_policy = jsonencode({
    redrivePermission = "byQueue",
    sourceQueueArns   = ["${aws_sqs_queue.deadletter.arn}"]
  })

  tags = {
    Application = var.application
    Customer    = var.customer
    Environment = module.vars.env.env
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
      "Resource": "arn:aws:sqs:*:${data.aws_caller_identity.current.account_id}:${var.application}-${module.vars.env.env_lowercase}-notification-api-queue"
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
        "ArnLike": {"aws:SourceArn":"arn:aws:iam::${data.aws_caller_identity.current.account_id}:*/*"}
      },
      "Resource": "arn:aws:sqs:*:${data.aws_caller_identity.current.account_id}:${var.application}-${module.vars.env.env_lowercase}-notification-api-queue"
    }
  ]
}
POLICY
}


resource "aws_sqs_queue" "deadletter_fires" {
  name = "${var.application}-${module.vars.env.env_lowercase}-active-fires-deadletter-queue"

  tags = {
    Application = var.application
    Customer    = var.customer
    Environment = module.vars.env.env
  }
}

resource "aws_sqs_queue" "queue_fires" {
  name = "${var.application}-${module.vars.env.env_lowercase}-active-fires-queue"

  tags = {
    Application = var.application
    Customer    = var.customer
    Environment = module.vars.env.env
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
      "Resource": "arn:aws:sqs:*:${data.aws_caller_identity.current.account_id}:${var.application}-${module.vars.env.env_lowercase}-active-fires-queue"
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
        "ArnLike": {"aws:SourceArn":"arn:aws:iam::${data.aws_caller_identity.current.account_id}:*/*"}
      },
      "Resource": "arn:aws:sqs:*:${data.aws_caller_identity.current.account_id}:${var.application}-${module.vars.env.env_lowercase}-active-fires-queue"
    }
  ]
}
POLICY

}


resource "aws_sqs_queue" "deadletter_evacs" {
  name = "${var.application}-${module.vars.env.env_lowercase}-evac-orders-deadletter-queue"

  tags = {
    Application = var.application
    Customer    = var.customer
    Environment = module.vars.env.env
  }
}

resource "aws_sqs_queue" "queue_evacs" {
  name = "${var.application}-${module.vars.env.env_lowercase}-evac-orders-queue"
  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.deadletter_evacs.arn
    maxReceiveCount     = "${var.maxReceivedCount}"
  })
  redrive_allow_policy = jsonencode({
    redrivePermission = "byQueue",
    sourceQueueArns   = ["${aws_sqs_queue.deadletter_evacs.arn}"]
  })
  tags = {
    Application = var.application
    Customer    = var.customer
    Environment = module.vars.env.env
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
      "Resource": "arn:aws:sqs:*:${data.aws_caller_identity.current.account_id}:${var.application}-${module.vars.env.env_lowercase}-evac-orders-queue"
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
        "ArnLike": {"aws:SourceArn":"arn:aws:iam::${data.aws_caller_identity.current.account_id}:*/*"}
      },
      "Resource": "arn:aws:sqs:*:${data.aws_caller_identity.current.account_id}:${var.application}-${module.vars.env.env_lowercase}-evac-orders-queue"
    }
  ]
}
POLICY

}


resource "aws_sqs_queue" "deadletter_bans" {
  name = "${var.application}-${module.vars.env.env_lowercase}-fire-bans-deadletter-queue"

  tags = {
    Application = var.application
    Customer    = var.customer
    Environment = module.vars.env.env
  }
}

resource "aws_sqs_queue" "queue_bans" {
  name = "${var.application}-${module.vars.env.env_lowercase}-fire-bans-queue"

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.deadletter_bans.arn
    maxReceiveCount     = "${var.maxReceivedCount}"
  })
  redrive_allow_policy = jsonencode({
    redrivePermission = "byQueue",
    sourceQueueArns   = ["${aws_sqs_queue.deadletter_bans.arn}"]
  })

  tags = {
    Application = var.application
    Customer    = var.customer
    Environment = module.vars.env.env
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
      "Resource": "arn:aws:sqs:*:${data.aws_caller_identity.current.account_id}:${var.application}-${module.vars.env.env_lowercase}-fire-bans-queue"
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
        "ArnLike": {"aws:SourceArn":"arn:aws:iam::${data.aws_caller_identity.current.account_id}:*/*"}
      },
      "Resource": "arn:aws:sqs:*:${data.aws_caller_identity.current.account_id}:${var.application}-${module.vars.env.env_lowercase}-fire-bans-queue"
    }
  ]
}
POLICY

}


resource "aws_sqs_queue" "deadletter_restrictions" {
  name = "${var.application}-${module.vars.env.env_lowercase}-area-restrictions-deadletter-queue"

  tags = {
    Application = var.application
    Customer    = var.customer
    Environment = module.vars.env.env
  }
}

resource "aws_sqs_queue" "queue_restrictions" {
  name = "${var.application}-${module.vars.env.env_lowercase}-area-restrictions-queue"

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.deadletter_restrictions.arn
    maxReceiveCount     = "${var.maxReceivedCount}"
  })
  redrive_allow_policy = jsonencode({
    redrivePermission = "byQueue",
    sourceQueueArns   = ["${aws_sqs_queue.deadletter_restrictions.arn}"]
  })

  tags = {
    Application = var.application
    Customer    = var.customer
    Environment = module.vars.env.env
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
      "Resource": "arn:aws:sqs:*:${data.aws_caller_identity.current.account_id}:${var.application}-${module.vars.env.env_lowercase}-area-restrictions-queue"
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
        "ArnLike": {"aws:SourceArn":"arn:aws:iam::${data.aws_caller_identity.current.account_id}:*/*"}
      },
      "Resource": "arn:aws:sqs:*:${data.aws_caller_identity.current.account_id}:${var.application}-${module.vars.env.env_lowercase}-area-restrictions-queue"
    }
  ]
}
POLICY

}