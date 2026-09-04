import {
  Component,
  OnInit,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AuthStore } from 'src/app/stores/auth.store';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-container-referral',
  imports: [FormsModule],
  templateUrl: './container-referral.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './container-referral.component.scss',
})
export class ContainerReferralComponent implements OnInit {
  referralLink = '';
  nextGoldReferral = 0;
  twitterLink = '';

  private authStore = inject(AuthStore);

  ngOnInit(): void {
    if (this.authStore.armyName()) {
      this.nextGoldReferral = this.authStore.referralGold();
      this.buildLinks(this.authStore.armyName()?.toLowerCase() as string);
    }
  }

  buildLinks(armyName: string) {
    this.referralLink = environment.inviteUrl + 'invite/' + armyName;

    this.twitterLink =
      'https://twitter.com/intent/tweet?ref_src=twsrc%5Etfw%7Ctwcamp%5Ebuttonembed%7Ctwterm%5Eshare%7Ctwgr%5E&text=%23minitroopers%20Rejoins%20mon%20arm%C3%A9e%20!!&url=' +
      encodeURI(this.referralLink);
  }

  twitterCliked() {
    window.open(this.twitterLink, '_blank');
  }

  discordCliked() {
    // stats
    // copy
  }
}
