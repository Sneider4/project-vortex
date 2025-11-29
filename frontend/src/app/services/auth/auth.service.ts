import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // usamos signal para integrarlo fácil con Angular 16+
  private _isLoggedIn = signal(false);

  isLoggedIn() {
    return this._isLoggedIn();
  }

  login(username: string, password: string): boolean {
    if (username === 'admin' && password === '1234') {
      this._isLoggedIn.set(true);
      return true;
    }
    this._isLoggedIn.set(false);
    return false;
  }

  logout(): void {
    this._isLoggedIn.set(false);
  }
}
