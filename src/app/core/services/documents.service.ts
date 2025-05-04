import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BASE_URL } from '../../constants/urls';
import { Area, DocumentoCreate, TipoDocumento, Documento } from '../../models/documento.model';

@Injectable({
  providedIn: 'root'
})
export class DocumentsService {
  DOCS_URL = `${BASE_URL}/documentos/`;
  constructor(private http: HttpClient) { }

  getDocs() {
    return this.http.get(this.DOCS_URL);
  }

  getDoc(id: string) {
    return this.http.get(`${this.DOCS_URL}${id}/`);
  }

  addDoc(doc: DocumentoCreate, file: File) {
    const formData = new FormData();
  
    Object.entries(doc).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(key, value as string | Blob);
      }
    });
  
    formData.append('archivo', file);
  
    return this.http.post(this.DOCS_URL, formData);
  }

  getData() {
    return this.http.get<{areas: Area[], tipos_documento: TipoDocumento[], documentos: Documento[]}>(`${this.DOCS_URL}resumen/`);
  }
}
