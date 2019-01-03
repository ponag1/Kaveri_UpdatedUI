import {LoginComponent} from "./login/login.component";
import {RegistrationFormComponent} from "./registration-form/registration-form.component";
import {ApproveRegistrationComponent} from "./approve-registration/approve-registration.component";
import {NgModule } from '@angular/core';
import {Routes, RouterModule } from '@angular/router';
import {AuthGuard} from './guards/auth-guard';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'registrationForm', component:RegistrationFormComponent, canActivate: [AuthGuard]},
  { path: 'approveRegistration', component:ApproveRegistrationComponent, canActivate: [AuthGuard]},
  { path: '', redirectTo: '/login',pathMatch:'full'},
  { path: '**', pathMatch:'full', redirectTo: '/login'}
] 

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
