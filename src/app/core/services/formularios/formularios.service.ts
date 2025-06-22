import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BASE_URL } from '../../../constants/urls';
import { Formulario } from '../../../models/formulario.model';

@Injectable({
  providedIn: 'root',
})
export class FormulariosService {
  FORMULARIOS_URL = `${BASE_URL}/formularios`;
  constructor(private http: HttpClient) {}

  getFormularios() {
    return this.http.get<Formulario[]>(`${this.FORMULARIOS_URL}/formularios/`);
  }

  getFormularioById(id: number) {
    return this.http.get<Formulario>(
      `${this.FORMULARIOS_URL}/formularios/${id}/`
    );
  }

  createFormulario(formulario: Formulario) {
    return this.http.post<Formulario>(
      `${this.FORMULARIOS_URL}/formularios/`,
      formulario
    );
  }

  updateFormulario(id: number, formulario: Formulario) {
    return this.http.put<Formulario>(
      `${this.FORMULARIOS_URL}/formularios/${id}/`,
      formulario
    );
  }

  deleteFormulario(id: number) {
    return this.http.delete(`${this.FORMULARIOS_URL}/formularios/${id}/`);
  }
}
