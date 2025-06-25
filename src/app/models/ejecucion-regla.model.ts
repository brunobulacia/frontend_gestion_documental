export interface EjecucionRegla {
  id: number;
  regla: number; // ID de la regla asociada
  evento: string; // Evento que disparó la ejecución
  usuario: number; // ID del usuario que ejecutó la regla
  fecha: string; // Fecha y hora de la ejecución
  estado: string; // Estado de la ejecución (ej. "exito", "error")
  mensaje: string; // Mensaje descriptivo de la ejecución
}
