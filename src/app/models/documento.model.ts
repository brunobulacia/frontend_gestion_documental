export interface TipoDocumento {
    id: number;
    nombre: string;
  }
  
  export interface Area {
    id: number;
    nombre: string;
  }
  
  export interface Usuario {
    id: number;
    username: string;
    email: string;
    rol?: string;
  }
  

  interface DocumentoBase {
    titulo: string;
    descripcion: string;
    es_publico?: boolean;
    versiones?: DocumentoVersion[];
    metadatos?: MetadatoPersonalizado[];
    permisos?: PermisoDocumento[];
  }
  export interface Documento extends DocumentoBase {
    id: string;
    fecha_creacion: Date;
    fecha_modificacion: Date;
    creado_por: Usuario;
    tipo: TipoDocumento | null;
    area: Area | null;
  }

  export interface DocumentoCreate extends DocumentoBase {
    tipo: number;
    area: number;
  }
  
  export interface DocumentoVersion {
    id: number;
    documento_id: string;
    archivo: string;
    version: number;
    subido_por: Usuario;
    fecha_subida: Date;
    comentarios: string;
    nombre_archivo?: string;
  }
  
  export interface MetadatoPersonalizado {
    id: number;
    documento_id: string;
    clave: string;
    valor: string;
  }
  
  export interface PermisoDocumento {
    id: number;
    documento_id: string;
    usuario: Usuario;
    puede_ver: boolean;
    puede_editar: boolean;
    puede_descargar?: boolean;
    puede_eliminar?: boolean;
  }
  
  export interface Rol {
    id: number;
    nombre: string;
    descripcion: string;
    permisos: string[]; // ['ver', 'editar', 'descargar', 'eliminar']
  }

