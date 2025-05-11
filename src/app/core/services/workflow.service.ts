import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  FlujoTrabajo,
  ElementoFlujo,
  TransicionFlujo,
  ValidacionFlujo,
  FlujoTrabajoCompleto
} from '../../models/workflows.model';
import { BASE_URL } from '../../constants/urls';

@Injectable({
  providedIn: 'root'
})
export class WorkflowService {
  private readonly WORKFLOWS_URL = `${BASE_URL}/workflows`;

  constructor(private http: HttpClient) { }

  // Flujos de trabajo
  getFlujos(): Observable<FlujoTrabajo[]> {
    return this.http.get<FlujoTrabajo[]>(`${this.WORKFLOWS_URL}/flujos/`);
  }

  getFlujoById(id: number): Observable<FlujoTrabajo> {
    return this.http.get<FlujoTrabajo>(`${this.WORKFLOWS_URL}/flujos/${id}/`);
  }

  getFlujoCompleto(id: number): Observable<FlujoTrabajoCompleto> {
    return this.http.get<{ elementos: ElementoFlujo[], transiciones: TransicionFlujo[] }>(`${this.WORKFLOWS_URL}/flujos/${id}/json/`)
      .pipe(
        map(data => {
          return {
            flujo: { id } as FlujoTrabajo,
            elementos: data.elementos,
            transiciones: data.transiciones
          };
        })
      );
  }

  crearFlujo(flujo: FlujoTrabajo): Observable<FlujoTrabajoCompleto> {
    return this.http.post<FlujoTrabajoCompleto>(`${this.WORKFLOWS_URL}/flujos/`, flujo).pipe(
      map(resultado => {
        if ('elementos' in resultado) {
          return resultado;
        } else {
          return {
            flujo: resultado,
            elementos: [],
            transiciones: []
          };
        }
      })
    ) ;
  }

  actualizarFlujo(flujo: FlujoTrabajo): Observable<FlujoTrabajo> {
    return this.http.put<FlujoTrabajo>(`${this.WORKFLOWS_URL}/flujos/${flujo.id}/`, flujo);
  }

  eliminarFlujo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.WORKFLOWS_URL}/flujos/${id}/`);
  }

  validarFlujo(id: number): Observable<ValidacionFlujo> {
    return this.http.post<ValidacionFlujo>(`${this.WORKFLOWS_URL}/flujos/${id}/validar/`, {});
  }

  asociarFlujoTipoDocumento(flujoId: number, tipoId: number): Observable<any> {
    return this.http.post(`${this.WORKFLOWS_URL}/flujos/${flujoId}/asociar/`, { tipo_id: tipoId });
  }

  // Elementos de flujo
  crearElemento(elemento: ElementoFlujo): Observable<ElementoFlujo> {
    return this.http.post<ElementoFlujo>(`${this.WORKFLOWS_URL}/elementos/`, elemento);
  }

  actualizarElemento(elemento: ElementoFlujo): Observable<ElementoFlujo> {
    return this.http.put<ElementoFlujo>(`${this.WORKFLOWS_URL}/elementos/${elemento.id}/`, elemento);
  }

  eliminarElemento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.WORKFLOWS_URL}/elementos/${id}/`);
  }

  // Transiciones
  crearTransicion(transicion: TransicionFlujo): Observable<TransicionFlujo> {
    return this.http.post<TransicionFlujo>(`${this.WORKFLOWS_URL}/transiciones/`, transicion);
  }

  actualizarTransicion(transicion: TransicionFlujo): Observable<TransicionFlujo> {
    return this.http.put<TransicionFlujo>(`${this.WORKFLOWS_URL}/transiciones/${transicion.id}/`, transicion);
  }

  eliminarTransicion(id: number): Observable<void> {
    return this.http.delete<void>(`${this.WORKFLOWS_URL}/transiciones/${id}/`);
  }

  guardarFlujoCompleto(flujoCompleto: FlujoTrabajoCompleto): Observable<FlujoTrabajoCompleto> {
    if (!flujoCompleto.flujo.id) {
      return this.crearFlujo(flujoCompleto.flujo);
    }
    flujoCompleto = this.fusionarElementosRepetidos(flujoCompleto);
    flujoCompleto = this.eliminarWaypoints(flujoCompleto);
    return this.http.post<FlujoTrabajoCompleto>(`${this.WORKFLOWS_URL}/flujos/actualizar/`, flujoCompleto);
  }

  // Método para guardar un flujo completo (flujo, elementos y transiciones)
  // guardarFlujoCompleto2(flujoCompleto: FlujoTrabajoCompleto): Observable<FlujoTrabajoCompleto> {
  //   // Fusionamos elementos repetidos
  //   flujoCompleto = this.fusionarElementosRepetidos(flujoCompleto);
  //   // Guardamos o actualizamos el flujo
  //   const flujoObs = flujoCompleto.flujo.id
  //     ? this.actualizarFlujo(flujoCompleto.flujo)
  //     : this.crearFlujo(flujoCompleto.flujo);

  //   return new Observable<FlujoTrabajoCompleto>(observer => {
  //     flujoObs.subscribe({
  //       next: (flujoGuardado) => {
  //         const flujoId = flujoGuardado.id!;
  //         const elementosPromises = flujoCompleto.elementos.map((elemento: any) => {
  //           elemento.flujo = flujoId;
  //           return elemento.id
  //             ? this.actualizarElemento(elemento).toPromise()
  //             : this.crearElemento(elemento).toPromise();
  //         });

  //         Promise.all(elementosPromises)
  //           .then(elementosGuardados => {
  //             // Mapa de IDs temporales a IDs reales
  //             const elementosMap = new Map<number, number>();
  //             elementosGuardados.forEach((elem: any, index: number) => {
  //               if (elem && flujoCompleto.elementos[index].id) {
  //                 elementosMap.set(flujoCompleto.elementos[index].id!, elem.id!);
  //               }
  //             });

  //             const transicionesPromises = flujoCompleto.transiciones.map((transicion: any) => {
  //               // Actualizar referencias a elementos si es necesario
  //               if (typeof transicion.origen === 'number' && elementosMap.has(transicion.origen)) {
  //                 transicion.origen = elementosMap.get(transicion.origen)!;
  //               }
  //               if (typeof transicion.destino === 'number' && elementosMap.has(transicion.destino)) {
  //                 transicion.destino = elementosMap.get(transicion.destino)!;
  //               }

  //               return transicion.id
  //                 ? this.actualizarTransicion(transicion).toPromise()
  //                 : this.crearTransicion(transicion).toPromise();
  //             });

  //             Promise.all(transicionesPromises)
  //               .then(transicionesGuardadas => {
  //                 observer.next({
  //                   flujo: flujoGuardado,
  //                   elementos: elementosGuardados as ElementoFlujo[],
  //                   transiciones: transicionesGuardadas as TransicionFlujo[]
  //                 });
  //                 observer.complete();
  //               })
  //               .catch(error => observer.error(error));
  //           })
  //           .catch(error => observer.error(error));
  //       },
  //       error: (error) => observer.error(error)
  //     });
  //   });
  // }

  fusionarElementosRepetidos(flujo: FlujoTrabajoCompleto): FlujoTrabajoCompleto {
    if (!flujo) return flujo;
    const elementosFusionados: { [bpmnId: string]: ElementoFlujo } = {};
    flujo.elementos.forEach(e => {
      // Si el elemento ya existe, fusiona sus atributos
      if (e.bpmnId && elementosFusionados[e.bpmnId]) {
        elementosFusionados[e.bpmnId] = { ...elementosFusionados[e.bpmnId], ...e };
      } else {
        // Si el elemento no existe, agrega un nuevo objeto
        if (e.bpmnId)
          elementosFusionados[e.bpmnId] = e;
      }
    });
    flujo.elementos = Object.values(elementosFusionados);
    return flujo;
  }

  eliminarWaypoints(flujoCompleto: FlujoTrabajoCompleto): FlujoTrabajoCompleto {
    const flujoCompletoModificado = { ...flujoCompleto };
    flujoCompletoModificado.transiciones = flujoCompletoModificado.transiciones.map(transicion => {
      const transicionModificada = { ...transicion };
      delete transicionModificada.waypoints;
      return transicionModificada;
    });
    return flujoCompletoModificado;
  }
  convertirBpmnAModelo(bpmnXml: string, flujoId: number): Observable<{ elementos: ElementoFlujo[], transiciones: TransicionFlujo[] }> {
    // Este método simula la conversión de XML BPMN a nuestro modelo
    // En una implementación real, se analizaría el XML para extraer los elementos y transiciones
    return new Observable(observer => {
      // Aquí iría la lógica de conversión del XML BPMN
      // Por ahora, devolvemos un modelo vacío
      observer.next({
        elementos: [],
        transiciones: []
      });
      observer.complete();
    });
  }

  // Convertir nuestro modelo de datos a BPMN
  convertirModeloABpmn(elementos: ElementoFlujo[], transiciones: TransicionFlujo[]): Observable<string> {
    // Este método simula la conversión de nuestro modelo a XML BPMN
    return new Observable(observer => {
      // Aquí iría la lógica de conversión a XML BPMN
      // Por ahora, devolvemos un XML BPMN básico
      const bpmnXml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="false">
    <!-- Aquí irían los elementos del proceso -->
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <!-- Aquí irían los elementos visuales -->
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;
      observer.next(bpmnXml);
      observer.complete();
    });
  }
}