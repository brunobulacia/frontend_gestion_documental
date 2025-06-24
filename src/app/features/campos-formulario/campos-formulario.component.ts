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
import { CheckboxModule } from 'primeng/checkbox';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

// Lucide Angular Icons
import {
  LucideAngularModule,
  ArrowLeftIcon,
  SettingsIcon,
  InfoIcon,
  PlusIcon,
  SearchIcon,
  FilterIcon,
  LoaderIcon,
  XIcon,
  ListIcon,
  EditIcon,
  TrashIcon,
  SaveIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  TypeIcon,
  HashIcon,
  AtSignIcon,
  CalendarIcon,
  CheckSquareIcon,
  AlignLeftIcon,
  RadioIcon,
} from 'lucide-angular';

// Servicios y Modelos
import { CamposFormularioService } from '../../core/services/formularios/campos-formulario.service';
import type { CamposFormulario } from '../../models/campos-formulario.model';

@Component({
  selector: 'app-campos-formulario',
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
    CheckboxModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './campos-formulario.component.html',
  styleUrls: ['./campos-formulario.component.css'],
})
export class CamposFormularioComponent implements OnInit, OnDestroy {
  // Iconos de Lucide
  readonly ArrowLeftIcon = ArrowLeftIcon;
  readonly SettingsIcon = SettingsIcon;
  readonly InfoIcon = InfoIcon;
  readonly PlusIcon = PlusIcon;
  readonly SearchIcon = SearchIcon;
  readonly FilterIcon = FilterIcon;
  readonly LoaderIcon = LoaderIcon;
  readonly XIcon = XIcon;
  readonly ListIcon = ListIcon;
  readonly EditIcon = EditIcon;
  readonly TrashIcon = TrashIcon;
  readonly SaveIcon = SaveIcon;
  readonly AlertCircleIcon = AlertCircleIcon;
  readonly CheckCircleIcon = CheckCircleIcon;
  readonly TypeIcon = TypeIcon;
  readonly HashIcon = HashIcon;
  readonly AtSignIcon = AtSignIcon;
  readonly CalendarIcon = CalendarIcon;
  readonly CheckSquareIcon = CheckSquareIcon;
  readonly AlignLeftIcon = AlignLeftIcon;
  readonly RadioIcon = RadioIcon;

  // Propiedades del componente
  camposFormulario: CamposFormulario[] = [];
  camposFiltered: CamposFormulario[] = [];
  formId = 1;
  cargando = true;
  guardando = false;

  // Modal
  mostrarModal = false;
  modoEdicion = false;
  campoSeleccionado: CamposFormulario | null = null;
  campoForm: FormGroup;

  // Filtros y búsqueda
  filtroTexto = '';
  mostrarFiltros = false;

  // Suscripciones
  private subscriptions = new Subscription();

  constructor(
    private camposFormularioService: CamposFormularioService,
    private router: Router,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.campoForm = this.crearFormulario();
  }

  ngOnInit(): void {
    this.obtenerIdFormulario();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  /**
   * Obtiene el ID del formulario desde la ruta
   */
  private obtenerIdFormulario(): void {
    const sub = this.route.paramMap.subscribe((params) => {
      const formIdParam = params.get('id');
      if (formIdParam) {
        this.formId = +formIdParam;
        this.cargarCamposFormulario();
      } else {
        this.mostrarError('ID de formulario no válido');
        this.router.navigate(['/formularios']);
      }
    });

    this.subscriptions.add(sub);
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
          Validators.minLength(2),
          Validators.maxLength(100),
        ],
      ],
      tipo: ['', [Validators.required]],
      opciones: [''],
      obligatorio: [false],
    });
  }

  /**
   * Carga los campos del formulario
   */
  cargarCamposFormulario(): void {
    this.cargando = true;

    const sub = this.camposFormularioService
      .getCamposFormulario(this.formId)
      .subscribe({
        next: (data) => {
          this.camposFormulario = data;
          this.filtrarCampos();
          this.cargando = false;
        },
        error: (error) => {
          console.error('Error al cargar campos:', error);
          this.mostrarError(
            'Error al cargar los campos del formulario. Por favor, intente nuevamente.'
          );
          this.cargando = false;
        },
      });

    this.subscriptions.add(sub);
  }

  /**
   * Filtra los campos según el texto de búsqueda
   */
  filtrarCampos(): void {
    if (!this.filtroTexto.trim()) {
      this.camposFiltered = [...this.camposFormulario];
    } else {
      const filtro = this.filtroTexto.toLowerCase().trim();
      this.camposFiltered = this.camposFormulario.filter(
        (campo) =>
          campo.nombre.toLowerCase().includes(filtro) ||
          campo.tipo.toLowerCase().includes(filtro)
      );
    }
  }

  /**
   * Limpia los filtros de búsqueda
   */
  limpiarFiltros(): void {
    this.filtroTexto = '';
    this.filtrarCampos();
  }

  /**
   * Toggle para mostrar/ocultar filtros avanzados
   */
  toggleFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  /**
   * Abre el modal para crear un nuevo campo
   */
  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.campoSeleccionado = null;
    this.campoForm.reset();
    this.campoForm.patchValue({ obligatorio: false });
    this.mostrarModal = true;
  }

  /**
   * Abre el modal para editar un campo existente
   */
  abrirModalEditar(campo: CamposFormulario): void {
    this.modoEdicion = true;
    this.campoSeleccionado = campo;
    this.campoForm.patchValue({
      nombre: campo.nombre,
      tipo: campo.tipo,
      opciones: campo.opciones || '',
      obligatorio: campo.obligatorio,
    });
    this.mostrarModal = true;
  }

  /**
   * Cierra el modal
   */
  cerrarModal(): void {
    this.mostrarModal = false;
    this.campoForm.reset();
    this.campoSeleccionado = null;
    this.guardando = false;
  }

  /**
   * Guarda el campo (crear o actualizar)
   */
  guardarCampo(): void {
    if (this.campoForm.invalid || this.guardando) {
      this.marcarCamposInvalidos();
      return;
    }

    this.guardando = true;
    const datosCampo = this.campoForm.value;

    if (this.modoEdicion && this.campoSeleccionado) {
      // Actualizar campo existente
      const campoActualizado: CamposFormulario = {
        ...this.campoSeleccionado,
        nombre: datosCampo.nombre.trim(),
        tipo: datosCampo.tipo,
        opciones: datosCampo.opciones?.trim() || '',
        obligatorio: datosCampo.obligatorio,
      };

      const sub = this.camposFormularioService
        .updateCamposFormulario(campoActualizado, this.campoSeleccionado.id)
        .subscribe({
          next: (campoGuardado) => {
            this.mostrarExito('Campo actualizado correctamente');
            this.cargarCamposFormulario();
            this.cerrarModal();
          },
          error: (error) => {
            console.error('Error al actualizar campo:', error);
            this.mostrarError(
              'Error al actualizar el campo. Por favor, intente nuevamente.'
            );
            this.guardando = false;
          },
        });

      this.subscriptions.add(sub);
    } else {
      // Crear nuevo campo
      const nuevoCampo: Partial<CamposFormulario> = {
        nombre: datosCampo.nombre.trim(),
        tipo: datosCampo.tipo,
        opciones: datosCampo.opciones?.trim() || '',
        obligatorio: datosCampo.obligatorio,
        formulario: this.formId,
      };

      const sub = this.camposFormularioService
        .createCamposFormulario(nuevoCampo as CamposFormulario)
        .subscribe({
          next: (campoCreado) => {
            this.mostrarExito('Campo creado correctamente');
            this.cargarCamposFormulario();
            this.cerrarModal();
          },
          error: (error) => {
            console.error('Error al crear campo:', error);
            this.mostrarError(
              'Error al crear el campo. Por favor, intente nuevamente.'
            );
            this.guardando = false;
          },
        });

      this.subscriptions.add(sub);
    }
  }

  /**
   * Confirma la eliminación de un campo
   */
  confirmarEliminar(campo: CamposFormulario): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar el campo "${campo.nombre}"? Esta acción no se puede deshacer.`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, Eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.eliminarCampo(campo.id);
      },
    });
  }

  /**
   * Elimina un campo
   */
  private eliminarCampo(id: number): void {
    const sub = this.camposFormularioService
      .deleteCamposFormulario(id)
      .subscribe({
        next: () => {
          this.mostrarExito('Campo eliminado correctamente');
          this.cargarCamposFormulario();
        },
        error: (error) => {
          console.error('Error al eliminar campo:', error);
          this.mostrarError(
            'Error al eliminar el campo. Por favor, intente nuevamente.'
          );
        },
      });

    this.subscriptions.add(sub);
  }

  /**
   * Determina si debe mostrar el campo de opciones
   */
  mostrarCampoOpciones(): boolean {
    const tipo = this.campoForm.get('tipo')?.value;
    return tipo === 'select';
  }

  /**
   * Obtiene la clase CSS para el badge del tipo
   */
  getTipoBadgeClass(tipo: string): string {
    switch (tipo.toLowerCase()) {
      case 'text':
        return 'text';
      case 'number':
        return 'number';
      case 'date':
        return 'email'; // Reutilizamos el estilo email para date
      case 'select':
        return 'select';
      case 'checkbox':
        return 'checkbox';
      default:
        return 'text';
    }
  }

  /**
   * Obtiene el icono para el tipo de campo
   */
  getTipoIcon(tipo: string): any {
    switch (tipo.toLowerCase()) {
      case 'text':
        return this.TypeIcon;
      case 'number':
        return this.HashIcon;
      case 'date':
        return this.CalendarIcon;
      case 'select':
        return this.ListIcon;
      case 'checkbox':
        return this.CheckSquareIcon;
      default:
        return this.TypeIcon;
    }
  }

  /**
   * Obtiene el mensaje de error para un campo
   */
  getErrorMessage(fieldName: string): string {
    const field = this.campoForm.get(fieldName);

    if (!field || !field.errors || !field.touched) {
      return '';
    }

    const errors = field.errors;

    if (errors['required']) {
      return 'Este campo es obligatorio';
    }

    if (errors['minlength']) {
      const requiredLength = errors['minlength'].requiredLength;
      return `M  {
      const requiredLength = errors["minlength"].requiredLength
      return \`Mínimo ${requiredLength} caracteres`;
    }

    if (errors['maxlength']) {
      const requiredLength = errors['maxlength'].requiredLength;
      return `Máximo ${requiredLength} caracteres`;
    }

    return 'Campo inválido';
  }

  /**
   * Marca todos los campos como tocados para mostrar errores
   */
  private marcarCamposInvalidos(): void {
    Object.keys(this.campoForm.controls).forEach((key) => {
      const control = this.campoForm.get(key);
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
  trackByCampo(index: number, campo: CamposFormulario): number {
    return campo.id || index;
  }
}
