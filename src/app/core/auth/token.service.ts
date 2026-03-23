import { Injectable } from '@angular/core';

interface JwtPayload {
  sub?: string;
  id?: number;
  username?: string;
  nombreCompleto?: string;
  rol?: string;
  exp?: number;
  [key: string]: unknown;
}

@Injectable({ providedIn: 'root' })
export class TokenService {
  private readonly storageKey = 'pz_token';

  getToken(): string | null {
    return localStorage.getItem(this.storageKey);
  }

  setToken(token: string): void {
    localStorage.setItem(this.storageKey, token);
  }

  clearToken(): void {
    localStorage.removeItem(this.storageKey);
  }

  getPayload(token = this.getToken()): JwtPayload | null {
    if (!token) {
      return null;
    }

    const parts = token.split('.');
    if (parts.length < 2) {
      return null;
    }

    try {
      const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');
      const json = atob(padded);
      return JSON.parse(json) as JwtPayload;
    } catch {
      return null;
    }
  }

  isTokenExpired(token = this.getToken()): boolean {
    const payload = this.getPayload(token);
    if (!payload?.exp) {
      return true;
    }

    const nowInSeconds = Math.floor(Date.now() / 1000);
    return payload.exp <= nowInSeconds;
  }

  hasValidToken(): boolean {
    const token = this.getToken();
    return Boolean(token) && !this.isTokenExpired(token);
  }
}

