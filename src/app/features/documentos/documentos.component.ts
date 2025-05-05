import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray, ReactiveFormsModule, FormsModule } from '@angular/forms';
import {
  Documento,
  DocumentoVersion,
  TipoDocumento,
  Area,
  Usuario,
  MetadatoPersonalizado,
  PermisoDocumento,
  Rol,
  DocumentoCreate
} from '../../models/documento.model';
import { CommonModule } from '@angular/common';
import { DocumentsService } from '../../core/services/documents.service';
import { UsersService } from '../../core/services/users.service';
import { saveAs } from 'file-saver';
import { DocumentDetailModalComponent } from '../../shared/components/document-details/document-details.component';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, DocumentDetailModalComponent],
  selector: 'app-documents',
  templateUrl: './documentos.component.html',
  styleUrls: ['./documentos.component.css']
})
export default class DocumentosComponent implements OnInit {
  archivoSeleccionado: File | null = null;
  documentos: Documento[] = [];
  documentosFiltrados: Documento[] = [];
  documentoForm: FormGroup;
  versionForm: FormGroup;
  permisoForm: FormGroup;

  isModalOpen = false;
  isVersionModalOpen = false;
  isPermisosModalOpen = false;
  isMetadatosModalOpen = false;

  isDropdownOpen = false;

  isEditing = false;
  currentDocumentoId: string | null = null;
  currentVersion: DocumentoVersion | null = null;

  searchTerm = '';
  tipoFilter = 'all';
  areaFilter = 'all';

  tiposDocumento: TipoDocumento[] = [];
  areas: Area[] = [];
  usuarios: Usuario[] = [];
  roles: Rol[] = [];

  // Esto ya no sirve de nada xd
  currentUser: Usuario = {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    rol: 'Administrador'
  };

  selectedFile: File | null = null;

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
      email: ''
    },
    tipo: null,
    area: null
  };;
  modalVisible: boolean = false;

  cargando: boolean = true;
  constructor(private fb: FormBuilder, private documentosService: DocumentsService, private usersService: UsersService) {
    this.documentoForm = this.fb.group({
      titulo: ['', [Validators.required]],
      descripcion: [''],
      tipo_id: ['', [Validators.required]],
      area_id: ['', [Validators.required]],
      es_publico: [false],
      metadatos: this.fb.array([])
    });

    this.versionForm = this.fb.group({
      comentarios: ['']
    });

    this.permisoForm = this.fb.group({
      usuarios: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.fetchData();
    this.aplicarFiltros();
  }

  // Getters para los FormArrays
  get metadatosArray() {
    return this.documentoForm.get('metadatos') as FormArray;
  }

  get usuariosPermisosArray() {
    console.log(this.permisoForm.get('usuarios'));
    return this.permisoForm.get('usuarios') as FormArray;
  }

  // TODO Agregar un nuevo campo de metadato
  agregarMetadato(clave: string = '', valor: string = '') {
    this.metadatosArray.push(
      this.fb.group({
        clave: [clave, Validators.required],
        valor: [valor, Validators.required]
      })
    );
  }

  // TODO Eliminar un campo de metadato
  eliminarMetadato(index: number) {
    this.metadatosArray.removeAt(index);
  }

  // TODO Agregar un usuario a los permisos
  agregarUsuarioPermiso(usuario: Usuario, puede_ver: boolean = true, puede_editar: boolean = false,
    puede_descargar: boolean = false, puede_eliminar: boolean = false) {
  
    const yaExiste = this.usuariosPermisosArray.controls.some(control =>
      control.get('usuario_id')?.value === usuario.id
    );
  
    if (yaExiste) {
      return; // Evita duplicados
    }
  
    this.usuariosPermisosArray.push(
      this.fb.group({
        usuario_id: [usuario.id, Validators.required],
        username: [usuario.username], // 👈 Agregado
        puede_ver: [puede_ver],
        puede_editar: [puede_editar],
        puede_descargar: [puede_descargar],
        puede_eliminar: [puede_eliminar]
      })
    );
  }
  

  // TODO Eliminar un usuario de los permisos
  eliminarUsuarioPermiso(index: number) {
    this.usuariosPermisosArray.removeAt(index);
  }

  // Datos de ejemplo para probar xd

  abrirModalCrear(): void {
    this.isEditing = false;
    this.currentDocumentoId = null;
    this.documentoForm.reset({
      es_publico: false
    });

    while (this.metadatosArray.length) {
      this.metadatosArray.removeAt(0);
    }

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
      es_publico: documento.es_publico
    });

    while (this.metadatosArray.length) {
      this.metadatosArray.removeAt(0);
    }

    if (documento.metadatos && documento.metadatos.length > 0) {
      documento.metadatos.forEach(metadato => {
        this.agregarMetadato(metadato.clave, metadato.valor);
      });
    }

    this.isModalOpen = true;
  }

  abrirModalVersiones(documento: Documento): void {
    this.currentDocumentoId = documento.id;
    this.versionForm.reset();
    this.isVersionModalOpen = true;
  }

  abrirModalPermisos(documento: Documento): void {
    this.currentDocumentoId = documento.id;

    while (this.usuariosPermisosArray.length) {
      this.usuariosPermisosArray.removeAt(0);
    }

    // Agregar permisos existentes
    if (documento.permisos && documento.permisos.length > 0) {
      documento.permisos.forEach(permiso => {
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

    // Limpiar metadatos existentes
    while (this.metadatosArray.length) {
      this.metadatosArray.removeAt(0);
    }

    // Agregar metadatos existentes
    if (documento.metadatos && documento.metadatos.length > 0) {
      documento.metadatos.forEach(metadato => {
        this.agregarMetadato(metadato.clave, metadato.valor);
      });
    }

    this.isMetadatosModalOpen = true;
  }

  cerrarModal(): void {
    this.isModalOpen = false;
    this.isVersionModalOpen = false;
    this.isPermisosModalOpen = false;
    this.isMetadatosModalOpen = false;
  }

  guardarDocumento(): void {
    if (this.documentoForm.invalid) {
      return;
    }

    const formValues = this.documentoForm.value;

    // Obtener tipo y área seleccionados
    const tipoSeleccionado = this.tiposDocumento.find(t => t.id === parseInt(formValues.tipo_id));
    const areaSeleccionada = this.areas.find(a => a.id === parseInt(formValues.area_id));

    if (!tipoSeleccionado || !areaSeleccionada) {
      alert('Debe seleccionar un tipo y un área válidos');
      return;
    }

    const metadatos: MetadatoPersonalizado[] = formValues.metadatos.map((m: any, index: number) => ({
      id: index + 1,
      documento_id: this.currentDocumentoId || '',
      clave: m.clave,
      valor: m.valor
    }));

    if (this.isEditing && this.currentDocumentoId) {
      const index = this.documentos.findIndex(doc => doc.id === this.currentDocumentoId);
      if (index !== -1) {
        this.documentos[index] = {
          ...this.documentos[index],
          titulo: formValues.titulo,
          descripcion: formValues.descripcion,
          tipo: tipoSeleccionado,
          area: areaSeleccionada,
          es_publico: formValues.es_publico,
          fecha_modificacion: new Date(),
          metadatos: metadatos
        };
      }
    } else {
      const nuevoDocumento: DocumentoCreate = {
        titulo: formValues.titulo,
        descripcion: formValues.descripcion,
        tipo: tipoSeleccionado.id,
        area: areaSeleccionada.id,
        es_publico: formValues.es_publico,
        metadatos: metadatos,
        versiones: []
      };
      if (this.archivoSeleccionado) {
        this.documentosService.addDoc(nuevoDocumento, this.archivoSeleccionado).subscribe({
          next: () => {
            alert('Documento creado conxito');
            window.location.reload();
            this.cerrarModal();
            //this.documentos.unshift(nuevoDocumento);
          },
          error: (err) => {
            alert('Error al crear documento');
            console.error('Error al crear documento:', err);
          }
        });;
      }
    }

    this.aplicarFiltros();
    this.cerrarModal();
  }

  fetchData() {
    this.documentosService.getData().subscribe({
      next: (res) => {
        console.log(res);
        this.documentos = res.documentos;
        this.tiposDocumento = res.tipos_documento;
        this.areas = res.areas;
        this.aplicarFiltros();
        this.cargando = false;
      }
    })
    this.usersService.getUsuarios().subscribe(res => {
      this.usuarios = res;
    })
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.archivoSeleccionado = input.files[0];
    }
  }


  guardarVersion(): void {
    if (this.versionForm.invalid || !this.currentDocumentoId || !this.selectedFile) {
      console.log("error");
      console.log(this.versionForm.value);
      return;
    }
    console.log(this.versionForm.value);
    const formValues = this.versionForm.value;
    this.documentosService.addNewVersion(this.currentDocumentoId, this.selectedFile).subscribe({
      next: (res) => {
        console.log('Documento subido', res);
        this.cerrarModal();
      },
      error: (err) => {
        console.error('Error al subir el documento', err);
      }
    });
  }


  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      console.log('Archivo seleccionado:', this.selectedFile.name); // <- para verificar
    } else {
      this.selectedFile = null;
    }
  }


  // TODO Guardar permisos
  guardarPermisos(): void {
    if (!this.currentDocumentoId) {
      return;
    }

    const formValues = this.permisoForm.value;
    const documento = this.documentos.find(doc => doc.id === this.currentDocumentoId);

    if (!documento) {
      return;
    }

    // Preparar permisos
    const permisos: PermisoDocumento[] = formValues.usuarios.map((p: any, index: number) => {
      const usuario = this.usuarios.find(u => u.id === parseInt(p.usuario_id));
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
        puede_eliminar: p.puede_eliminar
      };
    });

    documento.permisos = permisos;

    this.cerrarModal();
  }

  // TODO Guardar metadatos
  guardarMetadatos(): void {
    if (!this.currentDocumentoId) {
      return;
    }

    const formValues = this.documentoForm.value;
    const documento = this.documentos.find(doc => doc.id === this.currentDocumentoId);

    if (!documento) {
      return;
    }

    // Preparar metadatos
    const metadatos: MetadatoPersonalizado[] = formValues.metadatos.map((m: any, index: number) => ({
      id: index + 1,
      documento_id: this.currentDocumentoId || '',
      clave: m.clave,
      valor: m.valor
    }));

    documento.metadatos = metadatos;

    this.cerrarModal();
  }

  // TODO Eliminar documento
  eliminarDocumento(id: string): void {
    if (confirm('¿Estás seguro de que deseas eliminar este documento?')) {
      this.documentos = this.documentos.filter(doc => doc.id !== id);
      this.aplicarFiltros();
    }
  }

  aplicarFiltros(): void {
    let filtrados = [...this.documentos];

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtrados = filtrados.filter(doc =>
        doc.titulo.toLowerCase().includes(term) ||
        doc.descripcion.toLowerCase().includes(term) ||
        (doc.metadatos && doc.metadatos.some(m => m.valor.toLowerCase().includes(term)))
      );
    }

    if (this.tipoFilter !== 'all') {
      filtrados = filtrados.filter(doc => doc.tipo?.id === parseInt(this.tipoFilter));
    }

    if (this.areaFilter !== 'all') {
      filtrados = filtrados.filter(doc => doc.area?.id === parseInt(this.areaFilter));
    }

    this.documentosFiltrados = filtrados;
  }

  // TODO Implementar permisos
  tienePermiso(documento: Documento, permiso: 'ver' | 'editar' | 'descargar' | 'eliminar'): boolean {
    if (documento.creado_por.id === this.currentUser.id || this.currentUser.rol === 'Administrador') {
      return true;
    }

    if (documento.es_publico && permiso === 'ver') {
      return true;
    }

    if (documento.permisos) {
      const permisoUsuario = documento.permisos.find(p => p.usuario.id === this.currentUser.id);
      if (permisoUsuario) {
        switch (permiso) {
          case 'ver': return permisoUsuario.puede_ver;
          case 'editar': return permisoUsuario.puede_editar;
          case 'descargar': return permisoUsuario.puede_descargar || false;
          case 'eliminar': return permisoUsuario.puede_eliminar || false;
        }
      }
    }

    return false;
  }

  // Obtener la última versión de un documento
  obtenerUltimaVersion(documento: Documento): DocumentoVersion | null {
    if (!documento.versiones || documento.versiones.length === 0) {
      return null;
    }
    return documento.versiones[0];
  }

  descargarVersion(version: DocumentoVersion): void {
    this.documentosService.downloadDoc(version.id).subscribe({
      next: (blob: Blob) => {
        saveAs(blob, version.nombre_archivo);
      }, error: (err) => {
        console.error('Error al descargar archivo:', err);
      }
    })
  }

  get documentoActual(): Documento | undefined {
    return this.documentos.find(d => d.id === this.currentDocumentoId);
  }

  get documentoSinVersiones(): boolean {
    return this.documentoActual?.versiones?.length === 0;
  }

  getUsuarios(): Usuario[] {
    return this.usuarios;
  }

  tienePermisoDescargar(): boolean {
    // TODO
    if (!this.documentoActual) {
      return false;
    }
    return this.tienePermiso(this.documentoActual, 'descargar');
  }

  abrirDropdown() {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  verDetallesDocumento(documento: Documento) {
    this.selectedDocument = documento;
    this.modalVisible = true;
  }

  closeModal() {
    this.modalVisible = false;
  }
}