import { Component, ViewChild, Injector, Output, EventEmitter, OnInit } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { StudentsServiceProxy, CreateOrEditStudentDto, StudentDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as moment from 'moment';
import { PricePackageLookupTableModalComponent } from './pricePackage-lookup-table-modal.component';
import { Country, CountriesService } from '@app/shared/common/services/countries.service';
import { Language, LanguagesService } from '@app/shared/common/services/languages.service';
import { InstructorLookupTableModalComponent } from '@app/shared/common/lookup/instructor-lookup-table-modal.component';
import { AssignStudentToCourseModalComponent } from './assign-student-to-course-modal.component';
import { isValid } from "finnish-personal-identity-code-validator";
import { VehicleLookupTableModalComponent } from '@app/shared/common/lookup/vehicle-lookup-table-modal.component';

@Component({
    selector: 'createOrEditStudentModal',
    templateUrl: './create-or-edit-student-modal.component.html'
})
export class CreateOrEditStudentModalComponent extends AppComponentBase implements OnInit {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @ViewChild('pricePackageLookupTableModal', { static: true }) pricePackageLookupTableModal: PricePackageLookupTableModalComponent;
    @ViewChild('vehicleLookupTableModal') vehicleLookupTableModal: VehicleLookupTableModalComponent;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    student: CreateOrEditStudentDto = new CreateOrEditStudentDto();

    dateOfBirth: Date;

    dropdownList = [];
    selectedItems = [];
    dropdownSettings = {};
    placeholder = this.l('Select');

    dropdownListLicenseClassesOwned = [];
    selectedItemsLicenseClassesOwned = [];
    dropdownSettingsLicenseClassesOwned = {};
    placeholderLicenseClassesOwned = this.l('Select');

    currentBirthCountry: string;
    countries: Country[];

    currentNativeLanguage: string;
    languages: Language[];

    assignToCourseAfterSave;

    @ViewChild('instructorLookupTableModal') instructorLookupTableModal: InstructorLookupTableModalComponent;

    instructorFullName = '';
    vehicleName = '';

    constructor(
        injector: Injector,
        private _studentsServiceProxy: StudentsServiceProxy,
        private _countriesService: CountriesService,
        private _languagesService: LanguagesService
    ) {
        super(injector);
    }

    ngOnInit() {
        this._countriesService.loadData().subscribe(result => {
            this.countries = result;

            for (var i = 0; i < this.countries.length; i++) {
                if (this.countries[i].name == 'Finland')
                    this.currentBirthCountry = this.countries[i].name;
            }

        });

        this._languagesService.loadData().subscribe(result => {
            this.languages = result;

            for (var i = 0; i < this.languages.length; i++) {
                if (this.languages[i].name == 'Finnish')
                    this.currentNativeLanguage = this.languages[i].name;
            }
        });

        this.dropdownSettings = {
            singleSelection: false,
            idField: 'item_id',
            textField: 'item_text',
            selectAllText: this.l('SelectAll'),
            unSelectAllText: this.l('UnselectAll'),
            allowSearchFilter: false,
            noDataAvailablePlaceholderText: this.l('NoData')
        };

        this.dropdownSettingsLicenseClassesOwned = {
            singleSelection: false,
            idField: 'item_id',
            textField: 'item_text',
            selectAllText: this.l('SelectAll'),
            unSelectAllText: this.l('UnselectAll'),
            allowSearchFilter: false,
            noDataAvailablePlaceholderText: this.l('NoData')
        };

        // var keys = Object.keys(this.countries);
        // for(var i=0; i<keys.length; i++){
        //     var key = keys[i];
        //     if(key == name)
        //     console.log(key, yourObject[key]);
        // }
    }

    onItemSelect(item: any) {
        console.log(item);
    }

    onSelectAll(items: any) {
        console.log(items);
    }


    show(studentId?: number): void {

        this.instructorFullName = '';
        this.vehicleName = '';

        this.assignToCourseAfterSave = false;
        this.dateOfBirth = null;

        if (!studentId) {
            this.student = new CreateOrEditStudentDto();

            for (var i = 0; i < this.countries.length; i++) {
                if (this.countries[i].name == 'Finland')
                    this.currentBirthCountry = this.countries[i].name;
            }

            for (var i = 0; i < this.languages.length; i++) {
                if (this.languages[i].name == 'Finnish')
                    this.currentNativeLanguage = this.languages[i].name;
            }

            this.active = true;
            this.updateLicenseClass(false);
            this.updateLicenseClassesOwned(false);
            this.modal.show();
        } else {
            this._studentsServiceProxy.getStudentForEdit(studentId).subscribe(result => {
                this.student = result.student;
                this.student.id = studentId;

                this.instructorFullName = result.defaultInstructorFullName;
                this.vehicleName = result.defaultVehicleName;

                if (this.student.dateOfBirth) {
                  //  this.dateOfBirth = this.student.dateOfBirth.toDate();
                }

                if (this.student.birthCountry != null)
                    this.currentBirthCountry = this._countriesService.getName(this.student.birthCountry);
                if (this.student.nativeLanguage != null)
                    this.currentNativeLanguage = this._languagesService.getName(this.student.nativeLanguage);

                this.active = true;
                this.updateLicenseClass(true);
                this.updateLicenseClassesOwned(true);
                this.modal.show();
            });
        }
    }

    updateLicenseClass(studentAvailable: boolean): void {
        if (!this.active) {
            return;
        }

        this.primengTableHelper.showLoadingIndicator();

        this._studentsServiceProxy.getAllLicenseClassForLookupTable(
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

                if (studentAvailable) {
                    for (var item of this.dropdownList) {
                        for (var studentClasses of this.student.licenseClasses) {
                            //console.log(item.item_text);
                            //console.log(studentClasses);
                            if (item.item_text == studentClasses) {
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

    updateLicenseClassesOwned(studentAvailable: boolean): void {
        if (!this.active) {
            return;
        }

        this.primengTableHelper.showLoadingIndicator();

        this._studentsServiceProxy.getAllLicenseClassForLookupTable(
            "",
            "",
            0,
            1000).subscribe(result => {

                // for(var r = 0; r < result.items.length; r++)
                //     console.log(result.items[r].id);

                this.dropdownListLicenseClassesOwned = [];
                this.selectedItemsLicenseClassesOwned = [];

                for (var _i = 0; _i < result.items.length; _i++) {
                    this.dropdownListLicenseClassesOwned.push(
                        {
                            item_id: _i,
                            item_text: result.items[_i].displayName
                        });
                }

                if (studentAvailable) {
                    for (var item of this.dropdownListLicenseClassesOwned) {
                        for (var studentClasses of this.student.licenseClassesAlreadyOwned) {
                            //console.log(item.item_text);
                            //console.log(studentClasses);
                            if (item.item_text == studentClasses) {
                                //console.log("Add it now");
                                this.selectedItemsLicenseClassesOwned.push(
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

    save(): void {

        if(!isValid(this.student.ssn))
        {
            abp.message.error(this.l("SSNNotValidDescription"), this.l("SSNNotValidHeader"));
            return;
        }

        this.saving = true;

        this.student.licenseClasses = [];
        this.student.licenseClassesAlreadyOwned = [];

        for (var licenseClass of this.selectedItems) {
            this.student.licenseClasses.push(
                licenseClass.item_text
            );
        }

        for (var licenseClass of this.selectedItemsLicenseClassesOwned) {
            this.student.licenseClassesAlreadyOwned.push(
                licenseClass.item_text
            );
        }

        if (this.dateOfBirth) {
            if (!this.student.dateOfBirth) {
          //      this.student.dateOfBirth = moment(this.dateOfBirth).startOf('day');
            }
            else {
           //     this.student.dateOfBirth = moment(this.dateOfBirth);
            }
        }
        else {
            this.student.dateOfBirth = null;
        }

        if (this.currentBirthCountry != null) {
            this.student.birthCountry = this._countriesService.getCode(this.currentBirthCountry);
        }
        if (this.currentNativeLanguage != null)
            this.student.nativeLanguage = this._languagesService.getCode(this.currentNativeLanguage);

        if (this.student.id == null && this.assignToCourseAfterSave) {

            this._studentsServiceProxy.createAndGetId(this.student)
                .pipe(finalize(() => { this.saving = false; }))
                .subscribe((result) => {
                    this.student.id = result;
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                    this.modalSave.emit(null);
                });
        }
        else {
            this._studentsServiceProxy.createOrEdit(this.student)
                .pipe(finalize(() => { this.saving = false; }))
                .subscribe(() => {
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                    this.modalSave.emit(null);
                });
        }
    }

    close(): void {

        this.active = false;
        this.modal.hide();
    }

    openSelectInstructorModal() {
        //this.vehicleLicenseClassLookupTableModal.id = this.vehicle.licenseClassId;
        //this.vehicleLicenseClassLookupTableModal.displayName = this.licenseClassClass;
        this.instructorLookupTableModal.show();
    }


    setInstructorNull() {
        this.student.defaultInstructorId = null;
        this.instructorFullName = '';
    }


    getNewInstructorId() {
        if (this.instructorLookupTableModal.id != null) {
            this.student.defaultInstructorId = this.instructorLookupTableModal.id;
            this.instructorFullName = this.instructorLookupTableModal.firstName + ' ' + this.instructorLookupTableModal.lastName;
        }
    }

  openSelectVehicleModal() {
        //this.vehicleLicenseClassLookupTableModal.id = this.vehicle.licenseClassId;
        //this.vehicleLicenseClassLookupTableModal.displayName = this.licenseClassClass;
        this.vehicleLookupTableModal.show();
    }


    setVehicleNull() {
        this.student.defaultVehicleId = null;
        this.vehicleName = '';
    }


    getNewVehicleId() {
        if (this.vehicleLookupTableModal.id != null) {
            this.student.defaultVehicleId = this.vehicleLookupTableModal.id;
            this.vehicleName = this.vehicleLookupTableModal.name;
        }
    }
}
