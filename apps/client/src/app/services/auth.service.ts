import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { UserExtended } from '@minitroopers/shared';
import { map, take, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { LanguageService } from './language.service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private languageService = inject(LanguageService);
  private notificationService = inject(NotificationService);

  loginFromEternal() {
    this.http
      .get<{ url: string }>(environment.apiUrl + '/api/oauth/redirect')
      .pipe(take(1))
      .subscribe(({ url }) => {
        window.location.href = url;
      });
  }

  signIn(): Promise<UserExtended | null> {
    return new Promise<UserExtended | null>((resolve) => {
      const userId = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      const expires = localStorage.getItem('expires');

      if (!userId || !token) {
        resolve(null);
        return;
      }

      if (!expires || Number(expires) <= Date.now()) {
        this.clearLocalStorage();
        resolve(null);
        return;
      }

      this.http
        .get<UserExtended>(environment.apiUrl + '/api/user/signin/eternal', {})
        .pipe(
          take(1),
          map((resp) => {
            if ((resp as { status?: string }).status === 'error') {
              this.clearLocalStorage();
              return null;
            }
            return resp;
          }),
        )
        .subscribe({
          next: (response) => {
            if (response?.name) {
              this.notificationService.notify(
                'success',
                `Connected as ${response.name}`,
              );
              resolve(response);
              return;
            }
            resolve(null);
          },
          error: () => {
            this.clearLocalStorage();
            this.notificationService.notify(
              'error',
              'Connection failed. Please try again.',
            );
            resolve(null);
          },
        });
    });
  }

  getFromToken(code: string) {
    let queryParams = new HttpParams();
    queryParams = queryParams.append('code', code);

    return this.http
      .get<UserExtended>(environment.apiUrl + '/api/oauth/token', {
        params: queryParams,
      })
      .pipe(
        tap((response) => {
          if (response?.connexionToken) {
            this.persistSession(response);
          }
        }),
      );
  }

  disconnect() {
    this.clearLocalStorage();
    this.notificationService.notify('success', 'Disconnected');
  }

  private persistSession(response: UserExtended & { connexionToken?: string }) {
    this.languageService.setLanguage(response.lang);
    localStorage.setItem('user', response.id);
    localStorage.setItem('token', response.connexionToken ?? '');
    localStorage.setItem(
      'expires',
      String(Date.now() + 24 * 7 * 60 * 60 * 1000),
    );
    this.notificationService.notify('success', 'Connected as ' + response.name);
  }

  private clearLocalStorage() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('expires');
    localStorage.removeItem('loginType');
  }
}
