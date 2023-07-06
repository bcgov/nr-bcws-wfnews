locals {
  environments = {
    "DEV" : local.DEV,
    "QA" : local.QA,
    "INT" : local.INT,
    "DLV" : local.DLV,
    "TST" : local.TST,
    "PROD" : local.PROD
  }
}