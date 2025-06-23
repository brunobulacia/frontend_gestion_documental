import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet, Router } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { Subscription } from 'rxjs';

// PrimeNG Components
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea, Textarea } from 'primeng/inputtextarea';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

// Lucide Angular Icons
import {
  LucideAngularModule,
  BookIcon,
  PlusIcon,
  SearchIcon,
  FilterIcon,
  LoaderIcon,
  FileTextIcon,
  XIcon,
  ListIcon,
  CalendarIcon,
  UserIcon,
  EyeIcon,
  EditIcon,
  TrashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SaveIcon,
  AlertCircleIcon,
  AlignLeftIcon,
  TagIcon,
} from 'lucide-angular';

// Servicios y Modelos
import { FormulariosService } from '../../core/services/formularios/formularios.service';
import { Formulario } from '../../models/formulario.model';

@Component({
  selector: 'app-formularios',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    ReactiveFormsModule,
    FormsModule,
    LucideAngularModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    Textarea,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './formularios.component.html',
  styleUrls: ['./formularios.component.css'],
})
export class FormulariosComponent implements OnInit, OnDestroy {
  // Iconos de Lucide
  readonly BookIcon = BookIcon;
  readonly PlusIcon = PlusIcon;
  readonly SearchIcon = SearchIcon;
  readonly FilterIcon = FilterIcon;
  readonly LoaderIcon = LoaderIcon;
  readonly FileTextIcon = FileTextIcon;
  readonly XIcon = XIcon;
  readonly ListIcon = ListIcon;
  readonly CalendarIcon = CalendarIcon;
  readonly UserIcon = UserIcon;
  readonly EyeIcon = EyeIcon;
  readonly EditIcon = EditIcon;
  readonly TrashIcon = TrashIcon;
  readonly ChevronLeftIcon = ChevronLeftIcon;
  readonly ChevronRightIcon = ChevronRightIcon;
  readonly SaveIcon = SaveIcon;
  readonly AlertCircleIcon = AlertCircleIcon;
  readonly AlignLeftIcon = AlignLeftIcon;
  readonly TagIcon = TagIcon;

  // Propiedades del componente
  formularios: Formulario[] = [];
  formulariosFiltered: Formulario[] = [];
  cargando = true;
  guardando = false;

  // Modal
  mostrarModal = false;
  modoEdicion = false;
  formularioSeleccionado: Formulario | null = null;
  formularioForm: FormGroup;

  // Filtros y búsqueda
  filtroTexto = '';
  mostrarFiltros = false;

  // Paginación
  paginaActual = 1;
  elementosPorPagina = 10;
  totalPaginas = 1;

  // Usuario actual
  creado_por: number;

  // Suscripciones
  private subscriptions = new Subscription();

  // Referencia a Math para el template
  Math = Math;

  constructor(
    private formulariosService: FormulariosService,
    private router: Router,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.creado_por = this.obtenerUsuarioActual();
    this.formularioForm = this.crearFormulario();
  }

  ngOnInit(): void {
    this.cargarFormularios();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Obtiene el ID del usuario actual desde localStorage
   */
  private obtenerUsuarioActual(): number {
    const perfil = localStorage.getItem('perfil');
    if (perfil) {
      try {
        return JSON.parse(perfil).user_id || 1;
      } catch {
        return 1;
      }
    }
    return 1;
  }

  /**
   * Crea el formulario reactivo
   */
  private crearFormulario(): FormGroup {
    return this.fb.group({
      nombre: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(100),
        ],
      ],
      descripcion: ['', [Validators.maxLength(500)]],
      tipo_documento: ['', [Validators.required, Validators.min(1)]],
    });
  }

  /**
   * Carga la lista de formularios
   */
  cargarFormularios(): void {
    this.cargando = true;

    const sub = this.formulariosService.getFormularios().subscribe({
      next: (data) => {
        this.formularios = data;
        this.filtrarFormularios();
        this.calcularPaginacion();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar formularios:', error);
        this.mostrarError(
          'Error al cargar los formularios. Por favor, intente nuevamente.'
        );
        this.cargando = false;
      },
    });

    this.subscriptions.add(sub);
  }

  /**
   * Filtra los formularios según el texto de búsqueda
   */
  filtrarFormularios(): void {
    if (!this.filtroTexto.trim()) {
      this.formulariosFiltered = [...this.formularios];
    } else {
      const filtro = this.filtroTexto.toLowerCase().trim();
      this.formulariosFiltered = this.formularios.filter(
        (formulario) =>
          formulario.nombre.toLowerCase().includes(filtro) ||
          formulario.descripcion.toLowerCase().includes(filtro)
      );
    }
    this.paginaActual = 1;
    this.calcularPaginacion();
  }

  /**
   * Calcula la paginación
   */
  calcularPaginacion(): void {
    this.totalPaginas = Math.ceil(
      this.formulariosFiltered.length / this.elementosPorPagina
    );
    if (this.totalPaginas === 0) this.totalPaginas = 1;
  }

  /**
   * Cambia la página actual
   */
  cambiarPagina(nuevaPagina: number): void {
    if (nuevaPagina >= 1 && nuevaPagina <= this.totalPaginas) {
      this.paginaActual = nuevaPagina;
    }
  }

  /**
   * Limpia los filtros de búsqueda
   */
  limpiarFiltros(): void {
    this.filtroTexto = '';
    this.filtrarFormularios();
  }

  /**
   * Toggle para mostrar/ocultar filtros avanzados
   */
  toggleFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  /**
   * Abre el modal para crear un nuevo formulario
   */
  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.formularioSeleccionado = null;
    this.formularioForm.reset();
    this.mostrarModal = true;
  }

  /**
   * Abre el modal para editar un formulario existente
   */
  abrirModalEditar(formulario: Formulario): void {
    this.modoEdicion = true;
    this.formularioSeleccionado = formulario;
    this.formularioForm.patchValue({
      nombre: formulario.nombre,
      descripcion: formulario.descripcion,
      tipo_documento: formulario.tipo_documento,
    });
    this.mostrarModal = true;
  }

  /**
   * Cierra el modal
   */
  cerrarModal(): void {
    this.mostrarModal = false;
    this.formularioForm.reset();
    this.formularioSeleccionado = null;
    this.guardando = false;
  }

  /**
   * Guarda el formulario (crear o actualizar)
   */
  guardarFormulario(): void {
    if (this.formularioForm.invalid || this.guardando) {
      this.marcarCamposInvalidos();
      return;
    }

    this.guardando = true;
    const datosFormulario = this.formularioForm.value;

    if (this.modoEdicion && this.formularioSeleccionado) {
      // Actualizar formulario existente
      const formularioActualizado: Formulario = {
        ...this.formularioSeleccionado,
        nombre: datosFormulario.nombre.trim(),
        descripcion: datosFormulario.descripcion?.trim() || '',
        tipo_documento: parseInt(datosFormulario.tipo_documento),
      };

      const sub = this.formulariosService
        .updateFormulario(this.formularioSeleccionado.id, formularioActualizado)
        .subscribe({
          next: (formularioGuardado) => {
            this.mostrarExito('Formulario actualizado correctamente');
            this.cargarFormularios();
            this.cerrarModal();
          },
          error: (error) => {
            console.error('Error al actualizar formulario:', error);
            this.mostrarError(
              'Error al actualizar el formulario. Por favor, intente nuevamente.'
            );
            this.guardando = false;
          },
        });

      this.subscriptions.add(sub);
    } else {
      // Crear nuevo formulario
      const nuevoFormulario: Partial<Formulario> = {
        nombre: datosFormulario.nombre.trim(),
        descripcion: datosFormulario.descripcion?.trim() || '',
        tipo_documento: parseInt(datosFormulario.tipo_documento),
        creado_por: this.creado_por,
        campos: [],
      };

      const sub = this.formulariosService
        .createFormulario(nuevoFormulario as Formulario)
        .subscribe({
          next: (formularioCreado) => {
            this.mostrarExito('Formulario creado correctamente');
            this.cargarFormularios();
            this.cerrarModal();
          },
          error: (error) => {
            console.error('Error al crear formulario:', error);
            this.mostrarError(
              'Error al crear el formulario. Por favor, intente nuevamente.'
            );
            this.guardando = false;
          },
        });

      this.subscriptions.add(sub);
    }
  }

  /**
   * Confirma la eliminación de un formulario
   */
  confirmarEliminar(formulario: Formulario): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar el formulario "${formulario.nombre}"? Esta acción no se puede deshacer.`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, Eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.eliminarFormulario(formulario.id);
      },
    });
  }

  /**
   * Elimina un formulario
   */
  private eliminarFormulario(id: number): void {
    const sub = this.formulariosService.deleteFormulario(id).subscribe({
      next: () => {
        this.mostrarExito('Formulario eliminado correctamente');
        this.cargarFormularios();
      },
      error: (error) => {
        console.error('Error al eliminar formulario:', error);
        this.mostrarError(
          'Error al eliminar el formulario. Por favor, intente nuevamente.'
        );
      },
    });

    this.subscriptions.add(sub);
  }

  /**
   * Navega a la vista de campos del formulario
   */
  verCamposFormulario(id: number): void {
    this.router.navigate(['/campos-formulario', id]);
  }

  /**
   * Formatea una fecha para mostrar
   */
  formatearFecha(fecha: string): string {
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    } catch {
      return fecha;
    }
  }

  /**
   * Obtiene el mensaje de error para un campo
   */
  getErrorMessage(fieldName: string): string {
    const field = this.formularioForm.get(fieldName);

    if (!field || !field.errors || !field.touched) {
      return '';
    }

    const errors = field.errors;

    if (errors['required']) {
      return 'Este campo es obligatorio';
    }

    if (errors['minlength']) {
      const requiredLength = errors['minlength'].requiredLength;
      return `Mínimo ${requiredLength} caracteres`;
    }

    if (errors['maxlength']) {
      const requiredLength = errors['maxlength'].requiredLength;
      return `Máximo ${requiredLength} caracteres`;
    }

    if (errors['min']) {
      return 'El valor debe ser mayor a 0';
    }

    return 'Campo inválido';
  }

  /**
   * Marca todos los campos como tocados para mostrar errores
   */
  private marcarCamposInvalidos(): void {
    Object.keys(this.formularioForm.controls).forEach((key) => {
      const control = this.formularioForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  /**
   * Muestra un mensaje de éxito
   */
  private mostrarExito(mensaje: string): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: mensaje,
      life: 5000,
    });
  }

  /**
   * Muestra un mensaje de error
   */
  private mostrarError(mensaje: string): void {
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: mensaje,
      life: 5000,
    });
  }

  /**
   * Función de tracking para optimizar el rendimiento de *ngFor
   */
  trackByFormulario(index: number, formulario: Formulario): number {
    return formulario.id;
  }
}
