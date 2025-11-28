import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { ClienteConContratosActivos, ClienteResumen } from '../../models/vortex.model';

@Injectable({
  providedIn: 'root'
})
export class ClienteService {
  private baseUrl = `${environment.apiUrl}/clientes`;

  constructor(private http: HttpClient) { }

  getResumen(idCliente: number): Observable<ClienteResumen> {
    return this.http.get<ClienteResumen>(`${this.baseUrl}/${idCliente}/resumen`);
  }

  buscarPorNit(nit: string): Observable<ClienteConContratosActivos> {
    return this.http.get<ClienteConContratosActivos>(`${this.baseUrl}/por-nit/${nit}`);
  }
}
