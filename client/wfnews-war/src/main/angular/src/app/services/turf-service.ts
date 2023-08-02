import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TurfService {
  private windowValue: any;

  setTurfData(data: any) {
    this.windowValue = data;
  }

  getTurfData() {
    return this.windowValue;
  }
}