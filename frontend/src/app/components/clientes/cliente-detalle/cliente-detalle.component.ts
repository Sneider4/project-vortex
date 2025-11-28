import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ClienteService } from '../../../services/cliente.service';
import { ClienteResumen } from '../../../../models/vortex.model'

@Component({
  selector: 'app-cliente-detalle',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './cliente-detalle.component.html',
  styleUrls: ['./cliente-detalle.component.scss']
})
export class ClienteDetalleComponent implements OnInit {
  clienteId!: number;
  data: ClienteResumen | null = null;
  loading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private clienteService: ClienteService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = Number(params.get('id'));
      if (!Number.isNaN(id)) {
        this.clienteId = id;
        this.cargarResumen();
      } else {
        this.errorMessage = 'ID de cliente inválido';
      }
    });
  }

  cargarResumen() {
    this.loading = true;
    this.errorMessage = '';
    this.clienteService.getResumen(this.clienteId).subscribe({
      next: (res) => {
        this.loading = false;
        this.data = res;
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
        this.errorMessage =
          err?.error?.message || 'Error al cargar el detalle del cliente';
      }
    });
  }

  getCantidadPorRiesgo(riesgo: string): number {
    if (!this.data) return 0;
    const item = this.data.resumen.tickets_por_riesgo.find(
      (r) => (r.riesgo_churn || 'N/D') === riesgo
    );
    return item ? item.cantidad : 0;
  }
}
