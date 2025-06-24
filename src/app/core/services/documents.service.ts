import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BASE_URL } from '../../constants/urls';
import {
  Area,
  DocumentoCreate,
  TipoDocumento,
  Documento,
} from '../../models/documento.model';

@Injectable({
  providedIn: 'root',
})
export class DocumentsService {
  DOCS_URL = `${BASE_URL}/documentos/`;
  constructor(private http: HttpClient) {}

  getDocs() {
    return this.http.get(`${this.DOCS_URL}documentos/`);
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
    return this.http.get<{
      areas: Area[];
      tipos_documento: TipoDocumento[];
      documentos: Documento[];
    }>(`${this.DOCS_URL}resumen/`);
  }

  addNewVersion(doc_id: string, file: File) {
    const formData = new FormData();

    formData.append('archivo', file);

    return this.http.post(`${this.DOCS_URL}${doc_id}/nueva-version/`, formData);
  }

  downloadDoc(ver_id: number) {
    return this.http.get(`${this.DOCS_URL}descargar/${ver_id}`, {
      responseType: 'blob',
    });
  }

  addMetadata(doc_id: string, metadata: any) {
    return this.http.post(
      `${this.DOCS_URL}${doc_id}/agregar-metadatos/`,
      metadata
    );
  }

  getDocumentTypes() {
    return this.http.get(`${this.DOCS_URL}tipos-documentos/`);
  }

  //OPERACIONES CRUDS PARA DOCUMENTOS
}
