export interface Usuarios {
  id: number;
  username: string;
  email: string;
  roles: string[];
  organizacion?: {
    id: number;
    nombre: string;
    direccion: string;
    telefono: string;
    plan?: {
      id: number;
      nombre: string;
      descripcion: string;
      precio: string;
      maximo_usuarios: number;
      maximo_documentos: number;
      maximo_almacenamiento: number;
      ocr: boolean;
      maximo_roles: number;
      duracion_meses: number;
    };
  };
  es_admin: boolean;
}
