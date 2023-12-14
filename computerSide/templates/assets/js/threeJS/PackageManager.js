import { LostPackageError } from "./CustomErrors.js";

class PackageManager{
  constructor(){
    this.packageIndex= 0;
  }

  checkPackage(robotMessage){
    if (robotMessage.id!== this.packageIndex) throw new LostPackageError();
    this.packageIndex++;
  }
}

export default PackageManager;