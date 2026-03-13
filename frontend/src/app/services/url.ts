import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class UrlService {
  private API = 'http://localhost:5000/api/urls';

  constructor(private http: HttpClient) {}

  getMyUrls() {
    return this.http.get(`${this.API}/my-urls`);
  }

  shortenUrl(data: any) {
    return this.http.post(`${this.API}/shorten`, data);
  }

  updateUrl(code: string, data: any) {
    return this.http.patch(`${this.API}/${code}`, data);
  }

  deleteUrl(code: string) {
    return this.http.delete(`${this.API}/${code}`);
  }

  getStats(code: string) {
    return this.http.get(`${this.API}/${code}/stats`);
  }
}