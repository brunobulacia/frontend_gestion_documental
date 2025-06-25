import { Component, type OnInit, type OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
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
import { Textarea } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

// Lucide Angular Icons
import {
  LucideAngularModule,
  ActivityIcon,
  PlusIcon,
  SearchIcon,
  XIcon,
  LoaderIcon,
  ListIcon,
  EyeIcon,
  EditIcon,
  TrashIcon,
  ArrowLeftIcon,
  SettingsIcon,
  ZapIcon,
  UserIcon,
  CalendarIcon,
  CheckCircleIcon,
  XCircleIcon,
  MessageSquareIcon,
  AlertCircleIcon,
  HashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from 'lucide-angular';

// Servicios y Modelos
import { EjecucionesReglasService } from '../../core/services/reglas/ejecuciones.reglas.service';
import type { EjecucionRegla } from '../../models/ejecucion-regla.model';

@Component({
  selector: 'app-ejecuciones-regla',
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
    Textarea,
    DropdownModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './ejecuciones-regla.component.html',
  styleUrls: ['./ejecuciones-regla.component.css'],
})
export class EjecucionesReglaComponent implements OnInit, OnDestroy {
  // Iconos de Lucide
  readonly ActivityIcon = ActivityIcon;
  readonly PlusIcon = PlusIcon;
  readonly SearchIcon = SearchIcon;
  readonly XIcon = XIcon;
  readonly LoaderIcon = LoaderIcon;
  readonly ListIcon = ListIcon;
  readonly EyeIcon = EyeIcon;
  readonly EditIcon = EditIcon;
  readonly TrashIcon = TrashIcon;
  readonly ArrowLeftIcon = ArrowLeftIcon;
  readonly SettingsIcon = SettingsIcon;
  readonly ZapIcon = ZapIcon;
  readonly UserIcon = UserIcon;
  readonly CalendarIcon = CalendarIcon;
  readonly CheckCircleIcon = CheckCircleIcon;
  readonly XCircleIcon = XCircleIcon;
  readonly MessageSquareIcon = MessageSquareIcon;
  readonly AlertCircleIcon = AlertCircleIcon;
  readonly HashIcon = HashIcon;
  readonly ChevronLeftIcon = ChevronLeftIcon;
  readonly ChevronRightIcon = ChevronRightIcon;

  // Propiedades del componente
  ejecuciones: EjecucionRegla[] = [];
  ejecucionesFiltered: EjecucionRegla[] = [];
  cargando = true;
  guardando = false;

  // Modal
  mostrarModalCrear = false;
  mostrarModalEditar = false;
  mostrarModalVer = false;
  ejecucionSeleccionada: EjecucionRegla | null = null;
  nuevaEjecucionForm: FormGroup;
  editarEjecucionForm: FormGroup;

  // Filtros y búsqueda
  filtroTexto = '';

  // Paginación
  paginaActual = 1;
  elementosPorPagina = 10;
  totalPaginas = 1;

  // ID de la regla desde la ruta
  reglaId = 1;

  // Suscripciones
  private subscriptions = new Subscription();

  // Referencia a Math para el template
  Math = Math;

  // Opciones para dropdowns
  eventosOpciones = [
    { label: 'Formulario completado', value: 'formulario_completado' },
    { label: 'Documento cargado', value: 'documento_cargado' },
    { label: 'Cambio de estado', value: 'estado_actualizado' },
  ];

  estadosOpciones = [
    { label: 'Éxito', value: 'exito' },
    { label: 'Error', value: 'error' },
  ];

  constructor(
    private ejecucionesReglasService: EjecucionesReglasService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.nuevaEjecucionForm = this.crearFormulario();
    this.editarEjecucionForm = this.crearFormulario();
  }

  ngOnInit(): void {
    this.obtenerReglaIdDesdeRuta();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Crea el formulario reactivo
   */
  private crearFormulario(): FormGroup {
    return this.fb.group({
      regla: [{ value: '', disabled: true }, [Validators.required]],
      evento: ['', [Validators.required]],
      estado: ['exito', [Validators.required]],
      mensaje: [
        '',
        [
          Validators.required,
          Validators.minLength(5),
          Validators.maxLength(500),
        ],
      ],
    });
  }

  /**
   * Obtiene el ID de la regla desde la ruta
   */
  private obtenerReglaIdDesdeRuta(): void {
    const sub = this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.reglaId = +id;
        this.nuevaEjecucionForm.patchValue({ regla: this.reglaId });
        this.cargarEjecuciones();
      } else {
        this.router.navigate(['/reglas']);
        this.mostrarError('ID de regla no encontrado en la ruta.');
      }
    });
    this.subscriptions.add(sub);
  }

  /**
   * Carga la lista de ejecuciones
   */
  cargarEjecuciones(): void {
    this.cargando = true;

    const sub = this.ejecucionesReglasService
      .getEjecucionesByReglaId(this.reglaId)
      .subscribe({
        next: (data) => {
          this.ejecuciones = data;
          this.filtrarEjecuciones();
          this.calcularPaginacion();
          this.cargando = false;
          console.log('Ejecuciones cargadas:', this.ejecuciones);
        },
        error: (error) => {
          console.error('Error al cargar ejecuciones:', error);
          this.mostrarError(
            'Error al cargar las ejecuciones. Por favor, intente nuevamente.'
          );
          this.cargando = false;
        },
      });

    this.subscriptions.add(sub);
  }

  /**
   * Filtra las ejecuciones según el texto de búsqueda
   */
  filtrarEjecuciones(): void {
    if (!this.filtroTexto.trim()) {
      this.ejecucionesFiltered = [...this.ejecuciones];
    } else {
      const filtro = this.filtroTexto.toLowerCase().trim();
      this.ejecucionesFiltered = this.ejecuciones.filter(
        (ejecucion) =>
          ejecucion.id.toString().includes(filtro) ||
          ejecucion.evento.toLowerCase().includes(filtro) ||
          ejecucion.estado.toLowerCase().includes(filtro) ||
          ejecucion.mensaje.toLowerCase().includes(filtro)
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
      this.ejecucionesFiltered.length / this.elementosPorPagina
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
    this.filtrarEjecuciones();
  }

  /**
   * Abre el modal para crear una nueva ejecución
   */
  abrirModalCrear(): void {
    this.nuevaEjecucionForm.reset({
      regla: this.reglaId,
      evento: '',
      estado: 'exito',
      mensaje: '',
    });
    this.mostrarModalCrear = true;
  }

  /**
   * Cierra el modal de crear
   */
  cerrarModalCrear(): void {
    this.mostrarModalCrear = false;
    this.nuevaEjecucionForm.reset();
    this.guardando = false;
  }

  /**
   * Abre el modal para ver detalles de una ejecución
   */
  verEjecucion(ejecucion: EjecucionRegla): void {
    this.ejecucionSeleccionada = ejecucion;
    this.mostrarModalVer = true;
  }

  /**
   * Cierra el modal de ver detalles
   */
  cerrarModalVer(): void {
    this.mostrarModalVer = false;
    this.ejecucionSeleccionada = null;
  }

  /**
   * Abre el modal para editar una ejecución
   */
  editarEjecucion(ejecucion: EjecucionRegla): void {
    this.ejecucionSeleccionada = ejecucion;
    this.editarEjecucionForm.patchValue({
      regla: ejecucion.regla,
      evento: ejecucion.evento,
      estado: ejecucion.estado,
      mensaje: ejecucion.mensaje,
    });
    this.mostrarModalEditar = true;
  }

  /**
   * Cierra el modal de editar
   */
  cerrarModalEditar(): void {
    this.mostrarModalEditar = false;
    this.editarEjecucionForm.reset();
    this.ejecucionSeleccionada = null;
    this.guardando = false;
  }

  /**
   * Actualiza una ejecución existente
   */
  actualizarEjecucion(): void {
    if (
      this.editarEjecucionForm.invalid ||
      this.guardando ||
      !this.ejecucionSeleccionada
    ) {
      this.marcarCamposInvalidosEditar();
      return;
    }

    this.guardando = true;
    const datosEjecucion: Partial<EjecucionRegla> = {
      id: this.ejecucionSeleccionada.id,
      regla: this.reglaId,
      evento: this.editarEjecucionForm.get('evento')?.value,
      estado: this.editarEjecucionForm.get('estado')?.value,
      mensaje: this.editarEjecucionForm.get('mensaje')?.value,
    };

    const sub = this.ejecucionesReglasService
      .updateEjecucion(
        this.ejecucionSeleccionada.id,
        datosEjecucion as EjecucionRegla
      )
      .subscribe({
        next: () => {
          this.mostrarExito('Ejecución actualizada correctamente');
          this.cargarEjecuciones();
          this.cerrarModalEditar();
        },
        error: (error) => {
          console.error('Error al actualizar ejecución:', error);
          this.mostrarError(
            'Error al actualizar la ejecución. Por favor, intente nuevamente.'
          );
          this.guardando = false;
        },
      });

    this.subscriptions.add(sub);
  }

  /**
   * Crea una nueva ejecución
   */
  crearEjecucion(): void {
    if (this.nuevaEjecucionForm.invalid || this.guardando) {
      this.marcarCamposInvalidos();
      return;
    }

    this.guardando = true;
    const datosEjecucion = {
      regla: this.reglaId,
      evento: this.nuevaEjecucionForm.get('evento')?.value,
      estado: this.nuevaEjecucionForm.get('estado')?.value,
      mensaje: this.nuevaEjecucionForm.get('mensaje')?.value,
    };

    const sub = this.ejecucionesReglasService
      .createEjecucion(datosEjecucion)
      .subscribe({
        next: (ejecucionCreada) => {
          this.mostrarExito('Ejecución creada correctamente');
          this.cargarEjecuciones();
          this.cerrarModalCrear();
        },
        error: (error) => {
          console.error('Error al crear ejecución:', error);
          this.mostrarError(
            'Error al crear la ejecución. Por favor, intente nuevamente.'
          );
          this.guardando = false;
        },
      });

    this.subscriptions.add(sub);
  }

  /**
   * Confirma la eliminación de una ejecución
   */
  confirmarEliminar(ejecucion: EjecucionRegla): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar la ejecución #${ejecucion.id}? Esta acción no se puede deshacer.`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, Eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.eliminarEjecucion(ejecucion.id);
      },
    });
  }

  /**
   * Elimina una ejecución
   */
  private eliminarEjecucion(id: number): void {
    const sub = this.ejecucionesReglasService.deleteEjecucion(id).subscribe({
      next: () => {
        this.mostrarExito('Ejecución eliminada correctamente');
        this.cargarEjecuciones();
      },
      error: (error) => {
        console.error('Error al eliminar ejecución:', error);
        this.mostrarError(
          'Error al eliminar la ejecución. Por favor, intente nuevamente.'
        );
      },
    });

    this.subscriptions.add(sub);
  }

  /**
   * Obtiene la clase CSS para el badge del evento
   */
  getEventoBadgeClass(evento: string): string {
    return evento.replace('_', '');
  }

  /**
   * Obtiene el texto legible para el evento
   */
  getEventoTexto(evento: string): string {
    const opcion = this.eventosOpciones.find((e) => e.value === evento);
    return opcion ? opcion.label : evento;
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
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return fecha;
    }
  }

  /**
   * Formatea una fecha completa para mostrar
   */
  formatearFechaCompleta(fecha: string): string {
    try {
      const date = new Date(fecha);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return fecha;
    }
  }

  /**
   * Obtiene el mensaje de error para un campo
   */
  getErrorMessage(fieldName: string): string {
    const field = this.nuevaEjecucionForm.get(fieldName);

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
      const minValue = errors['min'].min;
      return `El valor mínimo es ${minValue}`;
    }

    return 'Campo inválido';
  }

  /**
   * Obtiene el mensaje de error para un campo del formulario de edición
   */
  getErrorMessageEditar(fieldName: string): string {
    const field = this.editarEjecucionForm.get(fieldName);

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
      const minValue = errors['min'].min;
      return `El valor mínimo es ${minValue}`;
    }

    return 'Campo inválido';
  }

  /**
   * Marca todos los campos como tocados para mostrar errores
   */
  private marcarCamposInvalidos(): void {
    Object.keys(this.nuevaEjecucionForm.controls).forEach((key) => {
      const control = this.nuevaEjecucionForm.get(key);
      if (control) {
        control.markAsTouched();
      }
    });
  }

  /**
   * Marca todos los campos como tocados para mostrar errores en el formulario de edición
   */
  private marcarCamposInvalidosEditar(): void {
    Object.keys(this.editarEjecucionForm.controls).forEach((key) => {
      const control = this.editarEjecucionForm.get(key);
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
  trackByEjecucion(index: number, ejecucion: EjecucionRegla): number {
    return ejecucion.id;
  }
}
