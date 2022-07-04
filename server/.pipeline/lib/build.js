'use strict';
const {OpenShiftClientX} = require('pipeline-cli')
const path = require('path');
const fs = require('fs')
module.exports = (settings)=>{
  const phases = settings.phases
  const options = settings.options
  const oc=new OpenShiftClientX(Object.assign({'namespace':phases.build.namespace}, options));
  const phase='build'
  let objects = []
  const templatesLocalBaseUrl =oc.toFileUrl(path.resolve(__dirname, '../../openshift'))

  // The building of your cool app goes here ▼▼▼
  const mvnSettings = oc.get('secret/artifactory-mvn-settings')[0];
  for (let fileName of Object.keys(mvnSettings.data)){
    const filePath = path.resolve(__dirname, `../../docker/base-openjdk18-openshift/contrib/${fileName}`);
    fs.writeFileSync(
      filePath, 
      Buffer.from(mvnSettings.data[fileName], 'base64').toString('utf-8'),
      {encoding:'utf8'}
    );
  }

  const npmrcSecret = oc.get('secret/artifactory-npmrc')[0];
  for (let fileName of Object.keys(npmrcSecret.data)){
    const filePath = path.resolve(__dirname, `../../docker/base-openjdk18-openshift/contrib/${fileName}`);
    fs.writeFileSync(
      filePath, 
      Buffer.from(npmrcSecret.data[fileName], 'base64').toString('utf-8'),
      {encoding:'utf8'}
    );
  }
  objects.push(... oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/base-openjdk18-openshift-build.yaml`, {
    'param':{
      'IMAGE_TAG': '1.7-5',
    }
  }));
    
  objects.push(... oc.processDeploymentTemplate(`${templatesLocalBaseUrl}/build.yaml`, {
    'param':{
      'SUFFIX': phases[phase].suffix,
      'TAG': phases[phase].tag,
      'GIT_URL': oc.git.http_url,
      'GIT_REF': oc.git.branch.merge
    }
  }));
  
  oc.applyRecommendedLabels(objects, phases[phase].name, phase, phases[phase].changeId, phases[phase].instance)
  oc.applyAndBuild(objects)
}