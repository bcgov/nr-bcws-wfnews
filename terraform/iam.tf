data "aws_iam_policy" "lambdaExecute" {
  name = "AWSLambdaExecute"
}

data "aws_iam_policy" "lambdaSQS" {
  name = "AWSLambdaSQSQueueExecutionRole"
}

data "aws_iam_policy" "lambdaVPC" {
  name = "AWSLambdaVPCAccessExecutionRole"
}

data "aws_iam_policy" "lambdaRDS" {
  name = "AmazonRDSDataFullAccess"
}

data "aws_iam_policy" "lambdaSecrets" {
  name = "SecretsManagerReadWrite"
}

resource "aws_iam_role" "lambda_iam_role" {
  name = "wfone-public-mobile-lambda-role-${var.target_env}"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Sid    = ""
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      },
    ]
  })
}

resource "aws_iam_policy" "lambdaSQS" {
  name        = "wfone-lambda-sqs-${var.target_env}"
  path        = "/"
  description = "Allow permissions needed for lambda functions to read/write to SQS queues"

  policy = <<EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "sqs:ListQueues",
                "sqs:ReceiveMessage",
                "sqs:DeleteMessage",
                "sqs:SendMessage",
                "sqs:GetQueueAttributes",
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents"
            ],
            "Resource": "*"
        }
    ]
}
EOF
}

resource "aws_iam_role_policy_attachment" "lambdaAttach" {
  role       = aws_iam_role.lambda_iam_role.name
  policy_arn = data.aws_iam_policy.lambdaExecute.arn
}

resource "aws_iam_role_policy_attachment" "sqsAttach" {
  role       = aws_iam_role.lambda_iam_role.name
  policy_arn = aws_iam_policy.lambdaSQS.arn
}

resource "aws_iam_role_policy_attachment" "vpcAttach" {
  role       = aws_iam_role.lambda_iam_role.name
  policy_arn = data.aws_iam_policy.lambdaVPC.arn
}

resource "aws_iam_role_policy_attachment" "rdsAttach" {
  role       = aws_iam_role.lambda_iam_role.name
  policy_arn = data.aws_iam_policy.lambdaRDS.arn
}

resource "aws_iam_role_policy_attachment" "secretsAttach" {
  role       = aws_iam_role.lambda_iam_role.name
  policy_arn = data.aws_iam_policy.lambdaSecrets.arn
}
