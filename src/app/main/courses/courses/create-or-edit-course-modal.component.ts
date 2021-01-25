import { Component, ViewChild, Injector, Output, EventEmitter, QueryList, ViewChildren, OnInit } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { CoursesServiceProxy, CreateOrEditCourseDto, PredefinedDrivingLessonDto, PredefinedDrivingLessonsServiceProxy, PricePackagesServiceProxy, PricePackageDto, PredefinedTheoryLessonDto, PredefinedTheoryLessonsServiceProxy } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { OfficeLookupTableModalComponent } from '../../../shared/common/lookup/office-lookup-table-modal.component';
import { MultiSelectComponent } from '@syncfusion/ej2-angular-dropdowns';
import { Subscription } from 'rxjs';
import { LicenseClassLookupTableModalComponent } from '../../../shared/common/lookup/licenseClass-lookup-table-modal.component';
import { DateTimeService } from '@app/shared/common/timing/date-time.service';

import { IDropdownSettings } from 'ng-multiselect-dropdown';


@Component({
    selector: 'createOrEditCourseModal',
    templateUrl: './create-or-edit-course-modal.component.html'
})
export class CreateOrEditCourseModalComponent extends AppComponentBase implements OnInit {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @ViewChild('officeLookupTableModal', { static: true }) courseOfficeLookupTableModal: OfficeLookupTableModalComponent;
    @ViewChild('licenseClassLookupTableModal', { static: true }) licenseClassLookupTableModal: LicenseClassLookupTableModalComponent;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    course: CreateOrEditCourseDto = new CreateOrEditCourseDto();

    officeName = '';

    // Multiselect dropdowns
    pdlList = [];
    pdlselectedItems = [];
    ptlList = [];
    ptlselectedItems = [];
    dropdownSettings: IDropdownSettings;
    placeholder = this.l('Select');

    pricePackages: any[];

    pricePackageSelectedAsHighlighted: PricePackageDto;

    licenseClassId: number;
    licenseClassSelected: string = '';

    constructor(
        injector: Injector,
        private _coursesServiceProxy: CoursesServiceProxy,
        private _predefinedDrivingLessonsServiceProxy: PredefinedDrivingLessonsServiceProxy,
        private _predefinedTheoryLessonsServiceProxy: PredefinedTheoryLessonsServiceProxy,
        private _pricePackagesServiceProxy: PricePackagesServiceProxy,
        private _dateTimeService: DateTimeService
    ) {
        super(injector);
    }

    ngOnInit() {
        this.dropdownSettings =
        {
            singleSelection: false,
            idField: 'item_id',
            textField: 'item_text',
            selectAllText: this.l('SelectAll'),
            unSelectAllText: this.l('UnselectAll'),
            allowSearchFilter: false,
            noDataAvailablePlaceholderText: this.l('NoData')
        };
    }

    UpdatePricePackage() {
        this._pricePackagesServiceProxy.getAllForLookup().subscribe(result => {

            this.pricePackages = [];

            for (var i = 0; i < result.length; i++) {
                this.pricePackages.push(
                    {
                        id: result[i].id,
                        dl: result[i].name,
                        checked: false
                    }
                );
            }


            if (this.course.pricePackages != null) {

                for (var i = 0; i < this.course.pricePackages.length; i++) {
                    this.pricePackages.find(e => e.id === this.course.pricePackages[i].id).checked = true;
                }

                if (this.course.pricePackages.some(e => e.id === this.course.highlightedPricePackageId))
                    this.pricePackageSelectedAsHighlighted = this.pricePackages.find(e => e.id === this.course.highlightedPricePackageId);
            }
        });
    }

    updateHighlightedPricePackage(): void {
        console.log(this.pricePackageSelectedAsHighlighted);
    }

    pricePackagesChanged(): void {
        if (this.pricePackageSelectedAsHighlighted == null)
            return;

        for (var i = 0; i < this.pricePackages.length; i++) {
            if (!this.pricePackages[i].checked && this.pricePackageSelectedAsHighlighted.id == this.pricePackages[i].id) {
                this.pricePackageSelectedAsHighlighted = null;
                return;
            }
        }
    }

    show(courseId?: number): void {

        this.pricePackageSelectedAsHighlighted = null;

        if (!courseId) {
            this.pdlList = [];
            this.pdlselectedItems = [];
            this.ptlList = [];
            this.ptlselectedItems = [];

            this.course = new CreateOrEditCourseDto();
            this.course.id = courseId;
            this.course.startDate = this._dateTimeService.getStartOfDay();
            this.course.lastEnrollmentDate = this._dateTimeService.getStartOfDay();
            this.officeName = '';

            this.licenseClassId = null;
            this.licenseClassSelected = '';

            this.course.visibleOnFrontPage = true;
            this.course.enrollmentAvailable = true;

            this.UpdatePricePackage();

            this.active = true;
            this.modal.show();
        } 
        else {
            this._predefinedDrivingLessonsServiceProxy.getAllForLookup(this.licenseClassSelected).subscribe(result => {

                this.pdlList = [];

                for (var i = 0; i < result.length; i++) {
                    this.pdlList.push(
                        {
                            item_id: result[i].id,
                            item_text: result[i].name
                        });
                }
            });

            this._predefinedTheoryLessonsServiceProxy.getAllForLookup(this.licenseClassSelected).subscribe(result => {

                this.ptlList = [];

                for (var i = 0; i < result.length; i++) {
                    this.ptlList.push(
                        {
                            item_id: result[i].id,
                            item_text: result[i].name
                        });
                }
            });

            this._coursesServiceProxy.getCourseForEdit(courseId).subscribe(result => {
                this.course = result.course;

                this.officeName = result.officeName;
                this.licenseClassSelected = result.course.licenseClass;

                this.UpdatePricePackage();

                this.pdlselectedItems = [];

                for (var pdl of this.course.predefinedDrivingLessons) {
                    this.pdlselectedItems.push(
                        {
                            item_id: pdl.id,
                            item_text: pdl.name
                        }
                    );
                }

                this.ptlselectedItems = [];

                for (var ptl of this.course.predefinedTheoryLessons) {
                    this.ptlselectedItems.push(
                        {
                            item_id: ptl.id,
                            item_text: ptl.name
                        }
                    );
                }

                this.active = true;
                this.modal.show();


            });
        }
    }

    save(): void {
        this.saving = true;

        this.course.predefinedDrivingLessons = [];
        this.course.predefinedTheoryLessons = [];

        for (var pdlSelected of this.pdlselectedItems) {
            var pddl: PredefinedDrivingLessonDto = new PredefinedDrivingLessonDto()
            pddl.id = pdlSelected.item_id;
            this.course.predefinedDrivingLessons.push(pddl);
        }

        for (var ptlSelected of this.ptlselectedItems) {
            var pdtl: PredefinedTheoryLessonDto = new PredefinedTheoryLessonDto()
            pdtl.id = ptlSelected.item_id;
            this.course.predefinedTheoryLessons.push(pdtl);
        }

        this.course.pricePackages = [];
        for (var i = 0; i < this.pricePackages.length; i++) {
            if (this.pricePackages[i].checked) {
                var pp: PricePackageDto = new PricePackageDto()
                pp.id = this.pricePackages[i].id;
                this.course.pricePackages.push(pp);
            }
        }


        this.course.licenseClass = this.licenseClassSelected;
        if (this.pricePackageSelectedAsHighlighted != null)
            this.course.highlightedPricePackageId = this.pricePackageSelectedAsHighlighted.id;

        this._coursesServiceProxy.createOrEdit(this.course)
            .pipe(finalize(() => { this.saving = false; }))
            .subscribe(() => {
                this.notify.info(this.l('SavedSuccessfully'));
                this.close();
                this.modalSave.emit(null);
            });
    }

    openSelectOfficeModal() {
        this.courseOfficeLookupTableModal.id = this.course.officeId;
        this.courseOfficeLookupTableModal.displayName = this.officeName;
        this.courseOfficeLookupTableModal.show();
    }


    setOfficeIdNull() {
        this.course.officeId = null;
        this.officeName = '';
    }


    getNewOfficeId() {
        this.course.officeId = this.courseOfficeLookupTableModal.id;
        this.officeName = this.courseOfficeLookupTableModal.displayName;
    }

    openSelectLicenseClassModal() {
        this.licenseClassLookupTableModal.id = this.licenseClassId;
        this.licenseClassLookupTableModal.displayName = this.licenseClassSelected;
        this.licenseClassLookupTableModal.show();
    }


    setLicenseClassIdNull() {
        this.licenseClassLookupTableModal.id = null;
        this.licenseClassId = null;
        this.licenseClassSelected = '';
    }


    getNewLicenseClass() {
        this.licenseClassId = this.licenseClassLookupTableModal.id;
        this.licenseClassSelected = this.licenseClassLookupTableModal.displayName;

        this._predefinedDrivingLessonsServiceProxy.getAllForLookup(this.licenseClassSelected).subscribe(result => {

            this.pdlList = [];
            this.pdlselectedItems = [];
            for (var i = 0; i < result.length; i++) {
                this.pdlList.push(
                    {
                        item_id: result[i].id,
                        item_text: result[i].name
                    }
                );
                this.pdlselectedItems.push(
                    {
                        item_id: result[i].id,
                        item_text: result[i].name
                    }
                );
            }
        });

        this._predefinedTheoryLessonsServiceProxy.getAllForLookup(this.licenseClassSelected).subscribe(result => {

            this.ptlList = [];
            this.ptlselectedItems = [];
            for (var i = 0; i < result.length; i++) {
                this.ptlList.push(
                    {
                        item_id: result[i].id,
                        item_text: result[i].name
                    }
                );
                this.ptlselectedItems.push(
                    {
                        item_id: result[i].id,
                        item_text: result[i].name
                    }
                );
            }
        });
    }

    atLeastOnePricePackageSelected() : boolean
    {
        if(this.pricePackages == undefined)
        return false;

        for (var i = 0; i < this.pricePackages.length; i++) {
            if(this.pricePackages[i].checked)
            return true;
        }

        return false;
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
