import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly _isLoggedIn = signal<boolean>(false);
  public readonly isLoggedIn = this._isLoggedIn.asReadonly();

  constructor() {}

  login(email: string, password: string): void {
    // Basic simulation of login logic
    console.log('Logging in with:', email, password);
    if (email && password) {
      this._isLoggedIn.set(true);
    }
  }

  logout(): void {
    this._isLoggedIn.set(false);
  }
}
