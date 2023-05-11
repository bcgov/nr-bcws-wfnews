# nr-bcws-wfnews
Primary code repository for WFNEWS 2.0.22

The high-level goals of Wildfire News 2.0.22 are:

* Consolidate the Wildfire Dashboard, Wildfires of Note and Current Wildfire Activity into a single application.
* Replace Wildfire News Application with richer functionality that requires minimal training.
* Use a Content Management System to manage information where it makes sense.
* Provide a map interface option for public users, while addressing issues identified with current sites.
* Try and utilize Public Mobile to a point where Wildfire News and Public Mobile are two channels exposing the same data. 
* Streamline access to Wildfire and related incident information

## Built With

* * [BC Government Object Storage](http://doc.isilon.com/ECS/3.6/API/index.html)
	* [Dell EMC ECS](http://doc.isilon.com/ECS/3.6/API/index.html)
* [Terraform](https://www.terraform.io)
* [Terragrunt](https://terragrunt.gruntwork.io)
* [Geoserver](https://geoserver.org/)

## (TBD) Getting Started

The product in deployed using Github actions. A Terraform cloud team server handles running the Terraform. A CI pipeline is setup to run static analysis of the Typescript.

Notes:

* Terraform is limited in the objects it can manage by the AWS Landing Zone permissions.
* AWS Secrets Manager holds the keycloak secrets in a secret named `<env>/nrdk/config/keycloak`.
* The folder `terragrunt/<env>` holds most of the environment specific configuration.

## Local Setup

If you want to run Terragrunt locally, you will need to setup a number of environment variables. Running the deployment locally is not recommended.

### AWS - Environment Variables

As documented in the [AWS CLI documentation](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-envvars.html) which can be obtained from the [Cloud PathFinder login page](GET LINK) and clicking on "Click for Credentials" of the appropriate project/environment.

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_SESSION_TOKEN`
- `AWS_DEFAULT_REGION`

### Keycloak - Environment Variables

You will need a client service account with realm admin privilege.

- `KEYCLOAK_BASEURL`: The base URL ending with "/auth"
- `KEYCLOAK_REALM_NAME`
- `KEYCLOAK_CLIENT_ID`
- `KEYCLOAK_CLIENT_SECRET`

### Terraform cloud team token

You will need a terraform cloud team token, and have it setup in `~/terraform.d/credentials.tfrc.json`. The token is input using a secret for Github actions.

```
{
  "credentials": {
    "app.terraform.io": {
      "token": "<TERRAFORM TEAM TOKEN>"
    }
  }
}
```

# Principles
- Infrastructure as Code
- Configuration as Code
- GitOps:
  - Describe the entire system declaratively
  - Version the canonical desired system state in Git
  - Automatically apply approved changes to the desired state
  - Ensure correctness and alert on divergence with software agents

[![Lifecycle:Experimental](https://img.shields.io/badge/Lifecycle-Experimental-339999)](<Redirect-URL>) ![License](https://img.shields.io/badge/License-Apache_2.0-blue.svg)
