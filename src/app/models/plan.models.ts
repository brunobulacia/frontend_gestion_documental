export interface Plan {
  id: number
  nombre: string
  descripcion: string
  precio: string
  maximo_usuarios: number
  caracteristicas?: string[]
  popular?: boolean
}

export interface PlanActual extends Plan {
  fecha_suscripcion?: string
  estado?: string
}

export interface OrganizacionData {
  nombre: string
  descripcion: string
  direccion?: string
  telefono?: string
}

export interface SuscripcionRequest {
  plan_id: number
  organizacion?: OrganizacionData
}
