import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClienteService } from '../../../services/cliente.service';
import { Cliente, Contrato } from '../../../../models/vortex.model';
import { catchError, Subscription, tap } from 'rxjs';
import Swal from 'sweetalert2';
import moment from 'moment';

@Component({
  selector: 'app-crear-contrato',
  imports: [ReactiveFormsModule],
  templateUrl: './crear-contrato.component.html',
  styleUrl: './crear-contrato.component.scss'
})
export class CrearContratoComponent {

  booleanCrearContrato: boolean = false;
  private subscriptions: Subscription = new Subscription();

  private fb = inject(FormBuilder);
  private clienteService = inject(ClienteService);

  form: FormGroup = this.fb.group({
    id_cliente: [null, [Validators.required]],
    nombre_proyecto: ['', [Validators.required]],
    fecha_inicio: ['', [Validators.required]],
    fecha_fin: [''],
    valor_mensual: [null, [Validators.required, Validators.min(0)]],
    estado: ['VIGENTE', [Validators.required]],
    nivel_servicio: [''],
  });

  listaContratos: any[] = [];
  clientes: Cliente[] = [];
  loading = false;
  errorMessage = '';
  contratoCreado: Contrato | null = null;

  ngOnInit(): void {
    this.cargarClientes();
    this.cargarContratos();
  }

  hasError(controlName: string, error: string): boolean {
    const ctrl = this.form.get(controlName);
    return !!ctrl && ctrl.touched && ctrl.hasError(error);
  }

  cargarClientes(): void {
    const listaClientes = this.clienteService.listarClientes().pipe(
      tap((data) => {
        this.clientes = data
        this.loading = false;
      }),
      catchError((error) => {
        console.error('Error cargando clientes:', error);
        this.errorMessage =
          'No se pudieron cargar los clientes. Verifica la API /clientes.';
        throw error;
      }),
    ).subscribe();
    this.subscriptions.add(listaClientes);
  }

  crearContrato(): void {
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
    this.errorMessage = '';
    this.contratoCreado = null;

    const contrato = this.clienteService.crearContrato(this.form.value).pipe(
      tap((contrato) => {
        this.contratoCreado = contrato;
        this.loading = false;
        this.booleanCrearContrato = false;
        this.form.reset();
        this.cargarContratos();
          Swal.fire({
            title: 'Contrato creado',
            text: 'Se ha creado exitosamente el contrato.',
            icon: 'success',
            iconColor: '#28a745',
            confirmButtonColor: '#0d6efd',
            confirmButtonText: 'Aceptar',
            allowOutsideClick: false
          })
      }),
      catchError((error) => {
        console.error('Error creando contrato:', error);
        this.errorMessage = 'Ocurrió un error creando el contrato.';
        this.loading = false;
        throw error;
      }),
    ).subscribe();
    this.subscriptions.add(contrato);
  }

  cargarContratos(): void {
    const contratos = this.clienteService.listarContratos().pipe(
      tap((contrato) => {
        this.listaContratos = contrato
      }),
      catchError((error) => {
        console.error('Error cargando clientes:', error);
        this.errorMessage =
          'No se pudieron cargar los clientes. Verifica la API /clientes.';
        throw error;
      }),
    ).subscribe();
    this.subscriptions.add(contratos);
  }

  crearC(cancelar: boolean = false): void {
    if (cancelar) {
      this.form.reset();
      this.booleanCrearContrato = false;
    }
    else {
      this.booleanCrearContrato = true;
    }
  }

  formateadorFecha(fecha: string | null) {
      moment.locale('es');
      return moment(fecha).format('dddd, DD [de] MMMM YYYY');
    }
}
