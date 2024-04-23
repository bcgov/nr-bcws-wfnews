#Begin by getting deployment environment
$environment = Read-Host -Prompt "Which environment should be deployed to? (Valid options: DLV, TST, PROD)"
$bucket = "s3://wfone-notifications-monitor-functions"

#Terraform is case sensitive
$environment = $environment.ToUpper()

#Check for valid environment, double-check if selected environment is PROD
switch($environment) {
    "DLV" {echo "Deploying to DLV"; Break}
    "TST" {echo "Deploying to TST"; Break}
    "PROD" {
        $prodDeploy = Read-Host -Prompt "Please confirm deployment to production environment (y/N)"
        Break
        switch ($prodDeploy) {
            "y" {Break}
            Default {
                throw "Response was not 'y'"
            }
        }
        Break;
    }
    Default {throw "Response was not DLV, TST or PROD"}
}

#Get base path and locations of relevant files
$rootFolder = (Get-Location).Path

$activeFireLambdas = $rootFolder+"\active-fire-monitor\active_fire"
$areaRestrictionsLambdas = $rootFolder+"\area-restrictions-monitor\area-restrictions"
$bansProhibitionsLambdas = $rootFolder+"\bans-and-prohibitions-monitor\bans-and-prohibitions"
$evacOrdersLambdas = $rootFolder+"\evacuation-orders-monitor\evacuation-orders"
$cacheInvalidatorLambdas = $rootFolder+"\cache-invalidator\wfnews-cache-invalidator"
$terraform = $rootFolder+"\terraform"


#Configure creation of zip files for lambdas
$activeFiresCompress = @{
    Path= $activeFireLambdas + "\*"
    CompressionLevel = "Fastest"
    DestinationPath = $activeFireLambdas + "\active_fire.zip"
}

$areaRestrictionsCompress = @{
    Path= $areaRestrictionsLambdas + "\*"
    CompressionLevel = "Fastest"
    DestinationPath = $areaRestrictionsLambdas + "\area_restrictions.zip"
}

$bansProhibitionsCompress = @{
    Path= $bansProhibitionsLambdas + "\*"
    CompressionLevel = "Fastest"
    DestinationPath = $bansProhibitionsLambdas + "\bans_and_prohibitions.zip"
}

$evacOrdersCompress = @{
    Path= $evacOrdersLambdas + "\*"
    CompressionLevel = "Fastest"
    DestinationPath = $evacOrdersLambdas + "\evacuation_orders.zip"
}

$cacheInvalidatorCompress = @{
    Path= $cacheInvalidatorLambdas + "\*"
    CompressionLevel = "Fastest"
    DestinationPath = $cacheInvalidatorLambdas + "\cache_invalidator.zip"
}

#Upload active fires
Set-Location -Path $activeFireLambdas
Compress-Archive @activeFiresCompress -Force
$destination0 = $bucket + "/active_fire.zip"
aws s3 cp active_fire.zip $destination0

#Upload area restrictions
Set-Location -Path $areaRestrictionsLambdas
Compress-Archive @areaRestrictionsCompress -Force
$destination1 = $bucket + "/area_restrictions.zip"
aws s3 cp area_restrictions.zip $destination1

#Upload Bans and Prohibitions
Set-Location -Path $bansProhibitionsLambdas
Compress-Archive @bansProhibitionsCompress -Force
$destination2 = $bucket + "/bans_and_prohibitions.zip"
aws s3 cp bans_and_prohibitions.zip $destination2

#Upload evac orders
Set-Location -Path $evacOrdersLambdas
Compress-Archive @evacOrdersCompress -Force
$destination3 = $bucket + "/evacuation_orders.zip"
aws s3 cp evacuation_orders.zip $destination3

#Upload cache invalidator
Set-Location -Path $cacheInvalidatorLambdas
Compress-Archive @cacheInvalidatorCompress -Force
$destination3 = $bucket + "/cache_invalidator.zip"
aws s3 cp cache_invalidator.zip $destination3

#Apply terraform script to configure AWS resources
Set-Location -Path $terraform
terraform workspace select $environment
terraform apply -auto-approve
cd $rootFolder