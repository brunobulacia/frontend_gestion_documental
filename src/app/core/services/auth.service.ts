import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BASE_URL } from '../../constants/urls';
import { tap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';


interface crearOrganizacion {
  nombre: string;
  direccion: string;
  telefono: string;
}
interface Plan {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  maximo_usuarios: number;
  maximo_documentos: number;
  maximo_almacenamiento: number; // En MB
  maximo_roles: number;
  ocr: boolean;
  duracion_meses: number; // Duración del plan en meses
}

interface Organizacion {
  id: number;
  nombre: string;
  direccion: string;
  telefono: string;
  plan: Plan;
}

interface Usuario {
  user_id: number;
  roles: string[];
  email: string;
  username: string;
  es_admin: boolean;
  organizacion: Organizacion | null; // Puede ser null si no pertenece a una organización
}

interface AuthResponse {
  access: string;
  refresh: string;
  user_id: number;
  roles: string[];
  email: string;
  username: string;
  es_admin: boolean;
  organizacion: Organizacion | null; // Puede ser null si no pertenece a una organización
}

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  USUARIOS_URL = `${BASE_URL}/usuarios`;
  private loggedIn = new BehaviorSubject<boolean>(false);
  private actualUser = new BehaviorSubject<Usuario | null>(null);

  loggedIn$ = this.loggedIn.asObservable();
  actualUser$ = this.actualUser.asObservable();

  constructor(private http: HttpClient) { }

  register(username: string, email: string, password: string, password2: string) { // TODO Ver el tema de los roles alv 🥶
    return this.http.post<AuthResponse>(`${this.USUARIOS_URL}/register/`, { username, email, password, password2 }).pipe(
      tap((res) => {
        localStorage.setItem('token', res.access);
        this.loggedIn.next(true);
        this.actualUser.next({
          user_id: res.user_id,
          roles: res.roles,
          email: res.email,
          username: res.username,
          es_admin: res.es_admin,
          organizacion: res.organizacion
        });
      })
    );;
  }

  login(username: string, password: string) {
    return this.http.post<AuthResponse>(`${this.USUARIOS_URL}/login/`, { username, password }).pipe(
      tap((res) => {
        localStorage.setItem('token', res.access);
        this.loggedIn.next(true);
        this.actualUser.next({
          user_id: res.user_id,
          roles: res.roles,
          email: res.email,
          username: res.username,
          es_admin: res.es_admin,
          organizacion: res.organizacion
        });
        console.log('Usuario autenticado:', this.actualUser.value);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    window.location.reload();
  }

  suscribeToPlan(organizacion: crearOrganizacion, planId: number) {
    return this.http.post<{
      usuario: Usuario
    }>(`${this.USUARIOS_URL}/suscribir/`,
      {
        organizacion: organizacion,
        plan_id: planId,
      }).pipe(
        tap((res) => {
          this.actualUser.next(res.usuario);
        })
      );
  }
  get token() {
    return localStorage.getItem('token');
  }

  get isAuthenticated() {
    console.log(this.token);
    if (!this.token) {
      console.log('No hay token');
      return false;
    }
    const token = this.token as string;
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationDate = new Date(payload.exp * 1000);

    const isExpired = expirationDate < new Date();
    if (isExpired) {
      this.logout();
    }
    this.loggedIn.next(!isExpired);
    return !isExpired;
  }


}
