import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
// Imports CoreUI
import { 
  CardModule, GridModule, TableModule, ButtonModule, BadgeModule, 
  ModalModule, FormModule, NavModule, AccordionModule, SharedModule, TooltipModule
} from '@coreui/angular';
import { IconModule } from '@coreui/icons-angular';
// Iconos necesarios
import { 
  cilArrowLeft, cilCloudDownload, cilPlus, cilSave, cilX, 
  cilFolderOpen, cilChartLine, cilList, cilUser, cilMoney, cilCalendar, 
  cilWarning, cilCheckCircle, cilClock, cilPen, cilBank, 
  cilSwapHorizontal, cilWallet, cilCash, cilDescription, cilCheckAlt, cilPrint
} from '@coreui/icons';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-bancos',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    CardModule, GridModule, TableModule, ButtonModule, BadgeModule, 
    ModalModule, FormModule, IconModule, NavModule, AccordionModule, SharedModule, TooltipModule
  ],
  templateUrl: './bancos.component.html',
  styleUrls: ['./bancos.component.scss']
})
export class BancosComponent {

  // === 1. ICONOS ===
  icons = { 
    cilArrowLeft, cilCloudDownload, cilPlus, cilSave, cilX, cilFolderOpen, cilChartLine, 
    cilList, cilUser, cilMoney, cilCalendar, cilWarning, cilCheckCircle, cilClock, 
    cilPen, cilBank, cilSwapHorizontal, cilWallet, cilCash, cilDescription, 
    cilCheckAlt, cilPrint
  };

  // === 2. MENU ESTRUCTURA ===
  menuEstructura = [
    {
      titulo: 'Catálogos', icono: 'cilList', id: 'catalogos',
      items: [
        { id: 'cuentas-bancarias', nombre: 'Cuentas Bancarias' },
        { id: 'tipos-transaccion', nombre: 'Tipos de Transacciones' }
      ]
    },
    {
      titulo: 'Operaciones', icono: 'cilSwapHorizontal', id: 'operaciones',
      items: [
        { id: 'ingresos', nombre: 'Ingresos Bancarios' },
        { id: 'egresos', nombre: 'Egresos Bancarios' },
        { id: 'transferencias', nombre: 'Transferencias' },
        { id: 'cheques', nombre: 'Gestión de Cheques' },
        { id: 'caja-chica', nombre: 'Gestión Caja Chica' },
        { id: 'conciliacion', nombre: 'Conciliación Bancaria' }
      ]
    },
    {
      titulo: 'Reportes', icono: 'cilChartLine', id: 'reportes',
      items: [
        { id: 'estado-bancario', nombre: 'Estado de Cuenta' },
        { id: 'reporte-conciliacion', nombre: 'Reporte Conciliación' },
        { id: 'flujo-caja', nombre: 'Flujo de Caja' }
      ]
    }
  ];

  // Estado General
  vistaActual: string = 'dashboard';
  tituloVista: string = 'Tesorería y Bancos';

  // KPI Dashboard
  saldoTotalBancos: number = 45800.25;
  saldoCajaChica: number = 250.00;
  porConciliar: number = 3;

  // Variables Modales
  public liveModalVisible = false;       // Transacción Genérica (Ingreso/Egreso)
  public modalCuentaVisible = false;     // Nueva Cuenta
  public modalTransferenciaVisible = false; 
  public modalChequeVisible = false;
  public modalCajaVisible = false;       // Caja Chica
  public modalConciliacionVisible = false; // Acción de Conciliar

  // Formularios
  transaccionForm: FormGroup;
  cuentaForm: FormGroup;
  transferenciaForm: FormGroup;
  chequeForm: FormGroup;
  cajaForm: FormGroup;
  conciliacionForm: FormGroup;

  // Listas (Show All toggles)
  showAll = false;
  initialLimit = 5;

  // === 3. DATOS (MOCK DATA) ===

  cuentasBancarias = [
    { banco: 'Banco Pichincha', numero: '2200334455', tipo: 'Corriente', moneda: 'USD', saldo: 25400.00, estado: 'Activo' },
    { banco: 'Banco Guayaquil', numero: '14558877', tipo: 'Ahorros', moneda: 'USD', saldo: 20400.25, estado: 'Activo' }
  ];

  tiposTransaccion = [
    { codigo: 'DEP', nombre: 'Depósito', efecto: 'Suma' },
    { codigo: 'TRF', nombre: 'Transferencia', efecto: 'Neutro' },
    { codigo: 'ND', nombre: 'Nota de Débito', efecto: 'Resta' },
    { codigo: 'NC', nombre: 'Nota de Crédito', efecto: 'Suma' },
    { codigo: 'CHQ', nombre: 'Cheque', efecto: 'Resta' }
  ];

  // Movimientos generales
  transacciones = [
    { fecha: '2025-11-29', tipo: 'Ingreso', concepto: 'Cobro Fac #540', banco: 'Banco Pichincha', monto: 1150.00, ref: 'TRF-9090', conciliado: true },
    { fecha: '2025-11-28', tipo: 'Egreso', concepto: 'Pago Proveedor ABC', banco: 'Banco Guayaquil', monto: 500.00, ref: 'TRF-1212', conciliado: false }
  ];

  cheques = [
    { numero: '000458', banco: 'Banco Pichincha', beneficiario: 'Juan Pérez (Arriendo)', monto: 850.00, fechaEmision: '2025-11-25', fechaCobro: '2025-11-30', estado: 'Emitido' },
    { numero: '000459', banco: 'Banco Pichincha', beneficiario: 'Seguros SA', monto: 1200.00, fechaEmision: '2025-11-28', fechaCobro: '2025-12-05', estado: 'Girado' }
  ];

  cajaChica = [
    { fecha: '2025-11-30', responsable: 'Maria Lopez', concepto: 'Compra agua y café', monto: 12.50, estado: 'Revisado' },
    { fecha: '2025-11-29', responsable: 'Jose Diaz', concepto: 'Taxi Mensajería', monto: 5.00, estado: 'Pendiente' }
  ];

  conciliaciones = [
    { mes: 'Octubre 2025', banco: 'Banco Pichincha', saldoLibros: 22000, saldoBanco: 22000, diferencia: 0, estado: 'Conciliado' }
  ];

  // Reporte Flujo Caja (Mock)
  flujoCaja = [
    { rubro: 'SALDO INICIAL', valor: 40000.00, esTotal: true },
    { rubro: 'Ingresos por Ventas', valor: 15000.00, esTotal: false },
    { rubro: 'Pago Proveedores', valor: -8000.00, esTotal: false },
    { rubro: 'Gastos Operativos', valor: -1200.00, esTotal: false },
    { rubro: 'SALDO FINAL', valor: 45800.00, esTotal: true }
  ];

  get totalDisponible() { return this.saldoTotalBancos + this.saldoCajaChica; }
  get listaTransacciones() { return this.showAll ? this.transacciones : this.transacciones.slice(0, this.initialLimit); }

  constructor(private fb: FormBuilder) {
    // Forms Initialization
    this.cuentaForm = this.fb.group({ banco: ['', Validators.required], numero: ['', Validators.required], tipo: ['Corriente'], saldoInicial: [0] });
    this.transaccionForm = this.fb.group({ tipo: ['Ingreso'], fecha: [new Date().toISOString().substring(0,10)], banco: [''], monto: [0], concepto: [''], referencia: [''] });
    this.transferenciaForm = this.fb.group({ origen: [''], destino: [''], monto: [0], fecha: [new Date().toISOString().substring(0,10)], concepto: ['Traslado de fondos'] });
    this.chequeForm = this.fb.group({ banco: [''], numero: [''], beneficiario: [''], monto: [0], fechaCobro: [''] });
    this.cajaForm = this.fb.group({ concepto: [''], monto: [0], responsable: [''] });
    this.conciliacionForm = this.fb.group({ banco: [''], mes: [''], saldoExtracto: [0] });
  }

  seleccionarVista(item: any) { this.vistaActual = item.id; this.tituloVista = item.nombre; }
  volverDashboard() { this.vistaActual = 'dashboard'; this.tituloVista = 'Tesorería y Bancos'; }

  // PDF Generation
  exportarPDF() {
    const doc = new jsPDF();
    doc.text(`Reporte: ${this.tituloVista}`, 14, 20);
    const fmt = new Intl.NumberFormat('en-US', { style:'currency', currency:'USD'});

    if (this.vistaActual === 'cuentas-bancarias' || this.vistaActual === 'estado-bancario') {
       const head = [['Banco', 'Número', 'Tipo', 'Saldo']]; 
       const data = this.cuentasBancarias.map(c => [c.banco, c.numero, c.tipo, fmt.format(c.saldo)]); 
       autoTable(doc, { startY: 30, head, body: data });
    } else if (this.vistaActual === 'flujo-caja') {
       const head = [['Rubro', 'Monto']];
       const data = this.flujoCaja.map(f => [f.rubro, fmt.format(f.valor)]);
       autoTable(doc, { startY: 30, head, body: data });
    }
    // Lógica extendible...
    doc.save(`${this.vistaActual}.pdf`);
  }

  // === LÓGICA DE ACCIONES Y MODALES ===

  toggleShowAll() { this.showAll = !this.showAll; }

  // 1. CUENTA BANCARIA
  toggleModalCuenta() { this.modalCuentaVisible = !this.modalCuentaVisible; }
  guardarCuenta() { 
    if(this.cuentaForm.valid){ 
        this.cuentasBancarias.push({...this.cuentaForm.value, moneda:'USD', estado:'Activo', saldo: this.cuentaForm.value.saldoInicial});
        alert('Cuenta Bancaria creada.\n>> CONTABILIDAD: Cuenta contable del activo creada automáticamente.');
        this.toggleModalCuenta(); 
    } 
  }

  // 2. TRANSACCIÓN (Ingreso/Egreso)
  toggleModalTransaccion() { this.liveModalVisible = !this.liveModalVisible; if(this.liveModalVisible) this.transaccionForm.reset({fecha:new Date().toISOString().substring(0,10)}); }
  guardarTransaccion() {
    if(this.transaccionForm.valid) {
        const val = this.transaccionForm.value;
        this.transacciones.unshift({fecha:val.fecha, tipo:val.tipo, concepto:val.concepto, banco: val.banco, monto:val.monto, ref: val.referencia || 'N/A', conciliado: false});
        alert(`MOVIMIENTO REGISTRADO.\n\n>> INTEGRACIÓN: Se ha generado el asiento contable de ${val.tipo} en Bancos.`);
        this.toggleModalTransaccion();
    }
  }

  // 3. TRANSFERENCIA
  toggleModalTransferencia() { this.modalTransferenciaVisible = !this.modalTransferenciaVisible; }
  guardarTransferencia() {
      alert('TRANSFERENCIA EXITOSA.\nSaldo debitado de Origen y acreditado en Destino.\nAsiento Contable automático generado.');
      this.toggleModalTransferencia();
  }

  // 4. CHEQUE
  toggleModalCheque() { this.modalChequeVisible = !this.modalChequeVisible; }
  guardarCheque() {
      if(this.chequeForm.valid) {
          const val = this.chequeForm.value;
          this.cheques.unshift({numero: val.numero, banco: val.banco, beneficiario: val.beneficiario, monto: val.monto, fechaEmision: new Date().toISOString().substring(0,10), fechaCobro: val.fechaCobro, estado:'Girado'});
          alert('CHEQUE GIRADO.\nContabilidad: Asiento provisional generado (Cuentas por pagar o Gasto).');
          this.toggleModalCheque();
      }
  }

  // 5. CAJA CHICA
  toggleModalCaja() { this.modalCajaVisible = !this.modalCajaVisible; }
  guardarCaja() {
      if(this.cajaForm.valid) {
          this.cajaChica.unshift({fecha:new Date().toISOString().substring(0,10), ...this.cajaForm.value, estado:'Pendiente'});
          this.saldoCajaChica -= this.cajaForm.value.monto;
          this.toggleModalCaja();
      }
  }

  // 6. CONCILIACIÓN
  toggleModalConciliacion() { this.modalConciliacionVisible = !this.modalConciliacionVisible; }
  guardarConciliacion() {
      alert('PROCESO FINALIZADO.\nEl saldo en libros ha sido cuadrado con el extracto bancario cargado.');
      this.toggleModalConciliacion();
  }
}