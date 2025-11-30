import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
// Imports CoreUI
import { 
  CardModule, GridModule, TableModule, ButtonModule, BadgeModule, 
  ModalModule, FormModule, NavModule, AccordionModule, SharedModule, TooltipModule
} from '@coreui/angular';
import { IconModule, IconSetService } from '@coreui/icons-angular';
// Iconos
import { 
  cilArrowLeft, cilCloudDownload, cilPlus, cilSave, cilX, 
  cilChevronBottom, cilChevronTop, cilBook, cilMoney, cilLockLocked, 
  cilChartLine, cilFolderOpen, cilSpreadsheet, cilTrash, cilPencil, 
  cilUser, cilBuilding, cilLocationPin, cilPhone, cilGlobeAlt, 
  cilSwapVertical, cilLoop, cilCalendar, cilClock, cilFile, 
  cilDescription, cilCloudUpload, cilTask, cilHistory, cilBan, 
  cilCheckCircle, cilLockUnlocked, cilWarning, cilSearch, cilPrint,
  cilCart, cilCreditCard, cilBriefcase, cilPeople, cilDollar, 
  cilMonitor, cilFastfood, cilQrCode, cilBarChart, cilBasket, cilOptions,
  cilList,
  cilPen,
  cilBank,
  cilCalculator
} from '@coreui/icons';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    CardModule, GridModule, TableModule, ButtonModule, BadgeModule, 
    ModalModule, FormModule, IconModule, NavModule, AccordionModule, SharedModule, TooltipModule
  ],
  providers: [IconSetService],
  templateUrl: './pos.component.html',
  styleUrls: ['./pos.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PosComponent implements OnInit {

  // === 1. ICONOS (CORREGIDO) ===
  // Se declaran todas las propiedades explícitamente para que el HTML las encuentre.
  icons = { 
    cilArrowLeft, cilCloudDownload, cilPlus, cilSave, cilX, cilFolderOpen, cilChartLine, 
    cilList, // Restaurado el original
    cilMonitor, // Agregado explícitamente (Corrige el error 1)
    cilUser, cilMoney, cilCalendar, cilWarning, cilCheckCircle, cilClock, 
    cilPen, cilBank, cilPeople, cilBriefcase, cilDollar, 
    cilCalculator, // Restaurado el original
    cilFastfood, // Agregado explícitamente (Corrige el error 2)
    cilTask, cilFile, cilPrint, cilSearch, cilCart, cilCreditCard, cilQrCode, 
    cilBarChart, cilBasket, cilLockLocked, cilLockUnlocked, cilOptions, cilTrash, 
    cilChevronBottom, cilChevronTop
  };

  // === 2. ESTRUCTURA DEL MENÚ ===
  menuEstructura = [
    {
      titulo: 'Operación Caja', icono: 'cilCart', id: 'operacion',
      items: [
        { id: 'venta-touch', nombre: 'Terminal Punto de Venta' },
        { id: 'apertura', nombre: 'Apertura / Reapertura' },
        { id: 'historial-caja', nombre: 'Historial Ventas' },
        { id: 'mesas', nombre: 'Gestión de Mesas' },
        { id: 'pendientes', nombre: 'Ventas Suspendidas' }
      ]
    },
    {
      titulo: 'Movimientos Dinero', icono: 'cilDollar', id: 'movimientos',
      items: [
        { id: 'ingreso-dinero', nombre: 'Ingresos de Efectivo' },
        { id: 'egreso-dinero', nombre: 'Gastos Menores / Salidas' },
        { id: 'corte-x', nombre: 'Corte Parcial (X)' },
        { id: 'adelantos', nombre: 'Adelantos / Propinas' }
      ]
    },
    {
      titulo: 'Cierre y Arqueo', icono: 'cilLockLocked', id: 'cierre',
      items: [
        { id: 'cierre-diario', nombre: 'Cierre Diario (Z)' },
        { id: 'cierre-turno', nombre: 'Cierre por Turno' },
        { id: 'arqueo-ciego', nombre: 'Conteo Físico (Ciego)' }
      ]
    },
    {
      titulo: 'Reportes Generales', icono: 'cilChartLine', id: 'reportes-gen',
      items: [
        { id: 'resumen-ventas', nombre: 'Ventas Diarias/Mes' },
        { id: 'impuestos-report', nombre: 'Reporte Impuestos' },
        { id: 'ranking-prod', nombre: 'Ranking Productos' },
        { id: 'devoluciones-rep', nombre: 'Devoluciones y Notas' }
      ]
    },
    {
      titulo: 'Consultas y Analítica', icono: 'cilBarChart', id: 'analisis',
      items: [
        { id: 'ventas-producto', nombre: 'Ventas x Producto' },
        { id: 'ventas-cajero', nombre: 'Rendimiento Cajero' },
        { id: 'hora-pico', nombre: 'Horas de Mayor Venta' },
        { id: 'margenes', nombre: 'Márgenes y Utilidad' }
      ]
    }
  ];

  // Estado Visual
  vistaActual: string = 'dashboard';
  tituloVista: string = 'Centro de Ventas (POS)';
  
  // Variables booleanas (Flags de vista)
  isDashboard = true;
  isPOS = false;        // Interfaz visual de venta
  isTablas = false;     // Listados genéricos (Historial, Reportes)
  isCierre = false;     // Pantallas de arqueo
  isAnalisis = false;   // Pantallas de KPIs avanzados
  isVacio = false;

  // Variables Botones
  btnAbrirCaja = false;
  btnCorteZ = false;
  btnNuevoMov = false;

  // KPIs
  totalVentasHoy = 0;
  ticketsEmitidos = 0;
  fondoCaja = 0;

  // === DATOS POS (Carrito) ===
  cart: any[] = [];
  totalCart = 0;
  impuestoCart = 0;
  
  // Lista de productos (Catálogo rápido)
  productosPOS = [
    { id: 'P001', nombre: 'Coca Cola 1.5L', precio: 1.50, cat: 'Bebidas' },
    { id: 'P002', nombre: 'Pizza Familiar', precio: 12.00, cat: 'Comida' },
    { id: 'P003', nombre: 'Agua Mineral', precio: 0.50, cat: 'Bebidas' },
    { id: 'P004', nombre: 'Combo Hamburguesa', precio: 5.50, cat: 'Comida' },
    { id: 'P005', nombre: 'Cerveza Importada', precio: 3.50, cat: 'Licores' },
    { id: 'P006', nombre: 'Papas Fritas', precio: 2.00, cat: 'Snacks' }
  ];

  // Historial Ventas
  historialVentas = [
    { ticket: 'T-00154', fecha: '30/11/2025 10:00', cajero: 'Juan P.', total: 15.50, pago: 'Efectivo', estado: 'Pagado' },
    { ticket: 'T-00153', fecha: '30/11/2025 09:45', cajero: 'Juan P.', total: 4.50, pago: 'Tarjeta', estado: 'Pagado' }
  ];

  // Movimientos Caja
  movimientosCaja = [
    { fecha: '30/11 08:00', tipo: 'Ingreso', concepto: 'Apertura Caja', monto: 100.00, usuario: 'Supervisor' }
  ];

  // Reportes Analytics
  ranking = [
    { producto: 'Pizza Familiar', cant: 45, total: 540.00 },
    { producto: 'Coca Cola', cant: 120, total: 180.00 }
  ];

  // Modales
  modalCobrarVisible = false;
  modalAperturaVisible = false;
  modalMovimientoVisible = false;
  modalMesaVisible = false;

  // Forms
  cobroForm: FormGroup;
  aperturaForm: FormGroup;
  movimientoForm: FormGroup;
  
  listaVisible: any[] = []; // Lista genérica para tablas

  constructor(
    private fb: FormBuilder, 
    public iconSet: IconSetService, 
    private cdr: ChangeDetectorRef
  ) {
    this.iconSet.icons = this.icons; // Vincula los iconos
    this.cobroForm = this.fb.group({ total: [0], efectivo: [0], cambio: [0], metodo: ['Efectivo'], cliente: ['Consumidor Final'] });
    this.aperturaForm = this.fb.group({ monto: [100, Validators.required], turno: ['Matutino'] });
    this.movimientoForm = this.fb.group({ tipo: ['Egreso'], concepto: [''], monto: [0] });
  }

  ngOnInit() {
    this.actualizarEstado();
  }

  // === CONTROL DE ESTADO ===
  actualizarEstado() {
    // 1. Calcular KPIs
    this.totalVentasHoy = this.historialVentas.reduce((acc, v) => acc + v.total, 0);
    this.ticketsEmitidos = this.historialVentas.length;
    
    // 2. Listas Dinámicas según Vista
    if(this.vistaActual.includes('historial')) this.listaVisible = this.historialVentas;
    else if(this.vistaActual.includes('ingreso') || this.vistaActual.includes('egreso')) this.listaVisible = this.movimientosCaja;
    else if(this.vistaActual.includes('ranking') || this.vistaActual.includes('producto')) this.listaVisible = this.ranking;
    else this.listaVisible = [];

    // 3. Flags
    this.isDashboard = this.vistaActual === 'dashboard';
    this.isPOS = this.vistaActual === 'venta-touch';
    this.isTablas = ['historial-caja', 'pendientes', 'ingreso-dinero', 'egreso-dinero', 'corte-x', 'adelantos', 'reportes'].some(v => this.vistaActual.includes(v));
    this.isCierre = this.vistaActual.includes('cierre') || this.vistaActual.includes('arqueo');
    this.isAnalisis = this.vistaActual === 'resumen-ventas' || this.vistaActual === 'ranking-prod' || this.vistaActual === 'hora-pico' || this.vistaActual === 'margenes';
    this.isVacio = !(this.isDashboard || this.isPOS || this.isTablas || this.isCierre || this.isAnalisis);

    // 4. Botonera
    this.btnAbrirCaja = this.vistaActual === 'apertura';
    this.btnCorteZ = this.vistaActual === 'cierre-diario';
    this.btnNuevoMov = this.vistaActual === 'ingreso-dinero' || this.vistaActual === 'egreso-dinero';

    this.cdr.markForCheck();
  }

  // --- FUNCIONES POS (Carrito) ---
  agregarProducto(prod: any) {
    const existe = this.cart.find(item => item.id === prod.id);
    if(existe) {
      existe.cantidad++;
      existe.subtotal = existe.cantidad * existe.precio;
    } else {
      this.cart.push({ ...prod, cantidad: 1, subtotal: prod.precio });
    }
    this.calcularTotalCart();
  }

  removerProducto(index: number) {
    this.cart.splice(index, 1);
    this.calcularTotalCart();
  }

  limpiarCarrito() {
    this.cart = [];
    this.calcularTotalCart();
  }

  calcularTotalCart() {
    const subtotal = this.cart.reduce((acc, item) => acc + item.subtotal, 0);
    this.impuestoCart = subtotal * 0.15;
    this.totalCart = subtotal + this.impuestoCart;
    this.cdr.markForCheck();
  }

  // --- NAVEGACIÓN ---
  seleccionarVista(item: any) { this.vistaActual = item.id; this.tituloVista = item.nombre; this.actualizarEstado(); }
  volverDashboard() { this.vistaActual = 'dashboard'; this.tituloVista = 'Centro de Ventas'; this.actualizarEstado(); }

  exportarPDF() {
    const doc = new jsPDF();
    doc.text(this.tituloVista, 14, 20);
    autoTable(doc, { startY: 30, head:[['Datos']], body:[['Reporte POS Generado']] });
    doc.save('POS_Report.pdf');
  }

  // --- MODALES & OPERACIONES ---

  toggleModalCobrar() { 
    if(this.cart.length === 0 && !this.modalCobrarVisible) return;
    this.modalCobrarVisible = true; 
    this.cobroForm.patchValue({ total: this.totalCart.toFixed(2), efectivo: 0, cambio: 0 });
    this.cdr.markForCheck();
  }

  procesarCobro() {
      alert('VENTA EXITOSA\n-> Integrado con: Facturación, Inventario y Contabilidad.');
      this.historialVentas.unshift({ticket: 'T-NEW', fecha: 'Ahora', cajero: 'Tú', total: this.totalCart, pago: this.cobroForm.value.metodo, estado: 'Pagado'});
      this.cart = [];
      this.calcularTotalCart();
      this.modalCobrarVisible = false;
      this.actualizarEstado(); // Actualiza KPIs y tabla
      this.cdr.markForCheck();
  }

  // Apertura
  toggleModalApertura() { this.modalAperturaVisible = true; this.cdr.markForCheck(); }
  guardarApertura() { 
      this.fondoCaja = this.aperturaForm.value.monto; 
      alert('Caja Abierta con $' + this.fondoCaja); 
      this.modalAperturaVisible = false; 
      this.actualizarEstado();
  }

  // Movimientos
  toggleModalMovimiento() { this.modalMovimientoVisible = true; this.movimientoForm.reset({tipo:'Egreso'}); this.cdr.markForCheck(); }
  guardarMovimiento() {
      const v = this.movimientoForm.value;
      this.movimientosCaja.unshift({fecha: 'Ahora', tipo: v.tipo, concepto: v.concepto, monto: v.monto, usuario: 'Cajero'});
      this.modalMovimientoVisible = false;
      this.actualizarEstado();
  }

  // Mesas
  toggleModalMesas() { this.modalMesaVisible = true; this.cdr.markForCheck(); }
  seleccionarMesa(mesa: number) {
      alert(`Mesa ${mesa} seleccionada.`);
      this.modalMesaVisible = false;
      this.vistaActual = 'venta-touch';
      this.actualizarEstado();
  }
}