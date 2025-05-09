import { Routes } from '@angular/router';
import MainLayoutComponent from './layout/main-layout/main-layout.component';
import AuthLayoutComponent from './layout/auth-layout/auth-layout.component';
import { authGuard } from './core/guards/auth.guard';
import DocumentsComponent from './features/documentos/documentos.component';
import DashboardComponent from './features/dashboard/dashboard.component';
import WorkflowListComponent from './features/workflows/workflow-list/workflow-list.component';
import WorkflowEditorComponent from './features/workflows/workflow-editor/workflow-editor.component';
import WorkflowViewerComponent from './features/workflows/workflow-viewer/workflow-viewer.component';

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
      ]
    },
    {
      path: 'login',
      component: AuthLayoutComponent,
    },
    { path: '**', redirectTo: 'login' } // fallback
  ];