import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdGuardGuard } from './guard/adG/ad-guard.guard';
import { McGuardGuard } from './guard/mcG/mc-guard.guard';
import { NotFoundComponent } from './notFound/not-found.component';

const routes: Routes = [

  { path: '', redirectTo: '/mc/user-account', pathMatch: 'full' },

  //MC compo_________________________________________________
  { path: 'mc', loadChildren: () => import('./main_compo/mc-route/mc-route.module').then( module => module.McRouteModule),
  data: { condition: 'mc' }, canActivate: [McGuardGuard] },

  //AD compo___________________________________________________
  { path: 'ad', loadChildren: () => import('./admin/ad-route/ad-route.module').then(module => module.AdRouteModule), 
  canActivate: [AdGuardGuard] },

  { path: '**', component: NotFoundComponent }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
