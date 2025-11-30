import { Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ContabilidadComponent } from './pages/contabilidad/contabilidad.component';
import { InventarioComponent } from './pages/inventario/inventario.component';
import { FacturacionComponent } from './pages/facturacion/facturacion.component';
import { CuentasPorCobrarComponent } from './pages/cuentas-por-cobrar/cuentas-por-cobrar.component';
import { CuentasPorPagarComponent } from './pages/cuentas-por-pagar/cuentas-por-pagar.component';
import { BancosComponent } from './pages/bancos/bancos.component';
import { ActivosFijosComponent } from './pages/activos-fijos/activos-fijos.component';
import { NominaComponent } from './pages/nomina/nomina.component';
import { ComprasComponent } from './pages/compras/compras.component';
import { PosComponent } from './pages/pos/pos.component';



export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'contabilidad', component: ContabilidadComponent },
  { path: 'facturacion', component: FacturacionComponent },
  { path: 'inventarios', component: InventarioComponent },
  { path: 'cxc', component: CuentasPorCobrarComponent },
  { path: 'cxp', component: CuentasPorPagarComponent },
  { path: 'bancos', component: BancosComponent }, 
  { path: 'activos', component: ActivosFijosComponent },
  { path: 'nomina', component: NominaComponent },
  { path: 'compras', component: ComprasComponent },
  { path: 'pos', component: PosComponent },
  { path: '**', redirectTo: '' }
];

