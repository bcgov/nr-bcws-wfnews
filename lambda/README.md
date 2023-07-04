# Welcome to Bitbucket #

To get started you will need to run these commands in your terminal.

New to Git? Please read the [Application Delivery Tutorial](https://apps.nrs.gov.bc.ca/int/stash/projects/APPDEV/repos/git-tutorial/browse).

### Configure Git for the first time ###

```
git config --global user.name "Last, First IIT:EX"
git config --global user.email "First.Last@gov.bc.ca"
```

### Repository URL ###

The url can be found by clicking the clone button in the top-left. Remember to add your account username and alter the url to start with bwa instead of apps. See the [tutorial](https://apps.nrs.gov.bc.ca/int/stash/projects/APPDEV/repos/git-tutorial/browse/bitbucket-addendum.md) for more information.

### Working with your repository ###

#### I just want to clone this repository ####

If you want to simply clone this empty repository then run then run this command in your terminal.

```
git clone <url>
```

Feel free to edit or delete this file.

#### My code is ready to be pushed ####

If you already have code ready to be pushed to this repository then run this in your terminal.

```
cd existing-project
git init
git add --all
git commit -m "Initial Commit"
git remote add origin <url>
git push -u origin master:<branch-to-create-on-origin>
```

Branch permissions will pervent pushing to the master branch or a release branch. Please create a pull request to update these branches. 

#### My code is already tracked by Git ####

If your code is already tracked by Git then set this repository as your "origin" to push to.

```
cd existing-project
git remote set-url origin <url>
git push -u origin <local-branch>:<branch-to-create-on-origin>
```
