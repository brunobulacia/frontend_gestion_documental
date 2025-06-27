import { Component, type OnInit, type OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  FormBuilder,
  type FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { Subscription } from 'rxjs';

// PrimeNG Components
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

// Lucide Angular Icons
import {
  LucideAngularModule,
  UsersIcon,
  PlusIcon,
  SearchIcon,
  XIcon,
  LoaderIcon,
  EyeIcon,
  EditIcon,
  TrashIcon,
  UserIcon,
  MailIcon,
  ShieldIcon,
  BuildingIcon,
  CrownIcon,
  AlertCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from 'lucide-angular';

// Servicios y Modelos
import { UsuariosService } from '../../core/services/admin/usuarios.service';
import type { Usuarios } from '../../models/usuarios.model';

interface Rol {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    FormsModule,
    LucideAngularModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    MultiSelectModule,
    CheckboxModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css'],
})
export class UsuariosComponent implements OnInit, OnDestroy {
  // Iconos
  readonly UsersIcon = UsersIcon;
  readonly PlusIcon = PlusIcon;
  readonly SearchIcon = SearchIcon;
  readonly XIcon = XIcon;
  readonly LoaderIcon = LoaderIcon;
  readonly EyeIcon = EyeIcon;
  readonly EditIcon = EditIcon;
  readonly TrashIcon = TrashIcon;
  readonly UserIcon = UserIcon;
  readonly MailIcon = MailIcon;
  readonly ShieldIcon = ShieldIcon;
  readonly BuildingIcon = BuildingIcon;
  readonly CrownIcon = CrownIcon;
  readonly AlertCircleIcon = AlertCircleIcon;
  readonly ChevronLeftIcon = ChevronLeftIcon;
  readonly ChevronRightIcon = ChevronRightIcon;

  // Propiedades
  usuarios: Usuarios[] = [];
  usuariosFiltered: Usuarios[] = [];
  cargando = true;
  guardando = false;

  // Modales
  mostrarModalCrear = false;
  mostrarModalEditar = false;
  mostrarModalVer = false;
  usuarioSeleccionado: Usuarios | null = null;
  nuevoUsuarioForm: FormGroup;
  editarUsuarioForm: FormGroup;

  // Filtros
  filtroTexto = '';

  // Paginación
  paginaActual = 1;
  elementosPorPagina = 10;
  totalPaginas = 1;

  private subscriptions = new Subscription();
  Math = Math;

  rolesOpciones: { label: string; value: number }[] = [];
  roles: Rol[] = [];

  constructor(
    private usuariosService: UsuariosService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.nuevoUsuarioForm = this.crearFormulario();
    this.editarUsuarioForm = this.crearFormulario();
  }

  ngOnInit(): void {
    this.cargarRoles();
    this.cargarUsuarios();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private crearFormulario(): FormGroup {
    return this.fb.group({
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(50),
        ],
      ],
      email: ['', [Validators.required, Validators.email]],
      roles: [[], [Validators.required]],
      es_admin: [false],
    });
  }

  cargarUsuarios(): void {
    this.cargando = true;
    console.log('Iniciando carga de usuarios...');

    const sub = this.usuariosService.getUsuarios().subscribe({
      next: (data) => {
        console.log('Datos recibidos del servicio:', data);
        console.log('Tipo de datos:', typeof data);
        console.log('Es array?', Array.isArray(data));

        // Manejo más robusto de la respuesta
        if (data === null || data === undefined) {
          console.warn('Datos nulos o indefinidos, inicializando array vacío');
          this.usuarios = [];
        } else if (Array.isArray(data)) {
          console.log('Datos son array, asignando directamente');
          this.usuarios = data;
        } else if (typeof data === 'object' && 'data' in data) {
          console.log('Datos tienen propiedad data, extrayendo...');
          this.usuarios = Array.isArray((data as any).data)
            ? (data as any).data
            : [];
        } else if (typeof data === 'object' && 'usuarios' in data) {
          console.log('Datos tienen propiedad usuarios, extrayendo...');
          this.usuarios = Array.isArray((data as any).usuarios)
            ? (data as any).usuarios
            : [];
        } else {
          console.warn(
            'Formato de datos no reconocido, inicializando array vacío'
          );
          this.usuarios = [];
        }

        console.log('Array final de usuarios:', this.usuarios);
        console.log('Longitud del array:', this.usuarios.length);

        this.filtrarUsuarios();
        this.calcularPaginacion();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        this.mostrarError('Error al cargar los usuarios.');
        this.cargando = false;
        this.usuarios = [];
        this.usuariosFiltered = [];
      },
    });
    this.subscriptions.add(sub);
  }

  filtrarUsuarios(): void {
    console.log('Ejecutando filtrarUsuarios...');
    console.log('this.usuarios antes del filtro:', this.usuarios);
    console.log('Es array this.usuarios?', Array.isArray(this.usuarios));

    // Triple verificación de seguridad
    if (!this.usuarios || !Array.isArray(this.usuarios)) {
      console.warn('this.usuarios no es un array válido, inicializando...');
      this.usuarios = [];
    }

    if (!this.filtroTexto.trim()) {
      this.usuariosFiltered = [...this.usuarios];
    } else {
      const filtro = this.filtroTexto.toLowerCase().trim();
      try {
        this.usuariosFiltered = this.usuarios.filter((usuario) => {
          // Verificar que usuario existe y tiene las propiedades necesarias
          if (!usuario || typeof usuario !== 'object') {
            return false;
          }

          return (
            (usuario.id && usuario.id.toString().includes(filtro)) ||
            (usuario.username &&
              usuario.username.toLowerCase().includes(filtro)) ||
            (usuario.email && usuario.email.toLowerCase().includes(filtro)) ||
            (usuario.roles &&
              Array.isArray(usuario.roles) &&
              usuario.roles.some(
                (rol) => rol && rol.nombre.toLowerCase().includes(filtro)
              ))
          );
        });
      } catch (error) {
        console.error('Error en filtrarUsuarios:', error);
        this.usuariosFiltered = [];
      }
    }

    console.log('Usuarios filtrados:', this.usuariosFiltered);
    this.paginaActual = 1;
    this.calcularPaginacion();
  }

  calcularPaginacion(): void {
    this.totalPaginas = Math.ceil(
      this.usuariosFiltered.length / this.elementosPorPagina
    );
    if (this.totalPaginas === 0) this.totalPaginas = 1;
  }

  cambiarPagina(nuevaPagina: number): void {
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginas) {
      this.paginaActual = nuevaPagina;
    }
  }

  limpiarFiltros(): void {
    this.filtroTexto = '';
    this.filtrarUsuarios();
  }

  abrirModalCrear(): void {
    this.nuevoUsuarioForm.reset({
      username: '',
      email: '',
      roles: [],
      es_admin: false,
    });
    this.mostrarModalCrear = true;
  }

  cerrarModalCrear(): void {
    this.mostrarModalCrear = false;
    this.nuevoUsuarioForm.reset();
    this.guardando = false;
  }

  verUsuario(usuario: Usuarios): void {
    this.usuarioSeleccionado = usuario;
    console.log(usuario.roles);
    this.mostrarModalVer = true;
  }

  cerrarModalVer(): void {
    this.mostrarModalVer = false;
    this.usuarioSeleccionado = null;
  }

  editarUsuario(usuario: Usuarios): void {
    this.usuarioSeleccionado = usuario;
    this.editarUsuarioForm.patchValue({
      username: usuario.username,
      email: usuario.email,
      roles: usuario.roles,
      es_admin: usuario.es_admin,
    });
    this.mostrarModalEditar = true;
  }

  cerrarModalEditar(): void {
    this.mostrarModalEditar = false;
    this.editarUsuarioForm.reset();
    this.usuarioSeleccionado = null;
    this.guardando = false;
  }

  actualizarUsuario(): void {
    if (
      this.editarUsuarioForm.invalid ||
      this.guardando ||
      !this.usuarioSeleccionado
    ) {
      this.marcarCamposInvalidosEditar();
      return;
    }

    this.guardando = true;
    const datosUsuario: Partial<Usuarios> = {
      username: this.editarUsuarioForm.get('username')?.value,
      email: this.editarUsuarioForm.get('email')?.value,
      roles: this.editarUsuarioForm.get('roles')?.value,
      es_admin: this.editarUsuarioForm.get('es_admin')?.value,
    };

    const sub = this.usuariosService
      .updateUsuario(this.usuarioSeleccionado.id, datosUsuario)
      .subscribe({
        next: () => {
          this.mostrarExito('Usuario actualizado correctamente');
          this.cargarUsuarios();
          this.cerrarModalEditar();
        },
        error: (error) => {
          console.error('Error al actualizar usuario:', error);
          this.mostrarError('Error al actualizar el usuario.');
          this.guardando = false;
        },
      });
    this.subscriptions.add(sub);
  }

  crearUsuario(): void {
    if (this.nuevoUsuarioForm.invalid || this.guardando) {
      this.marcarCamposInvalidos();
      return;
    }

    this.guardando = true;
    const datosUsuario: Partial<Usuarios> = {
      username: this.nuevoUsuarioForm.get('username')?.value,
      email: this.nuevoUsuarioForm.get('email')?.value,
      roles: this.nuevoUsuarioForm.get('roles')?.value,
      es_admin: this.nuevoUsuarioForm.get('es_admin')?.value,
    };

    const sub = this.usuariosService
      .createUsuario(datosUsuario as Usuarios)
      .subscribe({
        next: () => {
          this.mostrarExito('Usuario creado correctamente');
          this.cargarUsuarios();
          this.cerrarModalCrear();
        },
        error: (error) => {
          console.error('Error al crear usuario:', error);
          this.mostrarError('Error al crear el usuario.');
          this.guardando = false;
        },
      });
    this.subscriptions.add(sub);
  }

  confirmarEliminar(usuario: Usuarios): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar al usuario "${usuario.username}"?`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, Eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.eliminarUsuario(usuario.id);
      },
    });
  }

  private eliminarUsuario(id: number): void {
    const sub = this.usuariosService.deleteUsuario(id).subscribe({
      next: () => {
        this.mostrarExito('Usuario eliminado correctamente');
        this.cargarUsuarios();
      },
      error: (error) => {
        console.error('Error al eliminar usuario:', error);
        this.mostrarError('Error al eliminar el usuario.');
      },
    });
    this.subscriptions.add(sub);
  }

  getRolesTexto(roleIds: number[]): string {
    return roleIds
      .map((roleId) => {
        const rol = this.roles.find((r) => r.id === roleId);
        return rol ? rol.nombre : `Rol ${roleId}`;
      })
      .join(', ');
  }

  getErrorMessage(fieldName: string): string {
    const field = this.nuevoUsuarioForm.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';

    const errors = field.errors;
    if (errors['required']) return 'Este campo es obligatorio';
    if (errors['email']) return 'Ingrese un email válido';
    if (errors['minlength'])
      return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
    if (errors['maxlength'])
      return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
    return 'Campo inválido';
  }

  getErrorMessageEditar(fieldName: string): string {
    const field = this.editarUsuarioForm.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';

    const errors = field.errors;
    if (errors['required']) return 'Este campo es obligatorio';
    if (errors['email']) return 'Ingrese un email válido';
    if (errors['minlength'])
      return `Mínimo ${errors['minlength'].requiredLength} caracteres`;
    if (errors['maxlength'])
      return `Máximo ${errors['maxlength'].requiredLength} caracteres`;
    return 'Campo inválido';
  }

  private marcarCamposInvalidos(): void {
    Object.keys(this.nuevoUsuarioForm.controls).forEach((key) => {
      const control = this.nuevoUsuarioForm.get(key);
      if (control) control.markAsTouched();
    });
  }

  private marcarCamposInvalidosEditar(): void {
    Object.keys(this.editarUsuarioForm.controls).forEach((key) => {
      const control = this.editarUsuarioForm.get(key);
      if (control) control.markAsTouched();
    });
  }

  private mostrarExito(mensaje: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: mensaje,
      life: 5000,
    });
  }

  private mostrarError(mensaje: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: mensaje,
      life: 5000,
    });
  }

  trackByUsuario(index: number, usuario: Usuarios): number {
    return usuario.id;
  }

  cargarRoles(): void {
    const sub = this.usuariosService.getUserRoles().subscribe(
      (data) => {
        const rolesData = data as Rol[];
        console.log('Roles cargados:', rolesData);
        this.roles = rolesData;
        this.rolesOpciones = rolesData.map((rol) => ({
          label: rol.nombre,
          value: rol.id,
        }));
      },
      (error) => {
        console.error('Error al cargar roles:', error);
        this.mostrarError('Error al cargar los roles del sistema.');
        // Fallback a roles por defecto si falla la carga
        this.rolesOpciones = [
          { label: 'Administrador', value: 1 },
          { label: 'Supervisor', value: 2 },
          { label: 'Colaborador', value: 3 },
        ];
      }
    );
    this.subscriptions.add(sub);
  }
}
