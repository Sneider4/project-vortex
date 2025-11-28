import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService } from '../../../services/dashboard.service';
import { DashboardResumen, RiesgoResumen } from '../../../../models/vortex.model'
import { RouterLink } from '@angular/router';
import { catchError, Subscription, tap } from 'rxjs';

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

  private subscriptions: Subscription = new Subscription();

  private dashboardService = inject(DashboardService)

  constructor() { }

  ngOnInit(): void {
    this.cargarResumen();
  }

  cargarResumen() {
    const resumen = this.dashboardService.getResumen().pipe(
      tap((data) => {
        this.loading = false;
        this.data = data;
      }),
      catchError((error) => {
        this.loading = false;
        console.error(error);
        this.errorMessage =
          error?.error?.message || 'Error al cargar el dashboard';
        throw error;
      }),
    ).subscribe();
    this.subscriptions.add(resumen);
  }


  getCantidadPorRiesgo(riesgo: string): number {
    if (!this.data) return 0;
    const item = this.data.resumen_riesgo.find(
      (r: RiesgoResumen) => (r.riesgo_churn || 'N/D') === riesgo
    );
    return item ? item.cantidad : 0;
  }
}
