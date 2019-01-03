import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { LandRecord } from '../models/LandRecord';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class ManageLandRecordsService {

  constructor(private http: Http) { }

  // API: GET /landRecords Mojani/:pId
  public getLandRecordsMojaniByPid(pId: number) : Observable<any> {
      console.log("Inside getLandRecordsMojaniByPid method in manageLandRecord service");
      return this.http.get('/manageLandRecords/api/getLandRecordsMojaniByPid/'+pId) 
      .map(res => res.json() );
  }

  // API: GET /landRecords Kaveri/:pId
  public getLandRecordsKaveriByPid(pId: number) : Observable<any> {
    console.log("Inside getLandRecordsKaveriByPid method in manageLandRecord service");
    return this.http.get('/manageKaveriRecords/api/getLandRecordsKaveriByPid/'+pId) 
    .map(res => res.json() );
  }

  // API: GET /landRecords/:Ward
  public getLandRecordsKaveriByWard(wardNo: number) : Observable<any> {
    console.log("Inside getLandRecordsKaveriBywardno method in manageLandRecord service");
    return this.http.get('/manageKaveriRecords/api/getLandRecordsKaveriByWard/'+wardNo) 
    .map(res => res.json() );
  }
  
  // API: POST /landRecords/landRecord
  public addLandRecordKaveri(landRecord: LandRecord){
    console.log("Inside addLandRecordKaveri method in manageLandRecord service");
    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post('/manageKaveriRecords/api/addLandRecordKaveri', JSON.stringify(landRecord), { headers: headers })
      .map(res => res.json());     
  }

   // API: POST /landRecords/landRecord[]
    public updateKaveriApprovedRecords(landRecords: LandRecord[]){
      console.log("Inside updateKaveriApprovedRecords method in manageLandRecord service");
      let headers = new Headers();
      headers.append('Content-Type', 'application/json');
      return this.http.post('/manageKaveriRecords/api/updateKaveriApprovedRecords', JSON.stringify(landRecords), { headers: headers })
        .map(res => res.json());     
    }

    public updateKaveriRejectedRecords(landRecords: LandRecord[]){
      console.log("Inside updateKaveriRejectedRecords method in manageLandRecord service");
      let headers = new Headers();
      headers.append('Content-Type', 'application/json');
      return this.http.post('/manageKaveriRecords/api/updateKaveriRejectedRecords', JSON.stringify(landRecords), { headers: headers })
        .map(res => res.json());     
    }

    // API: GET /landRecords Kaveri/:pId
   public getLandRecordsKaveriBytxnId(txnID: string) : Observable<any> {
    console.log("Inside getLandRecordsKaveriBytxnId method in manageLandRecord service");
    return this.http.get('/manageKaveriRecords/api/getLandRecordsKaveriBytxnId/'+txnID)
    .map(res => res.json() );
  }
}