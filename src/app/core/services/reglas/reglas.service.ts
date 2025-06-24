// reglas.service
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BASE_URL } from '../../../constants/urls';
import { ReglaAutomatica } from '../../../models/reglas.model';

@Injectable({
  providedIn: 'root',
})
export class ReglasService {
  REGLAS_URL = `${BASE_URL}/reglas`;

  constructor(private http: HttpClient) {}

  getReglas() {
    return this.http.get<ReglaAutomatica[]>(`${this.REGLAS_URL}/reglas/`);
  }

  getReglaById(id: number) {
    return this.http.get<ReglaAutomatica>(`${this.REGLAS_URL}/reglas/${id}/`);
  }

  createRegla(regla: ReglaAutomatica) {
    return this.http.post<Partial<ReglaAutomatica>>(
      `${this.REGLAS_URL}/reglas/`,
      regla
    );
  }

  updateRegla(id: number, regla: ReglaAutomatica) {
    return this.http.put<Partial<ReglaAutomatica>>(
      `${this.REGLAS_URL}/reglas/${id}/`,
      regla
    );
  }

  deleteRegla(id: number) {
    return this.http.delete<void>(`${this.REGLAS_URL}/reglas/${id}/`);
  }
}
