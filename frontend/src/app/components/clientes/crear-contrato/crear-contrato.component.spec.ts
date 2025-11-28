import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearContratoComponent } from './crear-contrato.component';

describe('CrearContratoComponent', () => {
  let component: CrearContratoComponent;
  let fixture: ComponentFixture<CrearContratoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearContratoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrearContratoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
