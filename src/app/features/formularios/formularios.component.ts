import { Component, OnInit } from '@angular/core';
import { FormulariosService } from '../../core/services/formularios/formularios.service';
import { Formulario } from '../../models/formulario.model';

//IMPORTS PARA CRUD
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import {
  LucideAngularModule,
  BookIcon,
  CalendarIcon,
  UserIcon,
  ClockIcon,
} from 'lucide-angular';

@Component({
  selector: 'app-formularios',
  standalone: true,
  imports: [RouterLink, CommonModule, RouterOutlet, LucideAngularModule],
  templateUrl: './formularios.component.html',
  styleUrl: './formularios.component.css',
})
export class FormulariosComponent {
  constructor(
    private formulariosService: FormulariosService,
    private router: Router
  ) {}

  formularios: Formulario[] = [];
  readonly BookIcon = BookIcon;
  readonly CalendarIcon = CalendarIcon;

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
