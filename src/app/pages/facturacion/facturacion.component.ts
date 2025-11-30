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
// Iconos necesarios para Facturación y Ventas
import { 
  cilArrowLeft, cilCloudDownload, cilPlus, cilSave, cilX, 
  cilChevronBottom, cilChevronTop, cilBook, cilMoney, cilLockLocked, 
  cilChartLine, cilFolderOpen, cilSpreadsheet, cilTrash, cilPencil, 
  cilUser, cilBuilding, cilLocationPin, cilPhone, cilGlobeAlt, 
  cilSwapVertical, cilLoop, cilCalendar, cilClock, cilFile, 
  cilDescription, cilCloudUpload, cilTask, cilHistory, cilBan, 
  cilCheckCircle, cilLockUnlocked, cilWarning, cilSearch, cilPrint,
  cilCart, cilCreditCard, cilBriefcase, cilPeople, cilDollar
} from '@coreui/icons';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-facturacion',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    CardModule, GridModule, TableModule, ButtonModule, BadgeModule, 
    ModalModule, FormModule, IconModule, NavModule, AccordionModule, SharedModule, TooltipModule
  ],
  templateUrl: './facturacion.component.html',
  styleUrls: ['./facturacion.component.scss']
})
export class FacturacionComponent {

  // === 1. REGISTRO DE ICONOS ===
  icons = { 
    cilArrowLeft, cilCloudDownload, cilPlus, cilSave, cilX, 
    cilChevronBottom, cilChevronTop, cilBook, cilMoney, cilLockLocked, 
    cilChartLine, cilFolderOpen, cilSpreadsheet, cilTrash, cilPencil, 
    cilUser, cilBuilding, cilLocationPin, cilPhone, cilGlobeAlt, 
    cilSwapVertical, cilLoop, cilCalendar, cilClock, cilFile, 
    cilDescription, cilCloudUpload, cilTask, cilHistory, cilBan, 
    cilCheckCircle, cilLockUnlocked, cilWarning, cilSearch, cilPrint,
    cilCart, cilCreditCard, cilBriefcase, cilPeople, cilDollar
  };

  // === 2. ESTRUCTURA DEL MENÚ ===
  menuEstructura = [
    {
      titulo: 'Catálogos', icono: 'cilBook', id: 'catalogos',
      items: [
        { id: 'clientes', nombre: 'Clientes' },
        { id: 'condiciones', nombre: 'Condiciones de Pago' },
        { id: 'precios', nombre: 'Listas de Precios' },
        { id: 'impuestos', nombre: 'Impuestos' }
      ]
    },
    {
      titulo: 'Operaciones', icono: 'cilCart', id: 'operaciones',
      items: [
        { id: 'cotizaciones', nombre: 'Cotizaciones' },
        { id: 'ordenes', nombre: 'Órdenes de Venta' },
        { id: 'facturas', nombre: 'Facturas de Venta' },
        { id: 'notas-credito', nombre: 'Notas de Crédito' },
        { id: 'notas-debito', nombre: 'Notas de Débito' },
        { id: 'recibos', nombre: 'Recibos de Ingreso' },
        { id: 'pagos', nombre: 'Pagos Recibidos' }
      ]
    },
    {
      titulo: 'Reportes', icono: 'cilChartLine', id: 'reportes',
      items: [ 
        { id: 'ventas-cliente', nombre: 'Ventas por Cliente' },
        { id: 'ventas-producto', nombre: 'Ventas por Producto' },
        { id: 'ventas-periodo', nombre: 'Ventas por Periodo' },
        { id: 'pendientes', nombre: 'Facturas Pendientes' },
        { id: 'estado-cuenta', nombre: 'Estado de Cuenta Clientes' } 
      ]
    }
  ];

  // Estado General
  vistaActual: string = 'dashboard';
  tituloVista: string = 'Resumen Comercial';
  
  // KPI Dashboard
  ventasMes: number = 45200.00;
  cuentasPorCobrar: number = 12500.50;
  facturasPendientes: number = 18;

  // Variables Modales
  public modalClienteVisible = false;
  public modalFacturaVisible = false;
  public modalPagoVisible = false;
  // Otros modales genéricos usarán lógica simple
  public modalGenericoVisible = false;

  // Formularios
  clienteForm: FormGroup;
  facturaForm: FormGroup;
  pagoForm: FormGroup;

  // Filtros visuales
  showAll: boolean = false;
  initialLimit: number = 5;

  // === 3. DATOS DE EJEMPLO (MOCK DATA) ===

  // -- Catálogos --
  clientes = [
    { codigo: 'CL-001', nombre: 'Juan Pérez', ruc: '0912345678001', telefono: '099123456', direccion: 'Centro, Calle 9', estado: 'Activo' },
    { codigo: 'CL-002', nombre: 'Corporación Favorita', ruc: '1790016919001', telefono: '022345678', direccion: 'Quito', estado: 'Activo' },
    { codigo: 'CL-003', nombre: 'Maria Gonzales', ruc: '0998877665', telefono: '042888999', direccion: 'Alborada', estado: 'Inactivo' }
  ];

  condiciones = [
    { codigo: '01', nombre: 'Contado', dias: 0 },
    { codigo: '02', nombre: 'Crédito 30 Días', dias: 30 },
    { codigo: '03', nombre: 'Crédito 60 Días', dias: 60 }
  ];

  listasPrecios = [
    { nombre: 'PVP General', margen: '30%', estado: 'Activo' },
    { nombre: 'Distribuidor', margen: '15%', estado: 'Activo' },
    { nombre: 'Mayorista', margen: '10%', estado: 'Activo' }
  ];

  impuestos = [
    { nombre: 'IVA 15%', porcentaje: 15, tipo: 'Ventas' },
    { nombre: 'IVA 0%', porcentaje: 0, tipo: 'Ventas' }
  ];

  // -- Operaciones --
  facturas = [
    { fecha: '2025-11-28', numero: 'FAC-001-001-000540', cliente: 'Corporación Favorita', subtotal: 1000.00, impuesto: 150.00, total: 1150.00, estado: 'Cobrada', saldo: 0 },
    { fecha: '2025-11-29', numero: 'FAC-001-001-000541', cliente: 'Juan Pérez', subtotal: 500.00, impuesto: 75.00, total: 575.00, estado: 'Pendiente', saldo: 575.00 }
  ];

  cotizaciones = [
    { fecha: '2025-11-30', numero: 'COT-0092', cliente: 'Nuevo Cliente SA', total: 2500.00, estado: 'Aprobada' },
    { fecha: '2025-11-29', numero: 'COT-0091', cliente: 'Maria Gonzales', total: 120.00, estado: 'Enviada' }
  ];

  pagos = [
    { fecha: '2025-11-28', recibo: 'REC-1001', cliente: 'Corporación Favorita', metodo: 'Transferencia', monto: 1150.00, estado: 'Conciliado' }
  ];

  notasCredito = [];
  ordenesVenta = [];

  // -- Reportes (Mock) --
  reporteVentasCliente = [
    { cliente: 'Corporación Favorita', totalVentas: 15000.00, cantidadTx: 12 },
    { cliente: 'Juan Pérez', totalVentas: 2500.00, cantidadTx: 3 }
  ];

  constructor(private fb: FormBuilder) {
    // 1. Cliente
    this.clienteForm = this.fb.group({
      ruc: ['', Validators.required], nombre: ['', Validators.required], telefono: [''], direccion: [''], email: ['']
    });

    // 2. Factura
    this.facturaForm = this.fb.group({
      cliente: ['', Validators.required],
      fecha: [new Date().toISOString().substring(0, 10)],
      condicion: ['Contado'],
      items: [[]], // Array simulado
      total: [0],
      observacion: ['']
    });

    // 3. Pago
    this.pagoForm = this.fb.group({
      cliente: ['', Validators.required], factura: ['', Validators.required], metodo: ['Transferencia'], monto: [0, Validators.required]
    });
  }

  // Navegación
  seleccionarVista(item: any) { this.vistaActual = item.id; this.tituloVista = item.nombre; }
  volverDashboard() { this.vistaActual = 'dashboard'; this.tituloVista = 'Resumen Comercial'; }

  get listaFacturas() { return this.showAll ? this.facturas : this.facturas.slice(0, this.initialLimit); }

  // PDF Global
  exportarPDF() {
    const doc = new jsPDF();
    doc.text(`Reporte: ${this.tituloVista}`, 14, 20);
    const fmt = new Intl.NumberFormat('en-US', { style:'currency', currency:'USD'});

    if (this.vistaActual === 'clientes') {
       const head = [['RUC', 'Razón Social', 'Teléfono']]; 
       const data = this.clientes.map(c => [c.ruc, c.nombre, c.telefono]); 
       autoTable(doc, { startY: 30, head, body: data });
    } else if (this.vistaActual === 'facturas' || this.vistaActual === 'pendientes') {
       const head = [['Número', 'Fecha', 'Cliente', 'Total', 'Estado']];
       const data = this.facturas.map(f => [f.numero, f.fecha, f.cliente, fmt.format(f.total), f.estado]);
       autoTable(doc, { startY: 30, head, body: data });
    } else if (this.vistaActual === 'ventas-cliente') {
       const head = [['Cliente', 'Ventas Totales']];
       const data = this.reporteVentasCliente.map(v => [v.cliente, fmt.format(v.totalVentas)]);
       autoTable(doc, { startY: 30, head, body: data });
    }
    // ... otros casos genéricos
    doc.save(`Ventas_${this.vistaActual}.pdf`);
  }

  // --- MÉTODOS DE ACCIÓN Y MODALES ---

  toggleShowAll() { this.showAll = !this.showAll; }

  // 1. Clientes
  toggleModalCliente() { this.modalClienteVisible = !this.modalClienteVisible; if(this.modalClienteVisible) this.clienteForm.reset(); }
  handleModalClienteChange(e: boolean) { this.modalClienteVisible = e; }
  guardarCliente() { 
    if(this.clienteForm.valid) { 
        this.clientes.push({...this.clienteForm.value, codigo:'CL-NEW', estado:'Activo'}); 
        this.toggleModalCliente(); 
    } 
  }

  // 2. Factura (CORE INTEGRATION)
  toggleModalFactura() { 
    this.modalFacturaVisible = !this.modalFacturaVisible; 
    if(this.modalFacturaVisible) this.facturaForm.reset({fecha: new Date().toISOString().substring(0, 10), total:0, condicion: 'Contado'}); 
  }
  handleModalFacturaChange(e: boolean) { this.modalFacturaVisible = e; }
  guardarFactura() { 
    if(this.facturaForm.valid) {
        // Guardar local
        const nuevaFact = {
            fecha: this.facturaForm.value.fecha,
            numero: 'FAC-001-001-0005'+(42+this.facturas.length),
            cliente: this.facturaForm.value.cliente,
            subtotal: Number(this.facturaForm.value.total),
            impuesto: Number(this.facturaForm.value.total) * 0.15,
            total: Number(this.facturaForm.value.total) * 1.15,
            estado: 'Pendiente',
            saldo: Number(this.facturaForm.value.total) * 1.15
        };
        this.facturas.unshift(nuevaFact);

        // *** INTEGRACIÓN CORE ERP ***
        alert(' INTEGRACIÓN CONTABILIDAD:\n ✓ Se generó asiento de ventas (Debe: CxC / Haber: Ventas + IVA).\n\n INTEGRACIÓN INVENTARIO:\n ✓ Se generó Kárdex de Salida de mercancía.');

        this.toggleModalFactura();
    }
  }

  // 3. Pagos
  toggleModalPago() { this.modalPagoVisible = !this.modalPagoVisible; }
  handleModalPagoChange(e:boolean) { this.modalPagoVisible = e; }
  guardarPago() {
      if(this.pagoForm.valid) {
          this.pagos.push({
              fecha: new Date().toISOString().substring(0,10),
              recibo: 'REC-'+(1002+this.pagos.length),
              cliente: 'Cliente Seleccionado',
              metodo: this.pagoForm.value.metodo,
              monto: this.pagoForm.value.monto,
              estado: 'Conciliado'
          });
          alert('INTEGRACIÓN CONTABILIDAD:\n ✓ Se generó asiento de cobro (Debe: Bancos / Haber: CxC).');
          this.toggleModalPago();
      }
  }

  // Generico para lo que no tiene form especifico en el demo
  toggleModalGenerico() { this.modalGenericoVisible = !this.modalGenericoVisible; }
}