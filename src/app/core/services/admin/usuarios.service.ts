// usuarios.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BASE_URL } from '../../../constants/urls';
import { Usuarios } from '../../../models/usuarios.model';
@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  USERS_URL = `${BASE_URL}/usuarios`;
  constructor(private http: HttpClient) {}

  getUsuarios() {
    return this.http.get<Usuarios[]>(`${this.USERS_URL}/usuarios/`);
  }

  getUsuarioById(id: number) {
    return this.http.get<Usuarios>(`${this.USERS_URL}/usuarios/${id}/`);
  }

  createUsuario(usuario: Usuarios) {
    return this.http.post<Usuarios>(`${this.USERS_URL}/usuarios/`, usuario);
  }

  updateUsuario(id: number, usuario: Partial<Usuarios>) {
    return this.http.put<Partial<Usuarios>>(
      `${this.USERS_URL}/usuarios/${id}/`,
      usuario
    );
  }
  deleteUsuario(id: number) {
    return this.http.delete(`${this.USERS_URL}/usuarios/${id}/`);
  }

  getUserRoles() {
    return this.http.get(`${this.USERS_URL}/roles/`);
  }
}
