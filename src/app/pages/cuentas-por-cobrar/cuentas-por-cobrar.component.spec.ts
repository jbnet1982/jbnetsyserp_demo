import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CuentasPorCobrarComponent } from './cuentas-por-cobrar.component';

describe('CuentasPorCobrarComponent', () => {
  let component: CuentasPorCobrarComponent;
  let fixture: ComponentFixture<CuentasPorCobrarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CuentasPorCobrarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CuentasPorCobrarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
