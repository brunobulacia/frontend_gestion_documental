import { CamposFormulario } from './campos-formulario.model';

export interface Formulario {
  id: number;
  campos: CamposFormulario[];
  nombre: string;
  descripcion: string;
  fecha_creacion: string;
  tipo_documento: number;
  creado_por: number;
}
