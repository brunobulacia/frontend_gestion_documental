import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowViewerComponent } from './workflow-viewer.component';

describe('WorkflowViewerComponent', () => {
  let component: WorkflowViewerComponent;
  let fixture: ComponentFixture<WorkflowViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkflowViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkflowViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
