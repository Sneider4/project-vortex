import { Component, inject, OnInit } from '@angular/core';
import { catchError, Subscription, tap } from 'rxjs';
import { TicketService } from '../../../services/ticket.service';
import { ActivatedRoute } from '@angular/router';
import moment from 'moment';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-detalle-ticket',
  imports: [NgClass],
  templateUrl: './detalle-ticket.component.html',
  styleUrl: './detalle-ticket.component.scss'
})
export class DetalleTicketComponent implements OnInit  {

  ticketId!: number;
  data: any = null;
  loading = false;
  errorMessage = '';

  private subscriptions: Subscription = new Subscription();

  private route = inject(ActivatedRoute)
  private ticketService = inject(TicketService)

  constructor() { }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      if (!Number.isNaN(id)) {
        this.ticketId = id;
        this.cargarDetalleTicket();
      } else {
        this.errorMessage = 'ID de cliente inválido';
      }
    });
  }

  cargarDetalleTicket() {
    console.log("Cargando detalle del ticket con ID:", this.ticketId);
    const resumen = this.ticketService.getDetalleTicket(this.ticketId).pipe(
      tap((data) => {
        this.loading = false;
        this.data = data;
        console.log(data);
      }),
      catchError((error) => {
        this.loading = false;
        console.error(error);
        this.errorMessage =
          error?.error?.message || 'Error al cargar el detalle del cliente';
        throw error;
      }),
    ).subscribe();
    this.subscriptions.add(resumen);
  }

  getPrioridadClass(prioridad: string | null | undefined): string {
    const p = (prioridad || '').toUpperCase();
    switch (p) {
      case 'CRITICA':
      case 'CRÍTICA':
        return 'text-bg-danger';
      case 'ALTA':
        return 'text-bg-danger';
      case 'MEDIA':
        return 'text-bg-warning text-dark';
      case 'BAJA':
        return 'text-bg-success';
      default:
        return 'text-bg-secondary';
    }
  }

  getSentimientoClass(sentimiento: string | null | undefined): string {
    switch (sentimiento) {
      case 'POSITIVO':
        return 'text-bg-success';
      case 'NEUTRO':
        return 'text-bg-secondary';
      case 'NEGATIVO':
        return 'text-bg-danger';
      default:
        return 'text-bg-light text-dark';
    }
  }

  getRiesgoClass(riesgo: string | null | undefined): string {
    switch (riesgo) {
      case 'ALTO':
        return 'text-bg-danger';
      case 'MEDIO':
        return 'text-bg-warning text-dark';
      case 'BAJO':
        return 'text-bg-success';
      default:
        return 'text-bg-secondary';
    }
  }

  formateadorFecha(fecha: string | null) {
    moment.locale('es');
    return moment(fecha).format('dddd, DD [de] MMMM YYYY');
  }

  goBack(): void {
    window.history.back();
  }
}
