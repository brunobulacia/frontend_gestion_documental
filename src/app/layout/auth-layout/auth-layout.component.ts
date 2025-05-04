import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { parseBackendErrors } from '../../utils/error-parser';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-auth',
  templateUrl: './auth-layout.component.html',
  styleUrls: ['./auth-layout.component.css']
})

export default class AuthLayoutComponent implements OnInit {
  activeTab: 'login' | 'register' = 'login';
  loginForm: FormGroup;
  registerForm: FormGroup;
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    // Formulario de login
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(6)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    // Formulario de registro
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(6)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validator: this.checkPasswords });
  }

  ngOnInit(): void {
  }

  checkPasswords(group: FormGroup) {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { notSame: true };
  }

  setActiveTab(tab: 'login' | 'register'): void {
    this.activeTab = tab;
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Login
  onLoginSubmit(): void {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value.username, this.loginForm.value.password).subscribe(
      {
        next: (res) => {
          console.log('Login exitoso', res);
          this.loading = false;
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.log('Error en el login', err);
          this.loading = false;
          this.errorMessage = parseBackendErrors(err.error);
        }
      }
    );
  }

  // Registro
  onRegisterSubmit(): void {
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.authService.register(this.registerForm.value.username, this.registerForm.value.email, this.registerForm.value.password, this.registerForm.value.confirmPassword).subscribe(
      {
        next: (res) => {
          console.log('Registro exitoso', res);
          this.loading = false;
          this.successMessage = 'Registro exitoso. Ya puedes iniciar sesión.';
          this.setActiveTab('login');
        },
        error: (err) => {
          console.log('Error en el registro', err);
          this.loading = false;
          this.errorMessage = parseBackendErrors(err.error);
        }
      }
    );
  }

  
  get loginUsername() { return this.loginForm.get('username'); }
  get loginPassword() { return this.loginForm.get('password'); }
  
  get registerUsername() { return this.registerForm.get('username'); }
  get registerEmail() { return this.registerForm.get('email'); }
  get registerPassword() { return this.registerForm.get('password'); }
  get registerConfirmPassword() { return this.registerForm.get('confirmPassword'); }
}