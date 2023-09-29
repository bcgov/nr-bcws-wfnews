import * as Storage from './node_modules/@ionic/storage/dist/ionic-storage.js';

  addEventListener("submitOfflineRoF", (resolve, reject) => { 
    try {
        console.log("submitting offline ROF")
        scheduleDataSync();
        resolve();
    } catch (err) {
        reject(err);
    }
  });

 async function scheduleDataSync() {
    const storage = new Storage();
    await storage.create();
    const isConnected = await checkOnlineStatus();
      if (isConnected) {
        await syncDataWithServer();
      }
    }

 async function syncDataWithServer() {
  const storage = new Storage();
    try {
      // Fetch and submit locally stored data
      const offlineReport = await storage.get('offlineReportData');

      if (offlineReport) {
        // Send the report to the server
        const response = await submitReportToServer(offlineReport);

        if (response.success) {
          // Remove the locally stored data if sync is successful
          await storage.remove('offlineReportData');
        }
      }
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }

async function submitReportToServer(offlineReport){
    const rofJson = JSON.parse(offlineReport);
    const resource = rofJson.resource;
    const image1 = rofJson.image1;
    const image2 = rofJson.image2;
    const image3 = rofJson.image3;
    const rofUrl = "https://wfone-notifications-api.dev.bcwildfireservices.com/rof"
    try {
        const formData = new FormData()
        if (resource !== null && resource !== undefined) formData.append('resource', resource)

        if (image1 !== null && image1 !== undefined && image1.webPath) formData.append('image1', await convertToBase64(image1))
        if (image2 !== null && image2 !== undefined && image2.webPath) formData.append('image2', await convertToBase64(image2))
        if (image3 !== null && image3 !== undefined && image3.webPath) formData.append('image3', await convertToBase64(image3))
        
        let response = await fetch(rofUrl, {
             method: 'POST',
             body: formData
         });

      if (response.ok) {
        // The server successfully processed the report
        return { success: true, message: 'Report submitted successfully' };
      } else {
        // The server encountered an error
        const responseData = await response.json();
        return { success: false, message: responseData.error };
      }
    } catch (error) {
      // An error occurred during the HTTP request
      return { success: false, message: 'An error occurred while submitting the report' };
    }
}  

async function blobToBase64 (url) {
  return new Promise(async (resolve, _) => {
    // do a request to the blob uri
    const response = await fetch(url);
      
    // response has a method called .blob() to get the blob file
    const blob = await response.blob();
      
    // instantiate a file reader
    const fileReader = new FileReader();
      
    // read the file
    fileReader.readAsDataURL(blob);
      
    fileReader.onloadend = function(){
      resolve(fileReader.result); // Here is the base64 string
    }
  });
};
      

async function convertToBase64 (image){
    // if the webPath is already a base64 string, return it
    if (image.webPath !== null && image.webPath.startsWith("data:image")){
        return image.webPath;
    }
    else {   
        let b64 = ""
        await blobToBase64(image.webPath).then(result => {
          b64 = result;
        })
        return b64;
    }
    
}
