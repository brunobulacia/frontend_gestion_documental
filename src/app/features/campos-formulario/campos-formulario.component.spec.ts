import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CamposFormularioComponent } from './campos-formulario.component';

describe('CamposFormularioComponent', () => {
  let component: CamposFormularioComponent;
  let fixture: ComponentFixture<CamposFormularioComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CamposFormularioComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CamposFormularioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
