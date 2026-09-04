import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SideBlockComponent } from './components/containers/side-block/side-block.component';
import { adminGuard } from './guards/admin.guard';
import { armyExistGuard } from './guards/army-exist.guard';
import { checkLoggedGuard } from './guards/check-logged.guard';
import { signupGuard } from './guards/signup.guard';
import { AddComponent } from './pages/add/add.component';
import { AdminComponent } from './pages/admin/admin.component';
import { ArmyComponent } from './pages/army/army.component';
import { HqComponent } from './pages/hq/hq.component';
import { MaintenanceComponent } from './pages/maintenance/maintenance.component';
import { OpponentsComponent } from './pages/opponents/opponents.component';
import { RankingComponent } from './pages/ranking/ranking.component';
import { SignupComponent } from './pages/signup/signup.component';
import { ViewFightComponent } from './pages/view-fight/view-fight.component';
import { ViewUpgradeComponent } from './pages/view-upgrade/view-upgrade.component';

// + guard connected & !hasArmy

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [signupGuard],
    component: SignupComponent,
  },
  { path: 'maintenance', component: MaintenanceComponent },
  {
    path: 'oauth/callback',
    canActivate: [signupGuard],
    component: SignupComponent,
  },
  {
    path: 'invite/:army',
    component: SignupComponent,
  },
  // { path: 'welcome', component: SignupComponent }, // gsap presentation later

  {
    path: 'war/:warId',
    component: ViewFightComponent,
  },
  {
    path: 'mission/:warId',
    component: ViewFightComponent,
  },
  {
    path: 'raid/:warId',
    component: ViewFightComponent,
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    component: AdminComponent,
  },

  {
    path: ':army',
    component: SideBlockComponent,
    canActivate: [armyExistGuard],
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: HqComponent,
      },
      {
        path: 'army',
        canActivate: [checkLoggedGuard],
        component: ArmyComponent,
      },
      {
        path: 'add',
        canActivate: [checkLoggedGuard],
        component: AddComponent,
      },
      {
        path: 'war',
        canActivate: [checkLoggedGuard],
        component: OpponentsComponent,
      },
      // {
      //   path: ':army/edit',
      //   canActivate: [armyExistGuard, checkLoggedGuard],
      //   component: ViewUpgradeComponent,
      // },
      {
        path: 'ranking',
        component: RankingComponent,
      },
      {
        path: ':trooper',
        canActivate: [], // + trooper exist guard
        component: ViewUpgradeComponent,
      },
    ],
  },

  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      bindToComponentInputs: true,
      onSameUrlNavigation: 'reload',
      anchorScrolling: 'enabled',
      scrollPositionRestoration: 'top',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
