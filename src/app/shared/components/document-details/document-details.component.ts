import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Documento, DocumentoVersion, MetadatoPersonalizado, PermisoDocumento } from '../../../models/documento.model';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-document-details',
  templateUrl: './document-details.component.html',
  styleUrls: ['./document-details.component.css']
})
export class DocumentDetailModalComponent {
  @Input() documento: Documento = {
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
  };
  @Input() visible: boolean = false;
  @Output() close = new EventEmitter<void>();

  activeTab: 'info' | 'versiones' | 'metadatos' | 'permisos' = 'info';

  // Determina si el usuario actual tiene permisos para editar
  puedeEditar: boolean = false;
  puedeDescargar: boolean = false;
  puedeEliminar: boolean = false;

  ngOnInit() {
    // Aquí se verificarían los permisos del usuario actual
    // Por ahora, asumimos que puede editar y descargar pero no eliminar
    this.puedeEditar = true;
    this.puedeDescargar = true;
    this.puedeEliminar = false;
  }

  closeModal() {
    this.visible = false;
    this.close.emit();
  }

  setActiveTab(tab: 'info' | 'versiones' | 'metadatos' | 'permisos') {
    this.activeTab = tab;
  }

  // Método para descargar una versión
  descargarVersion(version: DocumentoVersion) {
    // Aquí iría la lógica para descargar el archivo
    console.log('Descargando versión:', version);

    // Simulación de descarga
    const link = document.createElement('a');
    link.href = version.archivo;
    link.download = version.nombre_archivo || `documento_v${version.version}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Método para ver una versión
  verVersion(version: DocumentoVersion) {
    // Aquí iría la lógica para visualizar el archivo
    console.log('Viendo versión:', version);

    // Simulación de apertura en nueva pestaña
    window.open(version.archivo, '_blank');
  }

  // Método para editar el documento
  editarDocumento() {
    // Aquí iría la lógica para editar el documento
    console.log('Editando documento:', this.documento);
  }

  // Método para eliminar el documento
  eliminarDocumento() {
    if (confirm('¿Está seguro de que desea eliminar este documento?')) {
      // Aquí iría la lógica para eliminar el documento
      console.log('Eliminando documento:', this.documento);
      this.closeModal();
    }
  }

  // Formatear fecha
  formatearFecha(fecha: Date): string {
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}