import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Documento,
  DocumentoVersion,
  MetadatoPersonalizado,
  PermisoDocumento,
} from '../../../models/documento.model';

// Lucide Angular Icons
import {
  LucideAngularModule,
  FileTextIcon,
  XIcon,
  InfoIcon,
  GitBranchIcon,
  TagsIcon,
  ShieldIcon,
  AlignLeftIcon,
  TagIcon,
  BuildingIcon,
  GlobeIcon,
  CalendarIcon,
  PlusIcon,
  EditIcon,
  UserIcon,
  ClockIcon,
  FileIcon,
  EyeIcon,
  DownloadIcon,
  MessageSquareIcon,
  HistoryIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrashIcon,
} from 'lucide-angular';

@Component({
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  selector: 'app-document-details',
  templateUrl: './document-details.component.html',
  styleUrls: ['./document-details.component.css'],
})
export class DocumentDetailModalComponent implements OnInit {
  // Iconos de Lucide
  readonly FileTextIcon = FileTextIcon;
  readonly XIcon = XIcon;
  readonly InfoIcon = InfoIcon;
  readonly GitBranchIcon = GitBranchIcon;
  readonly TagsIcon = TagsIcon;
  readonly ShieldIcon = ShieldIcon;
  readonly AlignLeftIcon = AlignLeftIcon;
  readonly TagIcon = TagIcon;
  readonly BuildingIcon = BuildingIcon;
  readonly GlobeIcon = GlobeIcon;
  readonly CalendarIcon = CalendarIcon;
  readonly PlusIcon = PlusIcon;
  readonly EditIcon = EditIcon;
  readonly UserIcon = UserIcon;
  readonly ClockIcon = ClockIcon;
  readonly FileIcon = FileIcon;
  readonly EyeIcon = EyeIcon;
  readonly DownloadIcon = DownloadIcon;
  readonly MessageSquareIcon = MessageSquareIcon;
  readonly HistoryIcon = HistoryIcon;
  readonly CheckCircleIcon = CheckCircleIcon;
  readonly XCircleIcon = XCircleIcon;
  readonly TrashIcon = TrashIcon;

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
      email: '',
    },
    tipo: null,
    area: null,
  };

  @Input() visible: boolean = false;
  @Output() close = new EventEmitter<void>();

  // Estado de las pestañas
  activeTab: 'info' | 'versiones' | 'metadatos' | 'permisos' = 'info';

  // Permisos del usuario actual
  puedeEditar: boolean = false;
  puedeDescargar: boolean = false;
  puedeEliminar: boolean = false;

  ngOnInit(): void {
    this.verificarPermisos();
  }

  /**
   * Verifica los permisos del usuario actual
   */
  private verificarPermisos(): void {
    // Aquí se verificarían los permisos del usuario actual
    // Por ahora, asumimos que puede editar y descargar pero no eliminar
    this.puedeEditar = true;
    this.puedeDescargar = true;
    this.puedeEliminar = false;

    // En una implementación real, esto vendría del servicio de autenticación
    // const currentUser = this.authService.getCurrentUser();
    // this.puedeEditar = this.permissionService.canEdit(this.documento, currentUser);
    // this.puedeDescargar = this.permissionService.canDownload(this.documento, currentUser);
    // this.puedeEliminar = this.permissionService.canDelete(this.documento, currentUser);
  }

  /**
   * Cierra la modal
   */
  closeModal(): void {
    this.visible = false;
    this.close.emit();
  }

  /**
   * Cambia la pestaña activa
   */
  setActiveTab(tab: 'info' | 'versiones' | 'metadatos' | 'permisos'): void {
    this.activeTab = tab;
  }

  /**
   * Descarga una versión específica del documento
   */
  descargarVersion(version: DocumentoVersion): void {
    try {
      console.log('Descargando versión:', version);

      // En una implementación real, esto haría una llamada al servicio
      // this.documentService.downloadVersion(version.id).subscribe({
      //   next: (blob) => {
      //     const url = window.URL.createObjectURL(blob);
      //     const link = document.createElement('a');
      //     link.href = url;
      //     link.download = version.nombre_archivo || `documento_v${version.version}.pdf`;
      //     document.body.appendChild(link);
      //     link.click();
      //     document.body.removeChild(link);
      //     window.URL.revokeObjectURL(url);
      //   },
      //   error: (error) => {
      //     console.error('Error al descargar:', error);
      //     // Mostrar notificación de error
      //   }
      // });

      // Simulación de descarga para desarrollo
      const link = document.createElement('a');
      link.href = version.archivo || '#';
      link.download =
        version.nombre_archivo || `documento_v${version.version}.pdf`;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error al descargar versión:', error);
      // En una implementación real, mostrarías una notificación de error
      alert('Error al descargar el archivo. Por favor, inténtelo de nuevo.');
    }
  }

  /**
   * Visualiza una versión específica del documento
   */
  verVersion(version: DocumentoVersion): void {
    try {
      console.log('Viendo versión:', version);

      // En una implementación real, esto abriría el visor de documentos
      // this.documentViewerService.openVersion(version.id);

      // Simulación para desarrollo
      if (version.archivo) {
        window.open(version.archivo, '_blank', 'noopener,noreferrer');
      } else {
        console.warn('No hay URL de archivo disponible para esta versión');
        alert('No se puede visualizar esta versión del documento.');
      }
    } catch (error) {
      console.error('Error al ver versión:', error);
      alert('Error al abrir el documento. Por favor, inténtelo de nuevo.');
    }
  }

  /**
   * Abre el modal de edición del documento
   */
  editarDocumento(): void {
    console.log('Editando documento:', this.documento);

    // En una implementación real, esto emitiría un evento o navegaría a la página de edición
    // this.router.navigate(['/documentos/editar', this.documento.id]);
    // o
    // this.editDocument.emit(this.documento);

    // Por ahora, cerramos la modal y mostramos un mensaje
    alert('Funcionalidad de edición no implementada en esta demo.');
    this.closeModal();
  }

  /**
   * Elimina el documento actual
   */
  eliminarDocumento(): void {
    const confirmMessage = `¿Está seguro de que desea eliminar el documento "${this.documento.titulo}"?\n\nEsta acción no se puede deshacer.`;

    if (confirm(confirmMessage)) {
      console.log('Eliminando documento:', this.documento);

      // En una implementación real, esto haría una llamada al servicio
      // this.documentService.deleteDocument(this.documento.id).subscribe({
      //   next: () => {
      //     this.notificationService.showSuccess('Documento eliminado exitosamente');
      //     this.documentDeleted.emit(this.documento.id);
      //     this.closeModal();
      //   },
      //   error: (error) => {
      //     console.error('Error al eliminar documento:', error);
      //     this.notificationService.showError('Error al eliminar el documento');
      //   }
      // });

      // Simulación para desarrollo
      alert('Documento eliminado exitosamente (simulación).');
      this.closeModal();
    }
  }

  /**
   * Formatea una fecha para mostrarla en la interfaz
   */
  formatearFecha(fecha: Date | string): string {
    try {
      const date = typeof fecha === 'string' ? new Date(fecha) : fecha;

      if (isNaN(date.getTime())) {
        return 'Fecha inválida';
      }

      return date.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (error) {
      console.error('Error al formatear fecha:', error);
      return 'Fecha no disponible';
    }
  }

  /**
   * Función de tracking para optimizar el rendimiento de *ngFor
   */
  trackByVersionId(index: number, version: DocumentoVersion): number {
    return version.id;
  }

  /**
   * Función de tracking para metadatos
   */
  trackByMetadatoId(
    index: number,
    metadato: MetadatoPersonalizado
  ): number | string {
    return metadato.id || index;
  }

  /**
   * Función de tracking para permisos
   */
  trackByPermisoId(index: number, permiso: PermisoDocumento): number | string {
    return permiso.id || index;
  }

  /**
   * Maneja el evento de teclado para cerrar la modal con Escape
   */
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      this.closeModal();
    }
  }

  /**
   * Previene el cierre de la modal al hacer clic en el contenido
   */
  onModalContentClick(event: Event): void {
    event.stopPropagation();
  }
}
