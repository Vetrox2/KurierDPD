import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Preferences } from '@capacitor/preferences';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly AUTH_TOKEN_KEY = 'auth_token';
  private readonly API_URL = 'https://kurierdpd-production.up.railway.app';

  private _authToken = signal<string | null>(null);
  get authToken() {
    return this._authToken.asReadonly();
  }

  constructor(private http: HttpClient) {
    this.loadToken();
  }

  async login(username: string, password: string): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.http.post<{ token: string }>(`${this.API_URL}/auth/login`, {
          username,
          password,
        })
      );

      if (response.token) {
        await this.saveToken(response.token);
        this._authToken.set(response.token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }

  private async loadToken(): Promise<void> {
    const { value } = await Preferences.get({ key: this.AUTH_TOKEN_KEY });
    if (value) {
      this._authToken.set(value);
    }
  }

  private async saveToken(token: string): Promise<void> {
    await Preferences.set({
      key: this.AUTH_TOKEN_KEY,
      value: token,
    });
  }
}
