import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BASE_URL } from '../../constants/urls';
import { tap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';

interface AuthResponse {
  access: string;
  refresh: string;
  user_id: number;
  rol: string;
  email: string;
  username: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  USUARIOS_URL = `${BASE_URL}/usuarios`;
  private loggedIn = new BehaviorSubject<boolean>(false);
  private platformId = inject(PLATFORM_ID);

  constructor(private http: HttpClient) {}

  private isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  register(
    username: string,
    email: string,
    password: string,
    password2: string
  ) {
    return this.http
      .post<AuthResponse>(`${this.USUARIOS_URL}/register/`, {
        username,
        email,
        password,
        password2,
        rol: 1,
      })
      .pipe(
        tap((res) => {
          if (this.isBrowser()) {
            localStorage.setItem('token', res.access);
          }
        })
      );
  }

  login(username: string, password: string) {
    return this.http
      .post<AuthResponse>(`${this.USUARIOS_URL}/login/`, { username, password })
      .pipe(
        tap((res) => {
          if (this.isBrowser()) {
            localStorage.setItem('token', res.access);
          }
        })
      );
  }

  logout() {
    if (this.isBrowser()) {
      localStorage.removeItem('token');
      window.location.reload();
    }
  }

  get token() {
    if (this.isBrowser()) {
      return localStorage.getItem('token');
    }
    return null;
  }

  get isAuthenticated() {
    const token = this.token;
    if (!token) {
      return false;
    }
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expirationDate = new Date(payload.exp * 1000);
      const isExpired = expirationDate < new Date();
      if (isExpired) {
        this.logout();
      }
      this.loggedIn.next(!isExpired);
      return !isExpired;
    } catch {
      return false;
    }
  }
}
