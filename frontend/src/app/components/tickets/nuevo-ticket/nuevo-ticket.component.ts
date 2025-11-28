import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TicketService } from '../../../services/ticket.service';
import { ClienteConContratosActivos, CreateTicketResponse } from '../../../../models/vortex.model';
import { ClienteService } from '../../../services/cliente.service';
import { catchError, Subscription, tap } from 'rxjs';
import Swal from 'sweetalert2';

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

  private subscriptions: Subscription = new Subscription();

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
    const usuario = this.clienteService.buscarPorNit(nit).pipe(
      tap((data) => {
        this.loading = false;
        this.clienteSeleccionado = data.cliente;
        this.contratosActivos = data.contratos_activos || [];

        if (this.contratosActivos.length === 1) {
          this.form.patchValue({ id_contrato: this.contratosActivos[0].id_contrato });
        }
      }),
      catchError((error) => {
        this.loading = false;
        console.error(error);
        this.errorMessage =
          error?.error?.message || 'No se encontró cliente para ese NIT';
        throw error;
      }),
    ).subscribe();
    this.subscriptions.add(usuario);
  }

  seleccionarContrato(id_contrato: number) {
    this.form.patchValue({ id_contrato });
  }

  enviarTicket() {
    this.errorMessage = '';
    this.resultado = null;

    if (this.form.invalid) {
      Swal.fire({
        title: 'Formulario invalido',
        text: 'Complete los campos requeridos.',
        icon: 'error',
        iconColor: '#dc3545',
        confirmButtonColor: '#0d6efd',
        confirmButtonText: 'Aceptar',
        allowOutsideClick: false
      })
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    // solo enviamos lo necesario al backend
    const dataTicket = {
      id_contrato: this.form.value.id_contrato,
      titulo: this.form.value.titulo,
      descripcion: this.form.value.descripcion
    };

    const crearTicket = this.ticketService.crearTicket(dataTicket).pipe(
      tap((resp) => {
        this.loading = false;
        this.resultado = resp;
          Swal.fire({
            title: 'Ticket creado con exito',
            text: 'se ha generado con exito el ticket. Pronto nos pondremos en contacto.',
            icon: 'success',
            iconColor: '#28a745',
            confirmButtonColor: '#0d6efd',
            confirmButtonText: 'Aceptar',
            allowOutsideClick: false
          })
      }),
      catchError((error) => {
        this.loading = false;
        console.error(error);
        this.errorMessage =
          error?.error?.message || 'Ocurrió un error al crear el ticket';
        throw error;
      }),
    ).subscribe();
    this.subscriptions.add(crearTicket);
  }

  hasError(controlName: string, error: string): boolean {
    const control = this.form.get(controlName);
    return !!control && control.touched && control.hasError(error);
  }
}
