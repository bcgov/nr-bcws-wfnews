data "aws_lambda_layer_version" "wfone_lambda_layer" {
  layer_name = "public-mobile-python-lib"
}

resource "aws_lambda_function" "monitor-bans-prohibitions" {
  function_name = "wfone-monitor-bans-${module.vars.env.env_lowercase}"
  s3_bucket     = module.vars.env.functionBucket
  s3_key        = module.vars.env.BanProhibitionMonitorKey
  role          = aws_iam_role.lambda_iam_role.arn
  handler       = "app.lambda_handler"
  runtime       = "python3.8"
  timeout = 900
  layers        = [data.aws_lambda_layer_version.wfone_lambda_layer.arn]
  environment {
    variables = {
      QUEUE_URL = aws_sqs_queue.queue_bans.url
      S3_BUCKET   = aws_s3_bucket.wfone-public-mobile-monitor-queue-bucket.id
      SECRET_NAME = module.vars.env.secret_name
      WFNEWS_API = module.vars.env.wfnewsUrl
    }
  }
}

resource "aws_lambda_function" "monitor-active-fires" {
  function_name = "wfone-monitor-active-fires-${module.vars.env.env_lowercase}"
  s3_bucket     = module.vars.env.functionBucket
  s3_key        = module.vars.env.ActiveFireMonitorKey
  role          = aws_iam_role.lambda_iam_role.arn
  handler       = "app.lambda_handler"
  runtime       = "python3.8"
  layers        = [data.aws_lambda_layer_version.wfone_lambda_layer.arn]
  timeout = 180
  environment {
    variables = {
      QUEUE_URL = aws_sqs_queue.queue_fires.url
      S3_BUCKET   = aws_s3_bucket.wfone-public-mobile-monitor-queue-bucket.id
      SECRET_NAME = module.vars.env.secret_name
      WFNEWS_API = module.vars.env.wfnewsUrl
    }
  }
}

resource "aws_lambda_function" "monitor-area-restrictions" {
  function_name = "wfone-monitor-area-restrictions-${module.vars.env.env_lowercase}"
  s3_bucket     = module.vars.env.functionBucket
  s3_key        = module.vars.env.AreaRestrictionsMonitorKey
  role          = aws_iam_role.lambda_iam_role.arn
  handler       = "app.lambda_handler"
  runtime       = "python3.8"
  timeout = 15
  layers        = [data.aws_lambda_layer_version.wfone_lambda_layer.arn]
  environment {
    variables = {
      QUEUE_URL = aws_sqs_queue.queue_restrictions.url
      S3_BUCKET   = aws_s3_bucket.wfone-public-mobile-monitor-queue-bucket.id
      SECRET_NAME = module.vars.env.secret_name
      WFNEWS_API = module.vars.env.wfnewsUrl
    }
  }
}

resource "aws_lambda_function" "monitor-evacuation" {
  function_name = "wfone-monitor-evacuation-${module.vars.env.env_lowercase}"
  s3_bucket     = module.vars.env.functionBucket
  s3_key        = module.vars.env.EvacuationMonitorKey
  role          = aws_iam_role.lambda_iam_role.arn
  handler       = "app.lambda_handler"
  runtime       = "python3.8"
  timeout = 15
  layers        = [data.aws_lambda_layer_version.wfone_lambda_layer.arn]
  environment {
    variables = {
      QUEUE_URL = aws_sqs_queue.queue_evacs.url
      S3_BUCKET   = aws_s3_bucket.wfone-public-mobile-monitor-queue-bucket.id
      SECRET_NAME = module.vars.env.secret_name
      WFNEWS_API = module.vars.env.wfnewsUrl

    }
  }
}
