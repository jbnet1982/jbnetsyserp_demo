import { Component, OnInit } from '@angular/core';
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
  cilPeople, cilBriefcase, cilDollar, cilCalculator, cilTask, cilMedicalCross, 
  cilFile, cilPrint, cilSearch
} from '@coreui/icons';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-nomina',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    CardModule, GridModule, TableModule, ButtonModule, BadgeModule, 
    ModalModule, FormModule, IconModule, NavModule, AccordionModule, SharedModule, TooltipModule
  ],
  providers: [IconSetService],
  templateUrl: './nomina.component.html',
  styleUrls: ['./nomina.component.scss']
})
export class NominaComponent implements OnInit {

  // 1. ICONOS
  icons = { 
    cilArrowLeft, cilCloudDownload, cilPlus, cilSave, cilX, cilFolderOpen, cilChartLine, 
    cilList, cilUser, cilMoney, cilCalendar, cilWarning, cilCheckCircle, cilClock, 
    cilPen, cilBank, cilPeople, cilBriefcase, cilDollar, cilCalculator, cilTask, 
    cilMedicalCross, cilFile, cilPrint, cilSearch
  };

  // 2. MENÚ
  menuEstructura = [
    {
      titulo: 'Catálogos', icono: 'cilList', id: 'catalogos',
      items: [
        { id: 'empleados', nombre: 'Empleados' },
        { id: 'cargos', nombre: 'Cargos' },
        { id: 'departamentos', nombre: 'Departamentos' },
        { id: 'conceptos', nombre: 'Deducciones e Ingresos' },
        { id: 'contratos', nombre: 'Tipos de Contrato' }
      ]
    },
    {
      titulo: 'Procesos', icono: 'cilCalculator', id: 'procesos',
      items: [
        { id: 'calculo-nomina', nombre: 'Cálculo de Nómina' },
        { id: 'pagos-nomina', nombre: 'Pago de Nómina' },
        { id: 'vacaciones', nombre: 'Control Vacaciones' },
        { id: 'liquidaciones', nombre: 'Liquidaciones' },
        { id: 'aportes', nombre: 'Aportes y Contribuciones' }
      ]
    },
    {
      titulo: 'Reportes', icono: 'cilChartLine', id: 'reportes',
      items: [
        { id: 'planillas', nombre: 'Planillas General' },
        { id: 'historial', nombre: 'Historial Empleado' },
        { id: 'costos', nombre: 'Costos Laborales' }
      ]
    }
  ];

  // Estado Visual
  vistaActual: string = 'dashboard';
  tituloVista: string = 'Recursos Humanos y Nómina';
  
  // Flags Visuales (Evitan lógica en HTML)
  isDashboard = true;
  isEmpleados = false;
  isNominas = false; // Historial de cálculos
  isVacaciones = false;
  isCatalogos = false; // Cargos, Dept, etc.
  isVacio = false;

  // Botones
  btnNuevoEmpleado = false;
  btnCalcular = false;
  btnNuevoItem = false;
  btnSolicitudVacacion = false;

  // KPI Variables
  totalEmpleados = 0;
  costoNominaMes = 0;
  vacacionesPendientes = 0;

  // Modales
  modalEmpleadoVisible = false;
  modalNominaVisible = false;
  modalVacacionVisible = false;
  modalCatalogoVisible = false;

  // Forms
  empleadoForm: FormGroup;
  nominaForm: FormGroup;
  vacacionForm: FormGroup;
  catalogoForm: FormGroup;

  // Listas y Datos Mock
  listaVisible: any[] = []; // Lista dinámica para la tabla
  
  empleados = [
    { id: 'E001', nombre: 'Juan Perez', cargo: 'Contador', depto: 'Finanzas', salario: 1200.00, estado: 'Activo', fechaIngreso: '2023-01-15' },
    { id: 'E002', nombre: 'Maria Rodriguez', cargo: 'Gerente Ventas', depto: 'Comercial', salario: 2500.00, estado: 'Activo', fechaIngreso: '2022-05-10' },
    { id: 'E003', nombre: 'Pedro Diaz', cargo: 'Bodeguero', depto: 'Logística', salario: 600.00, estado: 'Activo', fechaIngreso: '2024-02-01' },
    { id: 'E004', nombre: 'Ana Lopez', cargo: 'Asistente', depto: 'Admin', salario: 550.00, estado: 'Permiso', fechaIngreso: '2023-11-20' }
  ];

  historialNominas = [
    { periodo: 'Octubre 2025', fecha: '2025-10-30', totalIngresos: 4850.00, totalEgresos: 458.50, neto: 4391.50, estado: 'Pagado' },
    { periodo: 'Septiembre 2025', fecha: '2025-09-30', totalIngresos: 4850.00, totalEgresos: 458.50, neto: 4391.50, estado: 'Pagado' }
  ];

  vacaciones = [
    { empleado: 'Juan Perez', fechaInicio: '2025-12-20', dias: 15, estado: 'Aprobado' }
  ];

  cargos = [{ nombre: 'Contador', base: 800 }, { nombre: 'Gerente', base: 2000 }];
  departamentos = [{ nombre: 'Finanzas', jefe: 'Juan Perez' }, { nombre: 'Comercial', jefe: 'Maria Rodriguez' }];
  conceptos = [{ nombre: 'Horas Extras', tipo: 'Ingreso' }, { nombre: 'IESS Personal', tipo: 'Deducción' }];

  constructor(private fb: FormBuilder, public iconSet: IconSetService) {
    this.iconSet.icons = this.icons;

    this.empleadoForm = this.fb.group({
      nombres: ['', Validators.required], apellido: ['', Validators.required],
      cedula: ['', Validators.required], cargo: ['Contador'], departamento: ['Finanzas'],
      salario: [460, Validators.required], fechaIngreso: [new Date().toISOString().substring(0, 10)]
    });

    this.nominaForm = this.fb.group({ periodo: ['Noviembre 2025'], fechaPago: [new Date().toISOString().substring(0,10)], notas: [''] });
    this.vacacionForm = this.fb.group({ empleado: [''], dias: [15], fechaInicio: [''] });
    this.catalogoForm = this.fb.group({ nombre: [''], detalle: [''] });
  }

  ngOnInit() {
    this.actualizarEstado();
  }

  // === LÓGICA CENTRAL (SIN GETTERS EN HTML) ===
  actualizarEstado() {
    // 1. KPIs
    this.totalEmpleados = this.empleados.length;
    this.costoNominaMes = this.empleados.reduce((sum, emp) => sum + emp.salario, 0); // Costo base simple
    this.vacacionesPendientes = 5; // Simulado

    // 2. Lógica de Vistas
    this.isDashboard = this.vistaActual === 'dashboard';
    this.isEmpleados = this.vistaActual === 'empleados';
    this.isNominas = ['calculo-nomina', 'planillas', 'historial', 'pagos-nomina'].includes(this.vistaActual);
    this.isVacaciones = this.vistaActual === 'vacaciones';
    this.isCatalogos = ['cargos', 'departamentos', 'conceptos', 'contratos'].includes(this.vistaActual);
    this.isVacio = !(this.isDashboard || this.isEmpleados || this.isNominas || this.isVacaciones || this.isCatalogos);

    // 3. Llenar Lista Visible según vista
    if (this.isEmpleados) {
        this.listaVisible = this.empleados;
    } else if (this.isNominas) {
        this.listaVisible = this.historialNominas;
    } else if (this.isVacaciones) {
        this.listaVisible = this.vacaciones;
    } else if (this.vistaActual === 'cargos') this.listaVisible = this.cargos;
      else if (this.vistaActual === 'departamentos') this.listaVisible = this.departamentos;
      else if (this.vistaActual === 'conceptos') this.listaVisible = this.conceptos;
    
    // 4. Botones
    this.btnNuevoEmpleado = this.vistaActual === 'empleados';
    this.btnCalcular = this.vistaActual === 'calculo-nomina';
    this.btnSolicitudVacacion = this.vistaActual === 'vacaciones';
    this.btnNuevoItem = this.isCatalogos;
  }

  seleccionarVista(item: any) {
    this.vistaActual = item.id;
    this.tituloVista = item.nombre;
    this.actualizarEstado();
  }

  volverDashboard() {
    this.vistaActual = 'dashboard';
    this.tituloVista = 'Recursos Humanos y Nómina';
    this.actualizarEstado();
  }

  exportarPDF() {
    const doc = new jsPDF();
    doc.text(`Reporte: ${this.tituloVista}`, 14, 20);
    // Simulación de tablas básicas
    if(this.isEmpleados) {
        autoTable(doc, { startY: 30, head:[['Nombre','Cargo','Salario']], body: this.empleados.map(e => [e.nombre, e.cargo, e.salario]) });
    }
    doc.save(`${this.vistaActual}.pdf`);
  }

  // === MÉTODOS TRANSACCIONALES ===

  toggleModalEmpleado() { this.modalEmpleadoVisible = !this.modalEmpleadoVisible; if(this.modalEmpleadoVisible) this.empleadoForm.reset({salario: 460, cargo: 'Asistente', departamento: 'Admin'}); }
  guardarEmpleado() {
    if(this.empleadoForm.valid) {
      const val = this.empleadoForm.value;
      this.empleados.push({
          id: 'E00'+(this.empleados.length+1),
          nombre: val.nombres + ' ' + val.apellido,
          cargo: val.cargo, depto: val.departamento,
          salario: val.salario, estado: 'Activo',
          fechaIngreso: val.fechaIngreso
      });
      alert('EMPLEADO CREADO.\nSe ha creado la ficha y cuenta de provisiones.');
      this.toggleModalEmpleado();
      this.actualizarEstado();
    }
  }

  toggleModalNomina() { this.modalNominaVisible = !this.modalNominaVisible; }
  ejecutarCalculoNomina() {
    // Simulación de cálculo masivo
    const totalSalarios = this.costoNominaMes;
    const aporteIess = totalSalarios * 0.0945;
    
    this.historialNominas.unshift({
        periodo: 'Noviembre 2025',
        fecha: new Date().toISOString().substring(0,10),
        totalIngresos: totalSalarios,
        totalEgresos: aporteIess,
        neto: totalSalarios - aporteIess,
        estado: 'Generado'
    });
    
    // INTEGRACIÓN CORE
    alert(`NÓMINA CALCULADA EXITOSAMENTE.\n\n>> CONTABILIDAD: Asiento de Rol Generado (Gasto Sueldos vs Bancos/IESS por Pagar).\n>> EGRESOS: $${(totalSalarios - aporteIess).toFixed(2)} listos para transferir.`);
    
    this.toggleModalNomina();
    this.actualizarEstado();
  }

  toggleModalVacacion() { this.modalVacacionVisible = !this.modalVacacionVisible; }
  guardarVacacion() {
      if(this.vacacionForm.valid) {
        this.vacaciones.push({empleado: 'Empleado Selecc.', fechaInicio: this.vacacionForm.value.fechaInicio, dias: this.vacacionForm.value.dias, estado: 'Solicitado'});
        this.toggleModalVacacion();
        this.actualizarEstado();
      }
  }

  toggleModalCatalogo() { this.modalCatalogoVisible = !this.modalCatalogoVisible; }
  guardarCatalogo() { 
      alert('Registro guardado.'); 
      this.toggleModalCatalogo();
      this.actualizarEstado();
  }

}