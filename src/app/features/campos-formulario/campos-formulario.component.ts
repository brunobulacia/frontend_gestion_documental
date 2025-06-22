import { Component, OnInit } from '@angular/core';
import { CamposFormularioService } from '../../core/services/formularios/campos-formulario.service';
import { CamposFormulario } from '../../models/campos-formulario.model';
import { Router, RouterLink } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { NgFor } from '@angular/common';
@Component({
  selector: 'app-campos-formulario',
  imports: [NgFor, RouterLink],
  templateUrl: './campos-formulario.component.html',
  styleUrl: './campos-formulario.component.css',
})
export class CamposFormularioComponent {
  constructor(
    private camposFormularioService: CamposFormularioService,
    private router: Router,
    private route: ActivatedRoute
  ) {}
  camposFormulario: CamposFormulario[] = [];
  formId: number = 1;

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const formIdParam = params.get('id');
      if (formIdParam) {
        this.formId = +formIdParam;
        this.camposFormularioService
          .getCamposFormulario(this.formId)
          .subscribe((data) => {
            this.camposFormulario = data;
            console.log(this.camposFormulario);
          });
      }
    });
  }
}
