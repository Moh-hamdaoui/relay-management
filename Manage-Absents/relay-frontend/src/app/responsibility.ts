import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Responsibility } from './models/responsabiliy.model';
import { HttpClient, HttpHeaders } from '@angular/common/http'; 

@Injectable({
  providedIn: 'root',
})
export class ResponsibilityService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
  }

  getResponsibilities(userId: string): Observable<Responsibility[]> {
    return this.http.get<Responsibility[]>(`${this.apiUrl}/users/${userId}/responsibilities`, { headers: this.getHeaders() });
  }

  getResponsibilityById(userId: string, responsibilityId: string): Observable<Responsibility> {
    return this.http.get<Responsibility>(`${this.apiUrl}/users/${userId}/responsibilities/${responsibilityId}` , { headers: this.getHeaders() });
  }

  createResponsibility(userId: string, description: string): Observable<Responsibility> {
    return this.http.post<Responsibility>(`${this.apiUrl}/users/${userId}/responsibilities`, { description }, { headers: this.getHeaders() });
  }

  updateResponsibility(userId: string, responsibilityId: string, description: string): Observable<Responsibility> {
    return this.http.put<Responsibility>(`${this.apiUrl}/users/${userId}/responsibilities/${responsibilityId}`, { description } , { headers: this.getHeaders() });
  }

  deleteResponsibility(userId: string, responsibilityId: string): Observable<any> {
    return this.http.delete<any>(`${`${this.apiUrl}/users/${userId}/responsibilities/${responsibilityId}`}` , { headers: this.getHeaders() });
  }
}