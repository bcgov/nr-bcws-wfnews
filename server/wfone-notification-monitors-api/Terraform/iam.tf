data "aws_iam_user" "PushNotificationAwsUser" {
  user_name = module.vars.env.PushNotificationAwsUser
}

data "aws_iam_role" "iam_for_lambda" {
  name = "iam_for_lambda"
}

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
  name = "wfone-public-mobile-lambda-role-${module.vars.env.env_lowercase}"
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

resource "aws_iam_role_policy_attachment" "lambdaAttach" {
    role = aws_iam_role.lambda_iam_role.name
    policy_arn = data.aws_iam_policy.lambdaExecute.arn
}

resource "aws_iam_role_policy_attachment" "sqsAttach" {
    role = aws_iam_role.lambda_iam_role.name
    policy_arn = data.aws_iam_policy.lambdaSQS.arn
}

resource "aws_iam_role_policy_attachment" "vpcAttach" {
    role = aws_iam_role.lambda_iam_role.name
    policy_arn = data.aws_iam_policy.lambdaVPC.arn
}

resource "aws_iam_role_policy_attachment" "rdsAttach" {
    role = aws_iam_role.lambda_iam_role.name
    policy_arn = data.aws_iam_policy.lambdaRDS.arn
}

resource "aws_iam_role_policy_attachment" "secretsAttach" {
    role = aws_iam_role.lambda_iam_role.name
    policy_arn = data.aws_iam_policy.lambdaSecrets.arn
}

