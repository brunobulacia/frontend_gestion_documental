import { Component, OnInit } from '@angular/core';
import { FormulariosService } from '../../core/services/formularios/formularios.service';
import { Formulario } from '../../models/formulario.model';

//IMPORTS PARA CRUD
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';

@Component({
  selector: 'app-formularios',
  standalone: true,
  imports: [RouterLink, CommonModule, RouterOutlet],
  templateUrl: './formularios.component.html',
  styleUrl: './formularios.component.css',
})
export class FormulariosComponent {
  constructor(
    private formulariosService: FormulariosService,
    private router: Router
  ) {}

  formularios: Formulario[] = [];

  ngOnInit() {
    this.formulariosService.getFormularios().subscribe((data) => {
      this.formularios = data;
      console.log(this.formularios);
    });
  }

  verCamposFormulario(id: number) {
    this.router.navigate(['/campos-formulario', id]);
  }
}
