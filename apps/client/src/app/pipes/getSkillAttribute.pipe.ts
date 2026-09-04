import { Pipe, PipeTransform } from '@angular/core';
import { SkillContent } from '@minitroopers/shared';

@Pipe({
  name: 'getSkillAttribute',
  standalone: true,
})
export class GetSkillAttributePipe implements PipeTransform {
  transform(
    skill: SkillContent,
    attribute: string,
    trooperName?: string | undefined,
  ): string {
    let txt = skill[attribute as keyof SkillContent] as string;
    if (txt?.includes('$') && trooperName) {
      txt = txt.replace('$', trooperName);
    }
    if (txt?.includes('<br/>')) {
      txt = txt.replace('<br/>', '\n');
    }

    return txt;
  }
}
