import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { map, Observable } from 'rxjs';
import { CreateTicketRequest, CreateTicketResponse, TicketWithAnalysis } from '../../models/vortex.model';

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private baseUrl = `${environment.apiUrl}/tickets`;

  constructor(private http: HttpClient) { }

  crearTicket(data: CreateTicketRequest): Observable<CreateTicketResponse> {
    return this.http.post<CreateTicketResponse>(`${this.baseUrl}/listadoTicketAnalisis`, data);
  }

  getTickets(): Observable<TicketWithAnalysis[]> {
    return this.http.get<{ items: TicketWithAnalysis[] }>(`${this.baseUrl}/listadoTicket`).pipe(
        // nos quedamos solo con el array items
        map((resp) => resp.items)
      );
  }

}
