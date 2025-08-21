import { Injectable } from '@angular/core';
import { ApiService } from '../../shared/api.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  private shareDriveUrl: string = 'https://1drv.ms/f/c/c92a8a49db0a351e/Ev3lIDxbGr9EhgNsLFXSvoQBwzWkaC8w3pNV_S-yMBfNag?e=Mb2aY7';

  constructor(private apiService: ApiService) {
    console.log("shareDriveUrl = " + this.shareDriveUrl);
  }
}
