import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkflowService } from '../../../core/services/workflow.service';
import { FlujoTrabajo, FlujoTrabajoCompleto } from '../../../models/workflows.model';
import BpmnViewer from 'bpmn-js/lib/NavigatedViewer';
import { CommonModule } from '@angular/common';

@Component({
  imports: [CommonModule],
  selector: 'app-workflow-viewer',
  templateUrl: './workflow-viewer.component.html',
  styleUrls: ['./workflow-viewer.component.css']
})
export default class WorkflowViewerComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('bpmnCanvas') bpmnCanvas!: ElementRef;
  
  flujoId: number | null = null;
  flujo: FlujoTrabajo | null = null;
  flujoCompleto: FlujoTrabajoCompleto | null = null;
  viewer: any;
  cargando: boolean = true;
  error: string | null = null;
  
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private workflowService: WorkflowService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.flujoId = +id;
        this.cargarFlujo(this.flujoId);
      } else {
        this.error = 'No se ha especificado un flujo de trabajo.';
        this.cargando = false;
      }
    });
  }

  ngAfterViewInit(): void {
    this.inicializarBpmnViewer();
  }

  ngOnDestroy(): void {
    if (this.viewer) {
      this.viewer.destroy();
    }
  }

  inicializarBpmnViewer(): void {
    this.viewer = new BpmnViewer({
      container: this.bpmnCanvas.nativeElement
    });
  }

  cargarFlujo(id: number): void {
    this.cargando = true;
    this.error = null;
    
    this.workflowService.getFlujoById(id).subscribe({
      next: (flujo) => {
        this.flujo = flujo;
        this.cargarFlujoCompleto(id);
      },
      error: (err) => {
        console.error('Error al cargar el flujo de trabajo', err);
        this.error = 'Error al cargar el flujo de trabajo. Por favor, intente nuevamente.';
        this.cargando = false;
      }
    });
  }

  cargarFlujoCompleto(id: number): void {
    this.workflowService.getFlujoCompleto(id).subscribe({
      next: (flujoCompleto) => {
        this.flujoCompleto = flujoCompleto;
        this.cargarDiagramaBpmn();
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar los detalles del flujo de trabajo', err);
        this.error = 'Error al cargar los detalles del flujo de trabajo. Por favor, intente nuevamente.';
        this.cargando = false;
      }
    });
  }

  cargarDiagramaBpmn(): void {
    if (!this.flujoCompleto) return;
    
    // Convertimos nuestro modelo a un diagrama BPMN
    this.workflowService.convertirModeloABpmn(
      this.flujoCompleto.elementos, 
      this.flujoCompleto.transiciones
    ).subscribe(bpmnXml => {
      // Cargamos el diagrama en el viewer
      this.viewer.importXML(bpmnXml, (err: any) => {
        if (err) {
          console.error('Error al cargar el diagrama BPMN', err);
          this.error = 'Error al cargar el diagrama BPMN.';
        } else {
          // Ajustamos la vista para mostrar todo el diagrama
          this.viewer.get('canvas').zoom('fit-viewport');
        }
      });
    });
  }

  volver(): void {
    this.router.navigate(['/workflows']);
  }

  editarFlujo(): void {
    if (this.flujoId) {
      this.router.navigate(['/workflows/editar', this.flujoId]);
    }
  }
}