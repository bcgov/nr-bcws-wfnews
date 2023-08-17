resource "aws_s3_bucket" "wfnews_upload_bucket" {
  bucket        = "wfnews-${var.target_env}-uploads"
  acl           = "private"
  force_destroy = true
}

resource "aws_s3_bucket" "wfnews_log_bucket" {
  bucket        = "wfnews-${var.target_env}-logs"
  acl           = "private"
  force_destroy = true
}

//Need to manually create bucket before first deployment in given environment, as lambdas must be uploaded before terraform runs.
data "aws_s3_bucket" "wfnews_lambda" {
  bucket        = "wfnews-lambda-${var.target_env}"
}

resource "aws_s3_bucket" "wfnews-monitor-queue-bucket" {
  bucket = "wfnews-monitor-queue-${var.target_env}"
  server_side_encryption_configuration {
    rule {
      bucket_key_enabled = false

      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }
}
