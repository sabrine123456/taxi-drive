import { Component, OnInit,ViewChild, ViewChildren, QueryList } from '@angular/core';
import {HttpClient} from'@angular/common/http';
import { FormBuilder } from '@angular/forms'
import {Validators,ValidatorFn, AbstractControl} from '@angular/forms';
import { Router } from '@angular/router';
import { isArray } from 'util';
import { environment } from '../../environments/environment'

@Component({
  selector: 'app-create-account',
  templateUrl: './create-account.page.html',
  styleUrls: ['./create-account.page.scss'],
})
export class CreateAccountPage implements OnInit {
  private base_path = `${environment.API_ENTRYPOINT}`;

  @ViewChild('signupSlider') signupSlider;
  submitAttempt: boolean;
  slideOneForm: any;
  slides: any;
  store: any;
  code : string ="123";
  empty:boolean ;
  disabled : boolean;
  phoneData={
    phone:''
  };
  constructor(public formBuilder: FormBuilder,private http:HttpClient, private router: Router) {}

 ngOnInit() {

  this.slideOneForm = this.formBuilder.group({
    firstname: ['', Validators.compose([Validators.pattern('[a-zA-Z ]*'), Validators.required])],
    lastname: ['', Validators.compose([Validators.pattern('[a-zA-Z ]*'), Validators.required])],
    email: ['',Validators.compose([
      Validators.required,
      Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
    ])],
    phone:['',Validators.compose([Validators.required,Validators.pattern('^-?[0-9]\\d*(\\.\\d{1,2})?$'),Validators.minLength(8)])],
    accountType:['',Validators.compose([
      Validators.required])],
    code:['',Validators.compose([
        Validators.required,Validators.pattern('^-?[0-9]\\d*(\\.\\d{1,2})?$')])],
    zip :['',Validators.compose([
      Validators.required,Validators.pattern('^-?[0-9]\\d*(\\.\\d{1,2})?$'),Validators.maxLength(5)])],
    town:['',Validators.compose([
      Validators.required])],
    country:['',Validators.compose([
      Validators.required])],
    password: ['', Validators.compose([Validators.required])],
    confirmPassword:['',[Validators.required,this.equalto('password')]]
    // person:['',]
});
  }
 

//password 

equalto(field_name): ValidatorFn {
  return (control: AbstractControl): {[key: string]: any} => { 
  let input = control.value;
  let isValid=control.root.value[field_name]==input
  if(!isValid) 
  return { 'equalTo': {isValid} }
  else 
  return null;
  };
  }

//previous next

next($event? : any){
  const value = $event.target|| $event.srcElement || $event.currentTarget;
  const idAttribute = value.attributes.id;
  if (idAttribute?.nodeValue === "phone") {
   this.verifyPhone();
  }
  else { 
    this.signupSlider.slideNext();
  }
}
checkValue(event){ 
  console.log(event.detail.value);
}
prev(){
  this.signupSlider.slidePrev();
}

//create account
  save(){
    this.submitAttempt = true;
    if(!this.slideOneForm.valid){
        this.signupSlider.slideTo(0);
    }
    else {
  this.http.post(`${this.base_path}/users/`,this.slideOneForm.value).toPromise().then((data:any)=>{
    this.router.navigate(['/home']);
  });
  //console.log(this.slideOneForm.value.phone);
    }   
}

//verify phone

verifyPhone()
{
  const phone = this.slideOneForm.value.phone;
 this.http.get(`${this.base_path}/users/?phone=${phone}`)
  .subscribe((data:Array<any>) => {
  if (data.length)
  {
    this.router.navigate(['/login']);
 } else { 
  this.verifyCode(this.slideOneForm.value.code);
  this.signupSlider.slideNext();
 }
});

}

verifPhone() {
  if (this.slideOneForm.value.phone.length === 0)
  {
   return true ;
  }
  else {
    return false;
  }
}

verifAccount() {
  if (this.slideOneForm.value.accountType.length === 0)
  {
   return true ;
  }
  else {
    return false;
  }
}

verifUser() {
  if ((this.slideOneForm.value.email.length === 0) || (this.slideOneForm.value.firstname.length === 0) || (this.slideOneForm.value.lastname.length === 0))
  {
   return true ;
  }
  else {
    return false;
  }
}

verifAddress() {
  if ((this.slideOneForm.value.zip.length === 0) || (this.slideOneForm.value.town.length === 0) || (this.slideOneForm.value.country.length === 0))
  {
   return true ;
  }
  else {
    return false;
  }
}
get errorControl() {
  return this.slideOneForm.controls;
}
//verify code 

verifyCode(value:string) {
  if (this.code === value) {
    this.disabled = false ;
  }
  else { 
     this.disabled = true ;
  }
}
}
