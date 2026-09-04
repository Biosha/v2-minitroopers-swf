import { Injectable } from '@angular/core';
import { Lang } from '@minitroopers/shared';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  selectedLanguage: Lang = 'fr';

  setLanguage(lang: Lang) {
    this.selectedLanguage = lang;
  }
}
