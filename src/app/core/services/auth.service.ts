import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BASE_URL } from '../../constants/urls';
import { tap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';

interface AuthResponse {
  access: string;
  refresh: string;
  user_id: number;
  rol: string;
  email: string;
  username: string;
}

@Injectable({
  providedIn: 'root'
})

export class AuthService {
  USUARIOS_URL = `${BASE_URL}/usuarios`;
  private loggedIn = new BehaviorSubject<boolean>(false);

  constructor(private http: HttpClient) { }

  register(username: string, email: string, password: string, password2: string) { // TODO Ver el tema de los roles alv 🥶
    return this.http.post<AuthResponse>(`${this.USUARIOS_URL}/register/`, { username, email, password, password2, rol: 1 }).pipe(
      tap((res) => {
        localStorage.setItem('token', res.access);
      })
    );;
  }

  login(username: string, password: string) {
    return this.http.post<AuthResponse>(`${this.USUARIOS_URL}/login/`, { username, password }).pipe(
      tap((res) => {
        localStorage.setItem('token', res.access);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
  }

  get token() {
    return localStorage.getItem('token');
  }

  get isAuthenticated() {
    if (!this.token) {
      return false;
    }
    const token = this.token as string;
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expirationDate = new Date(payload.exp * 1000);

    const isExpired = expirationDate < new Date();
    this.loggedIn.next(!isExpired);
    return !isExpired;
  }

}
