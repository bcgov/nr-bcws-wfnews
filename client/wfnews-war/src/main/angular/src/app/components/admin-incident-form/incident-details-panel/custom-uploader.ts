export class CustomImageUploader {
  private loader;
  private reader;

  constructor(loader) {
    this.loader = loader;
  }

  // Starts the upload process.
  // Note that this current writes a data url to the html directly
  // we could replace this in the future to write to the document store
  // and use URL's to our aws bucket to fetch, to save on size.
  upload() {
    return new Promise((resolve, reject) => {
      const reader = (this.reader = new window.FileReader());

      reader.addEventListener('load', () => {
        resolve({ default: reader.result });
      });

      reader.addEventListener('error', (err) => {
        reject(err);
      });

      reader.addEventListener('abort', () => {
        reject();
      });

      this.loader.file.then((file) => {
        reader.readAsDataURL(file);
      });
    });
  }

  // Aborts the upload process.
  abort() {
    this.reader.abort();
  }
}
