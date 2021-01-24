import { Component, ViewChild, Injector, Output, EventEmitter, OnInit } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { InstructorsServiceProxy, CreateOrEditInstructorDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { DateTimeService } from '@app/shared/common/timing/date-time.service';
import { LicenseClassLookupTableModalComponent } from '@app/shared/common/lookup/licenseClass-lookup-table-modal.component';
import { OfficeLookupTableModalComponent } from '@app/shared/common/lookup/office-lookup-table-modal.component';
import { VehicleLookupTableModalComponent } from '@app/shared/common/lookup/vehicle-lookup-table-modal.component';


@Component({
    selector: 'createOrEditInstructorModal',
    templateUrl: './create-or-edit-instructor-modal.component.html'
})
export class CreateOrEditInstructorModalComponent extends AppComponentBase implements OnInit {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @ViewChild('licenseClassLookupTableModal', { static: true }) licenseClassLookupTableModal: LicenseClassLookupTableModalComponent;
    @ViewChild('officeLookupTableModal', { static: true }) officeLookupTableModal: OfficeLookupTableModalComponent;
    @ViewChild('vehicleLookupTableModal') vehicleLookupTableModal: VehicleLookupTableModalComponent;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    instructor: CreateOrEditInstructorDto = new CreateOrEditInstructorDto();

    dropdownList = [];
    selectedItems = [];
    dropdownSettings = {};
    placeholder = 'None';

    defaultOffice = '';
    vehicleName = '';

    constructor(
        injector: Injector,
        private _instructorsServiceProxy: InstructorsServiceProxy,
        private _dateTimeService: DateTimeService
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

    show(instructorId?: number): void {

        if (!instructorId) {
            this.instructor = new CreateOrEditInstructorDto();
            this.instructor.id = instructorId;
            this.instructor.dateOfBirth = this._dateTimeService.getStartOfDay();
            this.defaultOffice = '';

            this.active = true;
            this.updateLicenseClass(false);
            this.modal.show();
        } else {
            this._instructorsServiceProxy.getInstructorForEdit(instructorId).subscribe(result => {
                this.instructor = result.instructor;
                this.defaultOffice = result.defaultOfficeName;
                this.vehicleName = result.defaultVehicleName;

                this.active = true;
                this.updateLicenseClass(true);
                this.modal.show();
            });
        }
    }

    save(): void {
        this.saving = true;

        this.instructor.licenseClasses = [];

        for (var licenseClass of this.selectedItems) {
            this.instructor.licenseClasses.push(
                licenseClass.item_text
            );
        }

        this._instructorsServiceProxy.createOrEdit(this.instructor)
            .pipe(finalize(() => { this.saving = false; }))
            .subscribe(() => {
                this.notify.info(this.l('SavedSuccessfully'));
                this.close();
                this.modalSave.emit(null);
            });
    }

    updateLicenseClass(instructorAvailable: boolean): void {
        if (!this.active) {
            return;
        }

        this.primengTableHelper.showLoadingIndicator();

        this._instructorsServiceProxy.getAllLicenseClassForLookupTable(
            "",
            "",
            0,
            1000).subscribe(result => {

                // for(var r = 0; r < result.items.length; r++)
                //     console.log(result.items[r].id);

                this.dropdownList = [];
                this.selectedItems = [];

                for (var _i = 0; _i < result.items.length; _i++) {
                    this.dropdownList.push(
                        {
                            item_id: _i,
                            item_text: result.items[_i].displayName
                        });
                }

                if (instructorAvailable) {
                    for (var item of this.dropdownList) {
                        for (var instructorClasses of this.instructor.licenseClasses) {
                            //console.log(item.item_text);
                            //console.log(studentClasses);
                            if (item.item_text == instructorClasses) {
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

    openSelectOfficeModal() {
        // this.licenseClassLookupTableModal.id = this.instructor.allowedClassesToTeach;
        // this.licenseClassLookupTableModal.displayName = this.licenseClassClass;
        this.officeLookupTableModal.show();
    }


    setOfficeNull() {
        this.instructor.defaultOfficeId = null;
        this.defaultOffice = '';
    }


    getOffice() {
        this.instructor.defaultOfficeId = this.officeLookupTableModal.id;
        this.defaultOffice = this.officeLookupTableModal.displayName;
    }

    openSelectVehicleModal() {
        //this.vehicleLicenseClassLookupTableModal.id = this.vehicle.licenseClassId;
        //this.vehicleLicenseClassLookupTableModal.displayName = this.licenseClassClass;
        this.vehicleLookupTableModal.show();
    }


    setVehicleNull() {
        this.instructor.defaultVehicleId = null;
        this.vehicleName = '';
    }


    getNewVehicleId() {
        if (this.vehicleLookupTableModal.id != null) {
            this.instructor.defaultVehicleId = this.vehicleLookupTableModal.id;
            this.vehicleName = this.vehicleLookupTableModal.name;
        }
    }


    close(): void {

        this.active = false;
        this.modal.hide();
    }
}
