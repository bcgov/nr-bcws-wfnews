resource "aws_sns_topic" "wfnews_sns_topic" {
  name = "wfnews-sns-topic-${var.target_env}"
}