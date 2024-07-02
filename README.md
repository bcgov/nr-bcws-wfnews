# BCWS Situation Report (WFNEWS)

[![Lifecycle](https://img.shields.io/badge/Lifecycle-Maturing-007EC6)](https://github.com/bcgov/repomountie/blob/master/doc/lifecycle-badges.md)
![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)
### Sonar Status
[![Bugs](https://sonarcloud.io/api/project_badges/measure?project=bcgov_nr-bcws-wfnews&metric=bugs)](https://sonarcloud.io/summary/new_code?id=bcgov_nr-bcws-wfnews)
[![Maintainability Rating](https://sonarcloud.io/api/project_badges/measure?project=bcgov_nr-bcws-wfnews&metric=sqale_rating)](https://sonarcloud.io/summary/new_code?id=bcgov_nr-bcws-wfnews)
[![Reliability Rating](https://sonarcloud.io/api/project_badges/measure?project=bcgov_nr-bcws-wfnews&metric=reliability_rating)](https://sonarcloud.io/summary/new_code?id=bcgov_nr-bcws-wfnews)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=bcgov_nr-bcws-wfnews&metric=security_rating)](https://sonarcloud.io/summary/new_code?id=bcgov_nr-bcws-wfnews)
[![Vulnerabilities](https://sonarcloud.io/api/project_badges/measure?project=bcgov_nr-bcws-wfnews&metric=vulnerabilities)](https://sonarcloud.io/summary/new_code?id=bcgov_nr-bcws-wfnews)

# Welcome to WFNEWS 2.0
This is the primary code repository for WFNEWS 2.0

The high-level goals of the Wildfire News project are:

* Consolidate the Wildfire Dashboard, Wildfires of Note and Current Wildfire Activity into a single application.
* Replace Wildfire News Application with richer functionality that requires minimal training.
* Use a Content Management System to manage information where it makes sense.
* Provide a map interface option for public users, while addressing issues identified with current sites.
* Streamline access to Wildfire and related incident information
* Consolidate Public Mobile application functionality with Wildfire Situation Report functionality

## Technologies used

* [Angular](https://angular.io/)
* [SMK](https://github.com/bcgov/smk)
* [Spring](https://spring.io/)
* [PostGIS](https://postgis.net/)
* [Terraform](https://www.terraform.io)
* [Terragrunt](https://terragrunt.gruntwork.io)
* [AWS](https://aws.amazon.com/)
* [Docker](https://www.docker.com/)

## Getting Started

### Local Deployment

For local development, we recommend starting individual services with Docker

You can create a database instance via

```
docker run --name wfnews-postgres -e POSTGRES_USER=wfnews -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgis/postgis:13-3.3
docker pull postgis/postgis:13-3.3
```

And build the database model with Liquibase:

```
docker build -t liquibase -f Dockerfile.liquibase.local .
docker run --rm liquibase --url=jdbc:postgresql://<your instance ip>:5432/wfnews --changelog-file=main-changelog.json --username=wfnews --password=password update
```

Similar docker scripts are provided for running the WFNEWS API and UI respectively. Local development configurations are provided for running the Angular application outside of the Java Spring container.

### Storybook

For UI/UX development we have Storybook for developers. You can run storybook using the following command:
```
ng run WFNEWS:storybook
```

Create stories for any new or rewritten compoenents.

Node 18+ is required.

### CI/CD for DEV/TEST/PROD Deployments

The WFNEWS project is built and deployed via Github actions. A Terraform cloud team server handles running the Terraform. A CI pipeline is setup to run static analysis of the Typescript.

### Testing

This project is tested with BrowserStack
