resource "aws_lambda_layer_version" "wfnews_lambda_layer" {
  s3_bucket = data.aws_s3_bucket.wfnews_lambda.bucket
  s3_key = "python.zip"
  layer_name = "wfnews_lambda_layer"
  compatible_runtimes = ["python3.9"]
}

data "aws_s3_object" "bans_and_prohibitions_monitor_hash" {
  bucket = data.aws_s3_bucket.wfnews_lambda.bucket
  key = "bans-and-prohibitions-monitor-hash.txt"
}

data "aws_s3_object" "active_fire_monitor_hash" {
  bucket = data.aws_s3_bucket.wfnews_lambda.bucket
  key = "active-fire-monitor-hash.txt"
}

data "aws_s3_object" "area_restrictions_monitor_hash" {
  bucket = data.aws_s3_bucket.wfnews_lambda.bucket
  key = "area-restrictions-monitor-hash.txt"
}

data "aws_s3_object" "evacuation_orders_monitor_hash" {
  bucket = data.aws_s3_bucket.wfnews_lambda.bucket
  key = "evacuation-orders-monitor-hash.txt"
}

resource "aws_lambda_function" "monitor-bans-prohibitions" {
  function_name = "wfnews-monitor-bans-${var.target_env}"
  s3_bucket = data.aws_s3_bucket.wfnews_lambda.bucket
  s3_key = "bans-and-prohibitions-monitor.zip"
  source_code_hash = data.aws_s3_object.bans_and_prohibitions_monitor_hash.body
  role          = aws_iam_role.lambda_iam_role.arn
  handler       = "app.lambda_handler"
  runtime       = "python3.9"
  timeout = 900
  layers  = [aws_lambda_layer_version.wfnews_lambda_layer.arn]
  environment {
    variables = {
      QUEUE_URL   = aws_sqs_queue.queues["bans-prohibitions"].url
      S3_BUCKET   = aws_s3_bucket.wfnews-monitor-queue-bucket.id
      SECRET_NAME = var.SECRET_NAME
      WFNEWS_API  = "https://${aws_route53_record.wfnews_nginx.name}"
      LAYER_URL   = "${var.WFARCGIS_URL}/${var.WFARCGIS_LAYER_BANS_PROHIBITION_AREAS}"
    }
  }
  vpc_config {
    subnet_ids         = module.network.aws_subnet_ids.web.ids
    security_group_ids = [data.aws_security_group.app.id]
  }
}

resource "aws_lambda_function" "monitor-active-fires" {
  function_name = "wfnews-monitor-active-fires-${var.target_env}"
  s3_bucket = data.aws_s3_bucket.wfnews_lambda.bucket
  s3_key      = "active-fire-monitor.zip"
  source_code_hash = data.aws_s3_object.active_fire_monitor_hash.body
  role          = aws_iam_role.lambda_iam_role.arn
  handler       = "app.lambda_handler"
  runtime       = "python3.9"
  layers        = [aws_lambda_layer_version.wfnews_lambda_layer.arn]
  timeout = 180
  environment {
    variables = {
      QUEUE_URL   = aws_sqs_queue.queues["active-fires"].url
      S3_BUCKET   = aws_s3_bucket.wfnews-monitor-queue-bucket.id
      SECRET_NAME = var.SECRET_NAME
      WFNEWS_API  = "https://${aws_route53_record.wfnews_nginx.name}"
      LAYER_URL   = "${var.WFARCGIS_URL}/${var.WFARCGIS_LAYER_ACTIVE_FIRES}"
    }
  }
  vpc_config {
    subnet_ids         = module.network.aws_subnet_ids.web.ids
    security_group_ids = [data.aws_security_group.app.id]
  }
}

resource "aws_lambda_function" "monitor-area-restrictions" {
  function_name = "wfnews-monitor-area-restrictions-${var.target_env}"
  s3_bucket = data.aws_s3_bucket.wfnews_lambda.bucket
  s3_key = "area-restrictions-monitor.zip"
  source_code_hash = data.aws_s3_object.area_restrictions_monitor_hash.body
  role          = aws_iam_role.lambda_iam_role.arn
  handler       = "app.lambda_handler"
  runtime       = "python3.9"
  timeout = 180
  layers  = [aws_lambda_layer_version.wfnews_lambda_layer.arn]
  environment {
    variables = {
      QUEUE_URL   = aws_sqs_queue.queues["area-restrictions"].url
      S3_BUCKET   = aws_s3_bucket.wfnews-monitor-queue-bucket.id
      SECRET_NAME = var.SECRET_NAME
      WFNEWS_API  = "https://${aws_route53_record.wfnews_nginx.name}"
      LAYER_URL   = "${var.WFARCGIS_URL}/${var.WFARCGIS_LAYER_AREA_RESTRICTIONS}"
    }
  }
  vpc_config {
    subnet_ids         = module.network.aws_subnet_ids.web.ids
    security_group_ids = [data.aws_security_group.app.id]
  }
}

resource "aws_lambda_function" "monitor-evacuation" {
  function_name = "wfnews-monitor-evacuation-${var.target_env}"
  s3_bucket = data.aws_s3_bucket.wfnews_lambda.bucket
  s3_key =  "evacuation-orders-monitor.zip"
  source_code_hash = data.aws_s3_object.evacuation_orders_monitor_hash.body
  role          = aws_iam_role.lambda_iam_role.arn
  handler       = "app.lambda_handler"
  runtime       = "python3.9"
  timeout = 180
  layers  = [aws_lambda_layer_version.wfnews_lambda_layer.arn]
  environment {
    variables = {
      QUEUE_URL   = aws_sqs_queue.queues["evac-orders"].url
      S3_BUCKET   = aws_s3_bucket.wfnews-monitor-queue-bucket.id
      SECRET_NAME = var.SECRET_NAME
      WFNEWS_API  = "https://${aws_route53_record.wfnews_nginx.name}"
      LAYER_URL   = "${var.WFARCGIS_URL}/${var.WFARCGIS_LAYER_EVACUATION_ORDERS_ALERTS}"
    }
  }
  vpc_config {
    subnet_ids         = module.network.aws_subnet_ids.web.ids
    security_group_ids = [data.aws_security_group.app.id]
  }
}

resource "aws_lambda_function" "wfnews-cache-invalidator" {
  function_name = "wfnews-cache-invalidator-${var.target_env}"
  s3_bucket = data.aws_s3_bucket.wfnews_lambda.bucket
  s3_key =  "wfnews-cache-invalidator.zip"
  source_code_hash = data.aws_s3_object.wfnews-cache-invalidator_hash.body
  role          = aws_iam_role.lambda_iam_role.arn
  handler       = "app.lambda_handler"
  runtime       = "nodejs18.x"
  timeout = 180
  environment {
    variables = {
      S3_BUCKET   = aws_s3_bucket.wfnews-monitor-queue-bucket.id
      SECRET_NAME = var.SECRET_NAME
      DISTRIBUTION_IDS = "${aws_cloudfront_distribution.wfnews_openmaps_cache.id},${aws_cloudfront_distribution.wfnews_services6_cache.id}"
    }
  }
  vpc_config {
    subnet_ids         = module.network.aws_subnet_ids.web.ids
    security_group_ids = [data.aws_security_group.app.id]
  }
}
