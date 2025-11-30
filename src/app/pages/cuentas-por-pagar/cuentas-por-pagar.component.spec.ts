import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CuentasPorPagarComponent } from './cuentas-por-pagar.component';

describe('CuentasPorPagarComponent', () => {
  let component: CuentasPorPagarComponent;
  let fixture: ComponentFixture<CuentasPorPagarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CuentasPorPagarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CuentasPorPagarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
