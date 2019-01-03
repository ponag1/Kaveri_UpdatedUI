import { Component, OnInit } from '@angular/core';
import {NgForm} from '@angular/forms';
import {LoginAuthenticationService } from '../services/login-authentication.service';
import { Router,ActivatedRoute} from '@angular/router';
import { Form } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  login: any = {};
  loading = false;
  authMessage : string;

  constructor(private loginAuthService : LoginAuthenticationService, private router: Router, private route :ActivatedRoute) {}

  ngOnInit() {
    document.body.style.backgroundImage = "url('/assets/images/land-patta-2.jpg')";
    document.body.style.backgroundSize = "cover";
  }

  onSubmit(userlogin : NgForm){
    if(userlogin.valid){
        this.loading = true; // validation in progress
        console.log("Form values :" + JSON.stringify(this.login));
        let user = {"userId" : this.login.username, "password" : this.login.password};
        //check for user authentication
        this.loginAuthService.isUserAuthenticated (user)
        .subscribe(
        authenticated => {
            this.loading=false;
            console.log("res received authentication service :" + authenticated);
            if (authenticated) {
              this.authMessage=null;
              //if auth success route according to the role
              console.log("logged in role :" + this.loginAuthService.getLoggedInRole());
              if(this.loginAuthService.getLoggedInRole() == "Mojani_Surveyor"){
                console.log("inside mojani survey");
                this.router.navigateByUrl('/layoutApplication');
              }
              else if(this.loginAuthService.getLoggedInRole() == "Mojani_Approver"){
                console.log("Inside mojani approver");
                this.router.navigateByUrl('/approveSurveys');
              } 
              else if(this.loginAuthService.getLoggedInRole() == "Kaveri_Registrar"){
                console.log("Inside Registration form");
                this.router.navigateByUrl('/registrationForm');
              }
              else if(this.loginAuthService.getLoggedInRole() == "Kaveri_Approver"){
                console.log("Inside Registration approver form");
                this.router.navigateByUrl('/approveRegistration');
              }            
            }else{
                this.authMessage = this.loginAuthService.getAuthMessage();
            }
         });
     }
  }

}
