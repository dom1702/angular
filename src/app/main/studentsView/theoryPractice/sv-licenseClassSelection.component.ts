import { Component, Injector, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import * as moment from 'moment';
import { TheoryExamsServiceProxy, GetAvailableLicenseClassesDto } from '@shared/service-proxies/service-proxies';
import { LicenseClass, VehicleDimensions } from './sv-licenseClassTasksOverview.component';
import { SVTheoryPracticeHelperService } from './sv-theoryPracticeHelper.service';
import { Router } from '@angular/router';

@Component({
    templateUrl: './sv-licenseClassSelection.component.html',      
    animations: [appModuleAnimation()], 
    providers: [TheoryExamsServiceProxy]
})
export class SVLicenseClassSelectionComponent extends AppComponentBase implements OnInit {

    licenseClasses : LicenseClass[];
    
    constructor(
        injector: Injector,  private _theoryExamService: TheoryExamsServiceProxy, 
        public theoryPracticeHelper: SVTheoryPracticeHelperService,
        private router: Router
    ) {
        super(injector);
      
    }

    loading;

    ngOnInit(): void {
        this.getAvailableLicenceClasses();         
    }

    selectLicencseClass(index : number) : void  {
        
        this.theoryPracticeHelper.selectedLicenseClass = this.licenseClasses[index];
        this.router.navigateByUrl("/app/main/studentsView/theoryPractice/licenseClassTasksOverview");
        //console.log("helper selected license class " + this.theoryPracticeHelper.selectedLicenseClass);
    }

    getAvailableLicenceClasses() {
        this.loading = true;
        this._theoryExamService.getAvailableLicenseClasses().subscribe(
            (result) => 
            {
                this.loading = false;
                this.generateLicenceClasses(result);
            }
        );
    }

    generateLicenceClasses(response: GetAvailableLicenseClassesDto) { 
        this.licenseClasses = [];  
        let picUrl ="";
        let description ="";
        let dimension: VehicleDimensions;

        for (let index = 0; index < response.licenseClasses.length; index++) {
            switch (response.licenseClasses[index].toLocaleUpperCase()) {
                case "B": 
                    picUrl = "/assets/onlineTheory/licenceClassPictures/B_PassengerCar.png";
                    description = "Passenger car";              
                    break;
                case "BE":
                    picUrl = "/assets/onlineTheory/licenceClassPictures/BE_PassengerCarTrailer.png";
                    description = "Passenger car with trailer";
                    dimension = new VehicleDimensions(10, undefined, 2, 2.5);
                    break;
                case"C":
                    picUrl = "/assets/onlineTheory/licenceClassPictures/C_Truck.png";          
                    description = "Truck";
                    dimension = new VehicleDimensions(10, 4, undefined, undefined, 15, 2.5);
                    break;
                case"C1":
                    picUrl = "/assets/onlineTheory/licenceClassPictures/C1_Truck.png";
                    description = "Truck";
                    dimension = new VehicleDimensions(7, 3, undefined, undefined, 5, 2.5);
                    break;
                case "A":
                    picUrl = "/assets/onlineTheory/licenceClassPictures/A_Motorcycle.png";
                    description = "Motorcycle";
                    break;
                case "AM120":
                    picUrl = "/assets/onlineTheory/licenceClassPictures/A1_Moped.png";
                    description = "Moped";
                    break;
                case"T":
                    picUrl = "/assets/onlineTheory/licenceClassPictures/T_Tractor.png";
                    description = "Motorcycle";
                    break;     
            }

            this.licenseClasses.push({
                token: response.licenseClasses[index],
                name: description,
                pictureUrl: picUrl,
                includePictureTasks: true,
                vehicleDimensions: dimension
            }); 
        }
    }

}