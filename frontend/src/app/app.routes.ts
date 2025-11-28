import { Routes } from '@angular/router';
import { NuevoTicketComponent } from './components/tickets/nuevo-ticket/nuevo-ticket.component';
import { ListaTicketsComponent } from './components/tickets/lista-tickets/lista-tickets.component';
import { DashboardComponent } from './components/dashboard/dashboard/dashboard.component';
import { ClienteDetalleComponent } from './components/clientes/cliente-detalle/cliente-detalle.component';

export const routes: Routes = [
  {
    path: '',
    component: DashboardComponent
  },
  {
    path: 'nuevo-ticket',
    component: NuevoTicketComponent
  },
  {
    path: 'tickets',
    component: ListaTicketsComponent
  },
  {
    path: 'clientes/:id',
    component: ClienteDetalleComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
