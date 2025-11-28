import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TicketService } from '../../../services/ticket.service';
import { ClienteConContratosActivos, CreateTicketResponse } from '../../../../models/vortex.model';
import { ClienteService } from '../../../services/cliente.service';

@Component({
  selector: 'app-nuevo-ticket',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './nuevo-ticket.component.html',
  styleUrls: ['./nuevo-ticket.component.scss']
})
export class NuevoTicketComponent {
  form: FormGroup;
  loading = false;
  errorMessage = '';
  resultado: CreateTicketResponse | null = null;

  clienteSeleccionado: ClienteConContratosActivos['cliente'] | null = null;
  contratosActivos: ClienteConContratosActivos['contratos_activos'] = [];

  constructor(
    private fb: FormBuilder,
    private ticketService: TicketService,
    private clienteService: ClienteService
  ) {
    this.form = this.fb.group({
      nit: ['', [Validators.required]],
      id_contrato: [null, [Validators.required]],
      titulo: ['', [Validators.required, Validators.maxLength(200)]],
      descripcion: ['', [Validators.required]]
    });
  }

  buscarClientePorNit() {
    this.errorMessage = '';
    this.clienteSeleccionado = null;
    this.contratosActivos = [];
    this.form.patchValue({ id_contrato: null });

    const nit = this.form.value.nit;
    if (!nit) {
      this.errorMessage = 'Debes ingresar un NIT';
      return;
    }

    this.loading = true;
    this.clienteService.buscarPorNit(nit).subscribe({
      next: (data) => {
        this.loading = false;
        this.clienteSeleccionado = data.cliente;
        this.contratosActivos = data.contratos_activos || [];

        if (this.contratosActivos.length === 1) {
          this.form.patchValue({ id_contrato: this.contratosActivos[0].id_contrato });
        }
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
        this.errorMessage =
          err?.error?.message || 'No se encontró cliente para ese NIT';
      }
    });
  }

  seleccionarContrato(id_contrato: number) {
    this.form.patchValue({ id_contrato });
  }

  onSubmit() {
    this.errorMessage = '';
    this.resultado = null;

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    // solo enviamos lo necesario al backend
    const payload = {
      id_contrato: this.form.value.id_contrato,
      titulo: this.form.value.titulo,
      descripcion: this.form.value.descripcion
    };

    this.ticketService.createTicket(payload as any).subscribe({
      next: (resp) => {
        this.loading = false;
        this.resultado = resp;
      },
      error: (err) => {
        this.loading = false;
        console.error(err);
        this.errorMessage =
          err?.error?.message || 'Ocurrió un error al crear el ticket';
      }
    });
  }

  hasError(controlName: string, error: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.touched && control.hasError(error);
  }
}
