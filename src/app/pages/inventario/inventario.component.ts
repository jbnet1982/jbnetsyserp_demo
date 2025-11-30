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
// Iconos: Se agrega cilCheckCircle
import { 
  cilArrowLeft, cilCloudDownload, cilPlus, cilSave, cilX, 
  cilChevronBottom, cilChevronTop, cilFolderOpen, cilChartLine, 
  cilList, cilTags, cilSpeedometer, cilBuilding, cilSwapVertical, 
  cilTruck, cilIndustry, cilClipboard, cilFile, cilPencil, cilTrash, cilSearch, cilPrint,
  cilBasket, cilBarChart, cilWarning, cilCheckCircle 
} from '@coreui/icons';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-inventario.component',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    CardModule, GridModule, TableModule, ButtonModule, BadgeModule, 
    ModalModule, FormModule, IconModule, NavModule, AccordionModule, SharedModule, TooltipModule
  ],
  templateUrl: './inventario.component.html',
  styleUrl: './inventario.component.scss',
})
export class InventarioComponent {
  // === 1. ICONOS (Agregado cilCheckCircle al final) ===
  icons = { 
    cilArrowLeft, cilCloudDownload, cilPlus, cilSave, cilX, cilChevronBottom, cilChevronTop, 
    cilFolderOpen, cilChartLine, cilList, cilTags, cilSpeedometer, cilBuilding, cilSwapVertical,
    cilTruck, cilIndustry, cilClipboard, cilFile, cilPencil, cilTrash, cilSearch, cilPrint,
    cilBasket, cilBarChart, cilWarning, cilCheckCircle
  };

  // === 2. MENÚ ESTRUCTURA (INVENTARIO) ===
  menuEstructura = [
    {
      titulo: 'Catálogos', icono: 'cilList', id: 'catalogos',
      items: [
        { id: 'productos', nombre: 'Productos / Servicios' },
        { id: 'categorias', nombre: 'Categorías' },
        { id: 'unidades', nombre: 'Unidades de Medida' },
        { id: 'bodegas', nombre: 'Bodegas / Almacenes' }
      ]
    },
    {
      titulo: 'Movimientos', icono: 'cilSwapVertical', id: 'movimientos',
      items: [
        { id: 'entradas', nombre: 'Entradas Inventario' },
        { id: 'salidas', nombre: 'Salidas Inventario' },
        { id: 'transferencias', nombre: 'Transferencias Bodegas' },
        { id: 'ajustes', nombre: 'Ajustes Inventario' },
        { id: 'costeo', nombre: 'Proceso de Costeo' }
      ]
    },
    {
      titulo: 'Reportes', icono: 'cilChartLine', id: 'reportes',
      items: [
        { id: 'kardex', nombre: 'Kardex' },
        { id: 'existencias', nombre: 'Informe Existencias' },
        { id: 'valorizacion', nombre: 'Valorización Inventario' },
        { id: 'bajo-stock', nombre: 'Productos Bajo Stock' }
      ]
    }
  ];

  // Estado General
  vistaActual: string = 'dashboard';
  tituloVista: string = 'Resumen de Inventarios';

  // KPI Dashboard
  totalProductos: number = 1450;
  valorInventario: number = 85400.50;
  totalMovimientosMes: number = 320;

  // Variables de Visibilidad de Modales
  modalProductoVisible = false;
  modalCategoriaVisible = false;
  modalBodegaVisible = false;
  modalMovimientoVisible = false;

  // Formularios
  productoForm: FormGroup;
  categoriaForm: FormGroup;
  bodegaForm: FormGroup;
  movimientoForm: FormGroup;

  // Filtros visuales
  showAll = false;
  initialLimit = 5;

  // === 3. DATOS DE EJEMPLO (MOCK DATA) ===

  // -- Catálogos --
  productos = [
    { codigo: 'PRD-001', nombre: 'Laptop HP 15"', categoria: 'Tecnología', unidad: 'UND', costo: 450.00, precio: 650.00, stock: 15, estado: 'Activo' },
    { codigo: 'PRD-002', nombre: 'Mouse Logitech Inalámbrico', categoria: 'Accesorios', unidad: 'UND', costo: 12.50, precio: 25.00, stock: 120, estado: 'Activo' },
    { codigo: 'PRD-003', nombre: 'Servidor Dell PowerEdge', categoria: 'Infraestructura', unidad: 'UND', costo: 2500.00, precio: 3800.00, stock: 2, estado: 'Activo' },
    { codigo: 'PRD-004', nombre: 'Cable UTP Cat6 (Bobina)', categoria: 'Conectividad', unidad: 'MTR', costo: 80.00, precio: 140.00, stock: 50, estado: 'Activo' }
  ];

  categorias = [
    { codigo: 'CAT-01', nombre: 'Tecnología', cuenta: '1.4.01.01 Mercaderia', estado: 'Activo' },
    { codigo: 'CAT-02', nombre: 'Accesorios', cuenta: '1.4.01.02 Suministros', estado: 'Activo' }
  ];

  unidades = [
    { codigo: 'UND', nombre: 'Unidad', factor: 1 },
    { codigo: 'MTR', nombre: 'Metro', factor: 1 },
    { codigo: 'KG', nombre: 'Kilogramo', factor: 1 }
  ];

  bodegas = [
    { codigo: 'BOD-PRI', nombre: 'Bodega Principal', ubicacion: 'Matriz Norte', responsable: 'J. Perez', estado: 'Activo' },
    { codigo: 'BOD-SUR', nombre: 'Almacén Sur', ubicacion: 'Sucursal Sur', responsable: 'M. Diaz', estado: 'Activo' }
  ];

  // -- Movimientos --
  movimientos = [
    { fecha: '30/11/2025', codigo: 'ING-0015', tipo: 'Entrada', concepto: 'Compra Proveedor ABC', bodega: 'Bodega Principal', total: 4500.00, estado: 'Procesado' },
    { fecha: '29/11/2025', codigo: 'EGR-0042', tipo: 'Salida', concepto: 'Venta Fact #1050', bodega: 'Bodega Principal', total: 650.00, estado: 'Procesado' },
    { fecha: '28/11/2025', codigo: 'TRF-0005', tipo: 'Transferencia', concepto: 'Reposición Stock', bodega: 'B. Principal -> A. Sur', total: 120.00, estado: 'Procesado' }
  ];

  costeos = [
    { periodo: 'Noviembre 2025', metodo: 'Promedio Ponderado', estado: 'Cerrado', fechaProc: '30/11/2025', usuario: 'Admin' },
    { periodo: 'Octubre 2025', metodo: 'Promedio Ponderado', estado: 'Cerrado', fechaProc: '31/10/2025', usuario: 'Admin' }
  ];

  // -- Reportes --
  kardex = [
    { fecha: '01/11/2025', doc: 'Saldo Inicial', tipo: 'INI', entrada: 10, salida: 0, saldo: 10, costoU: 450, total: 4500 },
    { fecha: '15/11/2025', doc: 'Compra 001', tipo: 'COM', entrada: 5, salida: 0, saldo: 15, costoU: 450, total: 2250 },
    { fecha: '20/11/2025', doc: 'Venta 105', tipo: 'VEN', entrada: 0, salida: 1, saldo: 14, costoU: 450, total: 450 }
  ];

  existencias = [
    { codigo: 'PRD-001', producto: 'Laptop HP 15"', bod1: 10, bod2: 5, total: 15, costoProm: 450.00 },
    { codigo: 'PRD-002', producto: 'Mouse Logitech', bod1: 80, bod2: 40, total: 120, costoProm: 12.50 }
  ];

  bajoStock = [
    { codigo: 'PRD-003', producto: 'Servidor Dell', stockActual: 2, stockMin: 5, estado: 'Crítico' },
    { codigo: 'PRD-009', producto: 'Impresora Epson', stockActual: 1, stockMin: 3, estado: 'Crítico' }
  ];

  // Getters
  get listaProductos() { return this.showAll ? this.productos : this.productos.slice(0, this.initialLimit); }

  constructor(private fb: FormBuilder) {
    // 1. Producto
    this.productoForm = this.fb.group({
      codigo: ['', Validators.required], nombre: ['', Validators.required], categoria: ['Tecnología'],
      unidad: ['UND'], costo: [0], precio: [0], stockInicial: [0]
    });
    // 2. Categoria
    this.categoriaForm = this.fb.group({ codigo: [''], nombre: [''], cuenta: [''] });
    // 3. Bodega
    this.bodegaForm = this.fb.group({ codigo: [''], nombre: [''], ubicacion: [''], responsable: [''] });
    // 4. Movimiento
    this.movimientoForm = this.fb.group({ tipo: ['Entrada'], bodega: [''], concepto: [''], fecha: [new Date().toISOString().substring(0,10)] });
  }

  // Navegación
  seleccionarVista(item: any) { this.vistaActual = item.id; this.tituloVista = item.nombre; }
  volverDashboard() { this.vistaActual = 'dashboard'; this.tituloVista = 'Resumen de Inventarios'; }

  // PDF
  exportarPDF() {
    const doc = new jsPDF();
    doc.text(`Reporte: ${this.tituloVista}`, 14, 20);
    doc.text(`Generado por JBNetsys ERP - ${new Date().toLocaleDateString()}`, 14, 28);
    const fmt = new Intl.NumberFormat('en-US', { style:'currency', currency:'USD'});

    if (this.vistaActual === 'productos') {
       const head = [['Cod', 'Nombre', 'Stock', 'Costo', 'Precio']];
       const data = this.productos.map(p => [p.codigo, p.nombre, p.stock, fmt.format(p.costo), fmt.format(p.precio)]);
       autoTable(doc, { startY: 35, head, body: data });
    } else if (this.vistaActual === 'existencias') {
       const head = [['Cod', 'Producto', 'Bod P', 'Bod S', 'Total']];
       const data = this.existencias.map(e => [e.codigo, e.producto, e.bod1, e.bod2, e.total]);
       autoTable(doc, { startY: 35, head, body: data });
    } else if (this.vistaActual === 'kardex') {
       const head = [['Fecha', 'Doc', 'Ent', 'Sal', 'Sld', 'Costo', 'Total']];
       const data = this.kardex.map(k => [k.fecha, k.doc, k.entrada, k.salida, k.saldo, fmt.format(k.costoU), fmt.format(k.total)]);
       autoTable(doc, { startY: 35, head, body: data });
    }
    
    doc.save(`Inv_${this.vistaActual}.pdf`);
  }

  // --- Modales ---
  toggleShowAll() { this.showAll = !this.showAll; }

  // Productos
  toggleModalProducto() { this.modalProductoVisible = !this.modalProductoVisible; if(this.modalProductoVisible) this.productoForm.reset({unidad:'UND'}); }
  handleModalProductoChange(e: boolean) { this.modalProductoVisible = e; }
  guardarProducto() { 
    if(this.productoForm.valid) { 
        this.productos.push({...this.productoForm.value, estado:'Activo'}); 
        // SIMULACIÓN INTEGRACIÓN CONTABLE
        console.log('INTEGRACIÓN: Cuenta contable asignada según categoría.');
        this.toggleModalProducto(); 
    } 
  }

  // Categorias
  toggleModalCategoria() { this.modalCategoriaVisible = !this.modalCategoriaVisible; }
  handleModalCategoriaChange(e: boolean) { this.modalCategoriaVisible = e; }
  guardarCategoria() { if(this.categoriaForm.valid) { this.categorias.push({...this.categoriaForm.value, estado:'Activo'}); this.toggleModalCategoria(); } }

  // Bodegas
  toggleModalBodega() { this.modalBodegaVisible = !this.modalBodegaVisible; }
  handleModalBodegaChange(e: boolean) { this.modalBodegaVisible = e; }
  guardarBodega() { if(this.bodegaForm.valid) { this.bodegas.push({...this.bodegaForm.value, estado:'Activo'}); this.toggleModalBodega(); } }

  // Movimientos
  toggleModalMovimiento() { this.modalMovimientoVisible = !this.modalMovimientoVisible; if(this.modalMovimientoVisible) this.movimientoForm.reset({tipo:'Entrada', fecha:new Date().toISOString().substring(0,10)}); }
  handleModalMovimientoChange(e: boolean) { this.modalMovimientoVisible = e; }
  guardarMovimiento() { 
    if(this.movimientoForm.valid) { 
        const val = this.movimientoForm.value;
        this.movimientos.unshift({ fecha: val.fecha, codigo: 'MOV-NEW', tipo: val.tipo, concepto: val.concepto, bodega: 'Bodega Principal', total: 0, estado: 'Procesado' });
        
        // ALERT INTEGRACIÓN CONTABLE
        alert(`Movimiento Generado. \n>> ASIENTO CONTABLE CREADO AUTOMÁTICAMENTE <<\nTipo: ${val.tipo}\nGlosa: ${val.concepto}`);
        
        this.toggleModalMovimiento(); 
    } 
  }
}
