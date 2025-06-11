import { Component,  OnInit } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule, ReactiveFormsModule } from "@angular/forms"
import { MatCardModule } from "@angular/material/card"
import { MatButtonModule } from "@angular/material/button"
import { MatChipsModule } from "@angular/material/chips"
import { MatDialogModule,  MatDialog } from "@angular/material/dialog"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatInputModule } from "@angular/material/input"
import { MatIconModule } from "@angular/material/icon"
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner"
import {  MatSnackBar, MatSnackBarModule } from "@angular/material/snack-bar"
import { MatDividerModule } from "@angular/material/divider"
import  { SubscriptionService } from "../../core/services/subscription.service"
import  { Plan, PlanActual, OrganizacionData } from "../../models/plan.models"
import { SubscriptionDialogComponent } from "../planes/modal/modal.component"

@Component({
  selector: "app-subscription-plans",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatChipsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
  ],
  templateUrl: "./planes.component.html",
  styleUrls: ["./planes.component.css"],
})
export class SubscriptionPlansComponent implements OnInit {
  planActual: PlanActual | null = null
  loading = true

  planesDisponibles: Plan[] = [
    {
      id: 1,
      nombre: "BÁSICO",
      descripcion: "Perfecto para equipos pequeños que están comenzando",
      precio: "19.00",
      maximo_usuarios: 3,
      caracteristicas: [
        "Hasta 3 usuarios",
        "10 GB de almacenamiento",
        "Hasta 500 documentos mensuales",
        "Historial de 30 días",
      ],
    },
    {
      id: 2,
      nombre: "PROFESIONAL",
      descripcion: "Ideal para equipos en crecimiento con necesidades avanzadas",
      precio: "59.00",
      maximo_usuarios: 15,
      popular: true,
      caracteristicas: [
        "Hasta 15 usuarios",
        "100 GB de almacenamiento",
        "Hasta 5000 documentos mensuales",
        "Lector OCR",
        "Historial ilimitado",
        "Reportes personalizados",
      ],
    },
    {
      id: 3,
      nombre: "EMPRESARIAL",
      descripcion: "Para organizaciones grandes con requisitos empresariales",
      precio: "149.00",
      maximo_usuarios: 50,
      caracteristicas: [
        "Hasta 50 usuarios",
        "500 GB de almacenamiento",
        "Documentos mensuales ilimitados",
        "Todas las funcionalidades",
        "Gestor de cuenta dedicado",
        "Personalización completa",
      ],
    },
  ]

  constructor(
    private subscriptionService: SubscriptionService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.obtenerPlanActual()
  }

  obtenerPlanActual(): void {
    this.subscriptionService.obtenerPlanActual().subscribe({
      next: (plan) => {
        this.planActual = plan
        this.loading = false
      },
      error: (error) => {
        if (error.status === 400 || error.status === 404) {
          // Usuario sin organización o sin plan
          this.planActual = null
        } else {
          this.mostrarError("Error al cargar el plan actual")
        }
        this.loading = false
      },
    })
  }

  getPlanIcon(planNombre: string): string {
    switch (planNombre.toUpperCase()) {
      case "BÁSICO":
        return "file-alt"
      case "PROFESIONAL":
        return "bolt"
      case "EMPRESARIAL":
        return "crown"
      default:
        return "shield-alt"
    }
  }

  getButtonText(plan: Plan): string {
    if (!this.planActual) return "Suscribirse"
    if (this.planActual.id === plan.id) return "Plan Actual"
    if (Number.parseFloat(plan.precio) > Number.parseFloat(this.planActual.precio)) return "Mejorar Plan"
    return "Cambiar Plan"
  }

  isButtonDisabled(plan: Plan): boolean {
    return this.planActual?.id === plan.id
  }

  handleSuscribirse(plan: Plan): void {
    const dialogRef = this.dialog.open(SubscriptionDialogComponent, {
      width: "500px",
      data: {
        plan: plan,
        planActual: this.planActual,
        tienePlan: !!this.planActual,
      },
    })

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.procesarSuscripcion(plan, result)
      }
    })
  }

  private procesarSuscripcion(plan: Plan, organizacionData?: OrganizacionData): void {
    const request: any = {
      plan_id: plan.id,
    }

    if (!this.planActual && organizacionData) {
      request.organizacion = organizacionData
    }

    this.subscriptionService.suscribirUsuario(request).subscribe({
      next: () => {
        this.mostrarExito(`¡Te has suscrito al plan ${plan.nombre} correctamente!`)
        this.obtenerPlanActual()
      },
      error: (error) => {
        const mensaje = error.error?.error || "No se pudo completar la suscripción"
        this.mostrarError(mensaje)
      },
    })
  }

  private mostrarExito(mensaje: string): void {
    this.snackBar.open(mensaje, "Cerrar", {
      duration: 5000,
      panelClass: ["success-snackbar"],
    })
  }

  private mostrarError(mensaje: string): void {
    this.snackBar.open(mensaje, "Cerrar", {
      duration: 5000,
      panelClass: ["error-snackbar"],
    })
  }
}
