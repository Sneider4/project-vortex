import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth/auth.service';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import Swal from 'sweetalert2';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, RouterLinkActive, RouterLink, CommonModule],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent {
    title = 'frontend';
    isSidebarCollapsed = false;
    currentYear = new Date().getFullYear();

    auth = inject(AuthService);
    private router = inject(Router);

    toggleSidebar(): void {
        this.isSidebarCollapsed = !this.isSidebarCollapsed;
    }

    goToLogin(): void {
        this.router.navigate(['/login']);
    }

    logout(): void {
        Swal.fire({
            title: "¿Cerrar sesión?",
            text: "¿Estás seguro de que deseas cerrar sesión?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Sí, cerrar sesión",
            cancelButtonText: "Cancelar",
            allowOutsideClick: false
        }).then((result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    icon: "success",
                    title: "Sesión cerrada",
                    text: "Has cerrado sesión correctamente.",
                    showConfirmButton: false,
                    timer: 2000
                });
                // Al cerrar sesión, lo mandamos a nuevo-ticket
                this.auth.logout();
                this.router.navigate(['/nuevo-ticket']);
            }
        });
    }

}
