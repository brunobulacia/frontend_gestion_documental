import { Component, type OnInit, type OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
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
import { AutoCompleteModule } from 'primeng/autocomplete';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

// Lucide Angular Icons
import {
  LucideAngularModule,
  ClipboardListIcon,
  PlusIcon,
  SearchIcon,
  FilterIcon,
  LoaderIcon,
  XIcon,
  ListIcon,
  EyeIcon,
  EditIcon,
  TrashIcon,
  SaveIcon,
  AlertCircleIcon,
  CalendarIcon,
  FileTextIcon,
  FileIcon,
  UserIcon,
  DatabaseIcon,
  HashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from 'lucide-angular';

// Servicios y Modelos
import { RespoFormService } from '../../core/services/formularios/respo-form.service';
import { DocumentsService } from '../../core/services/documents.service';
import type { RespuestaFormularioDocumento } from '../../models/respo-form.model';
import { FormulariosService } from '../../core/services/formularios/formularios.service';

@Component({
  selector: 'app-respuesta-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    LucideAngularModule,
    DialogModule,
    ButtonModule,
    InputTextModule,
    Textarea,
    AutoCompleteModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './respuesta-form.component.html',
  styleUrls: ['./respuesta-form.component.css'],
})
export class RespuestaFormComponent implements OnInit, OnDestroy {
  // Iconos de Lucide
  readonly ClipboardListIcon = ClipboardListIcon;
  readonly PlusIcon = PlusIcon;
  readonly SearchIcon = SearchIcon;
  readonly FilterIcon = FilterIcon;
  readonly LoaderIcon = LoaderIcon;
  readonly XIcon = XIcon;
  readonly ListIcon = ListIcon;
  readonly EyeIcon = EyeIcon;
  readonly EditIcon = EditIcon;
  readonly TrashIcon = TrashIcon;
  readonly SaveIcon = SaveIcon;
  readonly AlertCircleIcon = AlertCircleIcon;
  readonly CalendarIcon = CalendarIcon;
  readonly FileTextIcon = FileTextIcon;
  readonly FileIcon = FileIcon;
  readonly UserIcon = UserIcon;
  readonly DatabaseIcon = DatabaseIcon;
  readonly HashIcon = HashIcon;
  readonly ChevronLeftIcon = ChevronLeftIcon;
  readonly ChevronRightIcon = ChevronRightIcon;

  // Propiedades del componente
  respuestas: RespuestaFormularioDocumento[] = [];
  respuestasFiltered: RespuestaFormularioDocumento[] = [];
  cargando = true;
  guardando = false;

  // Modal
  mostrarModal = false;
  mostrarModalVer = false;
  modoEdicion = false;
  respuestaSeleccionada: RespuestaFormularioDocumento | null = null;
  respuestaForm: FormGroup;

  // Filtros y búsqueda
  filtroTexto = '';
  mostrarFiltros = false;

  // Paginación
  paginaActual = 1;
  elementosPorPagina = 10;
  totalPaginas = 1;

  // Usuario actual
  completado_por: number;

  // Suscripciones
  private subscriptions = new Subscription();

  // Referencia a Math para el template
  Math = Math;

  // Nombres de documentos
  nombresDocumentos: { id: string; titulo: string }[] = [];
  formularioNombres: { id: number; nombre: string }[] = [];

  // Objetos seleccionados para autocomplete
  formularioSeleccionado: { id: number; nombre: string } | null = null;
  formularioSugerencias: { id: number; nombre: string }[] = [];

  // Para p-autocomplete de documentos
  documentoSeleccionado: { id: string; titulo: string } | null = null;
  documentoSugerencias: { id: string; titulo: string }[] = [];

  constructor(
    private respoFormService: RespoFormService,
    private documentService: DocumentsService,
    private formulariosService: FormulariosService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    this.completado_por = this.obtenerUsuarioActual();
    this.respuestaForm = this.crearFormulario();
  }

  ngOnInit(): void {
    this.cargarRespuestas();

    // Cargar formularios
    const subFormularios = this.formulariosService.getFormularios().subscribe({
      next: (formularios) => {
        this.formularioNombres = formularios.map((f) => ({
          id: f.id,
          nombre: f.nombre,
        }));
        this.formularioSugerencias = [...this.formularioNombres];
        console.log('Formularios cargados:', this.formularioNombres);
      },
      error: (error) => {
        console.error('Error al cargar formularios:', error);
        this.mostrarError(
          'Error al cargar los formularios. Por favor, intente nuevamente.'
        );
      },
    });

    this.subscriptions.add(subFormularios);

    // Cargar documentos
    const subDocumentos = this.documentService.getDocs().subscribe({
      next: (documentos) => {
        this.nombresDocumentos = Array.isArray(documentos)
          ? documentos.map((doc: any) => ({
              id: doc.id,
              titulo: doc.titulo || 'Documento sin título',
            }))
          : [];
        this.documentoSugerencias = [...this.nombresDocumentos];
        console.log('Documentos cargados:', this.nombresDocumentos);
      },
      error: (error) => {
        console.error('Error al cargar documentos:', error);
        this.mostrarError(
          'Error al cargar los documentos. Por favor, intente nuevamente.'
        );
      },
    });

    this.subscriptions.add(subDocumentos);
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
      formulario: ['', [Validators.required]],
      documento: ['', [Validators.required]],
      datos: ['', [Validators.required, Validators.minLength(3)]],
    });
  }

  /**
   * Verifica si el formulario es válido
   */
  esFormularioValido(): boolean {
    const datosValidos = this.respuestaForm.get('datos')?.valid || false;
    const formularioValido = this.formularioSeleccionado !== null;
    const documentoValido = this.documentoSeleccionado !== null;

    return datosValidos && formularioValido && documentoValido;
  }

  /**
   * Carga la lista de respuestas
   */
  cargarRespuestas(): void {
    this.cargando = true;

    const sub = this.respoFormService.getRespuestasFormularios().subscribe({
      next: (data) => {
        this.respuestas = data;
        this.filtrarRespuestas();
        this.calcularPaginacion();
        this.cargando = false;
        console.log('Respuestas Formulario:', this.respuestas);
      },
      error: (error) => {
        console.error('Error al cargar respuestas:', error);
        this.mostrarError(
          'Error al cargar las respuestas. Por favor, intente nuevamente.'
        );
        this.cargando = false;
      },
    });

    this.subscriptions.add(sub);
  }

  /**
   * Filtra las respuestas según el texto de búsqueda
   */
  filtrarRespuestas(): void {
    if (!this.filtroTexto.trim()) {
      this.respuestasFiltered = [...this.respuestas];
    } else {
      const filtro = this.filtroTexto.toLowerCase().trim();
      this.respuestasFiltered = this.respuestas.filter(
        (respuesta) =>
          respuesta.documento.toLowerCase().includes(filtro) ||
          respuesta.datos.toLowerCase().includes(filtro) ||
          respuesta.id.toString().includes(filtro)
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
      this.respuestasFiltered.length / this.elementosPorPagina
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
    this.filtrarRespuestas();
  }

  /**
   * Toggle para mostrar/ocultar filtros avanzados
   */
  toggleFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  /**
   * Abre el modal para crear una nueva respuesta
   */
  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.respuestaSeleccionada = null;
    this.formularioSeleccionado = null;
    this.documentoSeleccionado = null;
    this.respuestaForm.reset();
    this.mostrarModal = true;
  }

  /**
   * Abre el modal para editar una respuesta existente
   */
  abrirModalEditar(respuesta: RespuestaFormularioDocumento): void {
    this.modoEdicion = true;
    this.respuestaSeleccionada = respuesta;

    // Buscar y establecer el formulario seleccionado
    this.formularioSeleccionado =
      this.formularioNombres.find((f) => f.id === respuesta.formulario) || null;

    // Buscar y establecer el documento seleccionado
    this.documentoSeleccionado =
      this.nombresDocumentos.find((d) => d.id === respuesta.documento) || null;

    this.respuestaForm.patchValue({
      formulario: respuesta.formulario,
      documento: respuesta.documento,
      datos: respuesta.datos,
    });
    this.mostrarModal = true;
  }

  /**
   * Abre el modal para ver detalles de una respuesta
   */
  verRespuesta(respuesta: RespuestaFormularioDocumento): void {
    this.respuestaSeleccionada = respuesta;
    this.mostrarModalVer = true;
  }

  /**
   * Cierra el modal de crear/editar
   */
  cerrarModal(): void {
    this.mostrarModal = false;
    this.respuestaForm.reset();
    this.respuestaSeleccionada = null;
    this.formularioSeleccionado = null;
    this.documentoSeleccionado = null;
    this.guardando = false;
  }

  /**
   * Cierra el modal de ver detalles
   */
  cerrarModalVer(): void {
    this.mostrarModalVer = false;
    this.respuestaSeleccionada = null;
  }

  /**
   * Guarda la respuesta (crear o actualizar)
   */
  guardarRespuesta(): void {
    // Marcar todos los campos como tocados para mostrar errores
    this.marcarCamposInvalidos();

    if (!this.esFormularioValido() || this.guardando) {
      console.log('Formulario inválido:', {
        formularioSeleccionado: this.formularioSeleccionado,
        documentoSeleccionado: this.documentoSeleccionado,
        datosValidos: this.respuestaForm.get('datos')?.valid,
        datosValue: this.respuestaForm.get('datos')?.value,
      });
      this.mostrarError('Por favor, complete todos los campos obligatorios.');
      return;
    }

    this.guardando = true;
    const datosRespuesta = this.respuestaForm.value;

    // Obtener IDs desde los objetos seleccionados
    const formularioId = this.formularioSeleccionado?.id;
    const documentoId = this.documentoSeleccionado?.id;

    if (!formularioId || !documentoId) {
      this.mostrarError(
        'Por favor, seleccione un formulario y un documento válidos.'
      );
      this.guardando = false;
      return;
    }

    if (this.modoEdicion && this.respuestaSeleccionada) {
      // Actualizar respuesta existente
      const respuestaActualizada: RespuestaFormularioDocumento = {
        ...this.respuestaSeleccionada,
        formulario: formularioId,
        documento: documentoId.toString(),
        datos: datosRespuesta.datos.trim(),
      };

      const sub = this.respoFormService
        .updateRespuestaFormulario(
          respuestaActualizada,
          this.respuestaSeleccionada.id
        )
        .subscribe({
          next: (respuestaGuardada) => {
            this.mostrarExito('Respuesta actualizada correctamente');
            this.cargarRespuestas();
            this.cerrarModal();
          },
          error: (error) => {
            console.error('Error al actualizar respuesta:', error);
            this.mostrarError(
              'Error al actualizar la respuesta. Por favor, intente nuevamente.'
            );
            this.guardando = false;
          },
        });

      this.subscriptions.add(sub);
    } else {
      // Crear nueva respuesta
      const nuevaRespuesta: Partial<RespuestaFormularioDocumento> = {
        formulario: formularioId,
        documento: documentoId.toString(),
        datos: datosRespuesta.datos.trim(),
        completado_por: this.completado_por,
        fecha_respuesta: new Date().toISOString(),
      };

      const sub = this.respoFormService
        .createRespuestaFormulario(
          nuevaRespuesta as RespuestaFormularioDocumento
        )
        .subscribe({
          next: (respuestaCreada) => {
            this.mostrarExito('Respuesta creada correctamente');
            this.cargarRespuestas();
            this.cerrarModal();
          },
          error: (error) => {
            console.error('Error al crear respuesta:', error);
            this.mostrarError(
              'Error al crear la respuesta. Por favor, intente nuevamente.'
            );
            this.guardando = false;
          },
        });

      this.subscriptions.add(sub);
    }
  }

  /**
   * Confirma la eliminación de una respuesta
   */
  confirmarEliminar(respuesta: RespuestaFormularioDocumento): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar la respuesta #${respuesta.id}? Esta acción no se puede deshacer.`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, Eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.eliminarRespuesta(respuesta.id);
      },
    });
  }

  /**
   * Elimina una respuesta
   */
  private eliminarRespuesta(id: number): void {
    const sub = this.respoFormService.deleteRespuestaFormulario(id).subscribe({
      next: () => {
        this.mostrarExito('Respuesta eliminada correctamente');
        this.cargarRespuestas();
      },
      error: (error) => {
        console.error('Error al eliminar respuesta:', error);
        this.mostrarError(
          'Error al eliminar la respuesta. Por favor, intente nuevamente.'
        );
      },
    });

    this.subscriptions.add(sub);
  }

  /**
   * Obtiene el nombre del documento
   */
  getDocumentoNombre(id: string): string {
    const nombre = this.nombresDocumentos.find((t) => t.id === id);
    return nombre ? nombre.titulo : 'Cargando...';
  }

  /**
   * Obtiene el nombre del formulario
   */
  getFormularioNombre(id: number): string {
    const nombre = this.formularioNombres.find((f) => f.id === id);
    return nombre ? nombre.nombre : 'Cargando...';
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
      });
    } catch {
      return fecha;
    }
  }

  /**
   * Obtiene el mensaje de error para un campo
   */
  getErrorMessage(fieldName: string): string {
    const field = this.respuestaForm.get(fieldName);

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

    return 'Campo inválido';
  }

  /**
   * Marca todos los campos como tocados para mostrar errores
   */
  private marcarCamposInvalidos(): void {
    Object.keys(this.respuestaForm.controls).forEach((key) => {
      const control = this.respuestaForm.get(key);
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
  trackByRespuesta(
    index: number,
    respuesta: RespuestaFormularioDocumento
  ): number {
    return respuesta.id;
  }

  // Métodos para manejar selección de formulario
  onFormularioSelect(event: any): void {
    this.respuestaForm.patchValue({
      formulario: event.id,
    });
    console.log('Formulario seleccionado:', event);
  }

  onFormularioClear(): void {
    this.formularioSeleccionado = null;
    this.respuestaForm.patchValue({
      formulario: null,
    });
  }

  // Métodos para manejar selección de documento
  onDocumentoSelect(event: any): void {
    this.respuestaForm.patchValue({
      documento: event.id,
    });
    console.log('Documento seleccionado:', event);
  }

  onDocumentoClear(): void {
    this.documentoSeleccionado = null;
    this.respuestaForm.patchValue({
      documento: null,
    });
  }

  // Métodos para autocomplete de formularios
  searchFormularios(event: any): void {
    const query = event.query.toLowerCase();
    this.formularioSugerencias = this.formularioNombres.filter((f) =>
      f.nombre.toLowerCase().includes(query)
    );
  }

  // Métodos para autocomplete de documentos
  searchDocumentos(event: any): void {
    const query = event.query.toLowerCase();
    this.documentoSugerencias = this.nombresDocumentos.filter((d) =>
      d.titulo.toLowerCase().includes(query)
    );
  }
}
