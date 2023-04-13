resource "aws_sns_topic" "wfnews_sns_topic" {
  name = "wfnews-sns-topic-${var.target_env}"
}

resource "aws_sns_topic_subscription" "wfnews_sns_topic_subscription" {
  for_each  = toset(split(",", var.sns_email_targets))
  topic_arn = aws_sns_topic.wfnews_sns_topic.arn
  protocol  = "email"
  endpoint  = each.key
}

resource "aws_sns_topic_policy" "wfnews_topic_policy" {
  arn    = aws_sns_topic.wfnews_sns_topic.arn
  policy = data.aws_iam_policy_document.wfnews_topic_policy_document.json
}

data "aws_iam_policy_document" "wfnews_topic_policy_document" {
  policy_id = "__default_policy_ID"
  statement {
    actions = [
      "SNS:Subscribe",
      "SNS:Receive",
      "SNS:Publish",
      "SNS:ListSubscriptionsByTopic",
      "SNS:GetTopicAttributes"
    ]

    effect = "Allow"

    principals {
      type        = "AWS"
      identifiers = ["*"]
    }

    resources = [
      aws_sns_topic.wfnews_sns_topic.arn
    ]

    condition {
      test     = "StringLike"
      variable = "aws:SourceVpc"
      values = [
        "${module.network.aws_vpc.id}"
      ]
    }

    sid = "__default_statement_ID"
  }
}