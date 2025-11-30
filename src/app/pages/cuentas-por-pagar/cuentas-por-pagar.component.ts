import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
// CoreUI Modules
import { 
  CardModule, GridModule, TableModule, ButtonModule, BadgeModule, 
  ModalModule, FormModule, NavModule, AccordionModule, SharedModule, TooltipModule
} from '@coreui/angular';
import { IconModule } from '@coreui/icons-angular';
// Iconos necesarios (Se agregan Truck para proveedores, Clipboard para Retenciones)
import { 
  cilArrowLeft, cilCloudDownload, cilPlus, cilSave, cilX, 
  cilChevronBottom, cilChevronTop, cilFolderOpen, cilChartLine, 
  cilList, cilUser, cilMoney, cilCalendar, cilWarning, cilCheckCircle, 
  cilClock, cilPhone, cilDescription, cilActionUndo, cilBank, 
  cilEnvelopeLetter, cilTruck, cilClipboard, cilFile, cilCreditCard
} from '@coreui/icons';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-cuentas-por-pagar',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    CardModule, GridModule, TableModule, ButtonModule, BadgeModule, 
    ModalModule, FormModule, IconModule, NavModule, AccordionModule, SharedModule, TooltipModule
  ],
  templateUrl: './cuentas-por-pagar.component.html',
  styleUrls: ['./cuentas-por-pagar.component.scss']
})
export class CuentasPorPagarComponent {

  icons = { 
    cilArrowLeft, cilCloudDownload, cilPlus, cilSave, cilX, cilFolderOpen, cilChartLine, 
    cilList, cilUser, cilMoney, cilCalendar, cilWarning, cilCheckCircle, cilClock, 
    cilPhone, cilDescription, cilActionUndo, cilBank, cilEnvelopeLetter, cilTruck,
    cilClipboard, cilFile, cilCreditCard
  };

  // === ESTRUCTURA DEL MENÚ ===
  menuEstructura = [
    {
      titulo: 'Catálogos', icono: 'cilList', id: 'catalogos',
      items: [
        { id: 'proveedores', nombre: 'Proveedores' },
        { id: 'condiciones', nombre: 'Condiciones de Pago' }
      ]
    },
    {
      titulo: 'Operaciones', icono: 'cilMoney', id: 'operaciones',
      items: [
        { id: 'ingreso-facturas', nombre: 'Facturas de Compra' },
        { id: 'notas-credito', nombre: 'Notas de Crédito' },
        { id: 'notas-debito', nombre: 'Notas de Débito' },
        { id: 'retenciones', nombre: 'Retenciones' },
        { id: 'programacion', nombre: 'Programación de Pagos' },
        { id: 'registro-pagos', nombre: 'Registro de Pagos' }
      ]
    },
    {
      titulo: 'Reportes', icono: 'cilChartLine', id: 'reportes',
      items: [
        { id: 'vencidas', nombre: 'CxP Vencidas' },
        { id: 'saldos-proveedor', nombre: 'Saldos por Proveedor' },
        { id: 'proyeccion', nombre: 'Proyección de Pagos' }
      ]
    }
  ];

  // Estado Visual
  vistaActual: string = 'dashboard';
  tituloVista: string = 'Gestión de Proveedores';

  // KPI Dashboard
  deudaTotal: number = 25400.00;
  pagosMes: number = 8500.00;
  vencido: number = 4200.00;

  // Variables Modales
  public modalProveedorVisible = false;
  public modalFacturaVisible = false;
  public modalPagoVisible = false;
  public modalRetencionVisible = false;
  public modalProgramacionVisible = false;

  // Formularios
  proveedorForm: FormGroup;
  facturaForm: FormGroup;
  pagoForm: FormGroup;
  retencionForm: FormGroup;

  // Filtros visuales
  showAll: boolean = false;
  initialLimit: number = 5;

  // === DATOS DE EJEMPLO (MOCK) ===

  proveedores = [
    { codigo: 'PRV-001', nombre: 'TechSolutions S.A.', ruc: '1799998888001', categoria: 'Tecnología', contacto: 'Roberto Gomez', telefono: '099123456', estado: 'Activo' },
    { codigo: 'PRV-002', nombre: 'Insumos de Oficina Ltda.', ruc: '0991231231001', categoria: 'Suministros', contacto: 'Maria Paz', telefono: '042223334', estado: 'Activo' },
    { codigo: 'PRV-003', nombre: 'Servicios de Limpieza Express', ruc: '1722223334001', categoria: 'Servicios', contacto: 'Luis Diaz', telefono: '098765432', estado: 'Activo' }
  ];

  condiciones = [
    { codigo: '01', nombre: 'Contado', dias: 0 },
    { codigo: '02', nombre: 'Crédito 15 Días', dias: 15 },
    { codigo: '03', nombre: 'Crédito 30 Días', dias: 30 }
  ];

  // Operaciones: Facturas de Compra
  facturasCompra = [
    { fecha: '2025-11-20', numero: '001-001-0000458', proveedor: 'TechSolutions S.A.', subtotal: 2000.00, iva: 300.00, total: 2300.00, vence: '2025-12-20', estado: 'Pendiente', saldo: 2300.00 },
    { fecha: '2025-11-25', numero: '002-001-0000120', proveedor: 'Insumos de Oficina', subtotal: 150.00, iva: 22.50, total: 172.50, vence: '2025-11-25', estado: 'Pagada', saldo: 0.00 }
  ];

  retenciones = [
    { fecha: '2025-11-25', numero: 'RET-00150', proveedor: 'Insumos de Oficina', facturaRef: '0000120', monto: 2.63, concepto: '1.75% Bienes', estado: 'Autorizada' }
  ];

  pagosRealizados = [
    { fecha: '2025-11-25', numero: 'EGR-550', proveedor: 'Insumos de Oficina', factura: '0000120', forma: 'Transferencia', banco: 'Banco Pichincha', monto: 169.87 }
  ];

  programacion = [
    { fechaPago: '2025-12-05', proveedor: 'TechSolutions S.A.', monto: 1000.00, prioridad: 'Alta', estado: 'Programado' },
    { fechaPago: '2025-12-20', proveedor: 'TechSolutions S.A.', monto: 1300.00, prioridad: 'Media', estado: 'Pendiente' }
  ];

  // Reportes
  reporteVencidas = [
    { proveedor: 'Servicios de Limpieza', factura: 'FAC-999', emision: '2025-10-01', diasMora: 45, monto: 450.00 },
    { proveedor: 'TechSolutions S.A.', factura: 'FAC-400', emision: '2025-09-15', diasMora: 60, monto: 3750.00 }
  ];

  constructor(private fb: FormBuilder) {
    // 1. Proveedor
    this.proveedorForm = this.fb.group({
      ruc: ['', Validators.required], nombre: ['', Validators.required], categoria: ['Servicios'],
      telefono: [''], direccion: [''], credito: [0]
    });

    // 2. Factura Compra (Integración Inv/Cont)
    this.facturaForm = this.fb.group({
      proveedor: ['', Validators.required], fecha: [new Date().toISOString().substring(0,10)], 
      numero: ['', Validators.required], condicion: ['30 Días'],
      concepto: ['Compra de Mercadería'], base: [0], iva: [0], total: [0]
    });

    // 3. Pago (Evolución de Tesorería)
    this.pagoForm = this.fb.group({
      proveedor: ['', Validators.required], factura: ['', Validators.required],
      fecha: [new Date().toISOString().substring(0,10)], forma: ['Transferencia'], monto: [0]
    });

    // 4. Retención
    this.retencionForm = this.fb.group({
      factura: ['', Validators.required], codigoRet: ['312'], porcentaje: [1.75], base: [0]
    });
  }

  // --- NAVEGACIÓN ---
  seleccionarVista(item: any) { this.vistaActual = item.id; this.tituloVista = item.nombre; }
  volverDashboard() { this.vistaActual = 'dashboard'; this.tituloVista = 'Gestión de Proveedores'; }

  get listaFacturas() { return this.showAll ? this.facturasCompra : this.facturasCompra.slice(0, this.initialLimit); }

  // PDF
  exportarPDF() {
    const doc = new jsPDF();
    doc.text(`Reporte: ${this.tituloVista}`, 14, 20);
    const fmt = new Intl.NumberFormat('en-US', { style:'currency', currency:'USD'});

    if (this.vistaActual === 'ingreso-facturas' || this.vistaActual === 'saldos-proveedor') {
        const head = [['Fecha', 'Proveedor', 'Factura', 'Vence', 'Total']];
        const data = this.facturasCompra.map(f => [f.fecha, f.proveedor, f.numero, f.vence, fmt.format(f.total)]);
        autoTable(doc, { startY: 30, head, body: data });
    }
    // Lógica extendible
    doc.save(`CxP_${this.vistaActual}.pdf`);
  }

  // --- MÉTODOS Y ACCIONES (INTEGRACIÓN) ---

  toggleShowAll() { this.showAll = !this.showAll; }

  // 1. Proveedor
  toggleModalProveedor() { this.modalProveedorVisible = !this.modalProveedorVisible; if(this.modalProveedorVisible) this.proveedorForm.reset(); }
  handleModalProveedorChange(e:boolean){ this.modalProveedorVisible = e; }
  guardarProveedor() { 
    if(this.proveedorForm.valid) { 
        this.proveedores.push({...this.proveedorForm.value, codigo:'PRV-NEW', estado:'Activo'}); 
        this.toggleModalProveedor(); 
    } 
  }

  // 2. Factura Compra (Core Integration)
  toggleModalFactura() { this.modalFacturaVisible = !this.modalFacturaVisible; if(this.modalFacturaVisible) this.facturaForm.reset({fecha:new Date().toISOString().substring(0,10), iva:0}); }
  handleModalFacturaChange(e:boolean){ this.modalFacturaVisible = e; }
  guardarFactura() {
    if(this.facturaForm.valid) {
        const val = this.facturaForm.value;
        const nuevoTotal = val.base + val.iva;
        this.facturasCompra.unshift({
            fecha: val.fecha, numero: val.numero, proveedor: val.proveedor, 
            subtotal: val.base, iva: val.iva, total: nuevoTotal, vence: '2025-12-30', estado: 'Pendiente', saldo: nuevoTotal
        });

        // *** INTEGRACIÓN ***
        let msg = 'FACTURA REGISTRADA.\n';
        msg += '-> CONTABILIDAD: Asiento de Compras/Gasto Generado (Debe: Gasto/Inv / Haber: CxP).\n';
        msg += '-> INVENTARIO: Se generó una orden de entrada pendiente de confirmar en bodega.';
        alert(msg);

        this.toggleModalFactura();
    }
  }

  // 3. Registro Pago
  toggleModalPago() { this.modalPagoVisible = !this.modalPagoVisible; }
  handleModalPagoChange(e:boolean){ this.modalPagoVisible = e; }
  guardarPago() {
      if(this.pagoForm.valid) {
          const val = this.pagoForm.value;
          this.pagosRealizados.unshift({fecha:val.fecha, numero:'EGR-NEW', proveedor: val.proveedor, factura:'Var', forma:val.forma, banco:'B. Pichincha', monto:val.monto});
          
          alert('PAGO REGISTRADO.\n-> TESORERÍA: Egreso de Banco generado.\n-> CXP: Saldo de proveedor actualizado.');
          this.toggleModalPago();
      }
  }

  // 4. Retenciones
  toggleModalRetencion() { this.modalRetencionVisible = !this.modalRetencionVisible; }
  guardarRetencion() {
      if(this.retencionForm.valid) {
          this.retenciones.unshift({fecha: new Date().toISOString().substring(0,10), numero:'RET-NEW', proveedor:'Prov Selec', facturaRef:'001', monto: 10.50, concepto:'Renta', estado:'Emitida'});
          this.toggleModalRetencion();
      }
  }

  // 5. Programación (Simple toggle)
  toggleModalProgramacion() { this.modalProgramacionVisible = !this.modalProgramacionVisible; }
  guardarProgramacion() { alert('Pagos programados guardados. Tesorería notificada.'); this.toggleModalProgramacion(); }
}