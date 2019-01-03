export class LandRecord {
  pid: number;
  txnID: string;
  wardNo: number;
  areaCode: number;
  siteNo: number;
  geoData: GeoData;
  ownerDetails: Owner;
  newOwnerDetails: Owner;
  preMutationSketch: string;
  TimeStamp: any;
  isMojaniSubmitted : boolean;
  isMojaniApproved :  boolean;
  isKaveriApproved: boolean;
  isKaveriRejected: boolean;
  sketchURL: string;
  constructor() { }

}

export class GeoData {
  latitude: number;
  longitude: number;
  length: number;
  width: number;
  totalArea: number;
  address: string;
  constructor() { }
}

export class Owner {
  ownerName: string;
  gender: string;
  aadharNo: number;
  mobileNo: number;
  emailID: string;
  address: string;
  constructor() { }

}