import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
// CoreUI
import { 
  CardModule, GridModule, TableModule, ButtonModule, BadgeModule, 
  ModalModule, FormModule, NavModule, AccordionModule, SharedModule, TooltipModule
} from '@coreui/angular';
import { IconModule, IconSetService } from '@coreui/icons-angular';
// Iconos
import { 
  cilArrowLeft, cilCloudDownload, cilPlus, cilSave, cilX, 
  cilFolderOpen, cilChartLine, cilList, cilUser, cilMoney, cilCalendar, 
  cilWarning, cilCheckCircle, cilClock, cilPen, cilBank, 
  cilTruck, cilCart, cilInbox, cilFile, cilDescription, cilLoop, 
  cilPrint, cilSearch
} from '@coreui/icons';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-compras',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    CardModule, GridModule, TableModule, ButtonModule, BadgeModule, 
    ModalModule, FormModule, IconModule, NavModule, AccordionModule, SharedModule, TooltipModule
  ],
  providers: [IconSetService],
  templateUrl: './compras.component.html',
  styleUrls: ['./compras.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush // <--- CORRECCIÓN CRÍTICA
})
export class ComprasComponent implements OnInit {

  icons = { 
    cilArrowLeft, cilCloudDownload, cilPlus, cilSave, cilX, cilFolderOpen, cilChartLine, 
    cilList, cilUser, cilMoney, cilCalendar, cilWarning, cilCheckCircle, cilClock, 
    cilPen, cilBank, cilTruck, cilCart, cilInbox, cilFile, cilDescription, cilLoop, 
    cilPrint, cilSearch
  };

  menuEstructura = [
    {
      titulo: 'Catálogos', icono: 'cilList', id: 'catalogos',
      items: [
        { id: 'proveedores', nombre: 'Proveedores' },
        { id: 'impuestos', nombre: 'Impuestos / Tasas' },
        { id: 'condiciones', nombre: 'Condiciones de Pago' }
      ]
    },
    {
      titulo: 'Procesos', icono: 'cilCart', id: 'procesos',
      items: [
        { id: 'ordenes', nombre: 'Órdenes de Compra' },
        { id: 'recepciones', nombre: 'Recepción de Mercancía' },
        { id: 'registro-compras', nombre: 'Facturas de Compra' },
        { id: 'devoluciones', nombre: 'Devoluciones a Prov.' }
      ]
    },
    {
      titulo: 'Reportes', icono: 'cilChartLine', id: 'reportes',
      items: [
        { id: 'compras-proveedor', nombre: 'Compras por Proveedor' },
        { id: 'compras-periodo', nombre: 'Análisis por Periodo' },
        { id: 'control-ordenes', nombre: 'Control Órdenes Pendientes' }
      ]
    }
  ];

  // Estado
  vistaActual: string = 'dashboard';
  tituloVista: string = 'Gestión de Compras';

  // Variables visuales (Booleans directos para evitar cálculos en HTML)
  isDashboard = true;
  
  // Botones
  btnNuevaOrden = false;
  btnRecepcion = false;
  btnRegistrarFact = false;
  btnNuevoProv = false;
  btnDevolucion = false;
  
  // Control Vista Vacía
  isVacio = false;

  // KPIS
  comprasMes = 0;
  ordenesPendientes = 0;
  entregasRecibidas = 0;

  // Modales Variables
  modalProveedorVisible = false;
  modalOrdenVisible = false;
  modalRecepcionVisible = false;
  modalCompraVisible = false;
  modalDevolucionVisible = false;
  modalCatalogoVisible = false; // Nuevo para genéricos

  // FORMS
  proveedorForm: FormGroup;
  ordenForm: FormGroup;
  recepcionForm: FormGroup;
  compraForm: FormGroup;
  devolucionForm: FormGroup;
  catalogoForm: FormGroup; // Nuevo genérico

  // DATA MOCK
  proveedores = [
    { codigo: 'PRV-001', nombre: 'TechSolutions S.A.', ruc: '179998888001', contacto: 'Carlos Ruiz', telefono: '099123456', estado: 'Activo' },
    { codigo: 'PRV-002', nombre: 'Insumos Globales', ruc: '0991231231001', contacto: 'Ana Beltran', telefono: '042888999', estado: 'Activo' }
  ];

  ordenes = [
    { fecha: '2025-11-30', numero: 'OC-2025-085', proveedor: 'TechSolutions S.A.', total: 4500.00, entrega: '2025-12-05', estado: 'Pendiente' },
    { fecha: '2025-11-28', numero: 'OC-2025-084', proveedor: 'Insumos Globales', total: 1200.00, entrega: '2025-11-30', estado: 'Aprobada' }
  ];

  recepciones = [
    { fecha: '2025-11-29', codigo: 'REC-00145', orden: 'OC-2025-083', proveedor: 'Insumos Globales', bodega: 'Principal', items: 15, estado: 'Ingresado' }
  ];

  compras = [
    { fecha: '2025-11-28', factura: '001-001-558', proveedor: 'TechSolutions S.A.', orden: 'OC-2025-080', subtotal: 1000, iva: 150, total: 1150, estado: 'Contabilizado' }
  ];
  
  impuestos = [{ nombre: 'IVA 15%', codigo: '2', tipo: 'Impuesto' }];
  condiciones = [{ nombre: 'Crédito 30 Días', codigo: '30D', tipo: 'Crédito' }];
  devoluciones = []; // Mock vacío

  // Variable para lista actual en la vista
  listaVisible: any[] = [];
  showAll = false;

  constructor(
    private fb: FormBuilder, 
    public iconSet: IconSetService,
    private cdr: ChangeDetectorRef // Inyección necesaria para OnPush
  ) {
    this.iconSet.icons = this.icons;

    this.proveedorForm = this.fb.group({ ruc: ['',Validators.required], nombre: ['',Validators.required], contacto: [''], telefono: [''] });
    this.ordenForm = this.fb.group({ proveedor: ['',Validators.required], fecha: [new Date().toISOString().substring(0,10)], entrega: [''], total: [0] });
    this.recepcionForm = this.fb.group({ orden: ['',Validators.required], fecha: [new Date().toISOString().substring(0,10)], bodega: ['Principal'] });
    this.compraForm = this.fb.group({ proveedor: [''], factura: ['',Validators.required], orden: [''], total: [0], fecha:[new Date().toISOString().substring(0,10)] });
    this.devolucionForm = this.fb.group({ factura: [''], motivo: [''], fecha: [new Date().toISOString().substring(0,10)] });
    this.catalogoForm = this.fb.group({ nombre: [''], codigo: [''] });
  }

  ngOnInit() {
    this.actualizarEstado();
  }

  // Método centralizado de cálculo de vista (Evita loops en el template)
  actualizarEstado() {
    // 1. Listas
    if (this.vistaActual === 'proveedores') this.listaVisible = this.proveedores;
    else if (['ordenes', 'control-ordenes'].includes(this.vistaActual)) this.listaVisible = this.ordenes;
    else if (this.vistaActual === 'recepciones') this.listaVisible = this.recepciones;
    else if (['registro-compras', 'compras-proveedor', 'compras-periodo'].includes(this.vistaActual)) this.listaVisible = this.compras;
    else if (this.vistaActual === 'impuestos') this.listaVisible = this.impuestos;
    else if (this.vistaActual === 'condiciones') this.listaVisible = this.condiciones;
    else this.listaVisible = [];

    // 2. KPIs
    this.comprasMes = this.compras.reduce((a,b)=>a+b.total, 0);
    this.ordenesPendientes = this.ordenes.filter(o => o.estado === 'Pendiente').length;
    this.entregasRecibidas = this.recepciones.length;

    // 3. Botonera
    this.btnNuevoProv = this.vistaActual === 'proveedores';
    this.btnNuevaOrden = this.vistaActual === 'ordenes';
    this.btnRecepcion = this.vistaActual === 'recepciones';
    this.btnRegistrarFact = this.vistaActual === 'registro-compras';
    this.btnDevolucion = this.vistaActual === 'devoluciones';

    // 4. Flags
    this.isDashboard = this.vistaActual === 'dashboard';
    const validViews = ['dashboard','proveedores','impuestos','condiciones','ordenes','recepciones','registro-compras','devoluciones','compras-proveedor','compras-periodo','control-ordenes'];
    this.isVacio = !validViews.includes(this.vistaActual);

    this.cdr.markForCheck(); // Forzar actualización segura
  }

  seleccionarVista(item: any) {
    this.vistaActual = item.id;
    this.tituloVista = item.nombre;
    this.actualizarEstado();
  }

  volverDashboard() {
    this.vistaActual = 'dashboard';
    this.tituloVista = 'Gestión de Compras';
    this.actualizarEstado();
  }

  exportarPDF() {
    const doc = new jsPDF();
    doc.text(this.tituloVista, 14, 20);
    autoTable(doc, { startY: 30, head:[['Datos']], body: [['Datos Demo Exportados']] });
    doc.save('Compras.pdf');
  }

  // --- MÉTODOS DE BOTONES ---

  // Apertura de Modales
  toggleModalProveedor() { this.modalProveedorVisible = true; this.proveedorForm.reset(); this.cdr.markForCheck(); }
  toggleModalOrden() { this.modalOrdenVisible = true; this.ordenForm.reset({fecha:new Date().toISOString().substring(0,10)}); this.cdr.markForCheck(); }
  toggleModalRecepcion() { this.modalRecepcionVisible = true; this.cdr.markForCheck(); }
  toggleModalCompra() { this.modalCompraVisible = true; this.cdr.markForCheck(); }
  toggleModalDevolucion() { this.modalDevolucionVisible = true; this.cdr.markForCheck(); }
  toggleModalCatalogo() { this.modalCatalogoVisible = true; this.cdr.markForCheck(); } // Genérico

  // Guardado
  guardarProveedor() {
    if(this.proveedorForm.valid) {
        this.proveedores.push({...this.proveedorForm.value, codigo: 'PRV-NEW', estado:'Activo'});
        this.modalProveedorVisible = false; 
        this.actualizarEstado();
    }
  }

  guardarOrden() {
    if(this.ordenForm.valid) {
        const v = this.ordenForm.value;
        this.ordenes.unshift({fecha:v.fecha, numero:'OC-NEW', proveedor:v.proveedor, total:v.total, entrega:v.entrega, estado:'Pendiente'});
        this.modalOrdenVisible = false; 
        this.actualizarEstado();
    }
  }

  guardarRecepcion() {
    if(this.recepcionForm.valid) {
        this.recepciones.unshift({...this.recepcionForm.value, codigo:'REC-NEW', items:5, estado:'Ingresado', proveedor:'--'});
        this.modalRecepcionVisible = false; 
        this.actualizarEstado();
    }
  }

  guardarCompra() {
    if(this.compraForm.valid) {
        const v = this.compraForm.value;
        this.compras.unshift({fecha:v.fecha, factura:v.factura, proveedor:v.proveedor, orden:v.orden, subtotal:v.total, iva:0, total:v.total, estado:'Contabilizado'});
        this.modalCompraVisible = false; 
        this.actualizarEstado();
    }
  }

  guardarDevolucion() {
      this.modalDevolucionVisible = false;
      this.actualizarEstado();
  }

  guardarCatalogo() {
      if (this.catalogoForm.valid && this.vistaActual === 'impuestos') {
        this.impuestos.push({...this.catalogoForm.value, tipo:'Impuesto'});
      }
      this.modalCatalogoVisible = false;
      this.actualizarEstado();
  }

  get proveedoresList() { return this.proveedores; } 
}