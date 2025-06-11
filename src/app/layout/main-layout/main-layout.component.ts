import { Component, OnInit } from '@angular/core';
import { RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule],
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css']
})
export default class MainLayoutComponent implements OnInit {
  sidebarOpen = true;
  isAdmin = false;
  constructor(
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.checkScreenSize();
    window.addEventListener('resize', this.checkScreenSize.bind(this));
    this.authService.actualUser$.subscribe(user => {
      if (user) {
        this.isAdmin = user.es_admin;
        console.log('Usuario actual:', user);
      }
    });
    
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  private checkScreenSize(): void {
    this.sidebarOpen = window.innerWidth > 768;
  }

  logout(): void {
    this.authService.logout();
  }
}