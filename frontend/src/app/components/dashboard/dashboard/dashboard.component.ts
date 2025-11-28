import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../../services/dashboard.service';
import { DashboardResumen, RiesgoResumen } from '../../../../models/vortex.model'
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  data: DashboardResumen | null = null;
  loading = false;
  errorMessage = '';

  constructor(private dashboardService: DashboardService) { }

  ngOnInit(): void {
    this.cargarResumen();
  }

  cargarResumen() {
    this.loading = true;
    this.errorMessage = '';
    this.dashboardService.getResumen().subscribe({
      next: (res) => {
        this.loading = false;
        this.data = res;
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
        this.errorMessage =
          err?.error?.message || 'Error al cargar el dashboard';
      }
    });
  }

  getCantidadPorRiesgo(riesgo: string): number {
    if (!this.data) return 0;
    const item = this.data.resumen_riesgo.find(
      (r: RiesgoResumen) => (r.riesgo_churn || 'N/D') === riesgo
    );
    return item ? item.cantidad : 0;
  }
}
