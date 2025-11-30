import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
// CoreUI
import { 
  CardModule, GridModule, TableModule, ButtonModule, BadgeModule, 
  ModalModule, FormModule, NavModule, AccordionModule, SharedModule, TooltipModule
} from '@coreui/angular';
import { IconModule } from '@coreui/icons-angular';
// Iconos: Se agregó 'cilPencil' que faltaba
import { 
  cilArrowLeft, cilCloudDownload, cilPlus, cilSave, cilX, 
  cilFolderOpen, cilChartLine, cilList, cilUser, cilMoney, cilCalendar, 
  cilWarning, cilCheckCircle, cilClock, cilPhone, cilDescription, 
  cilActionUndo, cilBank, cilEnvelopeLetter, cilPencil
} from '@coreui/icons';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-cuentas-por-cobrar',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    CardModule, GridModule, TableModule, ButtonModule, BadgeModule, 
    ModalModule, FormModule, IconModule, NavModule, AccordionModule, SharedModule, TooltipModule
  ],
  templateUrl: './cuentas-por-cobrar.component.html',
  styleUrls: ['./cuentas-por-cobrar.component.scss']
})
export class CuentasPorCobrarComponent {

  // === 1. REGISTRO DE ICONOS (Se agregó cilPencil) ===
  icons = { 
    cilArrowLeft, cilCloudDownload, cilPlus, cilSave, cilX, cilFolderOpen, cilChartLine, 
    cilList, cilUser, cilMoney, cilCalendar, cilWarning, cilCheckCircle, cilClock, 
    cilPhone, cilDescription, cilActionUndo, cilBank, cilEnvelopeLetter, cilPencil
  };

  // === MENÚ ===
  menuEstructura = [
    {
      titulo: 'Catálogos', icono: 'cilList', id: 'catalogos',
      items: [
        { id: 'clientes', nombre: 'Cartera de Clientes' },
        { id: 'limites', nombre: 'Límites de Crédito' },
        { id: 'condiciones', nombre: 'Condiciones de Pago' }
      ]
    },
    {
      titulo: 'Gestiones', icono: 'cilMoney', id: 'gestiones',
      items: [
        { id: 'estados-cuenta', nombre: 'Estados de Cuenta' },
        { id: 'antiguedad', nombre: 'Antigüedad de Saldos' },
        { id: 'registro-pagos', nombre: 'Registro de Pagos' },
        { id: 'aplicacion', nombre: 'Aplicación de Pagos' }, // Se asegura que el ID coincida con HTML
        { id: 'reversion', nombre: 'Reversión de Pagos' },
        { id: 'cobranzas', nombre: 'Gestión de Cobranzas' }
      ]
    },
    {
      titulo: 'Reportes', icono: 'cilChartLine', id: 'reportes',
      items: [
        { id: 'vencidas', nombre: 'Cuentas Vencidas' },
        { id: 'historial-cobranzas', nombre: 'Historial de Gestión' },
        { id: 'reporte-antiguedad', nombre: 'Reporte General Aging' }
      ]
    }
  ];

  // Estado
  vistaActual: string = 'dashboard';
  tituloVista: string = 'Panel de Control CxC';

  // KPIs
  totalCartera: number = 52450.00;
  totalVencido: number = 12300.50; // Alerta roja
  cobradoMes: number = 18500.00;

  // Modales
  public liveModalVisible = false; // Pago
  public modalClienteVisible = false;
  public modalLimiteVisible = false;
  public modalGestionVisible = false; // CRM Cobranza
  public modalReversionVisible = false;

  // Forms
  pagoForm: FormGroup;
  clienteForm: FormGroup;
  limiteForm: FormGroup;
  gestionForm: FormGroup; // Notas de llamada
  reversionForm: FormGroup;

  // === DATA MOCK ===

  // Clientes y Límites
  clientes = [
    { codigo: 'C001', nombre: 'Corporación Favorita', ruc: '1790016919001', limite: 20000, usado: 15000, disponible: 5000, condicion: '30 Días' },
    { codigo: 'C002', nombre: 'Juan Pérez', ruc: '0912345678001', limite: 1000, usado: 575, disponible: 425, condicion: 'Contado' },
    { codigo: 'C003', nombre: 'Distribuidora ABC', ruc: '0990008881001', limite: 5000, usado: 4800, disponible: 200, condicion: '15 Días' }
  ];

  condiciones = [
    { codigo: 'CON', nombre: 'Contado', dias: 0 },
    { codigo: 'CR15', nombre: 'Crédito 15 Días', dias: 15 },
    { codigo: 'CR30', nombre: 'Crédito 30 Días', dias: 30 },
    { codigo: 'CR60', nombre: 'Crédito 60 Días', dias: 60 }
  ];

  // Antigüedad / Estado de Cuenta
  saldos = [
    { cliente: 'Corporación Favorita', doc: 'FAC-540', emision: '2025-10-01', vcto: '2025-10-31', mora: 30, saldo: 5000.00, tramo: '30-60 días', estado: 'Vencido' },
    { cliente: 'Corporación Favorita', doc: 'FAC-602', emision: '2025-11-15', vcto: '2025-12-15', mora: 0, saldo: 10000.00, tramo: 'Por Vencer', estado: 'Corriente' },
    { cliente: 'Juan Pérez', doc: 'FAC-541', emision: '2025-11-29', vcto: '2025-11-29', mora: 1, saldo: 575.00, tramo: '1-30 días', estado: 'Vencido' },
    { cliente: 'Distribuidora ABC', doc: 'FAC-400', emision: '2025-08-01', vcto: '2025-08-15', mora: 105, saldo: 4800.00, tramo: '> 90 días', estado: 'Judicial' }
  ];

  // Historial de Cobros
  cobros = [
    { fecha: '2025-11-28', recibo: 'REC-1001', cliente: 'Corporación Favorita', monto: 1150.00, forma: 'Transferencia', banco: 'Produbanco', ref: 'TRF-9988' }
  ];

  // Gestión de Cobranza (CRM)
  gestiones = [
    { fecha: '2025-11-28', cliente: 'Distribuidora ABC', tipo: 'Llamada', resultado: 'Compromiso Pago', nota: 'Prometió pagar el viernes', usuario: 'Agente 1' },
    { fecha: '2025-11-29', cliente: 'Juan Pérez', tipo: 'Correo', resultado: 'Enviado', nota: 'Recordatorio automático', usuario: 'Sistema' }
  ];

  constructor(private fb: FormBuilder) {
    // 1. Registro Pago
    this.pagoForm = this.fb.group({
      cliente: ['', Validators.required],
      documento: ['', Validators.required],
      fecha: [new Date().toISOString().substring(0, 10)],
      monto: [0, Validators.required],
      forma: ['Transferencia'],
      referencia: ['']
    });

    // 2. Cliente Nuevo
    this.clienteForm = this.fb.group({ nombre: [''], ruc: [''], limite: [0], condicion: ['30 Días'] });

    // 3. Modificar Limite
    this.limiteForm = this.fb.group({ cliente: [''], nuevoLimite: [0] });

    // 4. Gestion Cobranza
    this.gestionForm = this.fb.group({ cliente: [''], tipo: ['Llamada'], nota: [''], fechaPromesa: [''] });

    // 5. Reversion
    this.reversionForm = this.fb.group({ recibo: [''], motivo: [''] });
  }

  // --- NAVEGACIÓN ---
  seleccionarVista(item: any) { this.vistaActual = item.id; this.tituloVista = item.nombre; }
  volverDashboard() { this.vistaActual = 'dashboard'; this.tituloVista = 'Panel de Control CxC'; }

  // --- MODALES Y ACCIONES ---

  // Pago (Integración Core)
  toggleModalPago() { this.liveModalVisible = !this.liveModalVisible; if(this.liveModalVisible) this.pagoForm.reset({fecha: new Date().toISOString().substring(0,10), monto:0, forma:'Transferencia'}); }
  guardarPago() {
    if(this.pagoForm.valid) {
      const v = this.pagoForm.value;
      // Simulamos la API
      this.cobros.unshift({fecha: v.fecha, recibo: 'REC-NEW', cliente: v.cliente, monto: v.monto, forma: v.forma, banco: 'B. Guayaquil', ref: v.referencia});
      
      // ALERTA INTEGRACION
      alert(`PAGO APLICADO CORRECTAMENTE.\n\n-> CONTABILIDAD: Asiento generado (Debe: Bancos / Haber: CxC Clientes).\n-> FACTURACIÓN: El saldo de la factura ${v.documento} ha sido actualizado.`);
      
      this.toggleModalPago();
    }
  }

  // Clientes
  toggleModalCliente() { this.modalClienteVisible = !this.modalClienteVisible; }
  guardarCliente() { if(this.clienteForm.valid){ this.clientes.push({...this.clienteForm.value, codigo:'C-NEW', usado:0, disponible:this.clienteForm.value.limite}); this.toggleModalCliente(); }}

  // Limites
  toggleModalLimite() { this.modalLimiteVisible = !this.modalLimiteVisible; }
  guardarLimite() { alert('Límite actualizado y notificado a pedidos.'); this.toggleModalLimite(); }

  // Gestion
  toggleModalGestion() { this.modalGestionVisible = !this.modalGestionVisible; }
  guardarGestion() { 
    this.gestiones.unshift({ fecha: new Date().toISOString().substring(0,10), cliente: this.gestionForm.value.cliente, tipo: this.gestionForm.value.tipo, resultado: 'Registrado', nota: this.gestionForm.value.nota, usuario: 'Tu Usuario'});
    this.toggleModalGestion(); 
  }

  // Reversion
  toggleModalReversion() { this.modalReversionVisible = !this.modalReversionVisible; }
  ejecutarReversion() { alert('ATENCIÓN: Se reversará el asiento contable y se abrirá nuevamente la factura.'); this.toggleModalReversion(); }

  // PDF
  exportarPDF() {
    const doc = new jsPDF();
    doc.text(this.tituloVista, 14, 20);
    const fmt = new Intl.NumberFormat('en-US', { style:'currency', currency:'USD'});

    if(this.vistaActual === 'antiguedad' || this.vistaActual === 'estados-cuenta' || this.vistaActual === 'vencidas') {
       const head = [['Cliente', 'Factura', 'Vencimiento', 'Tramo', 'Saldo']];
       const data = this.saldos.map(s => [s.cliente, s.doc, s.vcto, s.tramo, fmt.format(s.saldo)]);
       autoTable(doc, { startY: 30, head, body: data });
    }
    // (Otros reportes lógica similar)
    doc.save(`CxC_${this.vistaActual}.pdf`);
  }
}