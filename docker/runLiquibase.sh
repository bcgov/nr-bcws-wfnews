#!/bin/bash
liquibase update --changelogFile=$CHANGELOG_FOLDER/main-changelog.json --url=$DB_URL --username=$DB_USER --password=$DB_PASS