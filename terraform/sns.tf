resource "aws_sns_topic" "wfnews_sns_topic" {
  name = "wfnews-sns-topic-${var.target_env}"
}

resource "aws_sns_topic_subscription" "wfnews_sns_topic_subscription" {
    for_each   = toset(split(",", var.sns_email_targets))
    topic_arn = aws_sns_topic.wfnews_sns_topic.arn
    protocol = "email"
    endpoint = each.key
}