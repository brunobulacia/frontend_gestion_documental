import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BASE_URL } from '../../constants/urls';
import { Usuario } from '../../models/documento.model';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  USERS_URL = `${BASE_URL}/usuarios/`;
  constructor(private http: HttpClient) { }

  getUsuarios() {
    return this.http.get<Usuario[]>(`${this.USERS_URL}`);
  }
}
