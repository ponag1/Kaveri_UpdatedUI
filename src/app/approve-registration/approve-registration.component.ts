import { Component, OnInit } from '@angular/core';
import { LandRecord } from '../models/LandRecord';
import { ManageLandRecordsService } from '../services/managelandrecords.service';
import {
  FormGroup,
  FormBuilder
} from '@angular/forms';

@Component({
  selector: 'app-approve-registration',
  templateUrl: './approve-registration.component.html',
  styleUrls: ['./approve-registration.component.css']
})
export class ApproveRegistrationComponent implements OnInit {
  template : string = "form1";
  landRecords : LandRecord[];
  landRecord : LandRecord = new LandRecord();
  approvedRecords : LandRecord[];
  wardNo : number;
  fetchComplete : boolean = false;
  noSearchResults : boolean = false;
  layoutForm: FormGroup;
  lat :number;
  long : number;
  sketchURL : string;

  constructor(private formBuilder: FormBuilder, private manageLandRecordsService : ManageLandRecordsService) { }

  ngOnInit() {
  }

  ngOnDestroy() {
    document.getElementById("heading").innerHTML ="KAVERI";
  }

  search(){
    console.log("ward No :" + this.wardNo);
    this.manageLandRecordsService.getLandRecordsKaveriByWard(this.wardNo)
    .subscribe(
      response => {
            console.log("res received from getLandRecords service kaveri ward" + JSON.stringify(response));
            if (response !=null) {
              //  this.router.navigate(['/success', this.landRecord.pid]);
              this.landRecords = <LandRecord[]> response.landRecords.filter(kaveriRec => !kaveriRec.isKaveriApproved).filter(nonRejectedRec => !nonRejectedRec.isKaveriRejected);
             if(this.landRecords!=null && this.landRecords.length > 0){
               this.noSearchResults= false;
             }else{
               this.noSearchResults = true;
             }
              this.fetchComplete = true;   
            }
      });
  }

  viewData(txnID){
    this.template = "form2";
    this.loadForm(txnID);
  }

  loadForm(txnID) {
    this.lat=null;
    this.long = null;
    this.layoutForm = this.formBuilder.group({
      TimeStamp: [null],
      pid: [null],
      wardNo: [null],
      areaCode: [null],
      siteNo: [null],
      geoData: this.formBuilder.group({
        latitude: [null],
        longitude: [null],
        length: [null],
        width: [null],
        totalArea: '',
        address: [null]
      }),
      preMutationSketch: [null],
      ownerDetails: this.formBuilder.group({
        ownerName: [null],
        gender:[null],
        aadharNo: [null],
        mobileNo: [null],
        emailID:[null],
        address: [null]
      }),
      newOwnerDetails: this.formBuilder.group({
        ownerName: [null],
        gender:[null],
        aadharNo: [null],
        mobileNo: [null],
        emailID:[null],
        address: [null]
      }),
      saleRate :[null]
    });
    console.log("Txn Id:"+txnID);
    this.manageLandRecordsService.getLandRecordsKaveriBytxnId(txnID)
      .subscribe(
        response => {
          console.log("res received getLandRecordbyTxnId service" + JSON.stringify(response));
          if (response !=null && response.success) {
            this.landRecord = <LandRecord> response.landRecords[0];
            console.log("landRecord object received:" + JSON.stringify(this.landRecord));
            if(this.landRecord.sketchURL!=null && this.landRecord.sketchURL!=""){
                  this.sketchURL = this.landRecord.sketchURL;
            }
            console.log("sketch URL:"+this.sketchURL);
            this.layoutForm.patchValue(this.landRecord);
            this.setGeoCordinates();
          }
      });
  }

  setGeoCordinates(){
    this.lat = parseFloat(this.layoutForm.get('geoData.latitude').value);
    this.long =parseFloat( this.layoutForm.get('geoData.longitude').value);
  } 

  onSubmit(){
    console.log("ApplicationData" + JSON.stringify(this.landRecords));
    this.approvedRecords =  this.landRecords.filter(
    (rec) => rec.isKaveriApproved);
    this.approvedRecords.forEach(
      (record,index) => {
          record.isKaveriRejected = false;
    });
    this.manageLandRecordsService.updateKaveriApprovedRecords(this.approvedRecords)
    .subscribe(
      response => {
        console.log("res received updateLandrecordKaveri service" + JSON.stringify(response));
        if (response !=null && response.success) {
          //  this.router.navigate(['/success', this.landRecord.pid]);
         this.template = "form3";
        }   
      });
  }

  onReject(){
    console.log("ApplicationDataReject" + JSON.stringify(this.landRecords));
    this.approvedRecords =  this.landRecords.filter(
    (rec) => rec.isKaveriApproved);
    this.approvedRecords.forEach(
      (record,index) => {
          record.isKaveriRejected = true;
          record.isKaveriApproved= false;
    });
    this.manageLandRecordsService.updateKaveriRejectedRecords(this.approvedRecords)
    .subscribe(
      response => {
        console.log("res received updateLandrecordKaveri service" + JSON.stringify(response));
        if (response !=null && response.success) {
          //  this.router.navigate(['/success', this.landRecord.pid]);
         this.template = "form3";
        }   
      });
  }

  isFieldValid(field: string) {
    return !this.layoutForm.get(field).valid && this.layoutForm.get(field).touched;
  }

  displayFieldCss(field: string) {
    return {
      'has-error': this.isFieldValid(field),
      'has-feedback': this.isFieldValid(field)
    };
  }

  submitNew(){
        this.landRecords = [];
        this.template = "form1";
        this.wardNo = null; 
        this.fetchComplete = false;
  }

  back(){
    this.template = "form1";
  }
}
