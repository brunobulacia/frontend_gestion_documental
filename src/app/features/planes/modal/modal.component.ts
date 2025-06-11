import { Component, Inject } from "@angular/core"
import { CommonModule } from "@angular/common"
import { FormsModule, ReactiveFormsModule,  FormBuilder,  FormGroup, Validators } from "@angular/forms"
import { MatDialogModule,  MatDialogRef, MAT_DIALOG_DATA} from "@angular/material/dialog"
import { MatButtonModule } from "@angular/material/button"
import { MatFormFieldModule } from "@angular/material/form-field"
import { MatInputModule } from "@angular/material/input"
import { MatIconModule } from "@angular/material/icon"
import { Plan, PlanActual, OrganizacionData } from "../../../models/plan.models"


interface DialogData {
  plan: Plan
  planActual: PlanActual | null
  tienePlan: boolean
}

@Component({
  selector: "app-subscription-dialog",
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
  ],
  templateUrl: "./modal.component.html",
  styleUrls: ["./modal.component.css"],
})
export class SubscriptionDialogComponent {
  organizacionForm: FormGroup
  data: DialogData

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<SubscriptionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) matDialogData: any,
  ) {
    this.data = matDialogData
    this.organizacionForm = this.fb.group({
      nombre: ["", [Validators.required, Validators.minLength(2)]],
      direccion: [""],
      telefono: [""],
    })
  }

  onCancel(): void {
    this.dialogRef.close()
  }

  onConfirm(): void {
    if (this.data.tienePlan) {
      // Si ya tiene plan, solo confirmar el cambio
      this.dialogRef.close(true)
    } else {
      // Si no tiene plan, validar y enviar datos de organización
      if (this.organizacionForm.valid) {
        const organizacionData: OrganizacionData = this.organizacionForm.value
        this.dialogRef.close(organizacionData)
      } else {
        // Marcar todos los campos como tocados para mostrar errores
        this.organizacionForm.markAllAsTouched()
      }
    }
  }

  getErrorMessage(fieldName: string): string {
    const field = this.organizacionForm.get(fieldName)
    if (field?.hasError("required")) {
      return "Este campo es obligatorio"
    }
    if (field?.hasError("minlength")) {
      return "Mínimo 2 caracteres"
    }
    return ""
  }
}
