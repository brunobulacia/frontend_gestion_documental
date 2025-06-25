import { Routes } from '@angular/router';
import MainLayoutComponent from './layout/main-layout/main-layout.component';
import AuthLayoutComponent from './layout/auth-layout/auth-layout.component';
import { authGuard } from './core/guards/auth.guard';
import DocumentsComponent from './features/documentos/documentos.component';
import DashboardComponent from './features/dashboard/dashboard.component';
import WorkflowListComponent from './features/workflows/workflow-list/workflow-list.component';
import WorkflowEditorComponent from './features/workflows/workflow-editor/workflow-editor.component';
import WorkflowViewerComponent from './features/workflows/workflow-viewer/workflow-viewer.component';
import { SubscriptionPlansComponent } from './features/planes/planes.component';
import { FormulariosComponent } from './features/formularios/formularios.component';
import { CamposFormularioComponent } from './features/campos-formulario/campos-formulario.component';
import { RespuestaFormComponent } from './features/respuesta-form/respuesta-form.component';
import { ReglasComponent } from './features/reglas/reglas.component';
import { EjecucionesReglaComponent } from './features/ejecuciones-regla/ejecuciones-regla.component';
import { UsuariosComponent } from './features/usuarios/usuarios.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'documents', component: DocumentsComponent },
      { path: 'workflows', component: WorkflowListComponent },
      { path: 'workflows/nuevo', component: WorkflowEditorComponent },
      { path: 'workflows/editar/:id', component: WorkflowEditorComponent },
      { path: 'workflows/ver/:id', component: WorkflowViewerComponent },
      { path: 'planes', component: SubscriptionPlansComponent },
      { path: 'formularios', component: FormulariosComponent },
      { path: 'campos-formulario/:id', component: CamposFormularioComponent },
      { path: 'resp-formulario', component: RespuestaFormComponent },
      { path: 'reglas', component: ReglasComponent },
      { path: 'ejecuciones-reglas/:id', component: EjecucionesReglaComponent },
      { path: 'usuarios', component: UsuariosComponent },
    ],
  },
  {
    path: 'login',
    component: AuthLayoutComponent,
  },
  { path: '**', redirectTo: 'login' }, // fallback
];
