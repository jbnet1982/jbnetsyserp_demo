import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { 
  CardModule, GridModule, TableModule, ButtonModule, BadgeModule, 
  ModalModule, FormModule, NavModule, AccordionModule, SharedModule, TooltipModule
} from '@coreui/angular';
import { IconModule, IconSetService } from '@coreui/icons-angular';
import { 
  cilArrowLeft, cilCloudDownload, cilPlus, cilSave, cilX, 
  cilFolderOpen, cilChartLine, cilList, cilUser, cilMoney, cilCalendar, 
  cilWarning, cilCheckCircle, cilClock, cilPen, cilBank, 
  cilMonitor, cilBuilding, cilTruck, cilCalculator, cilTrash, cilGraph, 
  cilTags, cilLocationPin, cilDescription
} from '@coreui/icons';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-activos-fijos',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    CardModule, GridModule, TableModule, ButtonModule, BadgeModule, 
    ModalModule, FormModule, IconModule, NavModule, AccordionModule, SharedModule, TooltipModule
  ],
  providers: [IconSetService],
  templateUrl: './activos-fijos.component.html',
  styleUrls: ['./activos-fijos.component.scss'],
  // ESTA LÍNEA ES LA SOLUCIÓN AL LOOP INFINITO:
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ActivosFijosComponent implements OnInit {

  // Iconos
  icons = { 
    cilArrowLeft, cilCloudDownload, cilPlus, cilSave, cilX, cilFolderOpen, cilChartLine, 
    cilList, cilUser, cilMoney, cilCalendar, cilWarning, cilCheckCircle, cilClock, 
    cilPen, cilBank, cilMonitor, cilBuilding, cilTruck, cilCalculator, cilTrash, cilGraph,
    cilTags, cilLocationPin, cilDescription
  };

  // Menú
  menuEstructura = [
    {
      titulo: 'Catálogos', icono: 'cilList', id: 'catalogos',
      items: [
        { id: 'tipos-activo', nombre: 'Tipos de Activos' },
        { id: 'ubicaciones', nombre: 'Ubicaciones' },
        { id: 'metodos', nombre: 'Métodos de Depreciación' }
      ]
    },
    {
      titulo: 'Gestión', icono: 'cilCalculator', id: 'gestion',
      items: [
        { id: 'registro-activos', nombre: 'Registro de Activos' },
        { id: 'depreciacion', nombre: 'Procesar Depreciación' },
        { id: 'bajas', nombre: 'Baja de Activos' },
        { id: 'revalorizaciones', nombre: 'Revalorizaciones' }
      ]
    },
    {
      titulo: 'Reportes', icono: 'cilChartLine', id: 'reportes',
      items: [
        { id: 'reporte-depreciacion', nombre: 'Informe Depreciaciones' },
        { id: 'activos-categoria', nombre: 'Activos por Categoría' },
        { id: 'activos-ubicacion', nombre: 'Activos por Ubicación' }
      ]
    }
  ];

  vistaActual: string = 'dashboard';
  tituloVista: string = 'Control de Activos Fijos';

  // Variables booleanas para control visual (Performance optimization)
  showDashboard = true;
  showRegistro = false;
  showDepreciacion = false;
  showBajas = false;
  showCatalogos = false;
  showVacio = false;
  
  // Variables botonera
  btnAltaVisible = false;
  btnCalculoVisible = false;
  btnBajaVisible = false;
  btnCatalogoVisible = false;

  totalActivosValor = 0;
  totalDepreciado = 0;
  totalUnidades = 0;
  valorNetoTotal = 0;

  // Modales
  modalActivoVisible = false;
  modalBajaVisible = false;
  modalDepreciacionVisible = false;
  modalCatalogoVisible = false;

  activoForm: FormGroup;
  bajaForm: FormGroup;
  depreciacionForm: FormGroup;
  catalogoForm: FormGroup;

  // Datos base
  activosOriginales = [
    { codigo: 'AF-001', nombre: 'Laptop Dell Latitude', tipo: 'Equipos Computo', ubicacion: 'Oficina Central', costo: 1200.00, depreciacion: 200.00, valorLibros: 1000.00, estado: 'Activo' },
    { codigo: 'AF-002', nombre: 'Escritorio Gerencial', tipo: 'Muebles y Enseres', ubicacion: 'Gerencia', costo: 850.00, depreciacion: 85.00, valorLibros: 765.00, estado: 'Activo' },
    { codigo: 'AF-003', nombre: 'Camioneta Toyota', tipo: 'Vehículos', ubicacion: 'Planta Durán', costo: 25000.00, depreciacion: 5000.00, valorLibros: 20000.00, estado: 'Activo' },
    { codigo: 'AF-004', nombre: 'Servidor Rack', tipo: 'Equipos Computo', ubicacion: 'Data Center', costo: 4500.00, depreciacion: 450.00, valorLibros: 4050.00, estado: 'Activo' }
  ];

  listaVisible: any[] = [];
  showAll = false;
  initialLimit = 5;

  // Otros datos
  tiposActivos = [{ nombre: 'Equipos Computo', vidaUtil: 3, cuenta: '1.2.04' }, { nombre: 'Muebles y Enseres', vidaUtil: 10, cuenta: '1.2.03' }];
  ubicaciones = [{ nombre: 'Oficina Central', responsable: 'J. Perez' }];
  metodos = [{ nombre: 'Línea Recta', descripcion: 'Constante anual' }];
  historialDepreciaciones = [{ periodo: 'Octubre 2025', fecha: '2025-10-31', total: 450.25, estado: 'Contabilizado', usuario: 'Sistema' }];
  bajas = [{ codigo: 'AF-009', activo: 'Impresora Dañada', fecha: '2025-09-15', motivo: 'Obsolescencia', valorResidual: 0.00, estado: 'Procesado' }];

  // Inyectamos ChangeDetectorRef
  constructor(
    private fb: FormBuilder, 
    public iconSet: IconSetService,
    private cdr: ChangeDetectorRef 
  ) {
    this.iconSet.icons = this.icons;

    this.activoForm = this.fb.group({
      codigo: ['', Validators.required], nombre: ['', Validators.required], tipo: ['Equipos Computo'], 
      ubicacion: ['Oficina Central'], fechaCompra: [new Date().toISOString().substring(0, 10)], 
      costo: [0, Validators.required], vidaUtil: [3]
    });
    this.bajaForm = this.fb.group({ activo: ['', Validators.required], fecha: [new Date().toISOString().substring(0, 10)], motivo: [''] });
    this.depreciacionForm = this.fb.group({ anio: [2025], mes: ['Noviembre'] });
    this.catalogoForm = this.fb.group({ nombre: [''], extra: [''] });
  }

  ngOnInit() {
    this.recalcularVistaCompleta();
  }

  // --- NAVEGACIÓN Y VISTA ---
  
  recalcularVistaCompleta() {
    // 1. Preparar lista con iconos (Esto evita logica en el HTML)
    const datosProcesados = this.activosOriginales.map(a => {
        let icono = this.icons.cilBuilding;
        if (a.tipo.includes('Computo')) icono = this.icons.cilMonitor;
        if (a.tipo.includes('Vehícu') || a.tipo.includes('Vehic')) icono = this.icons.cilTruck;
        return { ...a, iconRef: icono };
    });

    // 2. Filtro de cantidad
    this.listaVisible = this.showAll ? datosProcesados : datosProcesados.slice(0, this.initialLimit);

    // 3. Totales
    this.totalUnidades = this.activosOriginales.length;
    this.totalActivosValor = this.activosOriginales.reduce((acc, obj) => acc + obj.costo, 0);
    this.totalDepreciado = this.activosOriginales.reduce((acc, obj) => acc + obj.depreciacion, 0);
    this.valorNetoTotal = this.totalActivosValor - this.totalDepreciado;

    // 4. Flags booleanos para el HTML (Evita *ngIf con funciones)
    this.showDashboard = this.vistaActual === 'dashboard';
    this.showRegistro = ['registro-activos', 'activos-categoria', 'activos-ubicacion'].includes(this.vistaActual);
    this.showDepreciacion = ['depreciacion', 'reporte-depreciacion'].includes(this.vistaActual);
    this.showBajas = this.vistaActual === 'bajas';
    this.showCatalogos = ['tipos-activo', 'ubicaciones', 'metodos'].includes(this.vistaActual);
    
    // Vista Vacía si no es ninguna de las anteriores
    this.showVacio = !(this.showDashboard || this.showRegistro || this.showDepreciacion || this.showBajas || this.showCatalogos);

    // 5. Botones visibles
    this.btnAltaVisible = this.vistaActual === 'registro-activos';
    this.btnCalculoVisible = this.vistaActual === 'depreciacion';
    this.btnBajaVisible = this.vistaActual === 'bajas';
    this.btnCatalogoVisible = ['tipos-activo', 'ubicaciones', 'metodos'].includes(this.vistaActual);

    // >>> DISPARADOR MANUAL DE CAMBIOS <<<
    this.cdr.markForCheck(); 
  }

  seleccionarVista(item: any) {
    this.vistaActual = item.id;
    this.tituloVista = item.nombre;
    this.recalcularVistaCompleta();
  }

  volverDashboard() {
    this.vistaActual = 'dashboard';
    this.tituloVista = 'Control de Activos Fijos';
    this.recalcularVistaCompleta();
  }

  toggleShowAll() {
    this.showAll = !this.showAll;
    this.recalcularVistaCompleta();
  }

  exportarPDF() {
    const doc = new jsPDF();
    doc.text(this.tituloVista, 14, 20);
    const fmt = new Intl.NumberFormat('en-US', { style:'currency', currency:'USD'});
    
    if (this.showRegistro) {
        const head = [['Código', 'Activo', 'Tipo', 'Ubic', 'Costo']];
        const data = this.activosOriginales.map(a => [a.codigo, a.nombre, a.tipo, a.ubicacion, fmt.format(a.costo)]);
        autoTable(doc, { startY: 30, head, body: data });
    }
    doc.save('AF_Export.pdf');
  }

  // --- MODALES (Usan cdr.markForCheck al guardar) ---

  toggleModalActivo() { this.modalActivoVisible = !this.modalActivoVisible; if(this.modalActivoVisible) this.activoForm.reset({fechaCompra: new Date().toISOString().substring(0,10), tipo:'Equipos Computo'}); this.cdr.markForCheck(); }
  handleModalActivoChange(e: boolean) { this.modalActivoVisible = e; this.cdr.markForCheck(); }
  
  guardarActivo() {
    if(this.activoForm.valid) {
      const v = this.activoForm.value;
      this.activosOriginales.unshift({
        codigo: v.codigo, nombre: v.nombre, tipo: v.tipo, ubicacion: v.ubicacion, 
        costo: v.costo, depreciacion: 0, valorLibros: v.costo, estado: 'Activo'
      });
      this.toggleModalActivo();
      this.recalcularVistaCompleta(); // Actualizar todo
    }
  }

  toggleModalBaja() { this.modalBajaVisible = !this.modalBajaVisible; this.cdr.markForCheck(); }
  handleModalBajaChange(e: boolean) { this.modalBajaVisible = e; this.cdr.markForCheck(); }
  procesarBaja() { if(this.bajaForm.valid) { this.toggleModalBaja(); } }

  toggleModalDepreciacion() { this.modalDepreciacionVisible = !this.modalDepreciacionVisible; this.cdr.markForCheck(); }
  handleModalDeprecChange(e: boolean) { this.modalDepreciacionVisible = e; this.cdr.markForCheck(); }
  ejecutarDepreciacion() {
    this.historialDepreciaciones.unshift({periodo:'Noviembre 2025', fecha: new Date().toISOString().substring(0,10), total:680.50, estado:'Contabilizado', usuario:'Admin'});
    this.toggleModalDepreciacion();
    this.cdr.markForCheck();
  }

  toggleModalCatalogo() { this.modalCatalogoVisible = !this.modalCatalogoVisible; this.cdr.markForCheck(); }
  guardarCatalogo() { this.toggleModalCatalogo(); }
}