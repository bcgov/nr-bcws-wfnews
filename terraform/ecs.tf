# ecs.tf

resource "aws_ecs_cluster" "wfnews_main" {
  name = "wfnews-cluster"

  tags = local.common_tags
}

/*
resource "terraform_data" "tasks" {
  input = {
    wfnews_server = {
      family = "wfnews-server-task-${var.target_env}",
      cpu = var.server_cpu_units,
      memory = var.server_memory,
      port = [{
            protocol      = "tcp"
            containerPort = var.server_port
            hostPort      = var.server_port
      }],
      environment = [
          {
            name  = "LOGGING_LEVEL"
            value = "${var.logging_level}"
          },
          {
            name  = "DB_NAME"
            value = "${aws_db_instance.wfnews_pgsqlDB.name}"
          },
          {
            name  = "AWS_REGION",
            value = var.aws_region
          },
          {
            name  = "bucketName",
            value = aws_s3_bucket.wfnews_upload_bucket.id
          },
          {
            name  = "WEBADE_OAUTH2_CLIENT_ID",
            value = var.WEBADE_OAUTH2_REST_CLIENT_ID
          },
          {
            name  = "WEBADE-OAUTH2_TOKEN_CLIENT_URL",
            value = var.WEBADE-OAUTH2_TOKEN_CLIENT_URL
          },
          {
            name  = "WEBADE-OAUTH2_TOKEN_URL",
            value = var.WEBADE-OAUTH2_TOKEN_URL
          },
          {
            name  = "WEBADE_OAUTH2_WFNEWS_REST_CLIENT_SECRET",
            value = var.WEBADE_OAUTH2_WFNEWS_REST_CLIENT_SECRET
          },
          {
            name  = "WFDM_REST_URL",
            value = var.WFDM_REST_URL
          },
          {
            name  = "WFIM_CLIENT_URL",
            value = var.WFIM_CLIENT_URL
          },
          {
            name  = "WFIM_CODE_TABLES_URL",
            value = var.WFIM_CODE_TABLES_URL
          },
          {
            name  = "WEBADE-OAUTH2_CHECK_TOKEN_URL",
            value = var.WEBADE-OAUTH2_CHECK_TOKEN_URL
          },
          {
            name  = "WFNEWS_EMAIL_NOTIFICATIONS_ENABLED_IND",
            value = var.WFNEWS_EMAIL_NOTIFICATIONS_ENABLED
          },
          {
            name  = "SMTP_HOST_NAME",
            value = var.SMTP_HOST_NAME
          },
          {
            name  = "SMTP_PASSWORD",
            value = var.SMTP_PASSWORD
          },
          {
            name  = "SMTP_FROM_EMAIL",
            value = var.SMTP_FROM_EMAIL
          },
          {
            name  = "SMTP_ADMIN_EMAIL",
            value = var.SMTP_ADMIN_EMAIL
          },
          {
            name  = "SMTP_EMAIL_SYNC_ERROR_FREQ",
            value = var.SMTP_EMAIL_SYNC_ERROR_FREQ
          },
          {
            name  = "SMTP_EMAIL_FREQ",
            value = var.SMTP_EMAIL_FREQ
            }, {
            name  = "SMTP_EMAIL_ERROR_SUBJECT",
            value = var.SMTP_EMAIL_ERROR_SUBJECT
          },
          {
            name  = "SMTP_EMAIL_SUBJECT",
            value = var.SMTP_EMAIL_SUBJECT
          },
          {
            name  = "DEFAULT_APPLICATION_ENVIRONMENT",
            value = var.DEFAULT_APPLICATION_ENVIRONMENT
          },
          {
            name  = "WFNEWS_AGOL_QUERY_URL",
            value = var.WFNEWS_AGOL_QUERY_URL
          },
          {
            name  = "WFNEWS_DB_URL",
            value = "jdbc:postgresql://${aws_db_instance.wfnews_pgsqlDB.endpoint}/${aws_db_instance.wfnews_pgsqlDB.name}"
          },
          {
            name  = "WFNEWS_USERNAME",
            value = var.WFNEWS_USERNAME
          },
          {
            name  = "WFNEWS_MAX_CONNECTIONS",
            value = var.WFNEWS_MAX_CONNECTIONS
          },
          {
            name  = "DB_PASS",
            value = "${var.db_pass}"
          },
          # Access keys and secret keys are not needed when using container-based authentication
          # {
          #   name = "WFNEWS_SNS_ACCESS_KEY",
          #   value = "${var.aws_access_key_id}"
          # },
          # {
          #   name = "WFNEWS_SNS_SECRET",
          #   value = "${var.aws_secret_access_key}"
          # },
          # {
          #   name = "WFNEWS_S3_ACCESS_KEY",
          #   value = "${var.aws_access_key_id}"
          # },
          # {
          #   name = "WFNEWS_S3_SECRET",
          #   value = "${var.aws_secret_access_key}"
          # },
          {
            name  = "WFNEWS_ACCESS_KEY_ID",
            value = "${var.aws_access_key_id}"
          },
          {
            name  = "WFNEWS_SECRET_ACCESS_KEY",
            value = "${var.aws_secret_access_key}"
          },
          {
            name  = "WFNEWS_SNS_TOPIC_ARN",
            value = "${aws_sns_topic.wfnews_sns_topic.arn}"
          },
          {
            name  = "WFNEWS_S3_BUCKET_NAME",
            value = "${aws_s3_bucket.wfnews_upload_bucket.bucket}"
          },
          {
            name  = "API_KEY",
            value = "${var.api_key}"
          }
      ],
      name = var.server_container_name,
      image = var.server_image
    },
    wfnews_client = {
      family = "wfnews-client-task-${var.target_env}",
      cpu                      = var.client_cpu_units,
      memory                   = var.client_memory,
      image                    = var.client_image,
      port = [{
            protocol      = "tcp"
            containerPort = var.client_port
            hostPort      = var.client_port
          }],
      environment = [
          {
            name  = "LOGGING_LEVEL"
            value = "${var.logging_level}"
          },
          {
            name  = "AWS_REGION",
            value = var.aws_region
          },
          {
            name  = "bucketName",
            value = aws_s3_bucket.wfnews_upload_bucket.id
          },
          {
            #Base URL will use the 
            name  = "BASE_URL",
            value = var.target_env == "prod" ? "https://${var.gov_client_url}/" : "https://${aws_route53_record.wfnews_client.name}/"
          },
          {
            name  = "WEBADE_OAUTH2_WFNEWS_REST_CLIENT_SECRET",
            value = var.WEBADE_OAUTH2_WFNEWS_UI_CLIENT_SECRET
          },
          {
            name  = "WEBADE-OAUTH2_TOKEN_URL",
            value = var.WEBADE-OAUTH2_TOKEN_URL
          },
          {
            name  = "WEBADE-OAUTH2_CHECK_TOKEN_V2_URL"
            value = var.WEBADE-OAUTH2_CHECK_TOKEN_URL
          },
          {
            name  = "WFIM_API_URL",
            value = var.WFIM_CLIENT_URL
          },
          {
            name  = "WFDM_API_URL",
            value = var.WFDM_REST_URL
          },
          {
            name  = "ORG_UNIT_URL",
            value = ""
          },
          { //Will be phased out from prod eventually, but not yet
            name  = "WFNEWS_API_URL",
            value = var.target_env == "prod" ? "https://${var.gov_api_url}/" : "https://${aws_route53_record.wfnews_apisix.name}/"
          },
          {
            name  = "WFNEWS_API_KEY",
            value = "${var.api_key}"
          },
          {
            name  = "WEBADE_OAUTH2_AUTHORIZE_URL",
            value = var.WEBADE_OAUTH2_AUTHORIZE_URL
          },
          {
            name  = "APPLICATION_ENVIRONMENT",
            value = var.target_env != "prod" ? var.target_env : " "
          },
          {
            name  = "AGOL_URL",
            value = var.agolUrl
          },
          {
            name  = "DRIVEBC_BASE_URL",
            value = var.drivebcBaseUrl
          },
          {
            name  = "OPENMAPS_BASE_URL",
            value = var.openmapsBaseUrl
          },
          {
            name  = "SITEMINDER_URL_PREFIX",
            value = var.siteMinderURLPrefix
          },
          {
            name  = "AGOL_AREA_RESTRICTIONS",
            value = var.agolAreaRestrictions
          },
          {
            name  = "AGOL_BANS_AND_PROHIBITIONS",
            value = var.agolBansAndProhibitions
          }

        ]
    },
    wfnews_liquibase = {
      family                   = "wfnews-liquibase-task-${var.target_env}",
      cpu                      = var.server_cpu_units,
      memory                   = var.server_memory,
      image                    = var.liquibase_image,
      port = [{
            protocol      = "tcp"
            containerPort = var.db_port
            hostPort      = var.db_port
          }],
      environment = [
          {
            name  = "DB_URL",
            value = "jdbc:postgresql://${aws_db_instance.wfnews_pgsqlDB.endpoint}/${aws_db_instance.wfnews_pgsqlDB.name}"
          },
          {
            name  = "DB_USER",
            value = "${aws_db_instance.wfnews_pgsqlDB.username}"
          },
          {
            name  = "DB_PASS"
            value = "${var.db_pass}"
          },
          {
            name = "CHANGELOG_FOLDER",
            value = "wfnews-db"
          }
      ]
    },
    wfnews_apisix = {
      family                   = "wfnews-apisix-task-${var.target_env}",
      cpu                      = var.server_cpu_units,
      memory                   = var.server_memory,
      image                    = var.apisix_image,
      port =[{
            protocol      = "tcp"
            containerPort = var.apisix_ports[0]
            hostPort      = var.apisix_ports[0]
          },
          {
            protocol      = "tcp"
            containerPort = var.apisix_ports[1]
            hostPort      = var.apisix_ports[1]
          }],
      environment = [
          {
            name  = "LOGGING_LEVEL"
            value = "${var.logging_level}"
          },
          {
            name  = "API_KEY",
            value = "${var.api_key}"
          },
          {
            name  = "TARGET_ENV",
            value = "${var.target_env}"
          },
          {
            name  = "LICENSE_PLATE",
            value = "${var.license_plate}"
          },
          {
            name  = "MAX_SIZE",
            value = "${var.max_upload_size}"
          }
        ]
    },
    wfss_pointid = {
      family = "wfss-pointid-api-${var.target_env}",
      cpu                      = var.server_cpu_units,
      memory                   = var.server_memory,
      image                    = var.pointid_image,
      port = [{
            protocol      = "tcp"
            containerPort = var.server_port
            hostPort      = var.server_port
      }],
      environment = [
          {
            name  = "DATABASE_WEATHER_URL",
            value = var.DATABASE_WEATHER_URL
          },
          {
            name  = "DATABASE_WEATHER_USER",
            value = var.DATABASE_WEATHER_USER
          },
          {
            name  = "DATABASE_WEATHER_PWD",
            value = var.DATABASE_WEATHER_PWD
          },
          {
            name  = "BCGW_URL",
            value = var.BCGW_URL
          },
          {
            name  = "WFGS_URL",
            value = var.WFGS_URL
          },
          {
            name  = "MAX_ALLOWED_RADIUS",
            value = var.POINTID_MAX_ALLOWED_RADIUS
          },
          {
            name  = "ASYNC_JOB_INTERVAL",
            value = var.ASYNC_JOB_INTERVAL
          },
          {
            name  = "ASYNC_JOB_REF_LAT",
            value = var.ASYNC_JOB_REF_LAT
          },
          {
            name  = "ASYNC_JOB_REF_LONG",
            value = var.POINTID_ASYNC_JOB_REF_LONG
          },
          {
            name  = "ASYNC_JOB_REF_RADIUS",
            value = var.POINTID_ASYNC_JOB_REF_RADIUS
          },
          {
            name  = "WEATHER_HOST",
            value = var.WEATHER_HOST
          },
          {
            name  = "WEATHER_USER",
            value = var.WEATHER_USER
          },
          {
            name  = "WEATHER_PASSWORD",
            value = var.WEATHER_PASSWORD
          },
          {
            name  = "WFARCGIS_URL",
            value = var.WFARCGIS_URL
          },
          {
            name  = "WFARCGIS_LAYER_AREA_RESTRICTIONS",
            value = var.WFARCGIS_LAYER_AREA_RESTRICTIONS
          },
          {
            name  = "WFARCGIS_LAYER_BANS_PROHIBITION_AREAS",
            value = var.WFARCGIS_LAYER_BANS_PROHIBITION_AREAS
          },
          {
            name  = "WFARCGIS_LAYER_DANGER_RATING",
            value = var.WFARCGIS_LAYER_DANGER_RATING
          },
          {
            name  = "WFARCGIS_LAYER_ACTIVE_FIRES",
            value = var.WFARCGIS_LAYER_ACTIVE_FIRES
          },
          {
            name  = "WFARCGIS_LAYER_EVACUATION_ORDERS_ALERTS",
            value = var.WFARCGIS_LAYER_EVACUATION_ORDERS_ALERTS
          },
          {
            name  = "WFARGIS_LAYER_FIRE_CENTRE_BOUNDARIES",
            value = var.WFARGIS_LAYER_FIRE_CENTRE_BOUNDARIES
          },
          {
            name  = "WFARCGIS_QUEUESIZE",
            value = var.WFARCGIS_QUEUESIZE
          },
          {
            name  = "WEBADE_OAUTH2_CLIENT_ID",
            value = var.WEBADE_OAUTH2_CLIENT_ID
          },
          {
            name  = "WEBADE_OATH2_TOKEN_URL",
            value = var.WEBADE_OATH2_TOKEN_URL
          },
          {
            name  = "WEBADE_OAUTH2_CLIENT_SCOPES",
            value = var.WEBADE_OAUTH2_CLIENT_SCOPES
          },
          {
            name  = "FIREWEATHER_BASEURL",
            value = var.FIREWEATHER_BASEURL
          },
          {
            name  = "FIREWEATHER_QUEUESIZE",
            value = var.FIREWEATHER_QUEUESIZE
          },
          {
            name  = "WFNEWS_BASEURL",
            value = var.WFNEWS_BASEURL
          },
          {
            name  = "WFNEWS_QUEUESIZE",
            value = var.WFNEWS_QUEUESIZE
          },
          {
            name  = "WEBADE_OAUTH2_CLIENT_SECRET",
            value = var.WEBADE_OAUTH2_CLIENT_SECRET
          }
        ]
    },
    wfone_notifications_api = {
      family                   = "wfone_notifications_api-task-${var.target_env}",
      cpu                      = var.server_cpu_units,
      memory                   = var.server_memory,
      port =[{
            protocol      = "tcp"
            containerPort = var.apisix_ports[0]
            hostPort      = var.apisix_ports[0]
          },
          {
            protocol      = "tcp"
            containerPort = var.apisix_ports[1]
            hostPort      = var.apisix_ports[1]
          }],
      environment = [
          {
            name  = "DATASOURCE_MAX_CONNECTIONS",
            value = var.WFONE_NOTIFICATIONS_API_DATASOURCE_MAX_CONNECTIONS
          },
          {
            name  = "DATASOURCE_PASSWORD",
            value = var.WFONE_NOTIFICATIONS_API_DATASOURCE_PASSWORD
          },
          {
            name  = "DATASOURCE_URL",
            value = var.WFONE_NOTIFICATIONS_API_DATASOURCE_URL
          },
          {
            name  = "DATASOURCE_USER",
            value = var.WFONE_NOTIFICATIONS_API_DATASOURCE_USER
          },
          {
            name  = "DEFAULT_APPLICATION_ENVIRONMENT",
            value = var.DEFAULT_APPLICATION_ENVIRONMENT
          },
          {
            name  = "EMAIL_ADMIN_EMAIL",
            value = var.WFONE_NOTIFICATIONS_API_EMAIL_ADMIN_EMAIL
          },
          {
            name  = "EMAIL_FROM_EMAIL",
            value = var.WFONE_NOTIFICATIONS_API_EMAIL_FROM_EMAIL
          },
          {
            name  = "EMAIL_NOTIFICATIONS_ENABLED",
            value = var.WFONE_NOTIFICATIONS_API_EMAIL_NOTIFICATIONS_ENABLED
          },
          {
            name  = "EMAIL_SYNC_SEND_ERROR_FREQ",
            value = var.WFONE_NOTIFICATIONS_API_EMAIL_SYNC_SEND_ERROR_FREQ
          },
          {
            name  = "EMAIL_SYNC_SEND_ERROR_SUBJECT",
            value = var.WFONE_NOTIFICATIONS_API_EMAIL_SYNC_SEND_ERROR_SUBJECT
          },
          {
            name  = "EMAIL_SYNC_SEND_FREQ",
            value = var.WFONE_NOTIFICATIONS_API_EMAIL_SYNC_SEND_FREQ
          },
          {
            name  = "EMAIL_SYNC_SUBJECT",
            value = var.WFONE_NOTIFICATIONS_API_EMAIL_SYNC_SUBJECT
          },
          {
            name  = "PUSH_ITEM_EXPIRE_HOURS",
            value = var.WFONE_NOTIFICATIONS_API_PUSH_ITEM_EXPIRE_HOURS
          },
          {
            name  = "QUARTZ_CONSUMER_INTERVAL_SECONDS",
            value = var.WFONE_NOTIFICATIONS_API_QUARTZ_CONSUMER_INTERVAL_SECONDS
          },
          {
            name  = "SMTP_CREDENTIALS_PASSWORD",
            value = var.WFONE_NOTIFICATIONS_API_SMTP_CREDENTIALS_PASSWORD
          },
          {
            name  = "SMTP_CREDENTIALS_USER",
            value = var.WFONE_NOTIFICATIONS_API_SMTP_CREDENTIALS_USER
          },
          {
            name  = "SMTP_HOST_NAME",
            value = var.WFONE_NOTIFICATIONS_API_SMTP_HOST_NAME
          },
          {
            name  = "WEBADE_OAUTH2_CHECK_TOKEN_URL"
            value = var.WEBADE-OAUTH2_CHECK_TOKEN_URL
          },
          {
            name  = "WEBADE_OAUTH2_CLIENT_ID",
            value = var.WFONE_NOTIFICATIONS_API_WEBADE_OAUTH2_CLIENT_ID
          },
          {
            name  = "WEBADE_OAUTH2_REST_CLIENT_SECRET",
            value = var.WFONE_NOTIFICATIONS_API_WEBADE_OAUTH2_REST_CLIENT_SECRET
          },
          {
            name  = "WEBADE_OAUTH2_TOKEN_CLIENT_URL",
            value = var.WEBADE-OAUTH2_TOKEN_CLIENT_URL
          },
          {
            name  = "WEBADE_OAUTH2_TOKEN_URL",
            value = var.WEBADE-OAUTH2_TOKEN_URL
          },
          {
            name  = "WEBADE_OAUTH2_WFIM_CLIENT_ID",
            value = var.WFONE_NOTIFICATIONS_API_WEBADE_OAUTH2_WFIM_CLIENT_ID
          },
          {
            name  = "WFDM_REST_URL",
            value = var.WFDM_REST_URL
          },
          {
            name  = "WFIM_CLIENT_URL",
            value = var.WFIM_CLIENT_URL
          },
          {
            name  = "WFIM_CODE_TABLES_URL",
            value = var.WFIM_CODE_TABLES_URL
          }
        ]
    }
  }
}

/*

/*
tasks = {
  wfnews_server = {
    family = "wfnews-server-task-${var.target_env}",
    cpu = var.server_cpu_units,
    memory = var.server_memory,
    port = [{
          protocol      = "tcp"
          containerPort = var.server_port
          hostPort      = var.server_port
    }],
    environment = [
        {
          name  = "LOGGING_LEVEL"
          value = "${var.logging_level}"
        },
        {
          name  = "DB_NAME"
          value = "${aws_db_instance.wfnews_pgsqlDB.name}"
        },
        {
          name  = "AWS_REGION",
          value = var.aws_region
        },
        {
          name  = "bucketName",
          value = aws_s3_bucket.wfnews_upload_bucket.id
        },
        {
          name  = "WEBADE_OAUTH2_CLIENT_ID",
          value = var.WEBADE_OAUTH2_REST_CLIENT_ID
        },
        {
          name  = "WEBADE-OAUTH2_TOKEN_CLIENT_URL",
          value = var.WEBADE-OAUTH2_TOKEN_CLIENT_URL
        },
        {
          name  = "WEBADE-OAUTH2_TOKEN_URL",
          value = var.WEBADE-OAUTH2_TOKEN_URL
        },
        {
          name  = "WEBADE_OAUTH2_WFNEWS_REST_CLIENT_SECRET",
          value = var.WEBADE_OAUTH2_WFNEWS_REST_CLIENT_SECRET
        },
        {
          name  = "WFDM_REST_URL",
          value = var.WFDM_REST_URL
        },
        {
          name  = "WFIM_CLIENT_URL",
          value = var.WFIM_CLIENT_URL
        },
        {
          name  = "WFIM_CODE_TABLES_URL",
          value = var.WFIM_CODE_TABLES_URL
        },
        {
          name  = "WEBADE-OAUTH2_CHECK_TOKEN_URL",
          value = var.WEBADE-OAUTH2_CHECK_TOKEN_URL
        },
        {
          name  = "WFNEWS_EMAIL_NOTIFICATIONS_ENABLED_IND",
          value = var.WFNEWS_EMAIL_NOTIFICATIONS_ENABLED
        },
        {
          name  = "SMTP_HOST_NAME",
          value = var.SMTP_HOST_NAME
        },
        {
          name  = "SMTP_PASSWORD",
          value = var.SMTP_PASSWORD
        },
        {
          name  = "SMTP_FROM_EMAIL",
          value = var.SMTP_FROM_EMAIL
        },
        {
          name  = "SMTP_ADMIN_EMAIL",
          value = var.SMTP_ADMIN_EMAIL
        },
        {
          name  = "SMTP_EMAIL_SYNC_ERROR_FREQ",
          value = var.SMTP_EMAIL_SYNC_ERROR_FREQ
        },
        {
          name  = "SMTP_EMAIL_FREQ",
          value = var.SMTP_EMAIL_FREQ
          }, {
          name  = "SMTP_EMAIL_ERROR_SUBJECT",
          value = var.SMTP_EMAIL_ERROR_SUBJECT
        },
        {
          name  = "SMTP_EMAIL_SUBJECT",
          value = var.SMTP_EMAIL_SUBJECT
        },
        {
          name  = "DEFAULT_APPLICATION_ENVIRONMENT",
          value = var.DEFAULT_APPLICATION_ENVIRONMENT
        },
        {
          name  = "WFNEWS_AGOL_QUERY_URL",
          value = var.WFNEWS_AGOL_QUERY_URL
        },
        {
          name  = "WFNEWS_DB_URL",
          value = "jdbc:postgresql://${aws_db_instance.wfnews_pgsqlDB.endpoint}/${aws_db_instance.wfnews_pgsqlDB.name}"
        },
        {
          name  = "WFNEWS_USERNAME",
          value = var.WFNEWS_USERNAME
        },
        {
          name  = "WFNEWS_MAX_CONNECTIONS",
          value = var.WFNEWS_MAX_CONNECTIONS
        },
        {
          name  = "DB_PASS",
          value = "${var.db_pass}"
        },
        # Access keys and secret keys are not needed when using container-based authentication
        # {
        #   name = "WFNEWS_SNS_ACCESS_KEY",
        #   value = "${var.aws_access_key_id}"
        # },
        # {
        #   name = "WFNEWS_SNS_SECRET",
        #   value = "${var.aws_secret_access_key}"
        # },
        # {
        #   name = "WFNEWS_S3_ACCESS_KEY",
        #   value = "${var.aws_access_key_id}"
        # },
        # {
        #   name = "WFNEWS_S3_SECRET",
        #   value = "${var.aws_secret_access_key}"
        # },
        {
          name  = "WFNEWS_ACCESS_KEY_ID",
          value = "${var.aws_access_key_id}"
        },
        {
          name  = "WFNEWS_SECRET_ACCESS_KEY",
          value = "${var.aws_secret_access_key}"
        },
        {
          name  = "WFNEWS_SNS_TOPIC_ARN",
          value = "${aws_sns_topic.wfnews_sns_topic.arn}"
        },
        {
          name  = "WFNEWS_S3_BUCKET_NAME",
          value = "${aws_s3_bucket.wfnews_upload_bucket.bucket}"
        },
        {
          name  = "API_KEY",
          value = "${var.api_key}"
        }
    ],
    name = var.server_container_name,
    image = var.server_image
  },
  wfnews_client = {
    family = "wfnews-client-task-${var.target_env}",
    cpu                      = var.client_cpu_units,
    memory                   = var.client_memory,
    image                    = var.client_image,
    port = [{
          protocol      = "tcp"
          containerPort = var.client_port
          hostPort      = var.client_port
        }],
    environment = [
        {
          name  = "LOGGING_LEVEL"
          value = "${var.logging_level}"
        },
        {
          name  = "AWS_REGION",
          value = var.aws_region
        },
        {
          name  = "bucketName",
          value = aws_s3_bucket.wfnews_upload_bucket.id
        },
        {
          #Base URL will use the 
          name  = "BASE_URL",
          value = var.target_env == "prod" ? "https://${var.gov_client_url}/" : "https://${aws_route53_record.wfnews_client.name}/"
        },
        {
          name  = "WEBADE_OAUTH2_WFNEWS_REST_CLIENT_SECRET",
          value = var.WEBADE_OAUTH2_WFNEWS_UI_CLIENT_SECRET
        },
        {
          name  = "WEBADE-OAUTH2_TOKEN_URL",
          value = var.WEBADE-OAUTH2_TOKEN_URL
        },
        {
          name  = "WEBADE-OAUTH2_CHECK_TOKEN_V2_URL"
          value = var.WEBADE-OAUTH2_CHECK_TOKEN_URL
        },
        {
          name  = "WFIM_API_URL",
          value = var.WFIM_CLIENT_URL
        },
        {
          name  = "WFDM_API_URL",
          value = var.WFDM_REST_URL
        },
        {
          name  = "ORG_UNIT_URL",
          value = ""
        },
        { //Will be phased out from prod eventually, but not yet
          name  = "WFNEWS_API_URL",
          value = var.target_env == "prod" ? "https://${var.gov_api_url}/" : "https://${aws_route53_record.wfnews_apisix.name}/"
        },
        {
          name  = "WFNEWS_API_KEY",
          value = "${var.api_key}"
        },
        {
          name  = "WEBADE_OAUTH2_AUTHORIZE_URL",
          value = var.WEBADE_OAUTH2_AUTHORIZE_URL
        },
        {
          name  = "APPLICATION_ENVIRONMENT",
          value = var.target_env != "prod" ? var.target_env : " "
        },
        {
          name  = "AGOL_URL",
          value = var.agolUrl
        },
        {
          name  = "DRIVEBC_BASE_URL",
          value = var.drivebcBaseUrl
        },
        {
          name  = "OPENMAPS_BASE_URL",
          value = var.openmapsBaseUrl
        },
        {
          name  = "SITEMINDER_URL_PREFIX",
          value = var.siteMinderURLPrefix
        },
        {
          name  = "AGOL_AREA_RESTRICTIONS",
          value = var.agolAreaRestrictions
        },
        {
          name  = "AGOL_BANS_AND_PROHIBITIONS",
          value = var.agolBansAndProhibitions
        }

      ]
  },
  wfnews_liquibase = {
    family                   = "wfnews-liquibase-task-${var.target_env}",
    cpu                      = var.server_cpu_units,
    memory                   = var.server_memory,
    image                    = var.liquibase_image,
    port = [{
          protocol      = "tcp"
          containerPort = var.db_port
          hostPort      = var.db_port
        }],
    environment = [
        {
          name  = "DB_URL",
          value = "jdbc:postgresql://${aws_db_instance.wfnews_pgsqlDB.endpoint}/${aws_db_instance.wfnews_pgsqlDB.name}"
        },
        {
          name  = "DB_USER",
          value = "${aws_db_instance.wfnews_pgsqlDB.username}"
        },
        {
          name  = "DB_PASS"
          value = "${var.db_pass}"
        },
        {
          name = "CHANGELOG_FOLDER",
          value = "wfnews-db"
        }
    ]
  },
  wfnews_apisix = {
    family                   = "wfnews-apisix-task-${var.target_env}",
    cpu                      = var.server_cpu_units,
    memory                   = var.server_memory,
    image                    = var.apisix_image,
    port =[{
          protocol      = "tcp"
          containerPort = var.apisix_ports[0]
          hostPort      = var.apisix_ports[0]
        },
        {
          protocol      = "tcp"
          containerPort = var.apisix_ports[1]
          hostPort      = var.apisix_ports[1]
        }],
    environment = [
        {
          name  = "LOGGING_LEVEL"
          value = "${var.logging_level}"
        },
        {
          name  = "API_KEY",
          value = "${var.api_key}"
        },
        {
          name  = "TARGET_ENV",
          value = "${var.target_env}"
        },
        {
          name  = "LICENSE_PLATE",
          value = "${var.license_plate}"
        },
        {
          name  = "MAX_SIZE",
          value = "${var.max_upload_size}"
        }
      ]
  },
  wfss_pointid = {
    family = "wfss-pointid-api-${var.target_env}",
    cpu                      = var.server_cpu_units,
    memory                   = var.server_memory,
    image                    = var.pointid-image,
    port = [{
          protocol      = "tcp"
          containerPort = var.server_port
          hostPort      = var.server_port
    }],
    environment = [
        {
          name  = "DATABASE_WEATHER_URL",
          value = var.DATABASE_WEATHER_URL
        },
        {
          name  = "DATABASE_WEATHER_USER",
          value = var.DATABASE_WEATHER_USER
        },
        {
          name  = "DATABASE_WEATHER_PWD",
          value = var.DATABASE_WEATHER_PWD
        },
        {
          name  = "BCGW_URL",
          value = var.BCGW_URL
        },
        {
          name  = "WFGS_URL",
          value = var.WFGS_URL
        },
        {
          name  = "MAX_ALLOWED_RADIUS",
          value = var.POINTID_MAX_ALLOWED_RADIUS
        },
        {
          name  = "ASYNC_JOB_INTERVAL",
          value = var.ASYNC_JOB_INTERVAL
        },
        {
          name  = "ASYNC_JOB_REF_LAT",
          value = var.ASYNC_JOB_REF_LAT
        },
        {
          name  = "ASYNC_JOB_REF_LONG",
          value = var.POINTID_ASYNC_JOB_REF_LONG
        },
        {
          name  = "ASYNC_JOB_REF_RADIUS",
          value = var.POINTID_ASYNC_JOB_REF_RADIUS
        },
        {
          name  = "WEATHER_HOST",
          value = var.WEATHER_HOST
        },
        {
          name  = "WEATHER_USER",
          value = var.WEATHER_USER
        },
        {
          name  = "WEATHER_PASSWORD",
          value = var.WEATHER_PASSWORD
        },
        {
          name  = "WFARCGIS_URL",
          value = var.WFARCGIS_URL
        },
        {
          name  = "WFARCGIS_LAYER_AREA_RESTRICTIONS",
          value = var.WFARCGIS_LAYER_AREA_RESTRICTIONS
        },
        {
          name  = "WFARCGIS_LAYER_BANS_PROHIBITION_AREAS",
          value = var.WFARCGIS_LAYER_BANS_PROHIBITION_AREAS
        },
        {
          name  = "WFARCGIS_LAYER_DANGER_RATING",
          value = var.WFARCGIS_LAYER_DANGER_RATING
        },
        {
          name  = "WFARCGIS_LAYER_ACTIVE_FIRES",
          value = var.WFARCGIS_LAYER_ACTIVE_FIRES
        },
        {
          name  = "WFARCGIS_LAYER_EVACUATION_ORDERS_ALERTS",
          value = var.WFARCGIS_LAYER_EVACUATION_ORDERS_ALERTS
        },
        {
          name  = "WFARGIS_LAYER_FIRE_CENTRE_BOUNDARIES",
          value = var.WFARGIS_LAYER_FIRE_CENTRE_BOUNDARIES
        },
        {
          name  = "WFARCGIS_QUEUESIZE",
          value = var.WFARCGIS_QUEUESIZE
        },
        {
          name  = "WEBADE_OAUTH2_CLIENT_ID",
          value = var.WEBADE_OAUTH2_CLIENT_ID
        },
        {
          name  = "WEBADE_OATH2_TOKEN_URL",
          value = var.WEBADE_OATH2_TOKEN_URL
        },
        {
          name  = "WEBADE_OAUTH2_CLIENT_SCOPES",
          value = var.WEBADE_OAUTH2_CLIENT_SCOPES
        },
        {
          name  = "FIREWEATHER_BASEURL",
          value = var.FIREWEATHER_BASEURL
        },
        {
          name  = "FIREWEATHER_QUEUESIZE",
          value = var.FIREWEATHER_QUEUESIZE
        },
        {
          name  = "WFNEWS_BASEURL",
          value = var.WFNEWS_BASEURL
        },
        {
          name  = "WFNEWS_QUEUESIZE",
          value = var.WFNEWS_QUEUESIZE
        },
        {
          name  = "WEBADE_OAUTH2_CLIENT_SECRET",
          value = var.WEBADE_OAUTH2_CLIENT_SECRET
        }
      ]
  },
  wfone_notifications_api = {
    family                   = "wfone_notifications_api-task-${var.target_env}",
    cpu                      = var.server_cpu_units,
    memory                   = var.server_memory,
    port =[{
          protocol      = "tcp"
          containerPort = var.apisix_ports[0]
          hostPort      = var.apisix_ports[0]
        },
        {
          protocol      = "tcp"
          containerPort = var.apisix_ports[1]
          hostPort      = var.apisix_ports[1]
        }],
    environment = [
        {
          name  = "DATASOURCE_MAX_CONNECTIONS",
          value = var.WFONE_NOTIFICATIONS_API_DATASOURCE_MAX_CONNECTIONS
        },
        {
          name  = "DATASOURCE_PASSWORD",
          value = var.WFONE_NOTIFICATIONS_API_DATASOURCE_PASSWORD
        },
        {
          name  = "DATASOURCE_URL",
          value = var.WFONE_NOTIFICATIONS_API_DATASOURCE_URL
        },
        {
          name  = "DATASOURCE_USER",
          value = var.WFONE_NOTIFICATIONS_API_DATASOURCE_USER
        },
        {
          name  = "DEFAULT_APPLICATION_ENVIRONMENT",
          value = var.DEFAULT_APPLICATION_ENVIRONMENT
        },
        {
          name  = "EMAIL_ADMIN_EMAIL",
          value = var.WFONE_NOTIFICATIONS_API_EMAIL_ADMIN_EMAIL
        },
        {
          name  = "EMAIL_FROM_EMAIL",
          value = var.WFONE_NOTIFICATIONS_API_EMAIL_FROM_EMAIL
        },
        {
          name  = "EMAIL_NOTIFICATIONS_ENABLED",
          value = var.WFONE_NOTIFICATIONS_API_EMAIL_NOTIFICATIONS_ENABLED
        },
        {
          name  = "EMAIL_SYNC_SEND_ERROR_FREQ",
          value = var.WFONE_NOTIFICATIONS_API_EMAIL_SYNC_SEND_ERROR_FREQ
        },
        {
          name  = "EMAIL_SYNC_SEND_ERROR_SUBJECT",
          value = var.WFONE_NOTIFICATIONS_API_EMAIL_SYNC_SEND_ERROR_SUBJECT
        },
        {
          name  = "EMAIL_SYNC_SEND_FREQ",
          value = var.WFONE_NOTIFICATIONS_API_EMAIL_SYNC_SEND_FREQ
        },
        {
          name  = "EMAIL_SYNC_SUBJECT",
          value = var.WFONE_NOTIFICATIONS_API_EMAIL_SYNC_SUBJECT
        },
        {
          name  = "PUSH_ITEM_EXPIRE_HOURS",
          value = var.WFONE_NOTIFICATIONS_API_PUSH_ITEM_EXPIRE_HOURS
        },
        {
          name  = "QUARTZ_CONSUMER_INTERVAL_SECONDS",
          value = var.WFONE_NOTIFICATIONS_API_QUARTZ_CONSUMER_INTERVAL_SECONDS
        },
        {
          name  = "SMTP_CREDENTIALS_PASSWORD",
          value = var.WFONE_NOTIFICATIONS_API_SMTP_CREDENTIALS_PASSWORD
        },
        {
          name  = "SMTP_CREDENTIALS_USER",
          value = var.WFONE_NOTIFICATIONS_API_SMTP_CREDENTIALS_USER
        },
        {
          name  = "SMTP_HOST_NAME",
          value = var.WFONE_NOTIFICATIONS_API_SMTP_HOST_NAME
        },
        {
          name  = "WEBADE_OAUTH2_CHECK_TOKEN_URL"
          value = var.WEBADE-OAUTH2_CHECK_TOKEN_URL
        },
        {
          name  = "WEBADE_OAUTH2_CLIENT_ID",
          value = var.WFONE_NOTIFICATIONS_API_WEBADE_OAUTH2_CLIENT_ID
        },
        {
          name  = "WEBADE_OAUTH2_REST_CLIENT_SECRET",
          value = var.WFONE_NOTIFICATIONS_API_WEBADE_OAUTH2_REST_CLIENT_SECRET
        },
        {
          name  = "WEBADE_OAUTH2_TOKEN_CLIENT_URL",
          value = var.WEBADE-OAUTH2_TOKEN_CLIENT_URL
        },
        {
          name  = "WEBADE_OAUTH2_TOKEN_URL",
          value = var.WEBADE-OAUTH2_TOKEN_URL
        },
        {
          name  = "WEBADE_OAUTH2_WFIM_CLIENT_ID",
          value = var.WFONE_NOTIFICATIONS_API_WEBADE_OAUTH2_WFIM_CLIENT_ID
        },
        {
          name  = "WFDM_REST_URL",
          value = var.WFDM_REST_URL
        },
        {
          name  = "WFIM_CLIENT_URL",
          value = var.WFIM_CLIENT_URL
        },
        {
          name  = "WFIM_CODE_TABLES_URL",
          value = var.WFIM_CODE_TABLES_URL
        }
      ]
  }
}
*/

/*
resource "aws_ecs_task_definition" "wfnews_tasks" {
  for_each = terraform_data.tasks.input
  family                   = each.value.family
  execution_role_arn       = aws_iam_role.wfnews_ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.wfnews_app_container_role.arn
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = each.value.cpu
  memory                   = each.value.memory
  tags                     = local.common_tags
  container_definitions = jsonencode ([
    {
      essential   = true
      name = each.value.name
      image = each.value.image
      cpu                      = each.value.cpu
      memory                   = each.value.memory
      networkMode = "awsvpc"
      portMappings = each.value.port,
      environment = each.value.environment
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-create-group  = "true"
          awslogs-group         = "/ecs/${each.value.name}"
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "ecs"
        }
      }
    }
  ])
}
*/

resource "aws_ecs_cluster_capacity_providers" "wfnews_main_providers" {
  cluster_name = aws_ecs_cluster.wfnews_main.name

  capacity_providers = ["FARGATE", "FARGATE_SPOT"]

  default_capacity_provider_strategy {
    base              = 1
    weight            = 100
    capacity_provider = "FARGATE_SPOT"
  }
}



resource "aws_ecs_task_definition" "wfnews_server" {
  family                   = "wfnews-server-task-${var.target_env}"
  execution_role_arn       = aws_iam_role.wfnews_ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.wfnews_app_container_role.arn
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.server_cpu_units
  memory                   = var.server_memory
  # volume {
  #   name = "work"
  #   emptyDir = {}
  # }
  # volume {
  #   name = "logging"
  #   emptyDir = {}
  # }
  tags                     = local.common_tags
  container_definitions = jsonencode([
    {
      essential   = true
      # readonlyRootFilesystem = true
      name        = var.server_container_name
      image       = var.server_image
      cpu         = var.server_cpu_units
      memory      = var.server_memory
      networkMode = "awsvpc"
      portMappings = [
        {
          protocol      = "tcp"
          containerPort = var.server_port
          hostPort      = var.server_port
        }
      ]
      environment = [
        {
          name  = "LOGGING_LEVEL"
          value = "${var.logging_level}"
        },
        {
          name  = "DB_NAME"
          value = "${aws_db_instance.wfnews_pgsqlDB.name}"
        },
        {
          name  = "AWS_REGION",
          value = var.aws_region
        },
        {
          name  = "bucketName",
          value = aws_s3_bucket.wfnews_upload_bucket.id
        },
        {
          name  = "WEBADE_OAUTH2_CLIENT_ID",
          value = var.WEBADE_OAUTH2_REST_CLIENT_ID
        },
        {
          name  = "WEBADE-OAUTH2_TOKEN_CLIENT_URL",
          value = var.WEBADE-OAUTH2_TOKEN_CLIENT_URL
        },
        {
          name  = "WEBADE-OAUTH2_TOKEN_URL",
          value = var.WEBADE-OAUTH2_TOKEN_URL
        },
        {
          name  = "WEBADE_OAUTH2_WFNEWS_REST_CLIENT_SECRET",
          value = var.WEBADE_OAUTH2_WFNEWS_REST_CLIENT_SECRET
        },
        {
          name  = "WFDM_REST_URL",
          value = var.WFDM_REST_URL
        },
        {
          name  = "WFIM_CLIENT_URL",
          value = var.WFIM_CLIENT_URL
        },
        {
          name  = "WFIM_CODE_TABLES_URL",
          value = var.WFIM_CODE_TABLES_URL
        },
        {
          name  = "WEBADE-OAUTH2_CHECK_TOKEN_URL",
          value = var.WEBADE-OAUTH2_CHECK_TOKEN_URL
        },
        {
          name  = "WFNEWS_EMAIL_NOTIFICATIONS_ENABLED_IND",
          value = var.WFNEWS_EMAIL_NOTIFICATIONS_ENABLED
        },
        {
          name  = "SMTP_HOST_NAME",
          value = var.SMTP_HOST_NAME
        },
        {
          name  = "SMTP_PASSWORD",
          value = var.SMTP_PASSWORD
        },
        {
          name  = "SMTP_FROM_EMAIL",
          value = var.SMTP_FROM_EMAIL
        },
        {
          name  = "SMTP_ADMIN_EMAIL",
          value = var.SMTP_ADMIN_EMAIL
        },
        {
          name  = "SMTP_EMAIL_SYNC_ERROR_FREQ",
          value = var.SMTP_EMAIL_SYNC_ERROR_FREQ
        },
        {
          name  = "SMTP_EMAIL_FREQ",
          value = var.SMTP_EMAIL_FREQ
          }, {
          name  = "SMTP_EMAIL_ERROR_SUBJECT",
          value = var.SMTP_EMAIL_ERROR_SUBJECT
        },
        {
          name  = "SMTP_EMAIL_SUBJECT",
          value = var.SMTP_EMAIL_SUBJECT
        },
        {
          name  = "DEFAULT_APPLICATION_ENVIRONMENT",
          value = var.DEFAULT_APPLICATION_ENVIRONMENT
        },
        {
          name  = "WFNEWS_AGOL_QUERY_URL",
          value = var.WFNEWS_AGOL_QUERY_URL
        },
        {
          name  = "WFNEWS_DB_URL",
          value = "jdbc:postgresql://${aws_db_instance.wfnews_pgsqlDB.endpoint}/${aws_db_instance.wfnews_pgsqlDB.name}"
        },
        {
          name  = "WFNEWS_USERNAME",
          value = var.WFNEWS_USERNAME
        },
        {
          name  = "WFNEWS_MAX_CONNECTIONS",
          value = var.WFNEWS_MAX_CONNECTIONS
        },
        {
          name  = "DB_PASS",
          value = "${var.db_pass}"
        },
        # Access keys and secret keys are not needed when using container-based authentication
        # {
        #   name = "WFNEWS_SNS_ACCESS_KEY",
        #   value = "${var.aws_access_key_id}"
        # },
        # {
        #   name = "WFNEWS_SNS_SECRET",
        #   value = "${var.aws_secret_access_key}"
        # },
        # {
        #   name = "WFNEWS_S3_ACCESS_KEY",
        #   value = "${var.aws_access_key_id}"
        # },
        # {
        #   name = "WFNEWS_S3_SECRET",
        #   value = "${var.aws_secret_access_key}"
        # },
        {
          name  = "WFNEWS_ACCESS_KEY_ID",
          value = "${var.aws_access_key_id}"
        },
        {
          name  = "WFNEWS_SECRET_ACCESS_KEY",
          value = "${var.aws_secret_access_key}"
        },
        {
          name  = "WFNEWS_SNS_TOPIC_ARN",
          value = "${aws_sns_topic.wfnews_sns_topic.arn}"
        },
        {
          name  = "WFNEWS_S3_BUCKET_NAME",
          value = "${aws_s3_bucket.wfnews_upload_bucket.bucket}"
        },
        {
          name  = "API_KEY",
          value = "${var.api_key}"
        }

      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-create-group  = "true"
          awslogs-group         = "/ecs/${var.server_name}"
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "ecs"
        }
      }
      mountPoints = [
        # {
        #   sourceVolume = "logging"
        #   containerPath = "/usr/local/tomcat/logs"
        #   readOnly = false
        # },
        # {
        #   sourceVolume = "work"
        #   containerPath = "/usr/local/tomcat/work"
        #   readOnly = false
        # }
      ]
      volumesFrom = []
    }
  ])
}

resource "aws_ecs_task_definition" "wfnews_client" {
  family                   = "wfnews-client-task-${var.target_env}"
  execution_role_arn       = aws_iam_role.wfnews_ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.wfnews_app_container_role.arn
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.client_cpu_units
  memory                   = var.client_memory
  # volume {
  #   name = "work"
  #   emptyDir = {}
  # }
  # volume {
  #   name = "logging"
  #   emptyDir = {}
  # }
  tags                     = local.common_tags
  container_definitions = jsonencode([
    {
      essential   = true
      # readonlyRootFilesystem = true
      name        = var.client_container_name
      image       = var.client_image
      cpu         = var.client_cpu_units
      memory      = var.client_memory
      networkMode = "awsvpc"
      portMappings = [
        {
          protocol      = "tcp"
          containerPort = var.client_port
          hostPort      = var.client_port
        }
      ]
      environment = [
        {
          name  = "LOGGING_LEVEL"
          value = "${var.logging_level}"
        },
        {
          name  = "AWS_REGION",
          value = var.aws_region
        },
        {
          name  = "bucketName",
          value = aws_s3_bucket.wfnews_upload_bucket.id
        },
        {
          #Base URL will use the 
          name  = "BASE_URL",
          value = var.target_env == "prod" ? "https://${var.gov_client_url}/" : "https://${aws_route53_record.wfnews_client.name}/"
        },
        {
          name  = "WEBADE_OAUTH2_WFNEWS_REST_CLIENT_SECRET",
          value = var.WEBADE_OAUTH2_WFNEWS_UI_CLIENT_SECRET
        },
        {
          name  = "WEBADE-OAUTH2_TOKEN_URL",
          value = var.WEBADE-OAUTH2_TOKEN_URL
        },
        {
          name  = "WEBADE-OAUTH2_CHECK_TOKEN_V2_URL"
          value = var.WEBADE-OAUTH2_CHECK_TOKEN_URL
        },
        {
          name  = "WFIM_API_URL",
          value = var.WFIM_CLIENT_URL
        },
        {
          name  = "WFDM_API_URL",
          value = var.WFDM_REST_URL
        },
        {
          name  = "ORG_UNIT_URL",
          value = ""
        },
        { //Will be phased out from prod eventually, but not yet
          name  = "WFNEWS_API_URL",
          value = var.target_env == "prod" ? "https://${var.gov_api_url}/" : "https://${aws_route53_record.wfnews_apisix.name}/"
        },
        {
          name  = "WFNEWS_API_KEY",
          value = "${var.api_key}"
        },
        {
          name  = "WEBADE_OAUTH2_AUTHORIZE_URL",
          value = var.WEBADE_OAUTH2_AUTHORIZE_URL
        },
        {
          name  = "APPLICATION_ENVIRONMENT",
          value = var.target_env != "prod" ? var.target_env : " "
        },
        {
          name  = "AGOL_URL",
          value = var.agolUrl
        },
        {
          name  = "DRIVEBC_BASE_URL",
          value = var.drivebcBaseUrl
        },
        {
          name  = "OPENMAPS_BASE_URL",
          value = var.openmapsBaseUrl
        },
        {
          name  = "SITEMINDER_URL_PREFIX",
          value = var.siteMinderURLPrefix
        },
        {
          name  = "AGOL_AREA_RESTRICTIONS",
          value = var.agolAreaRestrictions
        },
        {
          name  = "AGOL_BANS_AND_PROHIBITIONS",
          value = var.agolBansAndProhibitions
        }

      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-create-group  = "true"
          awslogs-group         = "/ecs/${var.client_name}"
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "ecs"
        }
      }
      mountPoints = [
        # {
        #   sourceVolume = "logging"
        #   containerPath = "/usr/local/tomcat/logs"
        #   readOnly = false
        # },
        # {
        #   sourceVolume = "work"
        #   containerPath = "/usr/local/tomcat/work"
        #   readOnly = false
        # }
        ]
      volumesFrom = []
    }
  ])
}

resource "aws_ecs_task_definition" "wfnews_liquibase" {
  family                   = "wfnews-liquibase-task-${var.target_env}"
  execution_role_arn       = aws_iam_role.wfnews_ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.wfnews_app_container_role.arn
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.server_cpu_units
  #   volume {
  #   name = "cache"
  #   emptyDir = {}
  # }
  # volume {
  #   name = "run"
  #   emptyDir = {}
  # }
  # volume {
  #   name = "logging"
  #   emptyDir = {}
  # }
  # volume {
  #   name = "nginx"
  # }
  # volume {
  #   name = "nginx-lib"
  # }
  # volume {
  #   name = "local"
  # }
  memory                   = var.server_memory
  tags                     = local.common_tags
  container_definitions = jsonencode([
    {
      essential   = true
      # readonlyRootFilesystem = true
      name        = var.liquibase_container_name
      image       = var.liquibase_image
      cpu         = var.server_cpu_units
      memory      = var.server_memory
      networkMode = "awsvpc"
      portMappings = [
        {
          protocol      = "tcp"
          containerPort = var.db_port
          hostPort      = var.db_port
        }
      ]
      environment = [
        {
          name = "CHANGELOG_FOLDER",
          value = "wfnews-db"
        },   
        {
          name  = "DB_URL",
          value = "jdbc:postgresql://${aws_db_instance.wfnews_pgsqlDB.endpoint}/${aws_db_instance.wfnews_pgsqlDB.name}"
        },
        {
          name  = "DB_USER",
          value = "${aws_db_instance.wfnews_pgsqlDB.username}"
        },
        {
          name  = "DB_PASS"
          value = "${var.db_pass}"
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-create-group  = "true"
          awslogs-group         = "/ecs/${var.liquibase_container_name}"
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "ecs"
        }
      }
      mountPoints = [
        # {
        #   sourceVolume = "logging"
        #   containerPath = "/var/log"
        #   readOnly = false
        # },
        # {
        #   sourceVolume = "cache"
        #   containerPath = "/var/cache/nginx"
        #   readOnly = false
        # },
        # {
        #   sourceVolume = "run"
        #   containerPath = "/var/run"
        #   readOnly = false
        # },
        # {
        #   sourceVolume = "nginx"
        #   containerPath = "/etc/nginx"
        #   readOnly = false
        # },
        # {
        #   sourceVolume = "nginx-lib"
        #   containerPath = "/var/lib/nginx"
        #   readOnly = false
        # },
        # {
        #   sourceVolume = "local"
        #   containerPath = "/liquibase"
        #   readOnly = false
        # }
      ]
      volumesFrom = []
    }
  ])
}

resource "aws_ecs_task_definition" "wfnews_apisix" {
  family                   = "wfnews-apisix-task-${var.target_env}"
  execution_role_arn       = aws_iam_role.wfnews_ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.wfnews_app_container_role.arn
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.server_cpu_units
  memory                   = var.server_memory
  tags                     = local.common_tags
  # volume {
  #   name = "cache"
  #   emptyDir = {}
  # }
  # volume {
  #   name = "run"
  #   emptyDir = {}
  # }
  # volume {
  #   name = "logging"
  #   emptyDir = {}
  # }
  # volume {
  #   name = "nginx"
  # }
  # volume {
  #   name = "nginx-lib"
  # }
  # volume {
  #   name = "local"
  # }
  # volume {
  #   name = "tmp"
  #   emptyDir = {}
  # }
  container_definitions = jsonencode([
    {
      essential   = true
      # readonlyRootFilesystem = true
      name        = var.apisix_container_name
      image       = var.apisix_image
      cpu         = var.server_cpu_units
      memory      = var.server_memory
      networkMode = "awsvpc"
      portMappings = [
        {
          protocol      = "tcp"
          containerPort = var.apisix_ports[0]
          hostPort      = var.apisix_ports[0]
        },
        {
          protocol      = "tcp"
          containerPort = var.apisix_ports[1]
          hostPort      = var.apisix_ports[1]
        }
        # {
        #   protocol = "tcp"
        #   containerPort = var.apisix_admin_port
        #   hostPort = var.apisix_admin_port
        # },
        # {
        #   protocol = "tcp"
        #   containerPort = var.health_check_port
        #   hostPort = var.health_check_port
        # }

      ]
      environment = [
        {
          name  = "LOGGING_LEVEL"
          value = "${var.logging_level}"
        },
        {
          name  = "API_KEY",
          value = "${var.api_key}"
        },
        {
          name  = "TARGET_ENV",
          value = "${var.target_env}"
        },
        {
          name  = "LICENSE_PLATE",
          value = "${var.license_plate}"
        },
        {
          name  = "MAX_SIZE",
          value = "${var.max_upload_size}"
        }
        # {
        #   name: "ETCD_ROOT_PASSWORD",
        #   value: "${var.etcd_password}"
        # }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-create-group  = "true"
          awslogs-group         = "/ecs/${var.apisix_names[0]}"
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "ecs"
        }
      }
      mountPoints = [
        # {
        #   sourceVolume = "logging"
        #   containerPath = "/var/log/nginx"
        #   readOnly = false
        # },
        # {
        #   sourceVolume = "cache"
        #   containerPath = "/var/cache/nginx"
        #   readOnly = false
        # },
        # {
        #   sourceVolume = "run"
        #   containerPath = "/var/run"
        #   readOnly = false
        # },
        # {
        #   sourceVolume = "nginx"
        #   containerPath = "/etc/nginx"
        #   readOnly = false
        # },
        # {
        #   sourceVolume = "nginx-lib"
        #   containerPath = "/var/lib/nginx"
        #   readOnly = false
        # },
        # {
        #   sourceVolume = "local"
        #   containerPath = "/usr/local/apisix"
        #   readOnly = false
        # },
        # {
        #   sourceVolume = "tmp"
        #   containerPath = "/tmp"
        #   readOnly = false
        # }
      ]
      volumesFrom = []
    }
  ])
}

resource "aws_ecs_task_definition" "notifications_liquibase" {
  family                   = "notifications-liquibase-task-${var.target_env}"
  execution_role_arn       = aws_iam_role.wfnews_ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.wfnews_app_container_role.arn
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.server_cpu_units
  #   volume {
  #   name = "cache"
  #   emptyDir = {}
  # }
  # volume {
  #   name = "run"
  #   emptyDir = {}
  # }
  # volume {
  #   name = "logging"
  #   emptyDir = {}
  # }
  # volume {
  #   name = "nginx"
  # }
  # volume {
  #   name = "nginx-lib"
  # }
  # volume {
  #   name = "local"
  # }
  memory = var.server_memory
  tags   = local.common_tags
  container_definitions = jsonencode([
    {
      essential = true
      # readonlyRootFilesystem = true
      name        = var.notifications_liquibase_container_name
      image       = var.liquibase_image
      cpu         = var.server_cpu_units
      memory      = var.server_memory
      networkMode = "awsvpc"
      portMappings = [
        {
          protocol      = "tcp"
          containerPort = var.db_port
          hostPort      = var.db_port
        }
      ]
      environment = [
        {
          name = "CHANGELOG_FOLDER",
          value = "wfnews-db"
        },
        {
          name  = "DB_URL",
          value = "jdbc:postgresql://${aws_db_instance.wfnews_pgsqlDB.endpoint}/${aws_db_instance.wfnews_pgsqlDB.name}"
        },
        {
          name  = "DB_USER",
          value = "${aws_db_instance.wfnews_pgsqlDB.username}"
        },
        {
          name  = "DB_PASS"
          value = "${var.db_pass}"
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-create-group  = "true"
          awslogs-group         = "/ecs/${var.notifications_liquibase_container_name}"
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "ecs"
        }
      }
      mountPoints = [
        # {
        #   sourceVolume = "logging"
        #   containerPath = "/var/log"
        #   readOnly = false
        # },
        # {
        #   sourceVolume = "cache"
        #   containerPath = "/var/cache/nginx"
        #   readOnly = false
        # },
        # {
        #   sourceVolume = "run"
        #   containerPath = "/var/run"
        #   readOnly = false
        # },
        # {
        #   sourceVolume = "nginx"
        #   containerPath = "/etc/nginx"
        #   readOnly = false
        # },
        # {
        #   sourceVolume = "nginx-lib"
        #   containerPath = "/var/lib/nginx"
        #   readOnly = false
        # },
        # {
        #   sourceVolume = "local"
        #   containerPath = "/liquibase"
        #   readOnly = false
        # }
      ]
      volumesFrom = []
    }
  ])
}

resource "aws_ecs_task_definition" "wfss_pointid" {
   family                   = "wfss-pointid-api-${var.target_env}"
  execution_role_arn       = aws_iam_role.wfnews_ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.wfnews_app_container_role.arn
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.server_cpu_units
  #   volume {
  #   name = "cache"
  #   emptyDir = {}
  # }
  # volume {
  #   name = "run"
  #   emptyDir = {}
  # }
  # volume {
  #   name = "logging"
  #   emptyDir = {}
  # }
  # volume {
  #   name = "nginx"
  # }
  # volume {
  #   name = "nginx-lib"
  # }
  # volume {
  #   name = "local"
  # }
  memory = var.server_memory
  tags   = local.common_tags
  container_definitions = jsonencode([
    {
      essential = true
      # readonlyRootFilesystem = true
      name        = var.pointid_container_name
      image       = var.pointid_image
      cpu         = var.server_cpu_units
      memory      = var.server_memory
      networkMode = "awsvpc"
      portMappings = [{
            protocol      = "tcp"
            containerPort = var.server_port
            hostPort      = var.server_port
      }]
      environment = [
          {
            name  = "DATABASE_WEATHER_URL",
            value = "${var.DATABASE_WEATHER_URL}"
          },
          {
            name  = "DATABASE_WEATHER_USER",
            value = "${var.DATABASE_WEATHER_USER}"
          },
          {
            name  = "DATABASE_WEATHER_PWD",
            value = "${var.DATABASE_WEATHER_PWD}"
          },
          {
            name  = "BCGW_URL",
            value = "${var.BCGW_URL}"
          },
          {
            name  = "WFGS_URL",
            value = "${var.WFGS_URL}"
          },
          {
            name  = "MAX_ALLOWED_RADIUS",
            value = "${tostring(var.POINTID_MAX_ALLOWED_RADIUS)}"
          },
          {
            name  = "ASYNC_JOB_INTERVAL",
            value = "${tostring(var.POINTID_ASYNC_JOB_INTERVAL)}"
          },
          {
            name  = "ASYNC_JOB_REF_LAT",
            value = "${tostring(var.POINTID_ASYNC_JOB_REF_LAT)}"
          },
          {
            name  = "ASYNC_JOB_REF_LONG",
            value = "${tostring(var.POINTID_ASYNC_JOB_REF_LONG)}"
          },
          {
            name  = "ASYNC_JOB_REF_RADIUS",
            value = "${tostring(var.POINTID_ASYNC_JOB_REF_RADIUS)}"
          },
          {
            name  = "WEATHER_HOST",
            value = "${var.WEATHER_HOST}"
          },
          {
            name  = "WEATHER_USER",
            value = "${var.WEATHER_USER}"
          },
          {
            name  = "WEATHER_PASSWORD",
            value = "${var.WEATHER_PASSWORD}"
          },
          {
            name  = "WFARCGIS_URL",
            value = "${var.WFARCGIS_URL}"
          },
          {
            name  = "WFARCGIS_LAYER_AREA_RESTRICTIONS",
            value = "${var.WFARCGIS_LAYER_AREA_RESTRICTIONS}"
          },
          {
            name  = "WFARCGIS_LAYER_BANS_PROHIBITION_AREAS",
            value = "${var.WFARCGIS_LAYER_BANS_PROHIBITION_AREAS}"
          },
          {
            name  = "WFARCGIS_LAYER_DANGER_RATING",
            value = "${var.WFARCGIS_LAYER_DANGER_RATING}"
          },
          {
            name  = "WFARCGIS_LAYER_ACTIVE_FIRES",
            value = "${var.WFARCGIS_LAYER_ACTIVE_FIRES}"
          },
          {
            name  = "WFARCGIS_LAYER_EVACUATION_ORDERS_ALERTS",
            value = "${var.WFARCGIS_LAYER_EVACUATION_ORDERS_ALERTS}"
          },
          {
            name  = "WFARGIS_LAYER_FIRE_CENTRE_BOUNDARIES",
            value = "${var.WFARGIS_LAYER_FIRE_CENTRE_BOUNDARIES}"
          },
          {
            name  = "WFARCGIS_QUEUESIZE",
            value = "${tostring(var.WFARCGIS_QUEUESIZE)}"
          },
          {
            name  = "WEBADE_OAUTH2_CLIENT_ID",
            value = "${var.WEBADE_OAUTH2_CLIENT_ID}"
          },
          {
            name  = "WEBADE_OAUTH2_TOKEN_URL",
            value = "${var.WEBADE_OAUTH2_TOKEN_URL}"
          },
          {
            name  = "WEBADE_OAUTH2_CLIENT_SCOPES",
            value = "${var.WEBADE_OAUTH2_CLIENT_SCOPES}"
          },
          {
            name  = "FIREWEATHER_BASEURL",
            value = "${var.FIREWEATHER_BASEURL}"
          },
          {
            name  = "FIREWEATHER_QUEUESIZE",
            value = "${tostring(var.FIREWEATHER_QUEUESIZE)}"
          },
          {
            name  = "WFNEWS_BASEURL",
            value = "wfss-pointid-api.${var.target_env}.bcwildfireservices.com"
          },
          {
            name  = "WFNEWS_QUEUESIZE",
            value = "${tostring(var.WFNEWS_QUEUESIZE)}"
          },
          {
            name  = "WEBADE_OAUTH2_CLIENT_SECRET",
            value = "${var.WEBADE_OAUTH2_CLIENT_SECRET}"
          }
        ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-create-group  = "true"
          awslogs-group         = "/ecs/${var.pointid_container_name}"
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "ecs"
        }
      }
      mountPoints = [
        # {
        #   sourceVolume = "logging"
        #   containerPath = "/var/log"
        #   readOnly = false
        # },
        # {
        #   sourceVolume = "cache"
        #   containerPath = "/var/cache/nginx"
        #   readOnly = false
        # },
        # {
        #   sourceVolume = "run"
        #   containerPath = "/var/run"
        #   readOnly = false
        # },
        # {
        #   sourceVolume = "nginx"
        #   containerPath = "/etc/nginx"
        #   readOnly = false
        # },
        # {
        #   sourceVolume = "nginx-lib"
        #   containerPath = "/var/lib/nginx"
        #   readOnly = false
        # },
        # {
        #   sourceVolume = "local"
        #   containerPath = "/liquibase"
        #   readOnly = false
        # }
      ]
      volumesFrom = []
    }
  ])
}

resource "aws_ecs_task_definition" "wfone_notifications_api" {
   family                   = "wfone_notifications_api-task-${var.target_env}"
  execution_role_arn       = aws_iam_role.wfnews_ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.wfnews_app_container_role.arn
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.wfone_notifications_api_cpu_units
  #   volume {
  #   name = "cache"
  #   emptyDir = {}
  # }
  # volume {
  #   name = "run"
  #   emptyDir = {}
  # }
  # volume {
  #   name = "logging"
  #   emptyDir = {}
  # }
  # volume {
  #   name = "nginx"
  # }
  # volume {
  #   name = "nginx-lib"
  # }
  # volume {
  #   name = "local"
  # }
  memory = var.wfone_notifications_api_memory
  tags   = local.common_tags
  container_definitions = jsonencode([
    {
      essential = true
      # readonlyRootFilesystem = true
      name        = var.wfone_notifications_api_container_name
      image       = var.wfone_notifications_api_image
      cpu         = var.wfone_notifications_api_cpu_units
      memory      = var.wfone_notifications_api_memory
      networkMode = "awsvpc"
      portMappings = [{
            protocol      = "tcp"
            containerPort = var.wfone_notifications_api_port
            hostPort      = var.wfone_notifications_api_port
      }]
      environment = [
          # {
          #   name  = "DATASOURCE_MAX_CONNECTIONS",
          #   value = var.WFONE_NOTIFICATIONS_API_DATASOURCE_MAX_CONNECTIONS
          # },
          # {
          #   name  = "DATASOURCE_PASSWORD",
          #   value = var.WFONE_NOTIFICATIONS_API_DATASOURCE_PASSWORD
          # },
          # {
          #   name  = "DATASOURCE_URL",
          #   value = var.WFONE_NOTIFICATIONS_API_DATASOURCE_URL
          # },
          # {
          #   name  = "DATASOURCE_USER",
          #   value = var.WFONE_NOTIFICATIONS_API_DATASOURCE_USER
          # },
          # {
          #   name  = "DEFAULT_APPLICATION_ENVIRONMENT",
          #   value = var.DEFAULT_APPLICATION_ENVIRONMENT
          # },
          # {
          #   name  = "EMAIL_ADMIN_EMAIL",
          #   value = var.WFONE_NOTIFICATIONS_API_EMAIL_ADMIN_EMAIL
          # },
          # {
          #   name  = "EMAIL_FROM_EMAIL",
          #   value = var.WFONE_NOTIFICATIONS_API_EMAIL_FROM_EMAIL
          # },
          # {
          #   name  = "EMAIL_NOTIFICATIONS_ENABLED",
          #   value = var.WFONE_NOTIFICATIONS_API_EMAIL_NOTIFICATIONS_ENABLED
          # },
          # {
          #   name  = "EMAIL_SYNC_SEND_ERROR_FREQ",
          #   value = var.WFONE_NOTIFICATIONS_API_EMAIL_SYNC_SEND_ERROR_FREQ
          # },
          # {
          #   name  = "EMAIL_SYNC_SEND_ERROR_SUBJECT",
          #   value = var.WFONE_NOTIFICATIONS_API_EMAIL_SYNC_SEND_ERROR_SUBJECT
          # },
          # {
          #   name  = "EMAIL_SYNC_SEND_FREQ",
          #   value = var.WFONE_NOTIFICATIONS_API_EMAIL_SYNC_SEND_FREQ
          # },
          # {
          #   name  = "EMAIL_SYNC_SUBJECT",
          #   value = var.WFONE_NOTIFICATIONS_API_EMAIL_SYNC_SUBJECT
          # },
          # {
          #   name  = "PUSH_ITEM_EXPIRE_HOURS",
          #   value = var.WFONE_NOTIFICATIONS_API_PUSH_ITEM_EXPIRE_HOURS
          # },
          # {
          #   name  = "QUARTZ_CONSUMER_INTERVAL_SECONDS",
          #   value = var.WFONE_NOTIFICATIONS_API_QUARTZ_CONSUMER_INTERVAL_SECONDS
          # },
          # {
          #   name  = "SMTP_CREDENTIALS_PASSWORD",
          #   value = var.WFONE_NOTIFICATIONS_API_SMTP_CREDENTIALS_PASSWORD
          # },
          # {
          #   name  = "SMTP_CREDENTIALS_USER",
          #   value = var.WFONE_NOTIFICATIONS_API_SMTP_CREDENTIALS_USER
          # },
          # {
          #   name  = "SMTP_HOST_NAME",
          #   value = var.WFONE_NOTIFICATIONS_API_SMTP_HOST_NAME
          # },
          # {
          #   name  = "WEBADE_OAUTH2_CHECK_TOKEN_URL"
          #   value = var.WEBADE-OAUTH2_CHECK_TOKEN_URL
          # },
          # {
          #   name  = "WEBADE_OAUTH2_CLIENT_ID",
          #   value = var.WFONE_NOTIFICATIONS_API_WEBADE_OAUTH2_CLIENT_ID
          # },
          # {
          #   name  = "WEBADE_OAUTH2_REST_CLIENT_SECRET",
          #   value = var.WFONE_NOTIFICATIONS_API_WEBADE_OAUTH2_REST_CLIENT_SECRET
          # },
          # {
          #   name  = "WEBADE_OAUTH2_TOKEN_CLIENT_URL",
          #   value = var.WEBADE-OAUTH2_TOKEN_CLIENT_URL
          # },
          # {
          #   name  = "WEBADE_OAUTH2_TOKEN_URL",
          #   value = var.WEBADE-OAUTH2_TOKEN_URL
          # },
          # {
          #   name  = "WEBADE_OAUTH2_WFIM_CLIENT_ID",
          #   value = var.WFONE_NOTIFICATIONS_API_WEBADE_OAUTH2_WFIM_CLIENT_ID
          # },
          # {
          #   name  = "WFDM_REST_URL",
          #   value = var.WFDM_REST_URL
          # },
          # {
          #   name  = "WFIM_CLIENT_URL",
          #   value = var.WFIM_CLIENT_URL
          # },
          # {
          #   name  = "WFIM_CODE_TABLES_URL",
          #   value = var.WFIM_CODE_TABLES_URL
          # }
        ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-create-group  = "true"
          awslogs-group         = "/ecs/${var.wfone_notifications_api_container_name}"
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "ecs"
        }
      }
      mountPoints = [
        # {
        #   sourceVolume = "logging"
        #   containerPath = "/var/log"
        #   readOnly = false
        # },
        # {
        #   sourceVolume = "cache"
        #   containerPath = "/var/cache/nginx"
        #   readOnly = false
        # },
        # {
        #   sourceVolume = "run"
        #   containerPath = "/var/run"
        #   readOnly = false
        # },
        # {
        #   sourceVolume = "nginx"
        #   containerPath = "/etc/nginx"
        #   readOnly = false
        # },
        # {
        #   sourceVolume = "nginx-lib"
        #   containerPath = "/var/lib/nginx"
        #   readOnly = false
        # },
        # {
        #   sourceVolume = "local"
        #   containerPath = "/liquibase"
        #   readOnly = false
        # }
      ]
      volumesFrom = []
    }
  ])
}

/*
resource "aws_ecs_task_definition" "wfnews_etcd" {
  count                    = 1
  family                   = "wfnews-etcd-task-${var.target_env}"
  execution_role_arn       = aws_iam_role.wfnews_ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.wfnews_app_container_role.arn
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.server_cpu_units
  memory                   = var.server_memory
  tags                     = local.common_tags
  container_definitions = jsonencode([
    {
      essential   = true
      name        = var.etcd_container_name
      image       = var.etcd_image
      cpu                      = var.server_cpu_units
      memory                   = var.server_memory
      networkMode = "awsvpc"
      portMappings = [
        {
          protocol = "tcp"
          containerPort = var.etcd_port
          hostPort = var.etcd_port
        }
      ]
      environment = [
        {
          name: "API_KEY",
          value: "${var.api_key}"
        },
        {
          name: "ETCD_ENABLE_V2",
          value: "true"
        },
        {
          name: "ETCD_ADVERTISE_CLIENT_URLS",
          value: "http://0.0.0.0:2379, http://wfnews-etcd.${var.license_plate}-${var.target_env}.nimbus.cloud.gov.bc.ca:80"
        },
        {
          name: "ETCD_LISTEN_CLIENT_URLS",
          value: "http://0.0.0.0:2379"
        },
        {
          name: "ETCD_ROOT_PASSWORD",
          value: "${var.etcd_password}"
        },
        {
          name: "ALLOW_NONE_AUTHENTICATION",
          value: "true"
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-create-group  = "true"
          awslogs-group         = "/ecs/${var.etcd_names[0]}"
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "ecs"
        }
      }
      mountPoints = [
        {
          sourceVolume: "efs-storage"
          containerPath: "/bitnami/etcd/data"
        }
      ]
      volumesFrom = []
      ulimits = [
        {
          "name": "nofile"
          "softLimit": 2048
          "hardLimit": 4096
        }
      ]
    } 
  ])
  
  volume {
    name = "efs-storage"
    efs_volume_configuration {
      file_system_id = aws_efs_file_system.wfnews_efs.id
      transit_encryption      = "ENABLED"
      transit_encryption_port = 2999
      authorization_config {
        iam             = "ENABLED"
      }
    }
  }
  
}

resource "aws_ecs_task_definition" "wfnews_apisix_gui" {
  family                   = "wfnews-apisix-gui-task-${var.target_env}"
  execution_role_arn       = aws_iam_role.wfnews_ecs_task_execution_role.arn
  task_role_arn            = aws_iam_role.wfnews_app_container_role.arn
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.server_cpu_units
  memory                   = var.server_memory
  tags                     = local.common_tags
  container_definitions = jsonencode([
    {
      essential   = true
      name        = var.apisix_gui_container_name
      image       = var.apisix_image
      cpu                      = var.server_cpu_units
      memory                   = var.server_memory
      networkMode = "awsvpc"
      portMappings = [
        {
          protocol = "tcp"
          containerPort = var.apisix_gui_port
          hostPort = var.apisix_gui_port
        }
      ]
      environment = [
        {
          name: "ETCD_URL",
          value: "http://wfnews-etcd.${var.license_plate}-${var.target_env}.nimbus.cloud.gov.bc.ca"
        },
        {
          name: "API_KEY",
          value: "${var.api_key}"
        }
      ]
      logConfiguration = {
        logDriver = "awslogs"
        options = {
          awslogs-create-group  = "true"
          awslogs-group         = "/ecs/${var.apisix_gui_names[0]}"
          awslogs-region        = var.aws_region
          awslogs-stream-prefix = "ecs"
        }
      }
      mountPoints = []
      volumesFrom = []
    }
  ])
}
*/

resource "aws_ecs_service" "wfnews_liquibase" {
  count                             = 1
  name                              = "wfnews-liquibase-service-${var.target_env}"
  cluster                           = aws_ecs_cluster.wfnews_main.id
  task_definition                   = aws_ecs_task_definition.wfnews_liquibase.arn
  desired_count                     = 1
  enable_ecs_managed_tags           = true
  propagate_tags                    = "TASK_DEFINITION"
  health_check_grace_period_seconds = 60
  wait_for_steady_state             = false


  capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight            = 100
    base              = 1
  }

  network_configuration {
    security_groups  = [aws_security_group.wfnews_ecs_tasks.id, data.aws_security_group.app.id]
    subnets          = module.network.aws_subnet_ids.app.ids
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_alb_target_group.wfnews_liquibase.id
    container_name   = var.liquibase_container_name
    container_port   = var.db_port
  }

  depends_on = [aws_iam_role_policy_attachment.wfnews_ecs_task_execution_role]

  tags = local.common_tags
}


resource "aws_ecs_service" "wfnews_main" {
  name                              = "wfnews-server-service-${var.target_env}"
  cluster                           = aws_ecs_cluster.wfnews_main.id
  task_definition                   = aws_ecs_task_definition.wfnews_server.arn
  desired_count                     = var.app_count
  enable_ecs_managed_tags           = true
  propagate_tags                    = "TASK_DEFINITION"
  health_check_grace_period_seconds = 60
  wait_for_steady_state             = false


  capacity_provider_strategy {
    capacity_provider = "FARGATE_SPOT"
    weight            = 80
  }
  capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight            = 20
    base              = 1
  }


  network_configuration {
    security_groups  = [aws_security_group.wfnews_ecs_tasks.id, data.aws_security_group.app.id]
    subnets          = module.network.aws_subnet_ids.app.ids
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_alb_target_group.wfnews_server.id
    container_name   = var.server_container_name
    container_port   = var.server_port
  }

  depends_on = [aws_iam_role_policy_attachment.wfnews_ecs_task_execution_role]

  tags = local.common_tags
}

resource "aws_ecs_service" "client" {
  name                              = "wfnews-client-service-${var.target_env}"
  cluster                           = aws_ecs_cluster.wfnews_main.id
  task_definition                   = aws_ecs_task_definition.wfnews_client.arn
  desired_count                     = var.app_count
  enable_ecs_managed_tags           = true
  propagate_tags                    = "TASK_DEFINITION"
  health_check_grace_period_seconds = 60
  wait_for_steady_state             = false


  capacity_provider_strategy {
    capacity_provider = "FARGATE_SPOT"
    weight            = 80
  }
  capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight            = 20
    base              = 1
  }


  network_configuration {
    security_groups  = [aws_security_group.wfnews_ecs_tasks.id, data.aws_security_group.app.id]
    subnets          = module.network.aws_subnet_ids.app.ids
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_alb_target_group.wfnews_client.id
    container_name   = var.client_container_name
    container_port   = var.client_port
  }

  depends_on = [aws_iam_role_policy_attachment.wfnews_ecs_task_execution_role]

  tags = local.common_tags
}

resource "aws_ecs_service" "apisix" {
  name                              = "wfnews-apisix-service-${var.target_env}"
  cluster                           = aws_ecs_cluster.wfnews_main.id
  task_definition                   = aws_ecs_task_definition.wfnews_apisix.arn
  desired_count                     = var.app_count
  enable_ecs_managed_tags           = true
  propagate_tags                    = "TASK_DEFINITION"
  health_check_grace_period_seconds = 60
  wait_for_steady_state             = false


  capacity_provider_strategy {
    capacity_provider = "FARGATE_SPOT"
    weight            = 80
  }
  capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight            = 20
    base              = 1
  }


  network_configuration {
    security_groups  = [aws_security_group.wfnews_ecs_tasks.id, data.aws_security_group.app.id]
    subnets          = module.network.aws_subnet_ids.web.ids
    assign_public_ip = true
  }

  #Hit http endpoint
  load_balancer {
    target_group_arn = aws_alb_target_group.wfnews_apisix.id
    container_name   = var.apisix_container_name
    container_port   = var.apisix_ports[0]
  }

  depends_on = [aws_iam_role_policy_attachment.wfnews_ecs_task_execution_role]

  tags = local.common_tags
}

resource "aws_ecs_service" "notifications_liquibase" {
  count                             = 1
  name                              = "notifications-liquibase-service-${var.target_env}"
  cluster                           = aws_ecs_cluster.wfnews_main.id
  task_definition                   = aws_ecs_task_definition.notifications_liquibase.arn
  desired_count                     = 1
  enable_ecs_managed_tags           = true
  propagate_tags                    = "TASK_DEFINITION"
  health_check_grace_period_seconds = 60
  wait_for_steady_state             = false


  capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight            = 100
    base              = 1
  }

  network_configuration {
    security_groups  = [aws_security_group.wfnews_ecs_tasks.id, data.aws_security_group.app.id]
    subnets          = module.network.aws_subnet_ids.app.ids
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_alb_target_group.wfnews_liquibase.id
    container_name   = var.liquibase_container_name
    container_port   = var.db_port
  }

  depends_on = [aws_iam_role_policy_attachment.wfnews_ecs_task_execution_role]

  tags = local.common_tags
}

/*
resource "aws_ecs_service" "etcd" {
  count                             = 0
  name                              = "wfnews-etcd-service-${var.target_env}"
  cluster                           = aws_ecs_cluster.wfnews_main.id
  task_definition                   = aws_ecs_task_definition.wfnews_tasks[wfnews_etcd[count.index]].arn
  desired_count                     = 0
  enable_ecs_managed_tags           = true
  propagate_tags                    = "TASK_DEFINITION"
  health_check_grace_period_seconds = 60
  wait_for_steady_state             = false


  capacity_provider_strategy {
    capacity_provider = "FARGATE_SPOT"
    weight            = 80
  }
  capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight = 20
    base = 1
  }


  network_configuration {
    security_groups  = [aws_security_group.wfnews_ecs_tasks.id, data.aws_security_group.app.id, data.aws_security_group.data.id, aws_security_group.wfnews_efs_access.id]
    subnets          = module.network.aws_subnet_ids.app.ids
    assign_public_ip = true
  }



  service_registries {
    registry_arn = aws_service_discovery_service.wfnews_service_discovery_service.arn
    container_port = var.etcd_port
    container_name = var.etcd_container_name
  }
  

  #Hit http endpoint
  
  load_balancer {
    target_group_arn = aws_alb_target_group.wfnews_etcd.id
    container_name   = var.etcd_container_name
    container_port   = var.etcd_port

  }
  

  depends_on = [aws_iam_role_policy_attachment.wfnews_ecs_task_execution_role]

  tags = local.common_tags
}

resource "aws_ecs_service" "apisix_gui" {
  count                             = 0 #TODO: RE-ENABLE WHEN ETCD WORKING
  name                              = "wfnews-apisix-gui-service-${var.target_env}"
  cluster                           = aws_ecs_cluster.wfnews_main.id
  task_definition                   = aws_ecs_task_definition.wfnews_tasks[wfnews_apisix_gui[count.index]].arn
  desired_count                     = 0
  enable_ecs_managed_tags           = true
  propagate_tags                    = "TASK_DEFINITION"
  health_check_grace_period_seconds = 60
  wait_for_steady_state             = false


  capacity_provider_strategy {
    capacity_provider = "FARGATE_SPOT"
    weight            = 80
  }
  capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight = 20
    base = 1
  }


  network_configuration {
    security_groups  = [aws_security_group.wfnews_ecs_tasks.id, data.aws_security_group.app.id]
    subnets          = module.network.aws_subnet_ids.app.ids
    assign_public_ip = true
  }

  #Hit http endpoint
  load_balancer {
    target_group_arn = aws_alb_target_group.wfnews_apisix_gui.id
    container_name   = var.apisix_gui_container_name
    container_port   = var.apisix_gui_port
  }


  depends_on = [aws_iam_role_policy_attachment.wfnews_ecs_task_execution_role]

  tags = local.common_tags
}
*/

resource "aws_ecs_service" "pointid" {
  name                              = "wfss-pointid-service-${var.target_env}"
  cluster                           = aws_ecs_cluster.wfnews_main.id
  task_definition                   = aws_ecs_task_definition.wfss_pointid.arn
  desired_count                     = var.app_count
  enable_ecs_managed_tags           = true
  propagate_tags                    = "TASK_DEFINITION"
  health_check_grace_period_seconds = 60
  wait_for_steady_state             = false


  capacity_provider_strategy {
    capacity_provider = "FARGATE_SPOT"
    weight            = 80
  }
  capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight            = 20
    base              = 1
  }


  network_configuration {
    security_groups  = [aws_security_group.wfnews_ecs_tasks.id, data.aws_security_group.app.id]
    subnets          = module.network.aws_subnet_ids.web.ids
    assign_public_ip = true
  }

  #Hit http endpoint
  load_balancer {
    target_group_arn = aws_alb_target_group.wfss_pointid.id
    container_name   = var.pointid_container_name
    container_port   = var.pointid_port
  }

  depends_on = [aws_iam_role_policy_attachment.wfnews_ecs_task_execution_role]

  tags = local.common_tags
}

resource "aws_ecs_service" "wfone_notifications_api" {
  name                              = "wfone-notifications-api-${var.target_env}"
  cluster                           = aws_ecs_cluster.wfnews_main.id
  task_definition                   = aws_ecs_task_definition.wfone_notifications_api.arn
  desired_count                     = var.app_count
  enable_ecs_managed_tags           = true
  propagate_tags                    = "TASK_DEFINITION"
  health_check_grace_period_seconds = 60
  wait_for_steady_state             = false


  capacity_provider_strategy {
    capacity_provider = "FARGATE_SPOT"
    weight            = 80
  }
  capacity_provider_strategy {
    capacity_provider = "FARGATE"
    weight            = 20
    base              = 1
  }


  network_configuration {
    security_groups  = [aws_security_group.wfnews_ecs_tasks.id, data.aws_security_group.app.id]
    subnets          = module.network.aws_subnet_ids.web.ids
    assign_public_ip = true
  }

  #Hit http endpoint
  load_balancer {
    target_group_arn = aws_alb_target_group.wfss_pointid.id
    container_name   = var.wfone_notifications_api_container_name
    container_port   = var.wfone_notifications_api_port
  }

  depends_on = [aws_iam_role_policy_attachment.wfnews_ecs_task_execution_role]

  tags = local.common_tags
}
