
# data "aws_lambda_layer_version" "wfnews_lambda_layer" {
#   layer_name = "wfnews-python-lib"
# }

resource "aws_lambda_layer_version" "wfnews_lambda_layer" {
  filename   = "lambda-functions/python.zip"
  layer_name = "wfnews-python-lib"
  compatible_runtimes = ["python3.8"]
}

resource "local_file" "bans_and_prohibitions_zip" {
  filename = "lambda-functions/bans_and_prohibitions.zip"
}

resource "local_file" "active_fire_monitor_zip" {
  filename = "lambda-functions/active-fire-monitor.zip"
}

resource "local_file" "area_restrictions_zip" {
  filename = "lambda-functions/area_restrictions.zip"
}

resource "local_file" "evacuation_orders_zip" {
  filename = "lambda-functions/evacuation_orders.zip"
}

resource "aws_lambda_function" "monitor-bans-prohibitions" {
  function_name = "wfnews-monitor-bans-${var.target_env}"
  filename = "lambda-functions/bans_and_prohibitions.zip"
  source_code_hash = local_file.bans_and_prohibitions_zip.content_base64sha256
  role          = aws_iam_role.lambda_iam_role.arn
  handler       = "app.lambda_handler"
  runtime       = "python3.8"
  timeout = 900
  layers  = [data.aws_lambda_layer_version.wfnews_lambda_layer.arn]
  environment {
    variables = {
      QUEUE_URL   = aws_sqs_queue.queue_bans.url
      S3_BUCKET   = aws_s3_bucket.wfnews-monitor-queue-bucket.id
      SECRET_NAME = var.SECRET_NAME
      WFNEWS_API  = var.WFNEWS_URL
    }
  }
}

resource "aws_lambda_function" "monitor-active-fires" {
  function_name = "wfnews-monitor-active-fires-${var.target_env}"
  filename      = "lambda-functions/active-fire-monitor.zip"
  source_code_hash = local_file.active_fire_monitor_zip.content_base64sha256
  role          = aws_iam_role.lambda_iam_role.arn
  handler       = "app.lambda_handler"
  runtime       = "python3.8"
  layers        = [data.aws_lambda_layer_version.wfnews_lambda_layer.arn]
  timeout = 180
  environment {
    variables = {
      QUEUE_URL   = aws_sqs_queue.queue_fires.url
      S3_BUCKET   = aws_s3_bucket.wfnews-monitor-queue-bucket.id
      SECRET_NAME = var.SECRET_NAME
      WFNEWS_API  = var.WFNEWS_URL
    }
  }
}

resource "aws_lambda_function" "monitor-area-restrictions" {
  function_name = "wfnews-monitor-area-restrictions-${var.target_env}"
  filename      = "lambda-functions/area_restrictions.zip"
  source_code_hash = local_file.area_restrictions_zip.content_base64sha256
  role          = aws_iam_role.lambda_iam_role.arn
  handler       = "app.lambda_handler"
  runtime       = "python3.8"
  timeout = 180
  layers  = [data.aws_lambda_layer_version.wfnews_lambda_layer.arn]
  environment {
    variables = {
      QUEUE_URL   = aws_sqs_queue.queue_restrictions.url
      S3_BUCKET   = aws_s3_bucket.wfnews-monitor-queue-bucket.id
      SECRET_NAME = var.SECRET_NAME
      WFNEWS_API  = var.WFNEWS_URL
    }
  }
}

resource "aws_lambda_function" "monitor-evacuation" {
  function_name = "wfnews-monitor-evacuation-${var.target_env}"
  filename =  "lambda-functions/evacuation_orders.zip"
  source_code_hash = local_file.area_restrictions_zip.content_base64sha256
  role          = aws_iam_role.lambda_iam_role.arn
  handler       = "app.lambda_handler"
  runtime       = "python3.8"
  timeout = 180
  layers  = [data.aws_lambda_layer_version.wfnews_lambda_layer.arn]
  environment {
    variables = {
      QUEUE_URL   = aws_sqs_queue.queue_evacs.url
      S3_BUCKET   = aws_s3_bucket.wfnews-monitor-queue-bucket.id
      SECRET_NAME = var.SECRET_NAME
      WFNEWS_API  = var.WFNEWS_URL
    }
  }
}
