import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BASE_URL } from '../../../constants/urls';
import { EjecucionRegla } from '../../../models/ejecucion-regla.model';

@Injectable({
  providedIn: 'root',
})
export class EjecucionesReglasService {
  constructor(private http: HttpClient) {}

  EJECUCIONES_URL = `${BASE_URL}/reglas/ejecuciones-reglas/`;

  getEjecuciones() {
    return this.http.get<EjecucionRegla[]>(this.EJECUCIONES_URL);
  }

  getEjecucionesByReglaId(reglaId: number) {
    return this.http.get<EjecucionRegla[]>(
      `${this.EJECUCIONES_URL}?regla=${reglaId}`
    );
  }

  getEjecucionById(id: number) {
    return this.http.get<EjecucionRegla>(`${this.EJECUCIONES_URL}${id}/`);
  }

  createEjecucion(ejecucion: Partial<EjecucionRegla>) {
    return this.http.post<Partial<EjecucionRegla>>(
      this.EJECUCIONES_URL,
      ejecucion
    );
  }

  updateEjecucion(id: number, ejecucion: EjecucionRegla) {
    return this.http.put<Partial<EjecucionRegla>>(
      `${this.EJECUCIONES_URL}${id}/`,
      ejecucion
    );
  }

  deleteEjecucion(id: number) {
    return this.http.delete<void>(`${this.EJECUCIONES_URL}${id}/`);
  }
}
