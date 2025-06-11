import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { WorkflowService } from '../../../core/services/workflow.service';
import {
  FlujoTrabajo,
  ElementoFlujo,
  TransicionFlujo,
  TipoElemento,
  FlujoTrabajoCompleto,
  BpmnElement
} from '../../../models/workflows.model';
import BpmnModeler from 'bpmn-js/lib/Modeler';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of, Subscription } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { DocumentsService } from '../../../core/services/documents.service';
import { UsersService } from '../../../core/services/users.service';
@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  selector: 'app-workflow-editor',
  templateUrl: './workflow-editor.component.html',
  styleUrls: ['./workflow-editor.component.css']
})
export default class WorkflowEditorComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('bpmnCanvas', { static: false }) bpmnCanvas!: ElementRef;

  flujoId: number | null = null;
  flujoForm!: FormGroup;
  modeler: any;
  cargando: boolean = false;
  guardando: boolean = false;
  error: string | null = null;
  modoVisualizacion: boolean = false;

  flujoActual: FlujoTrabajoCompleto | null = null;
  elementoSeleccionado: ElementoFlujo | null = null;
  transicionSeleccionada: TransicionFlujo | null = null;

  tiposDocumento: any[] = []; // Aquí cargaríamos los tipos de documento
  usuarios: any[] = []; // Aquí cargaríamos los usuarios
  roles: any[] = []; // Aquí cargaríamos los roles

  tiposElemento = Object.values(TipoElemento);

  private subscriptions = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private workflowService: WorkflowService,
    private http: HttpClient,
    private documentsService: DocumentsService,
    private usersService: UsersService
  ) { }

  ngOnInit(): void {
    this.inicializarFormulario();
    this.cargarDatosIniciales();

    // Determinar si estamos en modo visualización
    const url = this.router.url;
    this.modoVisualizacion = url.includes('/ver/');

    // Obtener el ID del flujo si estamos editando o visualizando
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.flujoId = +id;
        this.cargarFlujo(this.flujoId);
      }
    });
  }

  ngAfterViewInit(): void {
  }

  ngOnDestroy(): void {
    if (this.modeler) {
      this.modeler.destroy();
    }
    this.subscriptions.unsubscribe();
  }

  inicializarFormulario(): void {
    this.flujoForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.maxLength(255)]],
      descripcion: [''],
      tipo_documento: [null, Validators.required],
      activo: [true]
    });

    if (this.modoVisualizacion) {
      this.flujoForm.disable();
    }
  }

  cargarDatosIniciales(): void {
    // Aquí cargaríamos los datos necesarios para el formulario
    // como tipos de documento, usuarios y roles
    // Por ahora, usamos datos de ejemplo

    this.documentsService.getDocumentTypes().subscribe((tiposDocumento: any) => {
      this.tiposDocumento = tiposDocumento;
    });
    this.usersService.getUserRoles().subscribe((roles: any) => {
      this.roles = roles;
    });
    this.usersService.getUsuarios().subscribe((usuarios) => {
      this.usuarios = usuarios;
      console.log(this.usuarios)
    });
    

  }

  inicializarBpmnModeler(): void {
    // Importamos el modeler de BPMN.js
    this.modeler = new BpmnModeler({
      container: this.bpmnCanvas.nativeElement,
    });

    console.log(this.flujoId);
    if (!this.flujoId) {
      this.cargarDiagramaVacio();
    }


    this.configurarEventosModeler();
  }

  cargarDiagramaVacio(): void {
    const emptyBpmn = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="false">
    <bpmn:startEvent id="StartEvent_1" />
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
      <bpmndi:BPMNShape id="_BPMNShape_StartEvent_2" bpmnElement="StartEvent_1">
        <dc:Bounds x="152" y="102" width="36" height="36" />
      </bpmndi:BPMNShape>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

    this.modeler.importXML(emptyBpmn, (err: any) => {
      if (err) {
        console.error('Error al cargar el diagrama BPMN vacío', err);
      }
    });
  }

  configurarEventosModeler(): void {
    const eventBus = this.modeler.get('eventBus');
    const selection = this.modeler.get('selection');

    // Evento cuando se selecciona un elemento
    eventBus.on('selection.changed', (e: any) => {
      const selectedElements = selection.get();
      console.log('selectedElements', selectedElements);
      if (selectedElements.length === 1) {
        const element = selectedElements[0];
        this.manejarSeleccionElemento(element);
      } else {
        this.elementoSeleccionado = null;
        this.transicionSeleccionada = null;
      }
    });

    // Evento cuando se crea un nuevo elemento
    eventBus.on('shape.added', (e: any) => {
      const element = e.element;
      this.manejarNuevoElemento(element);
    });

    // Evento cuando se crea una nueva conexión
    eventBus.on('connection.added', (e: any) => {
      const element = e.element;
      this.manejarNuevaConexion(element);
    });

    // Evento cuando se elimina un elemento
    eventBus.on('shape.removed', (e: any) => {
      const element = e.element;
      this.manejarElementoEliminado(element);
    });

    // Evento cuando se elimina una conexión
    eventBus.on('connection.removed', (e: any) => {
      const element = e.element;
      this.manejarConexionEliminada(element);
    });
  }

  manejarSeleccionElemento(element: any): void {
    if (element.type === 'bpmn:Task' ||
      element.type === 'bpmn:StartEvent' ||
      element.type === 'bpmn:EndEvent' ||
      element.type === 'bpmn:ExclusiveGateway') {

      // Buscar el elemento en nuestro modelo
      const elementoEncontrado = this.flujoActual?.elementos.find(e => e.bpmnId === element.id);

      if (elementoEncontrado) {
        this.elementoSeleccionado = elementoEncontrado;
        this.transicionSeleccionada = null;
      } else {
        // Si no existe, creamos un nuevo elemento en nuestro modelo
        this.elementoSeleccionado = {
          flujo: this.flujoId || 0,
          nombre: element.businessObject.name || '',
          tipo: this.mapearTipoBpmn(element.type),
          orden: 0,
          bpmnId: element.id,
          x: element.x,
          y: element.y,
          width: element.width,
          height: element.height
        };
      }
    } else if (element.type === 'bpmn:SequenceFlow') {
      // Buscar la transición en nuestro modelo
      const transicionEncontrada = this.flujoActual?.transiciones.find(t => t.bpmnId === element.id);

      if (transicionEncontrada) {
        this.transicionSeleccionada = transicionEncontrada;
        this.elementoSeleccionado = null;
      } else {
        // Si no existe, creamos una nueva transición en nuestro modelo
        const origenId = this.flujoActual?.elementos.find(e => e.bpmnId === element.source.id)?.id;
        const destinoId = this.flujoActual?.elementos.find(e => e.bpmnId === element.target.id)?.id;

        if (origenId && destinoId) {
          this.transicionSeleccionada = {
            origen: origenId,
            destino: destinoId,
            condicion: element.businessObject.name || '',
            bpmnId: element.id,
            waypoints: element.waypoints
          };
        }
      }
    }
  }

  manejarNuevoElemento(element: any): void {
    if (element.type === 'bpmn:Task' ||
      element.type === 'bpmn:StartEvent' ||
      element.type === 'bpmn:EndEvent' ||
      element.type === 'bpmn:ExclusiveGateway') {

      // Crear un nuevo elemento en nuestro modelo
      const nuevoElemento: ElementoFlujo = {
        flujo: this.flujoId || 0,
        nombre: element.businessObject.name || '',
        tipo: this.mapearTipoBpmn(element.type),
        orden: this.flujoActual?.elementos.length || 0,
        bpmnId: element.id,
        x: element.x,
        y: element.y,
        width: element.width,
        height: element.height
      };

      if (!this.flujoActual) {
        this.flujoActual = {
          flujo: { id: this.flujoId || 0 } as FlujoTrabajo,
          elementos: [],
          transiciones: []
        };
      }

      this.flujoActual.elementos.push(nuevoElemento);
      this.elementoSeleccionado = nuevoElemento;
    }
  }

  manejarNuevaConexion(element: any): void {
    if (element.type === 'bpmn:SequenceFlow') {
      // Buscar los elementos origen y destino en nuestro modelo
      const origenId = this.flujoActual?.elementos.find(e => e.bpmnId === element.source.id)?.id;
      const destinoId = this.flujoActual?.elementos.find(e => e.bpmnId === element.target.id)?.id;

      if (origenId && destinoId) {
        // Crear una nueva transición en nuestro modelo
        const nuevaTransicion: TransicionFlujo = {
          origen: origenId,
          destino: destinoId,
          condicion: element.businessObject.name || '',
          bpmnId: element.id,
          waypoints: element.waypoints
        };

        if (!this.flujoActual) {
          this.flujoActual = {
            flujo: { id: this.flujoId || 0 } as FlujoTrabajo,
            elementos: [],
            transiciones: []
          };
        }

        this.flujoActual.transiciones.push(nuevaTransicion);
        this.transicionSeleccionada = nuevaTransicion;
      }
    }
  }

  manejarElementoEliminado(element: any): void {
    if (this.flujoActual) {
      // Eliminar el elemento de nuestro modelo
      this.flujoActual.elementos = this.flujoActual.elementos.filter(e => e.bpmnId !== element.id);

      // Eliminar las transiciones relacionadas
      this.flujoActual.transiciones = this.flujoActual.transiciones.filter(t => {
        const origen = this.flujoActual?.elementos.find(e => e.id === t.origen);
        const destino = this.flujoActual?.elementos.find(e => e.id === t.destino);
        return origen && destino;
      });

      if (this.elementoSeleccionado?.bpmnId === element.id) {
        this.elementoSeleccionado = null;
      }
    }
  }

  manejarConexionEliminada(element: any): void {
    if (this.flujoActual) {
      // Eliminar la transición de nuestro modelo
      this.flujoActual.transiciones = this.flujoActual.transiciones.filter(t => t.bpmnId !== element.id);

      if (this.transicionSeleccionada?.bpmnId === element.id) {
        this.transicionSeleccionada = null;
      }
    }
  }

  mapearTipoBpmn(tipoBpmn: string): TipoElemento {
    switch (tipoBpmn) {
      case 'bpmn:StartEvent':
        return TipoElemento.INICIO;
      case 'bpmn:EndEvent':
        return TipoElemento.FIN;
      case 'bpmn:Task':
        return TipoElemento.TAREA;
      case 'bpmn:ExclusiveGateway':
        return TipoElemento.DECISION;
      default:
        return TipoElemento.TAREA;
    }
  }

  cargarFlujo(id: number): void {
    this.cargando = true;
    this.error = null;

    // Primero obtenemos los datos básicos del flujo
    const flujoObs = this.workflowService.getFlujoById(id);

    // Luego obtenemos los elementos y transiciones
    const flujoCompletoObs = this.workflowService.getFlujoCompleto(id);

    forkJoin([flujoObs, flujoCompletoObs])
      .pipe(
        catchError(err => {
          console.error('Error al cargar el flujo de trabajo', err);
          this.error = 'Error al cargar el flujo de trabajo. Por favor, intente nuevamente.';
          this.cargando = false;
          return of([null, null]);
        })
      )
      .subscribe(([flujo, flujoCompleto]) => {
        if (flujo && flujoCompleto) {
          this.flujoForm.patchValue({
            nombre: flujo.nombre,
            descripcion: flujo.descripcion,
            tipo_documento: flujo.tipo_documento,
            activo: flujo.activo
          });

          this.flujoActual = {
            flujo: flujo,
            elementos: flujoCompleto.elementos,
            transiciones: flujoCompleto.transiciones
          };

          // Esperamos al siguiente ciclo del DOM para que #bpmnCanvas exista
          setTimeout(() => {
            this.inicializarBpmnModeler();
            this.openDiagram(this.generarBpmnXml());
          });
        }

        this.cargando = false;
      });
  }


  cargarDiagramaBpmn(): void {
    if (!this.bpmnCanvas) {
      console.warn('El canvas BPMN aún no está disponible');
      return;
    }

    if (!this.flujoActual || !this.modeler) return;

    const bpmnXml = this.generarBpmnXml();
    console.log(bpmnXml);
    this.modeler.importXML(bpmnXml, (err: any) => {
      if (err) {
        console.error('Error al cargar el diagrama BPMN', err);
      }
    });
  }


  generarBpmnXml(): string {
    const generarId = () => 'id_' + Math.random().toString(36).substr(2, 9);

    if (!this.flujoActual) {
      throw new Error("No hay flujo actual definido.");
    }

    // Si no hay elementos, agregamos un evento de inicio por defecto
    if (!this.flujoActual.elementos || this.flujoActual.elementos.length === 0) {
      const defaultStart: ElementoFlujo = {
        id: 1,
        tipo: TipoElemento.INICIO,
        nombre: 'Inicio',
        bpmnId: generarId(),
        x: 150,
        y: 150,
        width: 36,
        height: 36,
        flujo: this.flujoActual.flujo,
        orden: 1
      };
      this.flujoActual.elementos.push(defaultStart);
    }

    // Aseguramos que todos los elementos tengan un bpmnId
    this.flujoActual.elementos.forEach(e => {
      if (!e.bpmnId) e.bpmnId = generarId();
    });

    this.flujoActual.transiciones.forEach(t => {
      if (!t.bpmnId) t.bpmnId = generarId();
    });

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
    <bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                      xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI"
                      xmlns:dc="http://www.omg.org/spec/DD/20100524/DC"
                      xmlns:di="http://www.omg.org/spec/DD/20100524/DI"
                      id="Definitions_1"
                      targetNamespace="http://bpmn.io/schema/bpmn">
      <bpmn:process id="Process_1" isExecutable="false">`;

    this.flujoActual.elementos.forEach(elemento => {
      const tipo = this.mapearTipoElementoBpmn(elemento.tipo);
      xml += `
        <${tipo} id="${elemento.bpmnId}" name="${elemento.nombre || ''}"/>`;
    });

    this.flujoActual.transiciones.forEach(transicion => {
      const origen = this.flujoActual?.elementos.find(e => e.id === transicion.origen);
      const destino = this.flujoActual?.elementos.find(e => e.id === transicion.destino);

      if (origen?.bpmnId && destino?.bpmnId) {
        xml += `
        <bpmn:sequenceFlow id="${transicion.bpmnId}" name="${transicion.condicion || ''}"
                           sourceRef="${origen.bpmnId}" targetRef="${destino.bpmnId}" />`;
      }
    });

    xml += `
      </bpmn:process>
      <bpmndi:BPMNDiagram id="BPMNDiagram_1">
        <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">`;

    this.flujoActual.elementos.forEach(elemento => {
      const x = elemento.x ?? 100;
      const y = elemento.y ?? 100;
      const width = elemento.width ?? 100;
      const height = elemento.height ?? 80;

      xml += `
          <bpmndi:BPMNShape id="Shape_${elemento.bpmnId}" bpmnElement="${elemento.bpmnId}">
            <dc:Bounds x="${x}" y="${y}" width="${width}" height="${height}" />
          </bpmndi:BPMNShape>`;
    });

    this.flujoActual.transiciones.forEach(transicion => {
      xml += `
          <bpmndi:BPMNEdge id="Edge_${transicion.bpmnId}" bpmnElement="${transicion.bpmnId}">`;

      if (transicion.waypoints?.length) {
        transicion.waypoints.forEach(pt => {
          xml += `
            <di:waypoint x="${pt.x}" y="${pt.y}" />`;
        });
      } else {
        const origen = this.flujoActual?.elementos.find(e => e.id === transicion.origen);
        const destino = this.flujoActual?.elementos.find(e => e.id === transicion.destino);

        if (origen && destino) {
          const x1 = (origen.x ?? 0) + (origen.width ?? 100) / 2;
          const y1 = (origen.y ?? 0) + (origen.height ?? 80) / 2;
          const x2 = (destino.x ?? 0) + (destino.width ?? 100) / 2;
          const y2 = (destino.y ?? 0) + (destino.height ?? 80) / 2;

          xml += `
            <di:waypoint x="${x1}" y="${y1}" />
            <di:waypoint x="${x2}" y="${y2}" />`;
        }
      }

      xml += `
          </bpmndi:BPMNEdge>`;
    });

    xml += `
        </bpmndi:BPMNPlane>
      </bpmndi:BPMNDiagram>
    </bpmn:definitions>`;

    return xml;
  }

  mapearTipoElementoBpmn(tipo: TipoElemento): string {
    switch (tipo) {
      case TipoElemento.INICIO:
        return 'bpmn:startEvent';
      case TipoElemento.FIN:
        return 'bpmn:endEvent';
      case TipoElemento.TAREA:
        return 'bpmn:task';
      case TipoElemento.DECISION:
        return 'bpmn:exclusiveGateway';
      default:
        return 'bpmn:task';
    }
  }

  actualizarElementoSeleccionado(evento: any): void {
    if (!this.elementoSeleccionado || !this.flujoActual) return;

    // Actualizamos el elemento en nuestro modelo
    const index = this.flujoActual.elementos.findIndex(e => e.id === this.elementoSeleccionado?.id || e.bpmnId === this.elementoSeleccionado?.bpmnId);

    if (index !== -1) {
      this.flujoActual.elementos[index] = { ...this.elementoSeleccionado, ...evento };
      this.elementoSeleccionado = this.flujoActual.elementos[index];

      // Actualizamos el elemento en el diagrama BPMN
      const elementRegistry = this.modeler.get('elementRegistry');
      const modeling = this.modeler.get('modeling');

      const bpmnElement = elementRegistry.get(this.elementoSeleccionado.bpmnId);

      if (bpmnElement) {
        modeling.updateProperties(bpmnElement, {
          name: this.elementoSeleccionado.nombre
        });
      }
    }
  }

  actualizarTransicionSeleccionada(evento: any): void {
    if (!this.transicionSeleccionada || !this.flujoActual) return;

    // Actualizamos la transición en nuestro modelo
    const index = this.flujoActual.transiciones.findIndex(t => t.id === this.transicionSeleccionada?.id || t.bpmnId === this.transicionSeleccionada?.bpmnId);

    if (index !== -1) {
      this.flujoActual.transiciones[index] = { ...this.transicionSeleccionada, ...evento };
      this.transicionSeleccionada = this.flujoActual.transiciones[index];

      // Actualizamos la transición en el diagrama BPMN
      const elementRegistry = this.modeler.get('elementRegistry');
      const modeling = this.modeler.get('modeling');

      const bpmnElement = elementRegistry.get(this.transicionSeleccionada.bpmnId);

      if (bpmnElement) {
        modeling.updateProperties(bpmnElement, {
          name: this.transicionSeleccionada.condicion
        });
      }
    }
  }

  guardarFlujo(): void {
    if (this.flujoForm.invalid) {
      this.marcarCamposInvalidos();
      return;
    }

    this.guardando = true;
    this.error = null;

    // Obtenemos los datos del formulario
    const datosFormulario = this.flujoForm.value;

    // Creamos o actualizamos el flujo
    const flujo: FlujoTrabajo = {
      id: this.flujoId || undefined,
      nombre: datosFormulario.nombre,
      descripcion: datosFormulario.descripcion,
      tipo_documento: datosFormulario.tipo_documento,
      activo: datosFormulario.activo
    };

    // Actualizamos el flujo en nuestro modelo
    if (this.flujoActual) {
      this.flujoActual.flujo = flujo;
    } else {
      this.flujoActual = {
        flujo: flujo,
        elementos: [],
        transiciones: []
      };
    }

    console.log('guardar:')
    console.log(this.flujoActual);
    this.workflowService.guardarFlujoCompleto(this.flujoActual)
      .pipe(
        catchError(err => {
          console.error('Error al guardar el flujo de trabajo', err);
          this.error = 'Error al guardar el flujo de trabajo. Por favor, intente nuevamente.';
          this.guardando = false;
          return of(null);
        })
      )
      .subscribe(flujoGuardado => {
        if (flujoGuardado) {
          this.guardando = false;
          this.flujoActual = flujoGuardado;
          this.flujoId = flujoGuardado.flujo?.id!;

          // Redirigimos a la página de edición si estamos creando un nuevo flujo
          if (!this.route.snapshot.paramMap.get('id')) {
            this.router.navigate(['/workflows/editar', this.flujoId]);
          }
        }

        this.guardando = false;
      });
  }

  validarFlujo(): void {
    if (!this.flujoId) {
      alert('Debe guardar el flujo antes de validarlo.');
      return;
    }

    this.workflowService.validarFlujo(this.flujoId)
      .subscribe(resultado => {
        if (resultado.valido) {
          alert('El flujo de trabajo es válido.');
        } else {
          alert(`El flujo de trabajo no es válido:\n${resultado.errores.join('\n')}`);
        }
      });
  }

  marcarCamposInvalidos(): void {
    Object.keys(this.flujoForm.controls).forEach(key => {
      const control = this.flujoForm.get(key);
      if (control?.invalid) {
        control.markAsTouched();
      }
    });
  }

  cancelar(): void {
    this.router.navigate(['/workflows']);
  }

  openDiagram(bpmnXML: any) {

    // import diagram
    try {

      this.modeler.importXML(bpmnXML);

      // access modeler components
      var canvas = this.modeler.get('canvas');
      var overlays = this.modeler.get('overlays');


      // zoom to fit full viewport
      canvas.zoom('fit-viewport');

      // attach an overlay to a node
      overlays.add('SCAN_OK', 'note', {
        position: {
          bottom: 0,
          right: 0
        },
        html: '<div class="diagram-note">Mixed up the labels?</div>'
      });

      // add marker
      canvas.addMarker('SCAN_OK', 'needs-discussion');
    } catch (err) {

      console.error('could not import BPMN 2.0 diagram', err);
    }
  }

}