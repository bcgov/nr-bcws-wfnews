data "aws_lambda_layer_version" "wfnews_lambda_layer" {
  layer_name = "wfnews-python-lib"
}

resource "aws_lambda_layer_version" "wfnews_lambda_layer" {
  filename   = "lambda/lambda-layer/python.zip"
  layer_name = "wfnews-python-lib"
  compatible_runtimes = ["python3.8"]
}

data "archive_file" "active_fire_zip" {
  source_dir = "lambda/active-fire-monitor/active_fire"
  output_path = "lambda/active-fire-monitor/active_fire.zip"
  type = "zip"
}

data "archive_file" "area_restrictions_zip" {
  source_dir = "lambda/area-restrictions-monitor/area-restrictions"
  output_path = "lambda/area-restrictions-monitor/area_restrictions.zip"
  type = "zip"
}

data "archive_file" "bans_and_prohibitions_zip" {
  source_dir = "lambda/bans-and-prohibitions-monitor/bans-and-prohibitions"
  output_path = "lambda/bans-and-prohibitions-monitor/bans_and_prohibitions.zip"
  type = "zip"
}

data "archive_file" "evacuation_orders_zip" {
  source_dir = "lambda/evacuation-orders-monitor/evacuation-orders"
  output_path = "lambda/evacuation-orders-monitor/evacuation_orders.zip"
  type = "zip"
}

resource "aws_lambda_function" "monitor-bans-prohibitions" {
  function_name = "wfnews-monitor-bans-${var.target_env}"
  filename      = "bans_and_prohibitions.zip"
  source_code_hash = data.archive_file.bans_and_prohibitions_zip.output_base64sha256 
#  s3_bucket     = var.FUNCTION_BUCKET
#  s3_key        = var.BAN_PROHIBITION_MONITOR_KEY
  role          = aws_iam_role.lambda_iam_role.arn
  handler       = "app.lambda_handler"
  runtime       = "python3.8"
  timeout = 900
  layers        = [data.aws_lambda_layer_version.wfnews_lambda_layer.arn]
  environment {
    variables = {
      QUEUE_URL = aws_sqs_queue.queue_bans.url
      S3_BUCKET   = aws_s3_bucket.wfnews-monitor-queue-bucket.id
      SECRET_NAME = var.SECRET_NAME
      WFNEWS_API = var.WFNEWS_URL
    }
  }
}

resource "aws_lambda_function" "monitor-active-fires" {
  function_name = "wfnews-monitor-active-fires-${var.target_env}"
  filename      = "active_fire.zip"
  source_code_hash = data.archive_file.active_fire_zip.output_base64sha256 
#  s3_bucket     = var.FUNCTION_BUCKET
#  s3_key        = var.ACTIVE_FIRE_MONITOR_KEY
  role          = aws_iam_role.lambda_iam_role.arn
  handler       = "app.lambda_handler"
  runtime       = "python3.8"
  layers        = [data.aws_lambda_layer_version.wfnews_lambda_layer.arn]
  timeout = 180
  environment {
    variables = {
      QUEUE_URL = aws_sqs_queue.queue_fires.url
      S3_BUCKET   = aws_s3_bucket.wfnews-monitor-queue-bucket.id
      SECRET_NAME = var.SECRET_NAME
      WFNEWS_API = var.WFNEWS_URL
    }
  }
}

resource "aws_lambda_function" "monitor-area-restrictions" {
  function_name = "wfnews-monitor-area-restrictions-${var.target_env}"
  filename      = "area_restrictions.zip"
  source_code_hash = data.archive_file.area_restrictions_zip.output_base64sha256 
#  s3_bucket     = var.FUNCTION_BUCKET
#  s3_key        = var.AREA_RESTRICTIONS_MONITOR_KEY
  role          = aws_iam_role.lambda_iam_role.arn
  handler       = "app.lambda_handler"
  runtime       = "python3.8"
  timeout = 180
  layers        = [data.aws_lambda_layer_version.wfnews_lambda_layer.arn]
  environment {
    variables = {
      QUEUE_URL = aws_sqs_queue.queue_restrictions.url
      S3_BUCKET   = aws_s3_bucket.wfnews-monitor-queue-bucket.id
      SECRET_NAME = var.SECRET_NAME
      WFNEWS_API = var.WFNEWS_URL
    }
  }
}

resource "aws_lambda_function" "monitor-evacuation" {
  function_name = "wfnews-monitor-evacuation-${var.target_env}"
  filename      = "evacuation_orders.zip"
  source_code_hash = data.archive_file.evacuation_orders_zip.output_base64sha256 
#  s3_bucket     = var.FUNCTION_BUCKET
#  s3_key        = var.EVACUATION_MONITOR_KEY
  role          = aws_iam_role.lambda_iam_role.arn
  handler       = "app.lambda_handler"
  runtime       = "python3.8"
  timeout = 180
  layers        = [data.aws_lambda_layer_version.wfnews_lambda_layer.arn]
  environment {
    variables = {
      QUEUE_URL = aws_sqs_queue.queue_evacs.url
      S3_BUCKET   = aws_s3_bucket.wfnews-monitor-queue-bucket.id
      SECRET_NAME = var.SECRET_NAME
      WFNEWS_API = var.WFNEWS_URL
    }
  }
}
