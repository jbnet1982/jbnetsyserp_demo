import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // <--- Importante para la navegación
import { CardModule, GridModule } from '@coreui/angular';
import { IconModule, IconSetService } from '@coreui/icons-angular';

// Importación de Iconos específicos
import { 
  cilMoney, 
  cilSpreadsheet, 
  cilList, 
  cilCart, 
  cilBank, 
  cilBriefcase, 
  cilCheckCircle, 
  cilChartLine, 
  cilPeople, 
  cilCalculator 
} from '@coreui/icons';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  // Agregamos RouterModule aquí para que [routerLink] funcione en el HTML
  imports: [CommonModule, RouterModule, CardModule, GridModule, IconModule],
  providers: [IconSetService],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  
  // Lista de módulos con propiedad 'link' agregada
  modules = [
    { 
      title: 'Contabilidad', 
      icon: 'cilCalculator', 
      color: 'grad-purple', 
      desc: 'Balances generales', 
      link: '/contabilidad' // <--- Ruta activa creada en el paso anterior
    },
    { 
      title: 'Facturación', 
      icon: 'cilSpreadsheet', 
      color: 'grad-blue', 
      desc: 'Gestión fiscal',
      link: '/facturacion' 
    },
    { 
      title: 'Inventarios', 
      icon: 'cilList', 
      color: 'grad-orange', 
      desc: 'Control de stock',
      link: '/inventarios'
    },
    { 
      title: 'Puntos de Venta', 
      icon: 'cilCart', 
      color: 'grad-green', 
      desc: 'Cajas diarias',
      link: '/pos'
    },
    { 
      title: 'Bancos', 
      icon: 'cilBank', 
      color: 'grad-cyan', 
      desc: 'Conciliación',
      link: '/bancos'
    },
    { 
      title: 'Ctas por Cobrar', 
      icon: 'cilMoney', 
      color: 'grad-info', 
      desc: 'Cartera clientes',
      link: '/cxc'
    },
    { 
      title: 'Ctas por Pagar', 
      icon: 'cilBriefcase', 
      color: 'grad-red', 
      desc: 'Proveedores',
      link: '/cxp'
    },
    { 
      title: 'Activos Fijos', 
      icon: 'cilCheckCircle', 
      color: 'grad-indigo', 
      desc: 'Depreciaciones',
      link: '/activos'
    },
    { 
      title: 'Compras', 
      icon: 'cilChartLine', 
      color: 'grad-teal', 
      desc: 'Adquisiciones',
      link: '/compras'
    },
    { 
      title: 'Nómina', 
      icon: 'cilPeople', 
      color: 'grad-pink', 
      desc: 'Recursos Humanos',
      link: '/nomina'
    }
  ];

  constructor(public iconSet: IconSetService) {
    // Registramos los iconos en el servicio para usarlos por nombre (string) en el HTML
    iconSet.icons = { 
      cilMoney, 
      cilSpreadsheet, 
      cilList, 
      cilCart, 
      cilBank, 
      cilBriefcase, 
      cilCheckCircle, 
      cilChartLine, 
      cilPeople, 
      cilCalculator 
    };
  }
}