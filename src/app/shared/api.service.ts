import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  get<T>(url: string, opts?: any) { return this.http.get<T>(url, opts); }

  post<T>(url: string, body: any, opts?: any) { return this.http.post<T>(url, body, opts); }
  
}

