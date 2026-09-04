import { animate, style, transition, trigger } from '@angular/animations';

import {
  Component,
  OnInit,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { Subscription } from 'rxjs';
import {
  FrontNotification,
  NotificationService,
} from 'src/app/services/notification.service';

@Component({
  selector: 'app-notification',
  imports: [],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  animations: [
    trigger('fadeOut', [
      transition(':leave', [
        style({ opacity: 1 }),
        animate('0.5s', style({ opacity: 0 })),
      ]),
    ]),
  ],
})
export class NotificationComponent implements OnInit {
  notifications: AnimatedNotification[] = [];
  private subscription: Subscription = new Subscription();
  private counter = 0;

  private notificationService = inject(NotificationService);

  ngOnInit() {
    this.subscription = this.notificationService.notify$.subscribe(
      (notification) => {
        const id = this.counter++;
        const animatedNotification: AnimatedNotification = {
          ...notification,
          id,
        };
        this.notifications.push(animatedNotification);
        setTimeout(() => {
          this.removeNotification(id);
        }, notification.ttl);
      },
    );
  }

  private removeNotification(id: number) {
    const notificationIndex = this.notifications.findIndex((n) => n.id === id);
    if (notificationIndex >= 0) {
      this.notifications.splice(notificationIndex, 1);
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}

interface AnimatedNotification extends FrontNotification {
  id: number;
}
