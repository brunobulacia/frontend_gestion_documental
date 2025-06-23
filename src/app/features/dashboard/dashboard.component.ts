import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Subscription, interval } from 'rxjs';

// Modelos
import {
  Documento,
  DocumentoVersion,
  TipoDocumento,
  Area,
  Usuario,
} from '../../models/documento.model';

// Servicios
import { DocumentsService } from '../../core/services/documents.service';

// Lucide Angular Icons
import {
  LucideAngularModule,
  FileTextIcon,
  GitBranchIcon,
  UnlockIcon,
  LockIcon,
  ClockIcon,
  ArrowRightIcon,
  CalendarIcon,
  EyeIcon,
  EditIcon,
  BarChart3Icon,
  ActivityIcon,
  PieChartIcon,
  Share2Icon,
  UserIcon,
  UploadIcon,
  SearchIcon,
  ShieldIcon,
  PlusIcon,
  RefreshCwIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  FileIcon,
  FolderIcon,
  ImageIcon,
  VideoIcon,
  MusicIcon,
  ArchiveIcon,
} from 'lucide-angular';

// Interfaces
interface DocumentoReciente extends Documento {
  diasDesdeModificacion: number;
}

interface EstadisticaDocumento {
  nombre: string;
  valor: number;
  porcentaje: number;
  color: string;
}

interface ActividadReciente {
  id: string;
  tipo: 'creacion' | 'version' | 'compartido' | 'modificacion';
  titulo: string;
  usuario: Usuario;
  fecha: Date;
  descripcion: string;
  color: string;
}

@Component({
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export default class DashboardComponent implements OnInit, OnDestroy {
  // Iconos de Lucide
  readonly FileTextIcon = FileTextIcon;
  readonly GitBranchIcon = GitBranchIcon;
  readonly UnlockIcon = UnlockIcon;
  readonly LockIcon = LockIcon;
  readonly ClockIcon = ClockIcon;
  readonly ArrowRightIcon = ArrowRightIcon;
  readonly CalendarIcon = CalendarIcon;
  readonly EyeIcon = EyeIcon;
  readonly EditIcon = EditIcon;
  readonly BarChart3Icon = BarChart3Icon;
  readonly ActivityIcon = ActivityIcon;
  readonly PieChartIcon = PieChartIcon;
  readonly Share2Icon = Share2Icon;
  readonly UserIcon = UserIcon;
  readonly UploadIcon = UploadIcon;
  readonly SearchIcon = SearchIcon;
  readonly ShieldIcon = ShieldIcon;
  readonly PlusIcon = PlusIcon;
  readonly RefreshCwIcon = RefreshCwIcon;
  readonly TrendingUpIcon = TrendingUpIcon;
  readonly TrendingDownIcon = TrendingDownIcon;
  readonly FileIcon = FileIcon;
  readonly FolderIcon = FolderIcon;
  readonly ImageIcon = ImageIcon;
  readonly VideoIcon = VideoIcon;
  readonly MusicIcon = MusicIcon;
  readonly ArchiveIcon = ArchiveIcon;

  // Estado de carga
  isLoading = true;

  // Datos de usuario actual
  currentUser: Usuario = {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    rol: 'Administrador',
  };

  // Estadísticas generales
  totalDocumentos = 0;
  documentosPublicos = 0;
  documentosPrivados = 0;
  totalVersiones = 0;

  // Tendencias (simuladas)
  documentosTrend = 12;
  versionesTrend = 8;
  publicosTrend = 5;
  privadosTrend = -2;

  // Datos principales
  documentosRecientes: DocumentoReciente[] = [];
  documentosPorTipo: EstadisticaDocumento[] = [];
  documentosPorArea: EstadisticaDocumento[] = [];
  actividadReciente: ActividadReciente[] = [];
  documentosCompartidos: Documento[] = [];

  // Datos base
  tiposDocumento: TipoDocumento[] = [];
  areas: Area[] = [];
  documentos: Documento[] = [];
  usuarios: Usuario[] = [];

  // Colores para gráficos
  private readonly colores: string[] = [
    'var(--color-secondary)',
    'var(--color-success)',
    'var(--color-warning)',
    'var(--color-info)',
    'var(--color-error)',
    'var(--color-primary)',
  ];

  // Suscripciones
  private subscriptions: Subscription[] = [];

  constructor(private router: Router, private docsService: DocumentsService) {}

  ngOnInit(): void {
    this.initializeComponent();
    this.setupAutoRefresh();
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  /**
   * Inicializa el componente
   */
  private initializeComponent(): void {
    this.cargarDatosEjemplo();
    this.fetchData();
  }

  /**
   * Configura la actualización automática cada 5 minutos
   */
  private setupAutoRefresh(): void {
    const autoRefresh = interval(3) //
      .subscribe(() => {
        this.refreshData();
      });

    this.subscriptions.push(autoRefresh);
  }

  /**
   * Actualiza los datos
   */
  refreshData(): void {
    this.isLoading = false;
    this.fetchData();
  }

  /**
   * Obtiene datos del servicio
   */
  private fetchData(): void {
    const dataSub = this.docsService.getData().subscribe({
      next: (res) => {
        this.documentos = res.documentos || [];
        this.tiposDocumento = res.tipos_documento || [];
        this.areas = res.areas || [];
        this.procesarDatos();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar datos:', error);
        this.procesarDatos(); // Usar datos de ejemplo
        this.isLoading = false;
      },
    });

    this.subscriptions.push(dataSub);
  }

  /**
   * Procesa todos los datos
   */
  private procesarDatos(): void {
    this.calcularEstadisticas();
    this.prepararDocumentosRecientes();
    this.prepararDocumentosPorTipo();
    this.prepararDocumentosPorArea();
    this.prepararActividadReciente();
    this.prepararDocumentosCompartidos();
  }

  /**
   * Carga datos de ejemplo para desarrollo
   */
  private cargarDatosEjemplo(): void {
    // Tipos de documento
    this.tiposDocumento = [
      { id: 1, nombre: 'Contrato' },
      { id: 2, nombre: 'Factura' },
      { id: 3, nombre: 'Informe' },
      { id: 4, nombre: 'Solicitud' },
      { id: 5, nombre: 'Manual' },
      { id: 6, nombre: 'Presentación' },
    ];

    // Áreas
    this.areas = [
      { id: 1, nombre: 'Recursos Humanos' },
      { id: 2, nombre: 'Finanzas' },
      { id: 3, nombre: 'Operaciones' },
      { id: 4, nombre: 'Marketing' },
      { id: 5, nombre: 'Legal' },
      { id: 6, nombre: 'Tecnología' },
    ];

    // Usuarios
    this.usuarios = [
      {
        id: 1,
        username: 'admin',
        email: 'admin@example.com',
        rol: 'Administrador',
      },
      {
        id: 2,
        username: 'juan.perez',
        email: 'juan@example.com',
        rol: 'Editor',
      },
      {
        id: 3,
        username: 'maria.garcia',
        email: 'maria@example.com',
        rol: 'Lector',
      },
      {
        id: 4,
        username: 'carlos.lopez',
        email: 'carlos@example.com',
        rol: 'Editor',
      },
      {
        id: 5,
        username: 'ana.martinez',
        email: 'ana@example.com',
        rol: 'Lector',
      },
    ];

    // Documentos de ejemplo (datos más realistas)
    this.documentos = this.generarDocumentosEjemplo();
  }

  /**
   * Genera documentos de ejemplo
   */
  private generarDocumentosEjemplo(): Documento[] {
    const documentos: Documento[] = [];
    const titulos = [
      'Contrato de servicios profesionales',
      'Factura mensual - Enero 2024',
      'Informe trimestral Q1 2024',
      'Manual de procedimientos actualizado',
      'Solicitud de vacaciones - Marzo',
      'Plan estratégico 2024-2025',
      'Política de seguridad informática',
      'Presupuesto anual 2024',
      'Evaluación de desempeño',
      'Propuesta comercial cliente ABC',
    ];

    for (let i = 0; i < titulos.length; i++) {
      const fechaCreacion = new Date();
      fechaCreacion.setDate(
        fechaCreacion.getDate() - Math.floor(Math.random() * 30)
      );

      const fechaModificacion = new Date(fechaCreacion);
      fechaModificacion.setDate(
        fechaModificacion.getDate() + Math.floor(Math.random() * 10)
      );

      documentos.push({
        id: `doc-${i + 1}`,
        titulo: titulos[i],
        descripcion: `Descripción del documento: ${titulos[i]}`,
        tipo: this.tiposDocumento[
          Math.floor(Math.random() * this.tiposDocumento.length)
        ],
        area: this.areas[Math.floor(Math.random() * this.areas.length)],
        creado_por:
          this.usuarios[Math.floor(Math.random() * this.usuarios.length)],
        fecha_creacion: fechaCreacion,
        fecha_modificacion: fechaModificacion,
        es_publico: Math.random() > 0.5,
        versiones: this.generarVersionesEjemplo(i + 1),
      });
    }

    return documentos;
  }

  /**
   * Genera versiones de ejemplo para un documento
   */
  private generarVersionesEjemplo(docIndex: number): DocumentoVersion[] {
    const numVersiones = Math.floor(Math.random() * 3) + 1;
    const versiones: DocumentoVersion[] = [];

    for (let v = 1; v <= numVersiones; v++) {
      const fechaSubida = new Date();
      fechaSubida.setDate(fechaSubida.getDate() - (numVersiones - v) * 5);

      versiones.push({
        id: docIndex * 10 + v,
        documento_id: `doc-${docIndex}`,
        archivo: `/documentos/doc_${docIndex}_v${v}.pdf`,
        version: v,
        subido_por:
          this.usuarios[Math.floor(Math.random() * this.usuarios.length)],
        fecha_subida: fechaSubida,
        comentarios:
          v === 1 ? 'Versión inicial' : `Versión ${v} - Revisiones aplicadas`,
        nombre_archivo: `documento_${docIndex}_v${v}.pdf`,
      });
    }

    return versiones;
  }

  /**
   * Calcula estadísticas generales
   */
  private calcularEstadisticas(): void {
    this.totalDocumentos = this.documentos.length;
    this.documentosPublicos = this.documentos.filter(
      (doc) => doc.es_publico
    ).length;
    this.documentosPrivados = this.totalDocumentos - this.documentosPublicos;
    this.totalVersiones = this.documentos.reduce((total, doc) => {
      return total + (doc.versiones?.length || 0);
    }, 0);
  }

  /**
   * Prepara documentos recientes
   */
  private prepararDocumentosRecientes(): void {
    const documentosOrdenados = [...this.documentos].sort(
      (a, b) => b.fecha_modificacion.getTime() - a.fecha_modificacion.getTime()
    );

    const recientes = documentosOrdenados.slice(0, 5);
    const hoy = new Date();

    this.documentosRecientes = recientes.map((doc) => ({
      ...doc,
      diasDesdeModificacion: Math.floor(
        (hoy.getTime() - doc.fecha_modificacion.getTime()) /
          (1000 * 60 * 60 * 24)
      ),
    }));
  }

  /**
   * Prepara estadísticas de documentos por tipo
   */
  private prepararDocumentosPorTipo(): void {
    const conteo: { [key: string]: number } = {};

    this.documentos.forEach((doc) => {
      if (doc.tipo) {
        const tipoNombre = doc.tipo.nombre;
        conteo[tipoNombre] = (conteo[tipoNombre] || 0) + 1;
      }
    });

    const items = Object.keys(conteo).map((nombre, index) => ({
      nombre,
      valor: conteo[nombre],
      porcentaje: (conteo[nombre] / this.totalDocumentos) * 100,
      color: this.colores[index % this.colores.length],
    }));

    this.documentosPorTipo = items.sort((a, b) => b.valor - a.valor);
  }

  /**
   * Prepara estadísticas de documentos por área
   */
  private prepararDocumentosPorArea(): void {
    const conteo: { [key: string]: number } = {};

    this.documentos.forEach((doc) => {
      if (doc.area) {
        const areaNombre = doc.area.nombre;
        conteo[areaNombre] = (conteo[areaNombre] || 0) + 1;
      }
    });

    const items = Object.keys(conteo).map((nombre, index) => ({
      nombre,
      valor: conteo[nombre],
      porcentaje: (conteo[nombre] / this.totalDocumentos) * 100,
      color: this.colores[index % this.colores.length],
    }));

    this.documentosPorArea = items.sort((a, b) => b.valor - a.valor);
  }

  /**
   * Prepara actividad reciente
   */
  private prepararActividadReciente(): void {
    const actividades: ActividadReciente[] = [];

    // Agregar actividades de creación y modificación
    this.documentos.forEach((doc) => {
      // Creación
      actividades.push({
        id: `creacion-${doc.id}`,
        tipo: 'creacion',
        titulo: doc.titulo,
        usuario: doc.creado_por,
        fecha: doc.fecha_creacion,
        descripcion: `${doc.creado_por.username} creó "${doc.titulo}"`,
        color: 'var(--color-primary)',
      });

      // Versiones
      if (doc.versiones && doc.versiones.length > 1) {
        const ultimaVersion = doc.versiones[doc.versiones.length - 1];
        actividades.push({
          id: `version-${ultimaVersion.id}`,
          tipo: 'version',
          titulo: doc.titulo,
          usuario: ultimaVersion.subido_por,
          fecha: ultimaVersion.fecha_subida,
          descripcion: `${ultimaVersion.subido_por.username} subió nueva versión de "${doc.titulo}"`,
          color: 'var(--color-info)',
        });
      }
    });

    // Ordenar por fecha y tomar los más recientes
    this.actividadReciente = actividades
      .sort((a, b) => b.fecha.getTime() - a.fecha.getTime())
      .slice(0, 8);
  }

  /**
   * Prepara documentos compartidos
   */
  private prepararDocumentosCompartidos(): void {
    this.documentosCompartidos = this.documentos
      .filter(
        (doc) =>
          doc.creado_por.id !== this.currentUser.id &&
          (doc.es_publico || this.tienePermisos(doc))
      )
      .slice(0, 5);
  }

  /**
   * Verifica si el usuario tiene permisos sobre un documento
   */
  private tienePermisos(doc: Documento): boolean {
    return (
      doc.permisos?.some(
        (p) => p.usuario.id === this.currentUser.id && p.puede_ver
      ) || false
    );
  }

  // Métodos de utilidad para el template

  /**
   * Obtiene el icono apropiado para un tipo de documento
   */
  getDocumentIcon(tipoNombre?: string): any {
    const iconMap: { [key: string]: any } = {
      Contrato: FileTextIcon,
      Factura: FileIcon,
      Informe: BarChart3Icon,
      Solicitud: FileTextIcon,
      Manual: FolderIcon,
      Presentación: ImageIcon,
    };

    return iconMap[tipoNombre || ''] || FileTextIcon;
  }

  /**
   * Obtiene el icono apropiado para un tipo de actividad
   */
  getActivityIcon(tipo: string): any {
    const iconMap: { [key: string]: any } = {
      creacion: PlusIcon,
      version: GitBranchIcon,
      compartido: Share2Icon,
      modificacion: EditIcon,
    };

    return iconMap[tipo] || ActivityIcon;
  }

  /**
   * Formatea fecha relativa
   */
  formatearFechaRelativa(fecha: Date): string {
    const ahora = new Date();
    const diferencia = ahora.getTime() - fecha.getTime();
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const minutos = Math.floor(diferencia / (1000 * 60));

    if (dias > 0) {
      return dias === 1 ? 'Ayer' : `Hace ${dias} días`;
    } else if (horas > 0) {
      return `Hace ${horas} ${horas === 1 ? 'hora' : 'horas'}`;
    } else if (minutos > 0) {
      return `Hace ${minutos} ${minutos === 1 ? 'minuto' : 'minutos'}`;
    } else {
      return 'Hace unos segundos';
    }
  }

  // Métodos de tracking para ngFor (optimización de rendimiento)

  trackByDocumentId(index: number, doc: Documento): string {
    return doc.id;
  }

  trackByChartItem(index: number, item: EstadisticaDocumento): string {
    return item.nombre;
  }

  trackByActivityId(index: number, activity: ActividadReciente): string {
    return activity.id;
  }

  // Métodos de navegación y acciones

  /**
   * Navega a la página de documentos
   */
  irADocumentos(): void {
    this.router.navigate(['/documents']);
  }

  /**
   * Navega a crear documento
   */
  crearDocumento(): void {
    this.router.navigate(['/documents'], { queryParams: { action: 'create' } });
  }

  /**
   * Ver documento específico
   */
  verDocumento(documentoId: string): void {
    this.router.navigate(['/documents', documentoId]);
  }

  /**
   * Editar documento específico
   */
  editarDocumento(documentoId: string): void {
    this.router.navigate(['/documents', documentoId, 'edit']);
  }

  /**
   * Gestionar versiones
   */
  gestionarVersiones(): void {
    this.router.navigate(['/documents'], { queryParams: { tab: 'versions' } });
  }

  /**
   * Gestionar permisos
   */
  gestionarPermisos(): void {
    this.router.navigate(['/documents'], {
      queryParams: { tab: 'permissions' },
    });
  }
}
