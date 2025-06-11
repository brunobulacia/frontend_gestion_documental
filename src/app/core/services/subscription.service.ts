import { Injectable } from "@angular/core"
import {  HttpClient, HttpHeaders } from "@angular/common/http"
import {  Observable, throwError } from "rxjs"
import { catchError } from "rxjs/operators"
import type { PlanActual, SuscripcionRequest } from "../../models/plan.models"
import { BASE_URL } from "../../constants/urls"
export interface Plan {
  id: number
  nombre: string
  precio: string
  maximo_usuarios: number
  maximo_documentos: number
  maximo_almacenamiento: number
  ocr: boolean
  maximo_roles: number
  duracion_meses: number
  caracteristicas?: string[]
  popular?: boolean
}

export interface OrganizacionData {
  nombre: string
  direccion: string
  telefono: string
}

@Injectable({
  providedIn: "root",
})
export class SubscriptionService {
  private apiUrl = BASE_URL; // Ajusta según tu configuración

  constructor(private http: HttpClient) {}

  obtenerPlanActual(): Observable<PlanActual> {
    return this.http
      .get<PlanActual>(`${this.apiUrl}/usuarios/plan/`, {
      })
      .pipe(catchError(this.handleError))
  }

  suscribirUsuario(request: SuscripcionRequest): Observable<any> {
    return this.http
      .post(`${this.apiUrl}/usuarios/suscribir/`, request, {

      })
      .pipe(catchError(this.handleError))
  }

  private handleError(error: any): Observable<never> {
    console.error("Error en el servicio:", error)
    return throwError(() => error)
  }
}
