import { Component, type OnInit, type OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
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
  SettingsIcon,
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
  ZapIcon,
  PlayIcon,
  PauseIcon,
  CheckCircleIcon,
  TypeIcon,
  CodeIcon,
  DatabaseIcon,
  HashIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  List,
  FileTextIcon,
  FileSpreadsheetIcon,
  DownloadIcon,
} from 'lucide-angular';

// Servicios y Modelos
import { ReglasService } from '../../core/services/reglas/reglas.service';
import type { ReglaAutomatica } from '../../models/reglas.model';

// Librerías para exportación
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';

interface KeyValuePair {
  key: string;
  value: string;
}

@Component({
  selector: 'app-reglas',
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
    DropdownModule,
    CheckboxModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './reglas.component.html',
  styleUrls: ['./reglas.component.css'],
})
export class ReglasComponent implements OnInit, OnDestroy {
  // Iconos de Lucide
  readonly SettingsIcon = SettingsIcon;
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
  readonly ZapIcon = ZapIcon;
  readonly PlayIcon = PlayIcon;
  readonly PauseIcon = PauseIcon;
  readonly CheckCircleIcon = CheckCircleIcon;
  readonly TypeIcon = TypeIcon;
  readonly CodeIcon = CodeIcon;
  readonly DatabaseIcon = DatabaseIcon;
  readonly HashIcon = HashIcon;
  readonly ChevronLeftIcon = ChevronLeftIcon;
  readonly ChevronRightIcon = ChevronRightIcon;
  readonly List = List;
  readonly FileTextIcon = FileTextIcon;
  readonly FileSpreadsheetIcon = FileSpreadsheetIcon;
  readonly DownloadIcon = DownloadIcon;

  // Propiedades del componente
  reglas: ReglaAutomatica[] = [];
  reglasFiltered: ReglaAutomatica[] = [];
  cargando = true;
  guardando = false;
  exportando: string | null = null;

  // Modal
  mostrarModal = false;
  mostrarModalVer = false;
  modoEdicion = false;
  reglaSeleccionada: ReglaAutomatica | null = null;
  reglaForm: FormGroup;

  // Filtros y búsqueda
  filtroTexto = '';
  mostrarFiltros = false;
  filtroEvento: string | null = null;
  filtroAccion: string | null = null;
  filtroEstado: boolean | null = null;

  // Paginación
  paginaActual = 1;
  elementosPorPagina = 10;
  totalPaginas = 1;

  // Usuario actual
  creada_por: number;

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

  accionesOpciones = [
    { label: 'Enviar notificación', value: 'notificar' },
    { label: 'Actualizar estado del documento', value: 'cambiar_estado' },
    { label: 'Activar flujo de trabajo', value: 'activar_workflow' },
    { label: 'Actualizar campo del documento', value: 'actualizar_campo' },
  ];

  estadosOpciones = [
    { label: 'Activa', value: true },
    { label: 'Inactiva', value: false },
  ];

  // Para el editor JSON
  condicionPairs: KeyValuePair[] = [];
  parametrosPairs: KeyValuePair[] = [];

  constructor(
    private reglasService: ReglasService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private router: Router
  ) {
    this.creada_por = this.obtenerUsuarioActual();
    this.reglaForm = this.crearFormulario();
  }

  ngOnInit(): void {
    this.cargarReglas();
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

  verEjecuciones(id_regla: number): void {
    this.router.navigate(['/ejecuciones-reglas', id_regla]);
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
          Validators.maxLength(255),
        ],
      ],
      evento: ['', [Validators.required]],
      accion: ['', [Validators.required]],
      activa: [true],
    });
  }

  /**
   * Carga la lista de reglas
   */
  cargarReglas(): void {
    this.cargando = true;

    const sub = this.reglasService.getReglas().subscribe({
      next: (data) => {
        this.reglas = data;
        this.aplicarTodosFiltros();
        this.calcularPaginacion();
        this.cargando = false;
        console.log('Reglas cargadas:', this.reglas);
      },
      error: (error) => {
        console.error('Error al cargar reglas:', error);
        this.mostrarError(
          'Error al cargar las reglas. Por favor, intente nuevamente.'
        );
        this.cargando = false;
      },
    });

    this.subscriptions.add(sub);
  }

  /**
   * Filtra las reglas según el texto de búsqueda
   */
  filtrarReglas(): void {
    this.aplicarTodosFiltros();
  }

  /**
   * Aplica filtros avanzados
   */
  aplicarFiltrosAvanzados(): void {
    this.aplicarTodosFiltros();
  }

  /**
   * Aplica todos los filtros combinados
   */
  private aplicarTodosFiltros(): void {
    let reglasFiltradas = [...this.reglas];

    // Filtro de texto
    if (this.filtroTexto.trim()) {
      const filtro = this.filtroTexto.toLowerCase().trim();
      reglasFiltradas = reglasFiltradas.filter(
        (regla) =>
          regla.nombre.toLowerCase().includes(filtro) ||
          regla.evento.toLowerCase().includes(filtro) ||
          regla.accion.toLowerCase().includes(filtro)
      );
    }

    // Filtro por evento
    if (this.filtroEvento) {
      reglasFiltradas = reglasFiltradas.filter(
        (regla) => regla.evento === this.filtroEvento
      );
    }

    // Filtro por acción
    if (this.filtroAccion) {
      reglasFiltradas = reglasFiltradas.filter(
        (regla) => regla.accion === this.filtroAccion
      );
    }

    // Filtro por estado
    if (this.filtroEstado !== null) {
      reglasFiltradas = reglasFiltradas.filter(
        (regla) => regla.activa === this.filtroEstado
      );
    }

    this.reglasFiltered = reglasFiltradas;
    this.paginaActual = 1;
    this.calcularPaginacion();
  }

  /**
   * Verifica si hay filtros activos
   */
  tienesFiltrosActivos(): boolean {
    return !!(
      this.filtroEvento ||
      this.filtroAccion ||
      this.filtroEstado !== null
    );
  }

  /**
   * Calcula la paginación
   */
  calcularPaginacion(): void {
    this.totalPaginas = Math.ceil(
      this.reglasFiltered.length / this.elementosPorPagina
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
    this.aplicarTodosFiltros();
  }

  /**
   * Limpia los filtros avanzados
   */
  limpiarFiltrosAvanzados(): void {
    this.filtroEvento = null;
    this.filtroAccion = null;
    this.filtroEstado = null;
    this.aplicarTodosFiltros();
  }

  /**
   * Limpia todos los filtros
   */
  limpiarTodosFiltros(): void {
    this.filtroTexto = '';
    this.filtroEvento = null;
    this.filtroAccion = null;
    this.filtroEstado = null;
    this.aplicarTodosFiltros();
  }

  /**
   * Toggle para mostrar/ocultar filtros avanzados
   */
  toggleFiltros(): void {
    this.mostrarFiltros = !this.mostrarFiltros;
  }

  /**
   * Exporta las reglas filtradas a PDF
   */
  async exportarPDF(): Promise<void> {
    if (this.reglasFiltered.length === 0) {
      this.mostrarError('No hay datos para exportar');
      return;
    }

    this.exportando = 'pdf';

    try {
      const doc = new jsPDF();

      // Configuración del documento
      doc.setFontSize(18);
      doc.text('Reporte de Reglas Automáticas', 14, 22);

      doc.setFontSize(11);
      doc.text(
        `Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`,
        14,
        30
      );
      doc.text(`Total de reglas: ${this.reglasFiltered.length}`, 14, 36);

      // Headers de la tabla
      let yPosition = 50;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');

      const headers = ['ID', 'Nombre', 'Evento', 'Acción', 'Estado', 'Fecha'];
      const columnWidths = [15, 40, 35, 35, 20, 30];
      let xPosition = 14;

      // Dibujar headers
      headers.forEach((header, index) => {
        doc.text(header, xPosition, yPosition);
        xPosition += columnWidths[index];
      });

      // Línea separadora
      yPosition += 5;
      doc.line(14, yPosition, 195, yPosition);
      yPosition += 10;

      // Datos de la tabla
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);

      this.reglasFiltered.forEach((regla, index) => {
        if (yPosition > 270) {
          // Nueva página si es necesario
          doc.addPage();
          yPosition = 20;
        }

        xPosition = 14;
        const rowData = [
          regla.id.toString(),
          regla.nombre.length > 25
            ? regla.nombre.substring(0, 25) + '...'
            : regla.nombre,
          this.getEventoTexto(regla.evento),
          this.getAccionTexto(regla.accion),
          regla.activa ? 'Activa' : 'Inactiva',
          this.formatearFecha(regla.creada_en),
        ];

        rowData.forEach((data, colIndex) => {
          doc.text(data, xPosition, yPosition);
          xPosition += columnWidths[colIndex];
        });

        yPosition += 8;
      });

      // Guardar el archivo
      const fileName = `reglas-automaticas-${
        new Date().toISOString().split('T')[0]
      }.pdf`;
      doc.save(fileName);

      this.mostrarExito(`PDF exportado correctamente: ${fileName}`);
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      this.mostrarError('Error al generar el archivo PDF');
    } finally {
      this.exportando = null;
    }
  }

  /**
   * Exporta las reglas filtradas a Excel
   */
  async exportarExcel(): Promise<void> {
    if (this.reglasFiltered.length === 0) {
      this.mostrarError('No hay datos para exportar');
      return;
    }

    this.exportando = 'excel';

    try {
      // Preparar datos para Excel
      const datosExcel = this.reglasFiltered.map((regla) => ({
        ID: regla.id,
        Nombre: regla.nombre,
        Evento: this.getEventoTexto(regla.evento),
        Acción: this.getAccionTexto(regla.accion),
        Estado: regla.activa ? 'Activa' : 'Inactiva',
        'Fecha de Creación': this.formatearFecha(regla.creada_en),
        Condiciones: JSON.stringify(regla.condicion),
        'Parámetros de Acción': JSON.stringify(regla.parametros_accion),
        'Creada por Usuario ID': regla.creada_por,
      }));

      // Crear libro de trabajo
      const ws = XLSX.utils.json_to_sheet(datosExcel);
      const wb = XLSX.utils.book_new();

      // Configurar ancho de columnas
      const colWidths = [
        { wch: 8 }, // ID
        { wch: 30 }, // Nombre
        { wch: 25 }, // Evento
        { wch: 25 }, // Acción
        { wch: 12 }, // Estado
        { wch: 18 }, // Fecha
        { wch: 40 }, // Condiciones
        { wch: 40 }, // Parámetros
        { wch: 15 }, // Creada por
      ];
      ws['!cols'] = colWidths;

      // Agregar hoja al libro
      XLSX.utils.book_append_sheet(wb, ws, 'Reglas Automáticas');

      // Generar y descargar archivo
      const fileName = `reglas-automaticas-${
        new Date().toISOString().split('T')[0]
      }.xlsx`;
      XLSX.writeFile(wb, fileName);

      this.mostrarExito(`Excel exportado correctamente: ${fileName}`);
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      this.mostrarError('Error al generar el archivo Excel');
    } finally {
      this.exportando = null;
    }
  }

  /**
   * Abre el modal para crear una nueva regla
   */
  abrirModalCrear(): void {
    this.modoEdicion = false;
    this.reglaSeleccionada = null;
    this.reglaForm.reset();
    this.reglaForm.patchValue({ activa: true });
    this.condicionPairs = [{ key: '', value: '' }];
    this.parametrosPairs = [{ key: '', value: '' }];
    this.mostrarModal = true;
  }

  /**
   * Abre el modal para editar una regla existente
   */
  abrirModalEditar(regla: ReglaAutomatica): void {
    this.modoEdicion = true;
    this.reglaSeleccionada = regla;
    this.reglaForm.patchValue({
      nombre: regla.nombre,
      evento: regla.evento,
      accion: regla.accion,
      activa: regla.activa,
    });

    // Convertir objetos JSON a pares clave-valor
    this.condicionPairs = this.objectToKeyValuePairs(regla.condicion);
    this.parametrosPairs = this.objectToKeyValuePairs(regla.parametros_accion);

    this.mostrarModal = true;
  }

  /**
   * Abre el modal para ver detalles de una regla
   */
  verRegla(regla: ReglaAutomatica): void {
    this.reglaSeleccionada = regla;
    this.mostrarModalVer = true;
  }

  /**
   * Cierra el modal de crear/editar
   */
  cerrarModal(): void {
    this.mostrarModal = false;
    this.reglaForm.reset();
    this.reglaSeleccionada = null;
    this.condicionPairs = [];
    this.parametrosPairs = [];
    this.guardando = false;
  }

  /**
   * Cierra el modal de ver detalles
   */
  cerrarModalVer(): void {
    this.mostrarModalVer = false;
    this.reglaSeleccionada = null;
  }

  /**
   * Guarda la regla (crear o actualizar)
   */
  guardarRegla(): void {
    if (this.reglaForm.invalid || this.guardando) {
      this.marcarCamposInvalidos();
      return;
    }

    // Validar que haya al menos un par de condición y parámetros
    const condicionValida = this.condicionPairs.some(
      (pair) => pair.key.trim() && pair.value.trim()
    );
    const parametrosValidos = this.parametrosPairs.some(
      (pair) => pair.key.trim() && pair.value.trim()
    );

    if (!condicionValida) {
      this.mostrarError('Debe agregar al menos una condición válida.');
      return;
    }

    if (!parametrosValidos) {
      this.mostrarError('Debe agregar al menos un parámetro de acción válido.');
      return;
    }

    this.guardando = true;
    const datosRegla = this.reglaForm.value;

    // Convertir pares clave-valor a objetos JSON
    const condicion = this.keyValuePairsToObject(this.condicionPairs);
    const parametros_accion = this.keyValuePairsToObject(this.parametrosPairs);

    if (this.modoEdicion && this.reglaSeleccionada) {
      // Actualizar regla existente
      const reglaActualizada: ReglaAutomatica = {
        ...this.reglaSeleccionada,
        nombre: datosRegla.nombre.trim(),
        evento: datosRegla.evento,
        accion: datosRegla.accion,
        activa: datosRegla.activa,
        condicion,
        parametros_accion,
      };

      const sub = this.reglasService
        .updateRegla(this.reglaSeleccionada.id, reglaActualizada)
        .subscribe({
          next: (reglaGuardada) => {
            this.mostrarExito('Regla actualizada correctamente');
            this.cargarReglas();
            this.cerrarModal();
          },
          error: (error) => {
            console.error('Error al actualizar regla:', error);
            this.mostrarError(
              'Error al actualizar la regla. Por favor, intente nuevamente.'
            );
            this.guardando = false;
          },
        });

      this.subscriptions.add(sub);
    } else {
      // Crear nueva regla
      const nuevaRegla: Partial<ReglaAutomatica> = {
        nombre: datosRegla.nombre.trim(),
        evento: datosRegla.evento,
        accion: datosRegla.accion,
        activa: datosRegla.activa,
        condicion,
        parametros_accion,
        creada_por: this.creada_por,
      };

      const sub = this.reglasService
        .createRegla(nuevaRegla as ReglaAutomatica)
        .subscribe({
          next: (reglaCreada) => {
            this.mostrarExito('Regla creada correctamente');
            this.cargarReglas();
            this.cerrarModal();
          },
          error: (error) => {
            console.error('Error al crear regla:', error);
            this.mostrarError(
              'Error al crear la regla. Por favor, intente nuevamente.'
            );
            this.guardando = false;
          },
        });

      this.subscriptions.add(sub);
    }
  }

  /**
   * Confirma la eliminación de una regla
   */
  confirmarEliminar(regla: ReglaAutomatica): void {
    this.confirmationService.confirm({
      message: `¿Está seguro de que desea eliminar la regla "${regla.nombre}"? Esta acción no se puede deshacer.`,
      header: 'Confirmar Eliminación',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Sí, Eliminar',
      rejectLabel: 'Cancelar',
      accept: () => {
        this.eliminarRegla(regla.id);
      },
    });
  }

  /**
   * Elimina una regla
   */
  private eliminarRegla(id: number): void {
    const sub = this.reglasService.deleteRegla(id).subscribe({
      next: () => {
        this.mostrarExito('Regla eliminada correctamente');
        this.cargarReglas();
      },
      error: (error) => {
        console.error('Error al eliminar regla:', error);
        this.mostrarError(
          'Error al eliminar la regla. Por favor, intente nuevamente.'
        );
      },
    });

    this.subscriptions.add(sub);
  }

  /**
   * Convierte un objeto a pares clave-valor
   */
  private objectToKeyValuePairs(obj: Record<string, any>): KeyValuePair[] {
    if (!obj || typeof obj !== 'object') {
      return [{ key: '', value: '' }];
    }

    const pairs = Object.entries(obj).map(([key, value]) => ({
      key,
      value: typeof value === 'string' ? value : JSON.stringify(value),
    }));

    return pairs.length > 0 ? pairs : [{ key: '', value: '' }];
  }

  /**
   * Convierte pares clave-valor a objeto
   */
  private keyValuePairsToObject(pairs: KeyValuePair[]): Record<string, any> {
    const obj: Record<string, any> = {};

    pairs.forEach((pair) => {
      if (pair.key.trim() && pair.value.trim()) {
        // Intentar parsear como JSON, si falla usar como string
        try {
          obj[pair.key.trim()] = JSON.parse(pair.value.trim());
        } catch {
          obj[pair.key.trim()] = pair.value.trim();
        }
      }
    });

    return obj;
  }

  /**
   * Agrega un nuevo par clave-valor para condiciones
   */
  agregarCondicionPair(): void {
    this.condicionPairs.push({ key: '', value: '' });
  }

  /**
   * Elimina un par clave-valor de condiciones
   */
  eliminarCondicionPair(index: number): void {
    if (this.condicionPairs.length > 1) {
      this.condicionPairs.splice(index, 1);
    }
  }

  /**
   * Agrega un nuevo par clave-valor para parámetros
   */
  agregarParametrosPair(): void {
    this.parametrosPairs.push({ key: '', value: '' });
  }

  /**
   * Elimina un par clave-valor de parámetros
   */
  eliminarParametrosPair(index: number): void {
    if (this.parametrosPairs.length > 1) {
      this.parametrosPairs.splice(index, 1);
    }
  }

  /**
   * Obtiene la clase CSS para el badge del evento
   */
  getEventoBadgeClass(evento: string): string {
    return evento.replace('_', '');
  }

  /**
   * Obtiene la clase CSS para el badge de la acción
   */
  getAccionBadgeClass(accion: string): string {
    return accion.replace('_', '');
  }

  /**
   * Obtiene el texto legible para el evento
   */
  getEventoTexto(evento: string): string {
    const opcion = this.eventosOpciones.find((e) => e.value === evento);
    return opcion ? opcion.label : evento;
  }

  /**
   * Obtiene el texto legible para la acción
   */
  getAccionTexto(accion: string): string {
    const opcion = this.accionesOpciones.find((a) => a.value === accion);
    return opcion ? opcion.label : accion;
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
   * Formatea un objeto JSON para mostrar
   */
  formatearJSON(obj: Record<string, any>): string {
    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return 'Objeto inválido';
    }
  }

  /**
   * Obtiene el mensaje de error para un campo
   */
  getErrorMessage(fieldName: string): string {
    const field = this.reglaForm.get(fieldName);

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

    return 'Campo inválido';
  }

  /**
   * Marca todos los campos como tocados para mostrar errores
   */
  private marcarCamposInvalidos(): void {
    Object.keys(this.reglaForm.controls).forEach((key) => {
      const control = this.reglaForm.get(key);
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
  trackByRegla(index: number, regla: ReglaAutomatica): number {
    return regla.id;
  }

  /**
   * Función de tracking para pares clave-valor
   */
  trackByIndex(index: number): number {
    return index;
  }
}
