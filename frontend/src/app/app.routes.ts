import { Routes } from '@angular/router';
import { NuevoTicketComponent } from './components/tickets/nuevo-ticket/nuevo-ticket.component';
import { ListaTicketsComponent } from './components/tickets/lista-tickets/lista-tickets.component';
import { DashboardComponent } from './components/dashboard/dashboard/dashboard.component';
import { ClienteDetalleComponent } from './components/clientes/cliente-detalle/cliente-detalle.component';
import { CrearClienteComponent } from './components/clientes/crear-cliente/crear-cliente.component';
import { CrearContratoComponent } from './components/clientes/crear-contrato/crear-contrato.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'nuevo-ticket', component: NuevoTicketComponent },
  { path: 'tickets', component: ListaTicketsComponent},
  { path: 'cliente-detalle/:id', component: ClienteDetalleComponent},
  { path: 'clientes/nuevo', component: CrearClienteComponent },
  { path: 'contratos/nuevo', component: CrearContratoComponent },
  { path: '**', redirectTo: '' },

];
