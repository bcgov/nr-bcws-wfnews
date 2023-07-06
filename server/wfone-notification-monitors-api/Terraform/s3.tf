resource "aws_s3_bucket" "wfone-public-mobile-monitor-queue-bucket" {
  bucket = "wfone-public-mobile-monitor-queue-${module.vars.env.env_lowercase}"
  server_side_encryption_configuration {
    rule {
      bucket_key_enabled = false

      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }
}