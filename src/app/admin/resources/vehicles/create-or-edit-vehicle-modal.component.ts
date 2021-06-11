import { Component, ViewChild, Injector, Output, EventEmitter, OnInit} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { VehiclesServiceProxy, CreateOrEditVehicleDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { VehicleLicenseClassLookupTableModalComponent } from './vehicle-licenseClass-lookup-table-modal.component';
import { VehicleInstructorLookupTableModalComponent } from './vehicle-instructor-lookup-table-modal.component';


@Component({
    selector: 'createOrEditVehicleModal',
    templateUrl: './create-or-edit-vehicle-modal.component.html'
})
export class CreateOrEditVehicleModalComponent extends AppComponentBase implements OnInit {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @ViewChild('vehicleLicenseClassLookupTableModal', { static: true }) vehicleLicenseClassLookupTableModal: VehicleLicenseClassLookupTableModalComponent;
    @ViewChild('instructorLookupTableModal', { static: true }) instructorLookupTableModal: VehicleInstructorLookupTableModalComponent;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    vehicle: CreateOrEditVehicleDto = new CreateOrEditVehicleDto();

    dropdownList = [];
    selectedItems = [];
    dropdownSettings = {};
    placeholder = 'None';

    instructorFullName = '';

    constructor(
        injector: Injector,
        private _vehiclesServiceProxy: VehiclesServiceProxy
    ) {
        super(injector);
    }

    ngOnInit() {
        this.dropdownSettings = {
            singleSelection: false,
            idField: 'item_id',
            textField: 'item_text',
            selectAllText: 'Select All',
            unSelectAllText: 'Unselect All',
            allowSearchFilter: false
        };
    }

    show(vehicleId?: number): void {

        if (!vehicleId) {
            this.vehicle = new CreateOrEditVehicleDto();
            this.vehicle.id = vehicleId;
            this.vehicle.inUse = true;
            this.instructorFullName = '';

            this.active = true;
            this.updateLicenseClass(false);
            this.modal.show();
        } else {
            this._vehiclesServiceProxy.getVehicleForEdit(vehicleId).subscribe(result => {
                this.vehicle = result.vehicle;
                this.instructorFullName = result.instructorFirstName + ' ' + result.instructorLastName;

                this.active = true;
                this.updateLicenseClass(true);
                this.modal.show();
            });
        }
    }

    save(): void {
            this.saving = true;

            this.vehicle.licenseClasses = [];

            for (var licenseClass of this.selectedItems)
            {
                this.vehicle.licenseClasses.push(
                    licenseClass.item_text
                );
            }
			
            this._vehiclesServiceProxy.createOrEdit(this.vehicle)
             .pipe(finalize(() => { this.saving = false;}))
             .subscribe(() => {
                this.notify.info(this.l('SavedSuccessfully'));
                this.close();
                this.modalSave.emit(null);
             });
    }

    updateLicenseClass(vehicleAvailable : boolean ) : void
    {
        if (!this.active) {
            return;
        }

        this.primengTableHelper.showLoadingIndicator();

        this._vehiclesServiceProxy.getAllLicenseClassForLookupTable(
            "",
            "",
            0,
            1000).subscribe(result => {

                // for(var r = 0; r < result.items.length; r++)
                //     console.log(result.items[r].id);
    
                this.dropdownList = [];
                this.selectedItems = [];

                for (var _i = 0; _i < result.items.length; _i++) 
                {   
                    this.dropdownList.push(
                    {
                        item_id: _i, 
                        item_text: result.items[_i].displayName
                    });
                }

                if(vehicleAvailable)
                {
                    for (var item of this.dropdownList) {
                        for (var instructorClasses of this.vehicle.licenseClasses) {
                            //console.log(item.item_text);
                            //console.log(studentClasses);
                            if(item.item_text == instructorClasses)
                            {
                                //console.log("Add it now");
                                this.selectedItems.push(
                                    {
                                        item_id: item.item_id,
                                        item_text: item.item_text
                                    }
                                );
                            }
                        }
                        
                    }

                    //console.log(this.selectedItems.length);
                }

                this.primengTableHelper.hideLoadingIndicator();
            });
    }

        openSelectLicenseClassModal() {
        //this.vehicleLicenseClassLookupTableModal.id = this.vehicle.licenseClassId;
        //this.vehicleLicenseClassLookupTableModal.displayName = this.licenseClassClass;
        this.vehicleLicenseClassLookupTableModal.show();
    }


        setLicenseClassIdNull() {
        //this.vehicle.licenseClassId = null;
        //this.licenseClassClass = '';
    }


        getNewLicenseClassId() {
        //this.vehicle.licenseClassId = this.vehicleLicenseClassLookupTableModal.id;
       // this.licenseClassClass = this.vehicleLicenseClassLookupTableModal.displayName;
    }

    openSelectInstructorModal() {
        //this.vehicleLicenseClassLookupTableModal.id = this.vehicle.licenseClassId;
        //this.vehicleLicenseClassLookupTableModal.displayName = this.licenseClassClass;
        this.instructorLookupTableModal.show();
    }


        setInstructorNull() {
        this.vehicle.responsibleInstructorId = null;
        this.instructorFullName = '';
    }


        getNewInstructorId() {
        this.vehicle.responsibleInstructorId = this.instructorLookupTableModal.id;
        this.instructorFullName = this.instructorLookupTableModal.firstName + ' ' + this.instructorLookupTableModal.lastName;
    }


    close(): void {

        this.active = false;
        this.modal.hide();
    }
}
