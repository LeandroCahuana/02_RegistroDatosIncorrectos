import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { UserRequest, UserResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/users`;

  crearUsuario(usuario: UserRequest): Observable<UserResponse> {
    return this.http.post<UserResponse>(`${this.baseUrl}/save`, usuario);
  }

  obtenerUsuarios(): Observable<UserResponse[]> {
    return this.http.get<UserResponse[]>(this.baseUrl);
  }

  obtenerPorId(id: number): Observable<UserResponse> {
    return this.http.get<UserResponse>(`${this.baseUrl}/${id}`);
  }
}
