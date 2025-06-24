import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BASE_URL } from '../../../constants/urls';
import { RespuestaFormularioDocumento } from '../../../models/respo-form.model';
@Injectable({
  providedIn: 'root',
})
export class RespoFormService {
  constructor(private http: HttpClient) {}

  RESP_FORM_URL = `${BASE_URL}/formularios/respuestas-formulario/`;

  getRespuestasFormularios() {
    return this.http.get<RespuestaFormularioDocumento[]>(this.RESP_FORM_URL);
  }

  getRespuestaFormulario(id: number) {
    return this.http.get<RespuestaFormularioDocumento>(
      `${this.RESP_FORM_URL}${id}/`
    );
  }

  updateRespuestaFormulario(
    respuestaFormulario: RespuestaFormularioDocumento,
    id: number
  ) {
    return this.http.put<RespuestaFormularioDocumento>(
      `${this.RESP_FORM_URL}${id}/`,
      respuestaFormulario
    );
  }

  deleteRespuestaFormulario(id: number) {
    return this.http.delete<RespuestaFormularioDocumento>(
      `${this.RESP_FORM_URL}${id}/`
    );
  }

  createRespuestaFormulario(respuestaFormulario: RespuestaFormularioDocumento) {
    return this.http.post<RespuestaFormularioDocumento>(
      this.RESP_FORM_URL,
      respuestaFormulario
    );
  }
}
