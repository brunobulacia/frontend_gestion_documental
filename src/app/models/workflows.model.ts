export interface Usuario {
    id: number;
    username: string;
    email?: string;
    nombre_completo?: string;
  }
  
  export interface Rol {
    id: number;
    nombre: string;
    descripcion?: string;
  }
  
  export interface TipoDocumento {
    id: number;
    nombre: string;
    descripcion?: string;
  }
  
  export enum TipoElemento {
    INICIO = 'INICIO',
    FIN = 'FIN',
    TAREA = 'TAREA',
    DECISION = 'DECISION'
  }
  
  export interface FlujoTrabajo {
    id?: number;
    nombre: string;
    descripcion: string;
    tipo_documento: TipoDocumento;
    tipo_documento_id?: any; //Top trolleadas
    creado_por?: Usuario;
    fecha_creacion?: Date;
    activo: boolean;
  }
  
  export interface ElementoFlujo {
    id?: number;
    flujo: number | FlujoTrabajo;
    nombre: string;
    tipo: TipoElemento;
    orden: number;
    asignado_a_usuario?:  Usuario | null;
    asignado_a_rol?:  Rol | null;
    condicion?: string;
    // Propiedades para el editor visual
    x?: number;
    y?: number;
    width?: number;
    height?: number;
    bpmnId?: string;
  }
  
  export interface TransicionFlujo {
    id?: number;
    origen: number | ElementoFlujo;
    destino: number | ElementoFlujo;
    condicion?: string;
    // Propiedades para el editor visual
    waypoints?: {x: number, y: number}[];
    bpmnId?: string;
  }
  
  export interface FlujoTrabajoCompleto {
    flujo: FlujoTrabajo;
    elementos: ElementoFlujo[];
    transiciones: TransicionFlujo[];
  }
  
  export interface ValidacionFlujo {
    valido: boolean;
    errores: string[];
  }
  
  export interface BpmnElement {
    id: string;
    type: string;
    name?: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
    source?: string;
    target?: string;
    waypoints?: {x: number, y: number}[];
  }