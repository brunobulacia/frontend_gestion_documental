import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { WorkflowService } from '../../../core/services/workflow.service';
import { FlujoTrabajo } from '../../../models/workflows.model';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-workflow-list',
  templateUrl: './workflow-list.component.html',
  styleUrls: ['./workflow-list.component.css']
})
export default class WorkflowListComponent implements OnInit {
  flujos: FlujoTrabajo[] = [];
  cargando: boolean = true;
  error: string | null = null;

  constructor(
    private workflowService: WorkflowService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.cargarFlujos();
  }

  cargarFlujos(): void {
    this.cargando = true;
    this.workflowService.getFlujos().subscribe({
      next: (flujos) => {
        this.flujos = flujos;
        this.cargando = false;
      },
      error: (err) => {
        console.error('Error al cargar flujos de trabajo', err);
        this.error = 'Error al cargar los flujos de trabajo. Por favor, intente nuevamente.';
        this.cargando = false;
      }
    });
  }

  crearNuevoFlujo(): void {
    this.router.navigate(['/workflows/nuevo']);
  }

  editarFlujo(id: number): void {
    this.router.navigate(['/workflows/editar', id]);
  }

  verFlujo(id: number): void {
    this.router.navigate(['/workflows/ver', id]);
  }

  eliminarFlujo(id: number): void {
    if (confirm('¿Está seguro de que desea eliminar este flujo de trabajo? Esta acción no se puede deshacer.')) {
      this.workflowService.eliminarFlujo(id).subscribe({
        next: () => {
          this.flujos = this.flujos.filter(f => f.id !== id);
        },
        error: (err) => {
          console.error('Error al eliminar flujo de trabajo', err);
          alert('Error al eliminar el flujo de trabajo. Por favor, intente nuevamente.');
        }
      });
    }
  }
}