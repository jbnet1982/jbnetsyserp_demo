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
// Iconos Completos
import { 
  cilArrowLeft, cilCloudDownload, cilPlus, cilSave, cilX, 
  cilChevronBottom, cilChevronTop, cilBook, cilMoney, cilLockLocked, 
  cilChartLine, cilFolderOpen, cilSpreadsheet, cilTrash, cilPencil, 
  cilUser, cilBuilding, cilLocationPin, cilPhone, cilGlobeAlt, 
  cilSwapVertical, cilLoop, cilCalendar, cilClock, cilFile, 
  cilDescription, cilCloudUpload, cilTask, cilHistory, cilBan, 
  cilCheckCircle, cilLockUnlocked, cilWarning, cilSearch, cilPrint
} from '@coreui/icons';

// Librerías PDF
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-contabilidad',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    CardModule, GridModule, TableModule, ButtonModule, BadgeModule, 
    ModalModule, FormModule, IconModule, NavModule, AccordionModule, SharedModule, TooltipModule
  ],
  templateUrl: './contabilidad.component.html',
  styleUrls: ['./contabilidad.component.scss']
})
export class ContabilidadComponent {

  // === 1. REGISTRO DE ICONOS ===
  icons = { 
    cilArrowLeft, cilCloudDownload, cilPlus, cilSave, cilX, 
    cilChevronBottom, cilChevronTop, cilBook, cilMoney, cilLockLocked, 
    cilChartLine, cilFolderOpen, cilSpreadsheet, cilTrash, cilPencil, 
    cilUser, cilBuilding, cilLocationPin, cilPhone, cilGlobeAlt, 
    cilSwapVertical, cilLoop, cilCalendar, cilClock, cilFile, 
    cilDescription, cilCloudUpload, cilTask, cilHistory, cilBan, 
    cilCheckCircle, cilLockUnlocked, cilWarning, cilSearch, cilPrint
  };

  // === 2. MENU ===
  menuEstructura = [
    {
      titulo: 'Catálogos', icono: 'cilBook', id: 'catalogos',
      items: [
        { id: 'plan-cuentas', nombre: 'Plan de Cuentas' },
        { id: 'tipos-cuentas', nombre: 'Tipos de Cuentas' },
        { id: 'centros-costo', nombre: 'Centros de Costo' },
        { id: 'sucursales', nombre: 'Sucursales / U. Negocio' },
        { id: 'monedas', nombre: 'Monedas y Tasas' }
      ]
    },
    {
      titulo: 'Operaciones', icono: 'cilMoney', id: 'operaciones',
      items: [
        { id: 'asientos-manuales', nombre: 'Asientos Manuales' },
        { id: 'asientos-recurrentes', nombre: 'Asientos Recurrentes' },
        { id: 'importacion', nombre: 'Importación (Excel/CSV)' },
        { id: 'plantillas', nombre: 'Plantillas de Asientos' }
      ]
    },
    {
      titulo: 'Cierre Contable', icono: 'cilLockLocked', id: 'cierre',
      items: [ 
        { id: 'cierre-mensual', nombre: 'Cierre Mensual' },
        { id: 'cierre-anual', nombre: 'Cierre Anual' },
        { id: 'reapertura', nombre: 'Reapertura de Periodos' },
        { id: 'estados-periodo', nombre: 'Estados de Periodo' } 
      ]
    },
    {
      titulo: 'Consultas y Reportes', icono: 'cilChartLine', id: 'reportes',
      items: [ 
        { id: 'libro-diario', nombre: 'Libro Diario' }, 
        { id: 'libro-mayor', nombre: 'Libro Mayor' }, 
        { id: 'balance-comprobacion', nombre: 'Balance Comprobación' }, 
        { id: 'estado-resultados', nombre: 'Estado de Resultados (PyG)' }, 
        { id: 'balance-general', nombre: 'Balance General' }, 
        { id: 'flujo-efectivo', nombre: 'Flujo de Efectivo' }, 
        { id: 'movimientos-cuenta', nombre: 'Movimientos por Cuenta' } 
      ]
    }
  ];

  // Estado Visual
  vistaActual: string = 'dashboard';
  tituloVista: string = 'Resumen General';
  
  // KPI Data
  totalActivos: number = 145200.00;
  totalPasivos: number = 42850.50;
  
  // Variables Modales
  public liveModalVisible = false;
  public modalCuentaVisible = false;
  public modalTipoCuentaVisible = false;
  public modalCentroCostoVisible = false;
  public modalSucursalVisible = false;
  public modalMonedaVisible = false;
  public modalRecurrenteVisible = false;
  public modalImportacionVisible = false;
  public modalPlantillaVisible = false;
  public modalCierreVisible = false;

  // Formularios
  asientoForm: FormGroup;
  cuentaForm: FormGroup;
  tipoCuentaForm: FormGroup;
  centroCostoForm: FormGroup;
  sucursalForm: FormGroup;
  monedaForm: FormGroup;
  recurrenteForm: FormGroup;
  importForm: FormGroup;
  plantillaForm: FormGroup;
  cierreForm: FormGroup;

  showAll: boolean = false;
  initialLimit: number = 5;

  // === DATOS DE EJEMPLO ===
  
  asientos = [
    { fecha: '29/11/2025', codigo: 'AS-688572', desc: 'Ingresos Ventas Online', cuenta: 'Bancos', debito: 1000, credito: 0, estado: 'Posteado' },
    { fecha: '28/11/2025', codigo: 'AS-001024', desc: 'Pago a proveedores', cuenta: 'Bancos', debito: 0, credito: 1500.00, estado: 'Posteado' },
    { fecha: '28/11/2025', codigo: 'AS-001025', desc: 'Venta Servicios', cuenta: 'Ingresos', debito: 2350.50, credito: 0, estado: 'Posteado' }
  ];

  planCuentas = [
    { codigo: '1', nombre: 'ACTIVOS', tipo: 'Grupo', nivel: 1 },
    { codigo: '1.1', nombre: 'ACTIVO CORRIENTE', tipo: 'Grupo', nivel: 2 },
    { codigo: '1.1.01', nombre: 'Efectivo y Equivalentes', tipo: 'SubGrupo', nivel: 3 },
    { codigo: '1.1.01.01', nombre: 'Caja General', tipo: 'Detalle', nivel: 4 }
  ];

  tiposCuentas = [
    { codigo: 'A', nombre: 'ACTIVOS', naturaleza: 'Deudora (Saldo Deudor)', descripcion: 'Recursos controlados' },
    { codigo: 'P', nombre: 'PASIVOS', naturaleza: 'Acreedora (Saldo Acreedor)', descripcion: 'Obligaciones' }
  ];

  centrosCosto = [
    { codigo: 'CC-100', nombre: 'Administración Central', categoria: 'Administrativo', responsable: 'Carlos Perez', presupuesto: 50000.00, estado: 'Activo' },
    { codigo: 'CC-200', nombre: 'Ventas y Marketing', categoria: 'Comercial', responsable: 'Ana Lopez', presupuesto: 25000.00, estado: 'Activo' }
  ];

  sucursales = [
    { codigo: 'SUC-01', nombre: 'Matriz Guayaquil', ciudad: 'Guayaquil', direccion: 'Av. 9 de Octubre', telefono: '(04) 255-5555', responsable: 'Ing. Juan Perez', estado: 'Activo' },
    { codigo: 'SUC-02', nombre: 'Agencia Quito Norte', ciudad: 'Quito', direccion: 'Av. Amazonas', telefono: '(02) 222-2222', responsable: 'Lic. Maria Torres', estado: 'Activo' }
  ];

  monedas = [
    { codigo: 'USD', nombre: 'Dólar Estadounidense', simbolo: '$', tasa: 1.0000, esBase: true, estado: 'Activo' },
    { codigo: 'EUR', nombre: 'Euro', simbolo: '€', tasa: 0.9542, esBase: false, estado: 'Activo' }
  ];

  asientosRecurrentes = [
    { nombre: 'Alquiler Oficinas Centrales', frecuencia: 'Mensual', diaEjecucion: 5, proximaFecha: '2025-12-05', monto: 1500.00, estado: 'Activo' },
    { nombre: 'Depreciación Maquinaria', frecuencia: 'Mensual', diaEjecucion: 28, proximaFecha: '2025-12-28', monto: 350.50, estado: 'Activo' }
  ];

  historialImportaciones = [
    { fecha: '2025-11-28', archivo: 'Data.xlsx', tipo: 'Asientos', registros: 1250, usuario: 'Admin', estado: 'Completado' },
    { fecha: '2025-11-25', archivo: 'Proveedores.csv', tipo: 'Catálogo', registros: 45, usuario: 'J. Perez', estado: 'Error Parcial' }
  ];

  plantillasAsientos = [
    { codigo: 'PLT-001', nombre: 'Compra Suministros', categoria: 'Gastos', items: 3, estado: 'Activo' }
  ];

  // Datos Cierre
  periodosContables = [
    { mes: 'Noviembre 2025', inicio: '2025-11-01', fin: '2025-11-30', estado: 'Abierto', cierre: '-' },
    { mes: 'Octubre 2025', inicio: '2025-10-01', fin: '2025-10-31', estado: 'Cerrado', cierre: '02/11/2025' }
  ];

  validacionCierre = [
    { tarea: 'Mayorización de Asientos', estado: 'Completado', requerido: true },
    { tarea: 'Conciliación Bancaria', estado: 'Pendiente', requerido: true }
  ];

  reaperturas = [
    { periodo: 'Septiembre 2025', fecha: '2025-10-15', usuario: 'Contador', motivo: 'Ajuste fiscal', estado: 'Aprobado' }
  ];

  // Reportes
  reporteDiario = [
    { fecha: '28/11/2025', codigo: 'AS-001', cuenta: '1.1.01.01 Caja', desc: 'Ventas del día', debe: 500.00, haber: 0 },
    { fecha: '28/11/2025', codigo: 'AS-001', cuenta: '4.1.01.01 Ventas', desc: 'Ventas del día', debe: 0, haber: 500.00 }
  ];

  reporteMayor = [
    { cuenta: '1.1.01.01 Caja General', saldoAnt: 1500.00, debitos: 500.00, creditos: 200.00, saldoAct: 1800.00 },
    { cuenta: '1.1.01.02 Bancos Nacionales', saldoAnt: 12000.00, debitos: 15000.00, creditos: 8000.00, saldoAct: 19000.00 }
  ];

  reporteBalanceComprobacion = [
    { cuenta: '1 ACTIVOS', sInicial: 100000, debito: 20000, credito: 15000, sFinal: 105000 },
    { cuenta: '2 PASIVOS', sInicial: 40000, debito: 10000, credito: 12000, sFinal: 42000 }
  ];

  reporteEstadoResultados = [
    { rubro: 'INGRESOS OPERATIVOS', valor: 85000.00, tipo: 'Titulo' },
    { rubro: 'Ventas Netas', valor: 85000.00, tipo: 'Detalle' },
    { rubro: 'UTILIDAD OPERATIVA', valor: 23000.00, tipo: 'Total' }
  ];

  reporteBalanceGeneral = [
    { rubro: 'TOTAL ACTIVOS', valor: 145200.00, nivel: 1 },
    { rubro: 'Activos Corrientes', valor: 45200.00, nivel: 2 }
  ];

  reporteFlujo = [
    { actividad: 'ACTIVIDADES DE OPERACIÓN', valor: 15000.00, esTotal: false },
    { actividad: 'FLUJO NETO', valor: 10000.00, esTotal: true }
  ];

  reporteMovimientosCuenta = [
    { fecha: '01/11/2025', referencia: 'AS-001', glosa: 'Apertura', debito: 5000, credito: 0, saldo: 5000 },
    { fecha: '05/11/2025', referencia: 'EG-045', glosa: 'Pago luz', debito: 0, credito: 150, saldo: 4850 }
  ];

  get patrimonioNeto(): number { return this.totalActivos - this.totalPasivos; }
  get listaVisible() { return this.showAll ? this.asientos : this.asientos.slice(0, this.initialLimit); }

  constructor(private fb: FormBuilder) {
    // 1. Asiento
    this.asientoForm = this.fb.group({ fecha: [new Date().toISOString().substring(0, 10)], desc: [''], cuenta: [''], tipo: ['debito'], monto: [0], estado: ['Borrador'] });
    // 2. Cuenta
    this.cuentaForm = this.fb.group({ codigo: [''], nombre: [''], tipo: ['Detalle'], nivel: [4] });
    // 3. Tipo Cuenta
    this.tipoCuentaForm = this.fb.group({ codigo: [''], nombre: [''], naturaleza: ['Deudora'], descripcion: [''] });
    // 4. Centro Costo
    this.centroCostoForm = this.fb.group({ codigo: [''], nombre: [''], categoria: ['Administrativo'], responsable: [''], presupuesto: [0], estado: ['Activo'] });
    // 5. Sucursal
    this.sucursalForm = this.fb.group({ codigo: [''], nombre: [''], ciudad: ['Guayaquil'], direccion: [''], telefono: [''], responsable: [''], estado: ['Activo'] });
    // 6. Moneda
    this.monedaForm = this.fb.group({ codigo: [''], nombre: [''], simbolo: ['$'], tasa: [1.0000], esBase: [false], estado: ['Activo'] });
    // 7. Recurrente
    this.recurrenteForm = this.fb.group({ nombre: [''], frecuencia: ['Mensual'], diaEjecucion: [1], proximaFecha: [new Date().toISOString().substring(0, 10)], monto: [0], estado: ['Activo'] });
    // 8. Importacion
    this.importForm = this.fb.group({ tipoCarga: ['Asientos'], archivo: [''], descripcion: [''] });
    // 9. Plantilla
    this.plantillaForm = this.fb.group({ codigo: [''], nombre: [''], categoria: ['General'], estado: ['Activo'] });
    // 10. Cierre
    this.cierreForm = this.fb.group({ periodo: [''], tipoAccion: ['Cierre'], comentario: [''], autorizacion: [''] });
  }

  // Navegación
  seleccionarVista(item: any) { this.vistaActual = item.id; this.tituloVista = item.nombre; }
  volverDashboard() { this.vistaActual = 'dashboard'; this.tituloVista = 'Resumen General'; }

  // PDF
  exportarPDF() {
    const doc = new jsPDF();
    doc.text(`Reporte: ${this.tituloVista}`, 14, 20);
    const fmt = new Intl.NumberFormat('en-US', { style:'currency', currency:'USD'});

    if (this.vistaActual.includes('libro')) {
        const head = [['Datos']]; const data = [[ 'Contenido Reporte' ]]; autoTable(doc, { startY: 30, head, body: data });
    } else if (this.vistaActual === 'asientos-manuales') {
        const head = [['Fecha', 'Desc', 'Monto']];
        const data = this.asientos.map(x => [x.fecha, x.desc, fmt.format(x.debito)]);
        autoTable(doc, { startY: 30, head, body: data });
    }
    doc.save(`${this.vistaActual}.pdf`);
  }

  // --- MÉTODOS DE MODALES (SHOW/HIDE/SAVE) ---
  
  toggleModal() { this.liveModalVisible = !this.liveModalVisible; if(this.liveModalVisible) this.asientoForm.reset({fecha: new Date().toISOString().substring(0,10), tipo:'debito'}); }
  handleModalChange(e: boolean) { this.liveModalVisible = e; }
  toggleShowAll() { this.showAll = !this.showAll; }
  guardarAsiento() { if(this.asientoForm.invalid) return; const v=this.asientoForm.value; const m=Number(v.monto); if(v.tipo==='debito') this.totalActivos+=m; else this.totalPasivos+=m; this.asientos.unshift({fecha:v.fecha, codigo:'AS-NEW', desc:v.desc, cuenta:v.cuenta, debito:v.tipo==='debito'?m:0, credito:v.tipo!=='debito'?m:0, estado:'Posteado'}); this.toggleModal(); }

  toggleModalCuenta() { this.modalCuentaVisible = !this.modalCuentaVisible; if(this.modalCuentaVisible) this.cuentaForm.reset({tipo:'Detalle', nivel:4}); }
  handleModalCuentaChange(e: boolean) { this.modalCuentaVisible = e; }
  guardarCuenta() { if(this.cuentaForm.valid) { this.planCuentas.push(this.cuentaForm.value); this.planCuentas.sort((a,b)=>a.codigo.localeCompare(b.codigo)); this.toggleModalCuenta(); } }

  toggleModalTipoCuenta() { this.modalTipoCuentaVisible = !this.modalTipoCuentaVisible; }
  handleModalTipoChange(e: boolean) { this.modalTipoCuentaVisible = e; }
  guardarTipoCuenta() { if(this.tipoCuentaForm.valid) { this.tiposCuentas.push(this.tipoCuentaForm.value); this.toggleModalTipoCuenta(); } }

  toggleModalCentroCosto() { this.modalCentroCostoVisible = !this.modalCentroCostoVisible; }
  handleModalCentroCostoChange(e: boolean) { this.modalCentroCostoVisible = e; }
  guardarCentroCosto() { if(this.centroCostoForm.valid) { this.centrosCosto.push(this.centroCostoForm.value); this.toggleModalCentroCosto(); } }

  toggleModalSucursal() { this.modalSucursalVisible = !this.modalSucursalVisible; }
  handleModalSucursalChange(e: boolean) { this.modalSucursalVisible = e; }
  guardarSucursal() { if(this.sucursalForm.valid) { this.sucursales.push(this.sucursalForm.value); this.toggleModalSucursal(); } }

  toggleModalMoneda() { this.modalMonedaVisible = !this.modalMonedaVisible; }
  handleModalMonedaChange(e: boolean) { this.modalMonedaVisible = e; }
  guardarMoneda() { if(this.monedaForm.valid) { this.monedas.push(this.monedaForm.value); this.toggleModalMoneda(); } }

  toggleModalRecurrente() { this.modalRecurrenteVisible = !this.modalRecurrenteVisible; }
  handleModalRecurrenteChange(e: boolean) { this.modalRecurrenteVisible = e; }
  guardarRecurrente() { if(this.recurrenteForm.valid) { this.asientosRecurrentes.push(this.recurrenteForm.value); this.toggleModalRecurrente(); } }

  toggleModalImportacion() { this.modalImportacionVisible = !this.modalImportacionVisible; }
  handleModalImportacionChange(e: boolean) { this.modalImportacionVisible = e; }
  guardarImportacion() { this.historialImportaciones.unshift({fecha:new Date().toISOString().substring(0,10), archivo:'Manual.csv', tipo:'Asientos', registros:0, usuario:'Tú', estado:'Procesando'}); this.toggleModalImportacion(); }

  toggleModalPlantilla() { this.modalPlantillaVisible = !this.modalPlantillaVisible; }
  handleModalPlantillaChange(e: boolean) { this.modalPlantillaVisible = e; }
  guardarPlantilla() { if(this.plantillaForm.valid) { this.plantillasAsientos.push({...this.plantillaForm.value, items:0}); this.toggleModalPlantilla(); } }

  toggleModalCierre(tipo: string = 'Cierre') { this.modalCierreVisible = !this.modalCierreVisible; if(this.modalCierreVisible) this.cierreForm.reset({tipoAccion:tipo, periodo:'2025'}); }
  handleModalCierreChange(e: boolean) { this.modalCierreVisible = e; }
  ejecutarAccionCierre() { if (this.cierreForm.valid) { alert(`${this.cierreForm.value.tipoAccion} procesado.`); this.toggleModalCierre(); } }
}