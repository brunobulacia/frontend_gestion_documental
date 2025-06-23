import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import {
  RouterOutlet,
  RouterLink,
  RouterLinkActive,
  Router,
} from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';

// Lucide Angular Icons
import {
  LucideAngularModule,
  FileTextIcon,
  LayoutDashboardIcon,
  FileIcon,
  WorkflowIcon,
  SettingsIcon,
  CreditCardIcon,
  ClipboardListIcon,
  LogOutIcon,
  MenuIcon,
  BuildingIcon,
  BellIcon,
  UserIcon,
} from 'lucide-angular';

@Component({
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    RouterLink,
    RouterLinkActive,
    LucideAngularModule,
  ],
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css'],
})
export default class MainLayoutComponent implements OnInit, OnDestroy {
  // Estado del sidebar
  sidebarOpen = false;
  isMobile = false;
  nombreUsuario = localStorage.getItem('username');
  // Información del usuario
  isAdmin = false;
  username = (() => {
    const perfil = localStorage.getItem('perfil');
    if (perfil) {
      try {
        return JSON.parse(perfil).username || null;
      } catch {
        return null;
      }
    }
    return null;
  })();

  // Suscripciones
  private subscriptions: Subscription[] = [];

  // Iconos de Lucide
  readonly FileTextIcon = FileTextIcon;
  readonly LayoutDashboardIcon = LayoutDashboardIcon;
  readonly FileIcon = FileIcon;
  readonly WorkflowIcon = WorkflowIcon;
  readonly SettingsIcon = SettingsIcon;
  readonly CreditCardIcon = CreditCardIcon;
  readonly ClipboardListIcon = ClipboardListIcon;
  readonly LogOutIcon = LogOutIcon;
  readonly MenuIcon = MenuIcon;
  readonly BuildingIcon = BuildingIcon;
  readonly BellIcon = BellIcon;
  readonly UserIcon = UserIcon;

  constructor(private authService: AuthService, private router: Router) {
    this.checkScreenSize();
  }

  ngOnInit(): void {
    this.initializeComponent();
    this.loadUserData();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: Event): void {
    this.checkScreenSize();
  }

  /**
   * Inicializa el componente
   */
  private initializeComponent(): void {
    this.checkScreenSize();
    this.sidebarOpen = !this.isMobile;
  }

  /**
   * Carga los datos del usuario
   */
  private loadUserData(): void {
    // Suscribirse a los datos del usuario si el servicio los proporciona
    /*  const userSub = this.authService.getCurrentUser()?.subscribe({
      next: (user) => {
        if (user) {
          this.username = user.name || user.email || 'Usuario';
          this.isAdmin = user.role === 'admin';
        }
      },
      error: (error) => {
        console.error('Error al cargar datos del usuario:', error);
      },
    });

    if (userSub) {
      this.subscriptions.push(userSub);
    } */
  }

  /**
   * Verifica el tamaño de la pantalla
   */
  private checkScreenSize(): void {
    this.isMobile = window.innerWidth <= 768;

    // En móvil, cerrar sidebar por defecto
    if (this.isMobile && this.sidebarOpen) {
      this.sidebarOpen = false;
    }
    // En desktop, abrir sidebar por defecto
    else if (!this.isMobile && !this.sidebarOpen) {
      this.sidebarOpen = true;
    }
  }

  /**
   * Alterna la visibilidad del sidebar
   */
  toggleSidebar(): void {
    this.sidebarOpen = !this.sidebarOpen;
  }

  /**
   * Cierra el sidebar (útil para móvil)
   */
  closeSidebar(): void {
    if (this.isMobile) {
      this.sidebarOpen = false;
    }
  }

  /**
   * Verifica si una ruta está activa
   */
  isActiveRoute(route: string): boolean {
    return this.router.url === route;
  }

  /**
   * Maneja el cierre de sesión
   */
  logout(): void {
    // Mostrar confirmación antes de cerrar sesión
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      try {
        this.authService.logout();
        // Opcional: mostrar mensaje de éxito
        console.log('Sesión cerrada exitosamente');
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
        // Opcional: mostrar mensaje de error
      }
    }
  }

  /**
   * Maneja la navegación y cierra el sidebar en móvil
   */
  onNavigate(): void {
    if (this.isMobile) {
      this.closeSidebar();
    }
  }

  /**
   * Maneja el evento de teclado para accesibilidad
   */
  onKeyDown(event: KeyboardEvent, action: () => void): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  }
}
