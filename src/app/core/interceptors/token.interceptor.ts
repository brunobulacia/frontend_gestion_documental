import { HttpInterceptorFn } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');
  const authService: AuthService = inject(AuthService);
  authService.isAuthenticated;
  if (!authService.isAuthenticated) {
    
    return next(req);
  }
  const authReq = req.clone({ 
    setHeaders: { 
      Authorization: `Bearer ${token}`
    }
  });

  return next(authReq);
};
