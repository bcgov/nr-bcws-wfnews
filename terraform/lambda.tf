

# data "aws_lambda_layer_version" "wfnews_lambda_layer" {
#   layer_name = "wfnews-python-lib"
# }


resource "aws_lambda_layer_version" "wfnews_lambda_layer" {
  s3_bucket = data.aws_s3_bucket.wfnews_lambda.bucket
  s3_key = "python.zip"
  layer_name = "wfnews-python-lib"
  compatible_runtimes = ["python3.8"]
}

# data "local_file" "bans_and_prohibitions_zip" {
#   filename = "bans_and_prohibitions.zip"
# }

# data "local_file" "active_fire_monitor_zip" {
#   filename = "active-fire-monitor.zip"
# }

# data "local_file" "area_restrictions_zip" {
#   filename = "area_restrictions.zip"
# }

# data "local_file" "evacuation_orders_zip" {
#   filename = "evacuation_orders.zip"
# }

resource "aws_lambda_function" "monitor-bans-prohibitions" {
  function_name = "wfnews-monitor-bans-${var.target_env}"
  s3_bucket = data.aws_s3_bucket.wfnews_lambda.bucket
  s3_key = "bans_and_prohibitions.zip"
  role          = aws_iam_role.lambda_iam_role.arn
  handler       = "app.lambda_handler"
  runtime       = "python3.8"
  timeout = 900
  layers  = [aws_lambda_layer_version.wfnews_lambda_layer.arn]
  environment {
    variables = {
      UNIQUE_DEPLOY_ID = var.UNIQUE_DEPLOY_ID
      QUEUE_URL   = aws_sqs_queue.queue_bans.url
      S3_BUCKET   = aws_s3_bucket.wfnews-monitor-queue-bucket.id
      SECRET_NAME = var.SECRET_NAME
      WFNEWS_API  = var.WFNEWS_URL
    }
  }
}

resource "aws_lambda_function" "monitor-active-fires" {
  function_name = "wfnews-monitor-active-fires-${var.target_env}"
  s3_bucket = data.aws_s3_bucket.wfnews_lambda.bucket
  s3_key      = "active-fire-monitor.zip"
  role          = aws_iam_role.lambda_iam_role.arn
  handler       = "app.lambda_handler"
  runtime       = "python3.8"
  layers        = [aws_lambda_layer_version.wfnews_lambda_layer.arn]
  timeout = 180
  environment {
    variables = {
      UNIQUE_DEPLOY_ID = var.UNIQUE_DEPLOY_ID
      QUEUE_URL   = aws_sqs_queue.queue_fires.url
      S3_BUCKET   = aws_s3_bucket.wfnews-monitor-queue-bucket.id
      SECRET_NAME = var.SECRET_NAME
      WFNEWS_API  = var.WFNEWS_URL
    }
  }
}

resource "aws_lambda_function" "monitor-area-restrictions" {
  function_name = "wfnews-monitor-area-restrictions-${var.target_env}"
  s3_bucket = data.aws_s3_bucket.wfnews_lambda.bucket
  s3_key = "area_restrictions.zip"
  role          = aws_iam_role.lambda_iam_role.arn
  handler       = "app.lambda_handler"
  runtime       = "python3.8"
  timeout = 180
  layers  = [aws_lambda_layer_version.wfnews_lambda_layer.arn]
  environment {
    variables = {
      UNIQUE_DEPLOY_ID = var.UNIQUE_DEPLOY_ID
      QUEUE_URL   = aws_sqs_queue.queue_restrictions.url
      S3_BUCKET   = aws_s3_bucket.wfnews-monitor-queue-bucket.id
      SECRET_NAME = var.SECRET_NAME
      WFNEWS_API  = var.WFNEWS_URL
    }
  }
}

resource "aws_lambda_function" "monitor-evacuation" {
  function_name = "wfnews-monitor-evacuation-${var.target_env}"
  s3_bucket = data.aws_s3_bucket.wfnews_lambda.bucket
  s3_key =  "evacuation_orders.zip"
  role          = aws_iam_role.lambda_iam_role.arn
  handler       = "app.lambda_handler"
  runtime       = "python3.8"
  timeout = 180
  layers  = [aws_lambda_layer_version.wfnews_lambda_layer.arn]
  environment {
    variables = {
      UNIQUE_DEPLOY_ID = var.UNIQUE_DEPLOY_ID
      QUEUE_URL   = aws_sqs_queue.queue_evacs.url
      S3_BUCKET   = aws_s3_bucket.wfnews-monitor-queue-bucket.id
      SECRET_NAME = var.SECRET_NAME
      WFNEWS_API  = var.WFNEWS_URL
    }
  }
}
