import {
  ComponentRef,
  Directive,
  HostListener,
  Input,
  ViewContainerRef,
} from '@angular/core';
import { TooltipComponent } from '../components/containers/tooltip/tooltip.component';

@Directive({
  selector: '[appTooltip]',
  standalone: true,
})
export class TooltipDirective {
  @Input('appTooltip') tooltipSkill: number | undefined = undefined;
  @Input('trooperName') trooperName: string | undefined = undefined;
  private tooltipRef: ComponentRef<TooltipComponent> | null = null;

  constructor(private viewContainerRef: ViewContainerRef) {}

  @HostListener('mouseenter') onMouseEnter() {
    this.createTooltip();
  }

  @HostListener('mouseleave') onMouseLeave() {
    this.destroyTooltip();
  }

  @HostListener('mousemove', ['$event']) onMouseMove(event: MouseEvent) {
    if (this.tooltipRef) {
      const tooltipElement = this.tooltipRef.location.nativeElement;
      tooltipElement.style.top = `${event.clientY + 10}px`;
      tooltipElement.style.left = `${event.clientX + 10}px`;
    }
  }

  private createTooltip() {
    this.tooltipRef = this.viewContainerRef.createComponent(TooltipComponent);
    this.tooltipRef.instance.skillId = this.tooltipSkill;
    this.tooltipRef.instance.trooperName = this.trooperName;
    const tooltipElement = this.tooltipRef.location.nativeElement;
    tooltipElement.classList.add('tooltip');
  }

  private destroyTooltip() {
    if (this.tooltipRef) {
      this.tooltipRef.destroy();
      this.tooltipRef = null;
    }
  }
}
