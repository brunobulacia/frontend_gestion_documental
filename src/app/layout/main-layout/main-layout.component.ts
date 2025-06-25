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

// PrimeNG Services y Components
import { MessageService, ConfirmationService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

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
  NotebookTabs,
  BookMarked,
  UserRoundCog,
} from 'lucide-angular';

@Component({
  standalone: true,
  imports: [
    RouterOutlet,
    CommonModule,
    RouterLink,
    RouterLinkActive,
    LucideAngularModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
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

  // Estado de carga para logout
  loggingOut = false;

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
  readonly NotebookTabs = NotebookTabs;
  readonly BookMarked = BookMarked;
  readonly UserRoundCog = UserRoundCog;
  constructor(
    private authService: AuthService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
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
   * Maneja el cierre de sesión con confirmación elegante
   */
  logout(): void {
    // Prevenir múltiples clics durante el proceso de logout
    if (this.loggingOut) {
      return;
    }

    this.confirmationService.confirm({
      message:
        '¿Estás seguro de que deseas cerrar sesión? Se perderán los cambios no guardados.',
      header: 'Confirmar Cierre de Sesión',
      icon: 'pi pi-sign-out',
      acceptLabel: 'Sí, Cerrar Sesión',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-text p-button-sm',
      defaultFocus: 'reject', // Foco en cancelar por seguridad
      accept: () => {
        this.performLogout();
      },
      reject: () => {
        // Mostrar mensaje informativo si cancela
        this.messageService.add({
          severity: 'info',
          summary: 'Cancelado',
          detail: 'El cierre de sesión ha sido cancelado',
          life: 3000,
        });
      },
    });
  }

  /**
   * Ejecuta el proceso de cierre de sesión
   */
  private performLogout(): void {
    this.loggingOut = true;

    // Mostrar mensaje de carga
    this.messageService.add({
      severity: 'info',
      summary: 'Cerrando Sesión',
      detail: 'Procesando cierre de sesión...',
      life: 2000,
    });

    try {
      // Simular un pequeño delay para mejor UX
      setTimeout(() => {
        this.authService.logout();

        // Mostrar mensaje de éxito
        this.messageService.add({
          severity: 'success',
          summary: 'Sesión Cerrada',
          detail: 'Has cerrado sesión exitosamente. ¡Hasta pronto!',
          life: 4000,
        });

        // Opcional: delay antes de redireccionar para que el usuario vea el mensaje
        setTimeout(() => {
          this.loggingOut = false;
          // El AuthService debería manejar la redirección, pero por si acaso:
          // this.router.navigate(['/login']);
        }, 1000);
      }, 500);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);

      // Mostrar mensaje de error
      this.messageService.add({
        severity: 'error',
        summary: 'Error al Cerrar Sesión',
        detail: 'Ocurrió un error inesperado. Por favor, intenta nuevamente.',
        life: 5000,
      });

      this.loggingOut = false;
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

  /**
   * Muestra notificaciones de bienvenida (opcional)
   */
  showWelcomeMessage(): void {
    if (this.username) {
      this.messageService.add({
        severity: 'success',
        summary: `¡Bienvenido, ${this.username}!`,
        detail: 'Has iniciado sesión correctamente en el sistema',
        life: 4000,
      });
    }
  }

  /**
   * Muestra notificaciones de información del sistema (opcional)
   */
  showSystemNotification(
    message: string,
    type: 'success' | 'info' | 'warn' | 'error' = 'info'
  ): void {
    this.messageService.add({
      severity: type,
      summary: 'Notificación del Sistema',
      detail: message,
      life: 5000,
    });
  }

  /**
   * Limpia todas las notificaciones
   */
  clearAllNotifications(): void {
    this.messageService.clear();
  }
}
