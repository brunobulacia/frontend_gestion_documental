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

    console.log(doc);
    // console.log(file);

    Object.entries(doc).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        // Si el valor es un objeto, intenta extraer el id o serializarlo
        if (typeof value === 'object' && value !== null && 'id' in value) {
          formData.append(key, (value as any).id.toString());
        } else {
          formData.append(key, value.toString());
        }
      }
    });

    formData.append('archivo', file);
    console.log('Archivo agregado al FormData:', formData.get('archivo'));
    // Verifica el contenido real del FormData
    /*  for (const [k, v] of formData.entries()) {
      console.log('FormData:', k, v);
    } */


    //return this.http.post<DocumentoCreate>(`${this.DOCS_URL}subir/`, doc);
    return this.http.post(`${this.DOCS_URL}subir/`, formData);
    // return this.http.post(`${this.DOCS_URL}documentos/`, formData);
  }

  getData() {
    return this.http.get<{
      areas: Area[];
      tipos_documento: TipoDocumento[];
      documentos: Documento[];
    }>(`${this.DOCS_URL}resumen/`);
  }

  deleteDoc(id: string) {
    return this.http.delete(`${this.DOCS_URL}documentos/${id}/`);
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
