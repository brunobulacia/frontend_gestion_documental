export interface ReglaAutomatica {
  id: number;
  nombre: string;
  evento: string;
  condicion: Record<string, any>;
  accion: string;
  parametros_accion: Record<string, any>;
  activa: boolean;
  creada_en: string;
  creada_por: number;
}
