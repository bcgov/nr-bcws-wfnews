data "aws_lambda_layer_version" "wfnews_lambda_layer" {
  layer_name = "wfnews-python-lib"
}

resource "aws_lambda_function" "monitor-bans-prohibitions" {
  function_name = "wfnews-monitor-bans-${var.target_env}"
  s3_bucket     = module.vars.env.functionBucket
  s3_key        = var.BanProhibitionMonitorKey
  role          = aws_iam_role.lambda_iam_role.arn
  handler       = "app.lambda_handler"
  runtime       = "python3.8"
  timeout = 900
  layers        = [data.aws_lambda_layer_version.wfnews_lambda_layer.arn]
  environment {
    variables = {
      QUEUE_URL = aws_sqs_queue.queue_bans.url
      S3_BUCKET   = aws_s3_bucket.wfnews-monitor-queue-bucket.id
      SECRET_NAME = var.secret_name
      WFNEWS_API = var.wfnewsUrl
    }
  }
}

resource "aws_lambda_function" "monitor-active-fires" {
  function_name = "wfnews-monitor-active-fires-${var.target_env}"
  s3_bucket     = module.vars.env.functionBucket
  s3_key        = var.ActiveFireMonitorKey
  role          = aws_iam_role.lambda_iam_role.arn
  handler       = "app.lambda_handler"
  runtime       = "python3.8"
  layers        = [data.aws_lambda_layer_version.wfnews_lambda_layer.arn]
  timeout = 180
  environment {
    variables = {
      QUEUE_URL = aws_sqs_queue.queue_fires.url
      S3_BUCKET   = aws_s3_bucket.wfnews-monitor-queue-bucket.id
      SECRET_NAME = var.secret_name
      WFNEWS_API = var.wfnewsUrl
    }
  }
}

resource "aws_lambda_function" "monitor-area-restrictions" {
  function_name = "wfnews-monitor-area-restrictions-${var.target_env}"
  s3_bucket     = module.vars.env.functionBucket
  s3_key        = var.AreaRestrictionsMonitorKey
  role          = aws_iam_role.lambda_iam_role.arn
  handler       = "app.lambda_handler"
  runtime       = "python3.8"
  timeout = 180
  layers        = [data.aws_lambda_layer_version.wfnews_lambda_layer.arn]
  environment {
    variables = {
      QUEUE_URL = aws_sqs_queue.queue_restrictions.url
      S3_BUCKET   = aws_s3_bucket.wfnews-monitor-queue-bucket.id
      SECRET_NAME = var.secret_name
      WFNEWS_API = var.wfnewsUrl
    }
  }
}

resource "aws_lambda_function" "monitor-evacuation" {
  function_name = "wfnews-monitor-evacuation-${var.target_env}"
  s3_bucket     = module.vars.env.functionBucket
  s3_key        = var.EvacuationMonitorKey
  role          = aws_iam_role.lambda_iam_role.arn
  handler       = "app.lambda_handler"
  runtime       = "python3.8"
  timeout = 180
  layers        = [data.aws_lambda_layer_version.wfnews_lambda_layer.arn]
  environment {
    variables = {
      QUEUE_URL = aws_sqs_queue.queue_evacs.url
      S3_BUCKET   = aws_s3_bucket.wfnews-monitor-queue-bucket.id
      SECRET_NAME = var.secret_name
      WFNEWS_API = var.wfnewsUrl

    }
  }
}
