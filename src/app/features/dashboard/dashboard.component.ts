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
    this.fetchData();
  }

  /**
   * Configura la actualización automática cada 5 minutos
   */
  private setupAutoRefresh(): void {
    const autoRefresh = interval(300000).subscribe(() => {
      this.refreshData();
    });

    this.subscriptions.push(autoRefresh);
  }

  /**
   * Actualiza los datos
   */
  refreshData(): void {
    this.fetchData();
  }

  /**
   * Obtiene datos del servicio
   */ private fetchData(): void {
    this.isLoading = true;
    const sub = this.docsService.loadDashboardData().subscribe({
      next: (res) => {
        console.log(res);
        this.documentos = res.documentos || [];
        this.tiposDocumento = res.tipos_documento || [];
        this.areas = res.areas || [];

        this.totalDocumentos = res.total_documentos || 0;
        this.documentosPublicos = res.documentos_publicos || 0;
        this.documentosPrivados = res.documentos_privados || 0;
        this.totalVersiones = res.total_versiones || 0;

        this.documentosTrend = res.documentos_trend || 0;
        this.versionesTrend = res.versiones_trend || 0;
        this.publicosTrend = res.publicos_trend || 0;
        this.privadosTrend = res.privados_trend || 0;

        this.documentosRecientes = res.documentos_recientes || [];
        this.actividadReciente = res.actividad_reciente || [];
        this.documentosCompartidos = res.documentos_compartidos || [];

        this.prepararDocumentosPorTipo();
        this.prepararDocumentosPorArea();

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al cargar datos reales del dashboard:', error);
        this.isLoading = false;
      },
    });
    this.subscriptions.push(sub);
  }

  /**
   * Procesa todos los datos
   */
  private procesarDatos(): void {
    // Ya no se necesita calcular documentos recientes, actividad ni compartidos
    this.prepararDocumentosPorTipo();
    this.prepararDocumentosPorArea();
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
  formatearFechaRelativa(fecha: Date | string): string {
    const fechaObj = new Date(fecha); // <- conversión segura
    const ahora = new Date();
    const diferencia = ahora.getTime() - fechaObj.getTime();

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
    this.router.navigate(['/documents']);
  }

  /**
   * Editar documento específico
   */
  editarDocumento(documentoId: string): void {
    this.router.navigate(['/documents']);
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
