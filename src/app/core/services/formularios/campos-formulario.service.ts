import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BASE_URL } from '../../../constants/urls';
import { CamposFormulario } from '../../../models/campos-formulario.model';

@Injectable({
  providedIn: 'root',
})
export class CamposFormularioService {
  constructor(private http: HttpClient) {}
  CAMPOS_FORM_URL = `${BASE_URL}/formularios`;
  getCamposFormularios() {
    return this.http.get<CamposFormulario[]>(
      `${this.CAMPOS_FORM_URL}/campos-formulario/`
    );
  }

  getCamposFormulario(formularioId: number) {
    return this.http.get<CamposFormulario[]>(
      `${this.CAMPOS_FORM_URL}/campos-formulario/?id_form=${formularioId}/`
    );
  }

  updateCamposFormulario(camposFormulario: CamposFormulario, campoId: number) {
    return this.http.put<CamposFormulario>(
      `${this.CAMPOS_FORM_URL}/campos-formulario/${campoId}/`,
      camposFormulario
    );
  }

  deleteCamposFormulario(campoId: number) {
    return this.http.delete<CamposFormulario>(
      `${this.CAMPOS_FORM_URL}/campos-formulario/${campoId}/`
    );
  }

  createCamposFormulario(camposFormulario: CamposFormulario) {
    return this.http.post<CamposFormulario>(
      `${this.CAMPOS_FORM_URL}/campos-formulario/`,
      camposFormulario
    );
  }
}
