import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TicketService } from '../../../services/ticket.service';
import { TicketWithAnalysis } from '../../../../models/vortex.model'

@Component({
  selector: 'app-lista-tickets',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './lista-tickets.component.html',
  styleUrls: ['./lista-tickets.component.scss']
})
export class ListaTicketsComponent implements OnInit {
  tickets: TicketWithAnalysis[] = [];
  loading = false;
  errorMessage = '';

  constructor(private ticketService: TicketService) { }

  ngOnInit(): void {
    this.cargarTickets();
  }

  cargarTickets() {
    this.loading = true;
    this.errorMessage = '';
    this.ticketService.getTickets().subscribe({
      next: (items) => {
        this.loading = false;
        this.tickets = items;
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
        this.errorMessage =
          err?.error?.message || 'Error al cargar la lista de tickets';
      }
    });
  }

  getRiesgoClass(riesgo: string | null | undefined): string {
    switch (riesgo) {
      case 'ALTO':
        return 'badge badge-alto';
      case 'MEDIO':
        return 'badge badge-medio';
      case 'BAJO':
        return 'badge badge-bajo';
      default:
        return 'badge badge-nd';
    }
  }

  getSentimientoClass(sentimiento: string | null | undefined): string {
    switch (sentimiento) {
      case 'NEGATIVO':
        return 'badge badge-negativo';
      case 'NEUTRO':
        return 'badge badge-neutro';
      case 'POSITIVO':
        return 'badge badge-positivo';
      default:
        return 'badge badge-nd';
    }
  }
}
