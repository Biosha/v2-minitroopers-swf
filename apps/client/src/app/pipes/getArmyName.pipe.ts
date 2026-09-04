import { Injectable, Pipe, PipeTransform } from '@angular/core';
import { PartialUserExtended } from '@minitroopers/shared';
import { PrefixArmy } from '../constants/prefix-army';

@Pipe({
  standalone: true,
  name: 'getArmyName',
})
@Injectable({
  providedIn: 'root',
})
export class GetArmyNamePipe implements PipeTransform {
  transform(user: PartialUserExtended | undefined): string {
    if (user) {
      const prefixs = PrefixArmy;

      return (
        "L'armée" +
        (user.prefix != 5 ? ' ' : '') +
        prefixs[user.prefix] +
        (user.prefix == 5 || user.prefix == 1 ? '' : ' ') +
        user.armyName
      );
    } else {
      return '';
    }
  }
}
