import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loginForm: FormGroup = this.fb.group({
    username: ['admin', [Validators.required]],
    password: ['1234', [Validators.required]],
  });

  errorMessage = '';

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Debe ingresar usuario y contraseña.';
      return;
    }

    const { username, password } = this.loginForm.value;

    const ok = this.auth.login(username, password);
    if (!ok) {
      this.errorMessage = 'Credenciales incorrectas.';
      return;
    }

    this.errorMessage = '';
    // Al loguear, lo mandamos al dashboard (o a donde quieras)
    this.router.navigate(['/dashboard']);
    Swal.fire({
      title: 'Inicio de sesión exitoso',
      text: 'Has iniciado sesión correctamente.',
      icon: 'success',
      iconColor: '#28a745',
      confirmButtonColor: '#0d6efd',
      confirmButtonText: 'Aceptar',
      allowOutsideClick: false
    });
  }
}
