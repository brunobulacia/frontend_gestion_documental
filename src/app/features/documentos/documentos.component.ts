import { Component, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  ReactiveFormsModule,
  FormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { saveAs } from 'file-saver';

// Modelos
import {
  Documento,
  DocumentoVersion,
  TipoDocumento,
  Area,
  Usuario,
  MetadatoPersonalizado,
  PermisoDocumento,
  Rol,
  DocumentoCreate,
} from '../../models/documento.model';

// Servicios
import { DocumentsService } from '../../core/services/documents.service';
import { UsersService } from '../../core/services/users.service';

// Componentes
import { DocumentDetailModalComponent } from '../../shared/components/document-details/document-details.component';

// Lucide Angular Icons
import {
  LucideAngularModule,
  FileTextIcon,
  SearchIcon,
  FilterIcon,
  TagIcon,
  BuildingIcon,
  GitBranchIcon,
  CalendarIcon,
  UserIcon,
  SettingsIcon,
  EyeIcon,
  EditIcon,
  ShieldIcon,
  TagsIcon,
  TrashIcon,
  PlusIcon,
  XIcon,
  RefreshCwIcon,
  ClockIcon,
  UploadIcon,
  UploadCloudIcon,
  AlignLeftIcon,
  AlertCircleIcon,
  GlobeIcon,
  SaveIcon,
  LoaderIcon,
  FileIcon,
  DownloadIcon,
  MessageSquareIcon,
  HistoryIcon,
  UsersIcon,
  UserPlusIcon,
  ChevronDownIcon,
} from 'lucide-angular';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    DocumentDetailModalComponent,
    LucideAngularModule,
  ],
  selector: 'app-documents',
  templateUrl: './documentos.component.html',
  styleUrls: ['./documentos.component.css'],
})
export default class DocumentosComponent implements OnInit, OnDestroy {
  // Iconos de Lucide
  readonly FileTextIcon = FileTextIcon;
  readonly SearchIcon = SearchIcon;
  readonly FilterIcon = FilterIcon;
  readonly TagIcon = TagIcon;
  readonly BuildingIcon = BuildingIcon;
  readonly GitBranchIcon = GitBranchIcon;
  readonly CalendarIcon = CalendarIcon;
  readonly UserIcon = UserIcon;
  readonly SettingsIcon = SettingsIcon;
  readonly EyeIcon = EyeIcon;
  readonly EditIcon = EditIcon;
  readonly ShieldIcon = ShieldIcon;
  readonly TagsIcon = TagsIcon;
  readonly TrashIcon = TrashIcon;
  readonly PlusIcon = PlusIcon;
  readonly XIcon = XIcon;
  readonly RefreshCwIcon = RefreshCwIcon;
  readonly ClockIcon = ClockIcon;
  readonly UploadIcon = UploadIcon;
  readonly UploadCloudIcon = UploadCloudIcon;
  readonly AlignLeftIcon = AlignLeftIcon;
  readonly AlertCircleIcon = AlertCircleIcon;
  readonly GlobeIcon = GlobeIcon;
  readonly SaveIcon = SaveIcon;
  readonly LoaderIcon = LoaderIcon;
  readonly FileIcon = FileIcon;
  readonly DownloadIcon = DownloadIcon;
  readonly MessageSquareIcon = MessageSquareIcon;
  readonly HistoryIcon = HistoryIcon;
  readonly UsersIcon = UsersIcon;
  readonly UserPlusIcon = UserPlusIcon;
  readonly ChevronDownIcon = ChevronDownIcon;

  // Estados de carga
  cargando = true;
  isRefreshing = false;
  isSubmitting = false;

  // Archivos
  archivoSeleccionado: File | null = null;
  selectedFile: File | null = null;

  // Datos principales
  documentos: Documento[] = [];
  documentosFiltrados: Documento[] = [];
  tiposDocumento: TipoDocumento[] = [];
  areas: Area[] = [];
  usuarios: Usuario[] = [];
  roles: Rol[] = [];

  // Formularios
  documentoForm!: FormGroup;
  versionForm!: FormGroup;
  permisoForm!: FormGroup;

  // Estados de modales
  isModalOpen = false;
  isVersionModalOpen = false;
  isPermisosModalOpen = false;
  isMetadatosModalOpen = false;
  isDropdownOpen = false;

  // Estados de edición
  isEditing = false;
  currentDocumentoId: string | null = null;
  currentVersion: DocumentoVersion | null = null;

  // Filtros
  searchTerm = '';
  tipoFilter = 'all';
  areaFilter = 'all';
  estadoFilter = 'all';

  // Paginación
  currentPage = 1;
  itemsPerPage = 10;
  totalPages = 1;

  // Usuario actual
  currentUser: Usuario = {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    rol: 'Administrador',
  };

  // Modal de detalles
  selectedDocument: Documento = {
    id: '',
    titulo: '',
    descripcion: '',
    es_publico: false,
    versiones: [],
    metadatos: [],
    permisos: [],
    fecha_creacion: new Date(),
    fecha_modificacion: new Date(),
    creado_por: {
      id: 0,
      username: '',
      email: '',
    },
    tipo: null,
    area: null,
  };
  modalVisible = false;

  // Suscripciones
  private subscriptions: Subscription[] = [];

  constructor(
    private fb: FormBuilder,
    private documentosService: DocumentsService,
    private usersService: UsersService
  ) {
    this.initializeForms();
  }

  ngOnInit(): void {
    this.fetchData();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  /**
   * Inicializa los formularios reactivos
   */
  private initializeForms(): void {
    this.documentoForm = this.fb.group({
      titulo: ['', [Validators.required, Validators.minLength(3)]],
      descripcion: [''],
      tipo_id: ['', [Validators.required]],
      area_id: ['', [Validators.required]],
      es_publico: [false],
      metadatos: this.fb.array([]),
    });

    this.versionForm = this.fb.group({
      comentarios: [''],
    });

    this.permisoForm = this.fb.group({
      usuarios: this.fb.array([]),
    });
  }

  /**
   * Obtiene datos del servidor
   */
  private fetchData(): void {
    this.cargando = true;

    const docsSub = this.documentosService.getData().subscribe({
      next: (res) => {
        this.documentos = res.documentos || [];
        this.tiposDocumento = res.tipos_documento || [];
        this.areas = res.areas || [];
        this.aplicarFiltros();
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar documentos:', error);
        this.cargando = false;
      },
    });

    const usersSub = this.usersService.getUsuarios().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios || [];
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
      },
    });

    this.subscriptions.push(docsSub, usersSub);
  }

  /**
   * Actualiza los datos
   */
  refreshData(): void {
    this.isRefreshing = true;

    const refreshSub = this.documentosService.getData().subscribe({
      next: (res) => {
        this.documentos = res.documentos || [];
        this.tiposDocumento = res.tipos_documento || [];
        this.areas = res.areas || [];
        this.aplicarFiltros();
        this.isRefreshing = false;
      },
      error: (error) => {
        console.error('Error al actualizar datos:', error);
        this.isRefreshing = false;
      },
    });

    this.subscriptions.push(refreshSub);
  }

  // Getters para FormArrays
  get metadatosArray(): FormArray {
    return this.documentoForm.get('metadatos') as FormArray;
  }

  get usuariosPermisosArray(): FormArray {
    return this.permisoForm.get('usuarios') as FormArray;
  }

  // Métodos de gestión de metadatos
  agregarMetadato(clave = '', valor = '', id: number | null = null): void {
    this.metadatosArray.push(
      this.fb.group({
        id: [id],
        clave: [clave, [Validators.required, Validators.minLength(2)]],
        valor: [valor, [Validators.required, Validators.minLength(1)]],
      })
    );
  }

  eliminarMetadato(index: number): void {
    if (confirm('¿Está seguro de eliminar este metadato?')) {
      this.metadatosArray.removeAt(index);
    }
  }

  // Métodos de gestión de permisos
  agregarUsuarioPermiso(
    usuario: Usuario,
    puede_ver = true,
    puede_editar = false,
    puede_descargar = false,
    puede_eliminar = false
  ): void {
    const yaExiste = this.usuariosPermisosArray.controls.some(
      (control) => control.get('usuario_id')?.value === usuario.id
    );

    if (yaExiste) {
      alert('Este usuario ya tiene permisos asignados.');
      return;
    }

    this.usuariosPermisosArray.push(
      this.fb.group({
        usuario_id: [usuario.id, Validators.required],
        username: [usuario.username],
        puede_ver: [puede_ver],
        puede_editar: [puede_editar],
        puede_descargar: [puede_descargar],
        puede_eliminar: [puede_eliminar],
      })
    );

    this.isDropdownOpen = false;
  }

  eliminarUsuarioPermiso(index: number): void {
    if (confirm('¿Está seguro de eliminar los permisos de este usuario?')) {
      this.usuariosPermisosArray.removeAt(index);
    }
  }

  // Métodos de modal
  abrirModalCrear(): void {
    this.isEditing = false;
    this.currentDocumentoId = null;
    this.archivoSeleccionado = null;

    this.documentoForm.reset({
      es_publico: false,
    });

    this.limpiarMetadatos();
    this.isModalOpen = true;
  }

  abrirModalEditar(documento: Documento): void {
    this.isEditing = true;
    this.currentDocumentoId = documento.id;

    this.documentoForm.patchValue({
      titulo: documento.titulo,
      descripcion: documento.descripcion,
      tipo_id: documento.tipo?.id,
      area_id: documento.area?.id,
      es_publico: documento.es_publico,
    });

    this.limpiarMetadatos();
    if (documento.metadatos?.length) {
      documento.metadatos.forEach((metadato) => {
        this.agregarMetadato(metadato.clave, metadato.valor, metadato.id);
      });
    }

    this.isModalOpen = true;
  }

  abrirModalVersiones(documento: Documento): void {
    this.currentDocumentoId = documento.id;
    this.selectedFile = null;
    this.versionForm.reset();
    this.isVersionModalOpen = true;
  }

  abrirModalPermisos(documento: Documento): void {
    this.currentDocumentoId = documento.id;
    this.limpiarPermisos();

    if (documento.permisos?.length) {
      documento.permisos.forEach((permiso) => {
        this.agregarUsuarioPermiso(
          permiso.usuario,
          permiso.puede_ver,
          permiso.puede_editar,
          permiso.puede_descargar || false,
          permiso.puede_eliminar || false
        );
      });
    }

    this.isPermisosModalOpen = true;
  }

  abrirModalMetadatos(documento: Documento): void {
    this.currentDocumentoId = documento.id;
    this.limpiarMetadatos();

    if (documento.metadatos?.length) {
      documento.metadatos.forEach((metadato) => {
        this.agregarMetadato(metadato.clave, metadato.valor, metadato.id);
      });
    }

    this.isMetadatosModalOpen = true;
  }

  cerrarModal(): void {
    this.isModalOpen = false;
    this.isVersionModalOpen = false;
    this.isPermisosModalOpen = false;
    this.isMetadatosModalOpen = false;
    this.isDropdownOpen = false;
    this.isSubmitting = false;
  }

  // Métodos de limpieza
  private limpiarMetadatos(): void {
    while (this.metadatosArray.length) {
      this.metadatosArray.removeAt(0);
    }
  }

  private limpiarPermisos(): void {
    while (this.usuariosPermisosArray.length) {
      this.usuariosPermisosArray.removeAt(0);
    }
  }

  // Métodos de guardado
  guardarDocumento(): void {
    if (this.documentoForm.invalid) {
      this.markFormGroupTouched(this.documentoForm);
      return;
    }

    this.isSubmitting = true;
    const formValues = this.documentoForm.value;

    const tipoSeleccionado = this.tiposDocumento.find(
      (t) => t.id === parseInt(formValues.tipo_id)
    );
    const areaSeleccionada = this.areas.find(
      (a) => a.id === parseInt(formValues.area_id)
    );

    if (!tipoSeleccionado || !areaSeleccionada) {
      alert('Debe seleccionar un tipo y un área válidos');
      this.isSubmitting = false;
      return;
    }

    const metadatos: MetadatoPersonalizado[] = formValues.metadatos.map(
      (m: any) => ({
        id: m.id,
        documento_id: this.currentDocumentoId || '',
        clave: m.clave,
        valor: m.valor,
      })
    );

    if (this.isEditing && this.currentDocumentoId) {
      // Lógica de edición
      const index = this.documentos.findIndex(
        (doc) => doc.id === this.currentDocumentoId
      );
      if (index !== -1) {
        this.documentos[index] = {
          ...this.documentos[index],
          titulo: formValues.titulo,
          descripcion: formValues.descripcion,
          tipo: tipoSeleccionado,
          area: areaSeleccionada,
          es_publico: formValues.es_publico,
          fecha_modificacion: new Date(),
          metadatos: metadatos,
        };
        this.aplicarFiltros();
        this.isSubmitting = false;
        this.cerrarModal();
      }
    } else {
      // Lógica de creación
      if (!this.archivoSeleccionado) {
        alert('Debe seleccionar un archivo');
        this.isSubmitting = false;
        return;
      }

      const nuevoDocumento: DocumentoCreate = {
        titulo: formValues.titulo,
        descripcion: formValues.descripcion,
        tipo: tipoSeleccionado.id,
        area: areaSeleccionada.id,
        es_publico: formValues.es_publico,
        metadatos: metadatos,
        versiones: [],
      };

      const createSub = this.documentosService
        .addDoc(nuevoDocumento, this.archivoSeleccionado)
        .subscribe({
          next: () => {
            alert('Documento creado exitosamente');
            this.refreshData();
            this.cerrarModal();
          },
          error: (err) => {
            console.error('Error al crear documento:', err);
            alert(
              'Error al crear documento: ' + (err.error?.message || err.message)
            );
            this.isSubmitting = false;
          },
        });

      this.subscriptions.push(createSub);
    }
  }

  guardarVersion(): void {
    if (
      this.versionForm.invalid ||
      !this.currentDocumentoId ||
      !this.selectedFile
    ) {
      this.markFormGroupTouched(this.versionForm);
      return;
    }

    this.isSubmitting = true;

    const versionSub = this.documentosService
      .addNewVersion(this.currentDocumentoId, this.selectedFile)
      .subscribe({
        next: () => {
          alert('Nueva versión subida exitosamente');
          this.refreshData();
          this.cerrarModal();
        },
        error: (err) => {
          console.error('Error al subir versión:', err);
          alert(
            'Error al subir versión: ' + (err.error?.message || err.message)
          );
          this.isSubmitting = false;
        },
      });

    this.subscriptions.push(versionSub);
  }

  guardarPermisos(): void {
    if (!this.currentDocumentoId) {
      return;
    }

    this.isSubmitting = true;
    const formValues = this.permisoForm.value;
    const documento = this.documentos.find(
      (doc) => doc.id === this.currentDocumentoId
    );

    if (!documento) {
      this.isSubmitting = false;
      return;
    }

    try {
      const permisos: PermisoDocumento[] = formValues.usuarios.map(
        (p: any, index: number) => {
          const usuario = this.usuarios.find(
            (u) => u.id === parseInt(p.usuario_id)
          );
          if (!usuario) {
            throw new Error('Usuario no encontrado');
          }

          return {
            id: index + 1,
            documento_id: this.currentDocumentoId || '',
            usuario: usuario,
            puede_ver: p.puede_ver,
            puede_editar: p.puede_editar,
            puede_descargar: p.puede_descargar,
            puede_eliminar: p.puede_eliminar,
          };
        }
      );

      documento.permisos = permisos;
      alert('Permisos guardados exitosamente');
      this.cerrarModal();
    } catch (error) {
      console.error('Error al guardar permisos:', error);
      alert('Error al guardar permisos');
      this.isSubmitting = false;
    }
  }

  guardarMetadatos(): void {
    if (!this.currentDocumentoId) {
      return;
    }

    this.isSubmitting = true;
    const formValues = this.documentoForm.value;
    const documento = this.documentos.find(
      (doc) => doc.id === this.currentDocumentoId
    );

    if (!documento) {
      this.isSubmitting = false;
      return;
    }

    const metadatos: MetadatoPersonalizado[] = formValues.metadatos.map(
      (m: any) => ({
        id: m.id ?? null,
        documento_id: this.currentDocumentoId || '',
        clave: m.clave,
        valor: m.valor,
      })
    );

    const metadatosSub = this.documentosService
      .addMetadata(this.currentDocumentoId, metadatos)
      .subscribe({
        next: () => {
          documento.metadatos = metadatos;
          alert('Metadatos guardados exitosamente');
          this.cerrarModal();
        },
        error: (err) => {
          console.error('Error al guardar metadatos:', err);
          alert(
            'Error al guardar metadatos: ' + (err.error?.message || err.message)
          );
          this.isSubmitting = false;
        },
      });

    this.subscriptions.push(metadatosSub);
  }

  // Métodos de archivos
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validar tamaño (10MB máximo)
      if (file.size > 10 * 1024 * 1024) {
        alert('El archivo es demasiado grande. Máximo 10MB permitido.');
        input.value = '';
        return;
      }

      // Validar tipo
      const allowedTypes = ['.pdf', '.docx', '.xlsx', '.pptx', '.txt'];
      const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();

      if (!allowedTypes.includes(fileExtension)) {
        alert('Tipo de archivo no permitido. Use: PDF, DOCX, XLSX, PPTX, TXT');
        input.value = '';
        return;
      }

      this.archivoSeleccionado = file;
    }
  }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];

      // Validar tamaño (10MB máximo)
      if (file.size > 10 * 1024 * 1024) {
        alert('El archivo es demasiado grande. Máximo 10MB permitido.');
        input.value = '';
        return;
      }

      this.selectedFile = file;
    } else {
      this.selectedFile = null;
    }
  }

  // Métodos de filtros
  aplicarFiltros(): void {
    let filtrados = [...this.documentos];

    // Filtro de búsqueda
    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtrados = filtrados.filter(
        (doc) =>
          doc.titulo.toLowerCase().includes(term) ||
          doc.descripcion.toLowerCase().includes(term) ||
          doc.creado_por.username.toLowerCase().includes(term) ||
          (doc.metadatos &&
            doc.metadatos.some(
              (m) =>
                m.clave.toLowerCase().includes(term) ||
                m.valor.toLowerCase().includes(term)
            ))
      );
    }

    // Filtro por tipo
    if (this.tipoFilter !== 'all') {
      filtrados = filtrados.filter(
        (doc) => doc.tipo?.id === parseInt(this.tipoFilter)
      );
    }

    // Filtro por área
    if (this.areaFilter !== 'all') {
      filtrados = filtrados.filter(
        (doc) => doc.area?.id === parseInt(this.areaFilter)
      );
    }

    // Filtro por estado
    if (this.estadoFilter !== 'all') {
      if (this.estadoFilter === 'publico') {
        filtrados = filtrados.filter((doc) => doc.es_publico);
      } else if (this.estadoFilter === 'privado') {
        filtrados = filtrados.filter((doc) => !doc.es_publico);
      }
    }

    this.documentosFiltrados = filtrados;
    this.calcularPaginacion();
  }

  limpiarFiltros(): void {
    this.searchTerm = '';
    this.tipoFilter = 'all';
    this.areaFilter = 'all';
    this.estadoFilter = 'all';
    this.aplicarFiltros();
  }

  private calcularPaginacion(): void {
    this.totalPages = Math.ceil(
      this.documentosFiltrados.length / this.itemsPerPage
    );
    if (this.currentPage > this.totalPages) {
      this.currentPage = 1;
    }
  }

  // Métodos de utilidad
  eliminarDocumento(id: string): void {
    if (
      confirm(
        '¿Está seguro de que desea eliminar este documento? Esta acción no se puede deshacer.'
      )
    ) {
      this.documentosService.deleteDoc(id).subscribe({
        next: () => {
          console.log('Documento eliminado exitosamente');
        },
        error: (err) => {
          console.error('Error al eliminar documento:', err);
          alert(
            'Error al eliminar documento: ' +
              (err.error?.message || err.message)
          );
        },
      });
    }
  }

  tienePermiso(
    documento: Documento,
    permiso: 'ver' | 'editar' | 'descargar' | 'eliminar'
  ): boolean {
    // El creador y administradores tienen todos los permisos
    if (
      documento.creado_por.id === this.currentUser.id ||
      this.currentUser.rol === 'Administrador'
    ) {
      return true;
    }

    // Documentos públicos permiten ver
    if (documento.es_publico && permiso === 'ver') {
      return true;
    }

    // Verificar permisos específicos
    if (documento.permisos) {
      const permisoUsuario = documento.permisos.find(
        (p) => p.usuario.id === this.currentUser.id
      );
      if (permisoUsuario) {
        switch (permiso) {
          case 'ver':
            return permisoUsuario.puede_ver;
          case 'editar':
            return permisoUsuario.puede_editar;
          case 'descargar':
            return permisoUsuario.puede_descargar || false;
          case 'eliminar':
            return permisoUsuario.puede_eliminar || false;
        }
      }
    }

    return false;
  }

  obtenerUltimaVersion(documento: Documento): DocumentoVersion | null {
    if (!documento.versiones || documento.versiones.length === 0) {
      return null;
    }
    return documento.versiones.reduce((latest, current) =>
      current.version > latest.version ? current : latest
    );
  }

  tienePermisoDescargar(): boolean {
    if (!this.documentoActual) {
      return false;
    }
    return this.tienePermiso(this.documentoActual, 'descargar');
  }

  get documentoActual(): Documento | undefined {
    return this.documentos.find((d) => d.id === this.currentDocumentoId);
  }

  get documentoSinVersiones(): boolean {
    return !this.documentoActual?.versiones?.length;
  }

  descargarVersion(version: DocumentoVersion): void {
    const downloadSub = this.documentosService
      .downloadDoc(version.id)
      .subscribe({
        next: (blob: Blob) => {
          saveAs(blob, version.nombre_archivo || 'documento.pdf');
        },
        error: (err) => {
          console.error('Error al descargar archivo:', err);
          alert('Error al descargar el archivo');
        },
      });

    this.subscriptions.push(downloadSub);
  }

  // Métodos de dropdown
  abrirDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  // Métodos de modal de detalles
  verDetallesDocumento(documento: Documento): void {
    this.selectedDocument = documento;
    this.modalVisible = true;
  }

  closeModal(): void {
    this.modalVisible = false;
  }

  // Métodos de utilidad para formularios
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      } else if (control instanceof FormArray) {
        control.controls.forEach((arrayControl) => {
          if (arrayControl instanceof FormGroup) {
            this.markFormGroupTouched(arrayControl);
          }
        });
      }
    });
  }

  // Métodos de tracking para optimización de rendimiento
  trackByDocumentId(index: number, doc: Documento): string {
    return doc.id;
  }

  trackByTipoId(index: number, tipo: TipoDocumento): number {
    return tipo.id;
  }

  trackByAreaId(index: number, area: Area): number {
    return area.id;
  }

  trackByUserId(index: number, usuario: Usuario): number {
    return usuario.id;
  }

  trackByVersionId(index: number, version: DocumentoVersion): number {
    return version.id;
  }

  trackByMetadatoIndex(index: number): number {
    return index;
  }

  trackByPermisoIndex(index: number): number {
    return index;
  }
}
