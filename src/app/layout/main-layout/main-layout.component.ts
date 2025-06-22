// main-layout.component.ts
import { Component, OnInit, OnDestroy, Inject } from '@angular/core';
import { RouterOutlet, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  standalone: true,
  imports: [RouterOutlet, CommonModule, RouterLink],
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css'],
})
export default class MainLayoutComponent implements OnInit, OnDestroy {
  sidebarOpen = window.innerWidth > 768;
  isAdmin = false;
  username = '';
  private sub!: Subscription;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // suscríbete a actualUser$ para poblar isAdmin y username
    /*   this.sub = this.authService.actualUser$.subscribe((user) => {
      this.isAdmin = !!user?.es_admin;
      this.username = user?.username ?? '';
    }); */

    window.addEventListener('resize', this.onResize);
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
    window.removeEventListener('resize', this.onResize);
  }

  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  private onResize = () => {
    this.sidebarOpen = window.innerWidth > 768;
  };

  logout(): void {
    this.authService.logout();
  }
}
