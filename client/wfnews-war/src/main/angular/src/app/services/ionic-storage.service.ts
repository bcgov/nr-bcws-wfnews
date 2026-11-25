import { Injectable } from '@angular/core';

import { Storage } from '@ionic/storage-angular';

@Injectable({
  providedIn: 'root'
})
export class IonicStorageService {
  // A call that comes before create() has finished must wait, not do nothing.
  private readonly ready: Promise<Storage>;

  constructor(storage: Storage) {
    this.ready = storage.create();
  }

  public async set(key: string, value: any) {
    return (await this.ready).set(key, value);
  }

  public async get(key: string) {
    return (await this.ready).get(key);
  }

  public async remove(key: string) {
    return (await this.ready).remove(key);
  }
}
