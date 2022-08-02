resource "aws_s3_bucket" "upload_bucket" {
  bucket        = "wfnews-${var.target_env}"
  acl           = "private"
  force_destroy = true
}

resource "aws_s3_bucket" "log_bucket" {
  bucket        = "wfnews-${var.target_env}-access-logs"
  acl           = "private"
  force_destroy = true
}