import {
  Component,
  OnDestroy,
  OnInit,
  effect,
  inject,
  ChangeDetectionStrategy,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TrooperDay } from '@minitroopers/shared';
import {
  PartialUserExtended,
  checkNameValide,
  statusAvailability,
} from '@minitroopers/shared';
import { Subject, debounceTime, switchMap, take, takeUntil } from 'rxjs';
import { ContainerBlueLargeComponent } from 'src/app/components/containers/container-blue-large/container-blue-large.component';
import { ContainerBlueComponent } from 'src/app/components/containers/container-blue/container-blue.component';
import { ChooseTrooperComponent } from 'src/app/components/trooper/choose-trooper/choose-trooper.component';
import { PrefixArmy } from 'src/app/constants/prefix-army';
import { GetArmyNamePipe } from 'src/app/pipes/getArmyName.pipe';
import { AuthService } from 'src/app/services/auth.service';
import { BackendService } from 'src/app/services/backend.service';
import { AuthStore } from 'src/app/stores/auth.store';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-signup',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    ContainerBlueComponent,
    ContainerBlueLargeComponent,
    ChooseTrooperComponent,
    GetArmyNamePipe,
  ],
  templateUrl: './signup.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './signup.component.scss',
})
export class SignupComponent implements OnInit, OnDestroy {
  public prefixes = Object.entries(PrefixArmy).map((x) => {
    return {
      value: Number(x[0]),
      label: x[1],
    };
  });

  public signupForm: FormGroup = new FormGroup({
    army: new FormControl('', [
      Validators.required,
      Validators.minLength(4),
      Validators.pattern(/^[a-zA-Z ]*$/),
    ]),
    prefix: new FormControl(this.prefixes[0].value, [Validators.required]),
    color: new FormControl(Math.floor(Math.random() * 6), Validators.required),
    trooper: new FormControl('', Validators.required),
    userId: new FormControl('', Validators.required),
    referralName: new FormControl(null, Validators.required),
  });

  public createdUrl: string | null = null;

  public get army() {
    return this.signupForm.get('army');
  }

  public get trooper() {
    return this.signupForm.get('trooper');
  }

  public availabilityState: statusAvailability = 'loading';

  public readonly AvailabilyStateColor = {
    loading: 'gray',
    available: '#03dd03',
    error: 'red',
  };

  public displayedTroopers: TrooperDay[] = [];

  public availableColors: string[] = [
    '#E87D5F',
    '#FFAA27',
    '#FFDB7F',
    '#96B732',
    '#9EADEF',
    '#A55DC6',
  ];

  public lockSubmit = false;

  public referralUser: PartialUserExtended | undefined = undefined;

  private checkAvailability$ = new Subject<string>();

  private backendService = inject(BackendService);
  public authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public authStore = inject(AuthStore);

  private destroyed$ = new Subject<void>();

  constructor() {
    effect(() => {
      if (this.authStore.isUserLoggedIn()) {
        this.signupForm.enable();
      }
    });
  }

  ngOnInit(): void {
    this.backendService
      .getTodayTroopers()
      .pipe(take(1))
      .subscribe((troopers: TrooperDay[]) => {
        this.displayedTroopers = troopers;
      });

    this.init();

    let referralArmy: string = this.route.snapshot.params['army'];

    const referralInStorage = localStorage.getItem('referral');
    if (!referralArmy && referralInStorage !== null) {
      referralArmy = referralInStorage;
    }

    if (referralArmy && checkNameValide(referralArmy)) {
      this.backendService
        .getArmy(referralArmy)
        .pipe(take(1))
        .subscribe((user) => {
          if (user?.armyName) {
            this.referralUser = user;
            localStorage.setItem('referral', referralArmy);
          }
        });
    }

    if (!referralArmy && this.authStore.hasTroopers()) {
      this.router.navigate(['/' + this.authStore.armyName()]);
    } else if (
      this.authStore.isUserLoggedIn() == false ||
      (this.authStore.isUserLoggedIn() &&
        referralArmy &&
        referralArmy?.toLowerCase() == this.authStore.armyName()?.toLowerCase())
    ) {
      this.signupForm.disable();
    }

    const codeUrl = this.route.snapshot.queryParamMap.get('code');
    if (
      codeUrl &&
      this.authStore.isAuthenticated() == false &&
      this.authStore.loading() == false
    ) {
      this.authService
        .getFromToken(codeUrl)
        .pipe(take(1))
        .subscribe((user) => {
          this.authStore.setUser(user);
          this.signupForm.get('userId')?.setValue(user.id);
          this.signupForm.enable();

          if (user.troopers?.length) {
            this.router.navigate(['/' + user.armyName]);
          }
        });
    } else if (!this.authStore.isUserLoggedIn()) {
      this.authStore.login(true);
    }
  }

  init(): void {
    this.checkAvailability$
      .pipe(takeUntil(this.destroyed$))
      .pipe(debounceTime(750))
      .pipe(
        switchMap((arg) => {
          this.availabilityState = 'loading';
          return this.backendService.checkAvailability(arg);
        }),
      )
      .subscribe((status: statusAvailability) => {
        this.availabilityState = status;
      });

    this.signupForm
      .get('army')
      ?.valueChanges.pipe(takeUntil(this.destroyed$))
      .subscribe((value: string) => {
        this.availabilityState = 'loading';
        if (value && value != '' && value.length > 3 && this.army?.valid) {
          this.createdUrl =
            environment.inviteUrl +
            value
              .trim()
              .replace(/[^a-zA-Z ]/g, '')
              .replace(/\s/g, '')
              .toLocaleLowerCase();

          this.checkAvailability$.next(value);
        } else {
          this.createdUrl = null;
        }
      });
  }

  loginClicked(): void {
    this.authService.loginFromEternal();
  }

  createArmy() {
    if (
      !this.trooper?.value ||
      !this.army ||
      !this.army.value ||
      this.army.invalid ||
      this.availabilityState != 'available' ||
      this.lockSubmit ||
      this.signupForm.get('userId')?.value === ''
    ) {
      return;
    }

    this.lockSubmit = true;

    if (this.referralUser) {
      this.signupForm.get('referralName')?.setValue(this.referralUser.armyName);
    }

    this.backendService
      .createUser(this.signupForm.getRawValue())
      .pipe(take(1))
      .subscribe((user) => {
        if (user.armyName) {
          this.authStore.setUser(user);
          this.router.navigate(['/' + user.armyName]);
          this.lockSubmit = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }
}
