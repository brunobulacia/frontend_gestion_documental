export interface RespuestaFormularioDocumento {
  id: number;
  fecha_respuesta: string; // ISO date string
  datos: string; // JSON string or similar
  formulario: number; // ID of the form
  documento: string; // UUID or similar identifier for the document
  completado_por: number; // ID of the user who completed the form
}
