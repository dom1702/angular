import { Component, ViewChild, Injector, Output, EventEmitter, QueryList, ViewChildren } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { finalize } from 'rxjs/operators';
import { CoursesServiceProxy, CreateOrEditCourseDto, PredefinedDrivingLessonDto, PredefinedDrivingLessonsServiceProxy, PricePackagesServiceProxy, PricePackageDto, PredefinedTheoryLessonDto, PredefinedTheoryLessonsServiceProxy } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as moment from 'moment';
import { OfficeLookupTableModalComponent } from '../../../shared/common/lookup/office-lookup-table-modal.component';
import { MultiSelectComponent } from '@syncfusion/ej2-angular-dropdowns';
import { Subscription } from 'rxjs';
import { LicenseClassLookupTableModalComponent } from '../../../shared/common/lookup/licenseClass-lookup-table-modal.component';

@Component({
    selector: 'createOrEditCourseModal',
    templateUrl: './create-or-edit-course-modal.component.html'
})
export class CreateOrEditCourseModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal') modal: ModalDirective;
    @ViewChild('officeLookupTableModal') courseOfficeLookupTableModal: OfficeLookupTableModalComponent;
    @ViewChild('licenseClassLookupTableModal') licenseClassLookupTableModal: LicenseClassLookupTableModalComponent;
    @ViewChildren('pdl_multiselect') predefinedDL_Multiselect: QueryList<MultiSelectComponent>;
    @ViewChildren('ptl_multiselect') predefinedTL_Multiselect: QueryList<MultiSelectComponent>;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    course: CreateOrEditCourseDto = new CreateOrEditCourseDto();

    officeName = '';

    predefinedDrivingLessons: Object[];
    predefinedTheoryLessons: Object[];
    pricePackages: any[];

    pricePackageSelectedAsHighlighted: PricePackageDto;

    fields: Object = { text: 'dl', value: 'id' };
    placeholderPdlSelection: string = 'Select predefined driving lessons';

    ptlFields: Object = { text: 'tl', value: 'id' };
    placeholderPtlSelection: string = 'Select predefined theory lessons';

    licenseClassId: number;
    licenseClassSelected: string = '';

    private pdlMultiselectSubscription: Subscription;
    private ptlMultiselectSubscription: Subscription;

    constructor(
        injector: Injector,
        private _coursesServiceProxy: CoursesServiceProxy,
        private _predefinedDrivingLessonsServiceProxy: PredefinedDrivingLessonsServiceProxy,
        private _predefinedTheoryLessonsServiceProxy: PredefinedTheoryLessonsServiceProxy,
        private _pricePackagesServiceProxy: PricePackagesServiceProxy
    ) {
        super(injector);
    }

    UpdateMultiSelect() {
        this.pdlMultiselectSubscription = this.predefinedDL_Multiselect.changes.subscribe((comps: QueryList<MultiSelectComponent>) => {
            var selected: number[] = [];

            if (this.course.predefinedDrivingLessons != null) {

                for (var i = 0; i < this.course.predefinedDrivingLessons.length; i++) {
                    selected.push(this.course.predefinedDrivingLessons[i].id);
                }

                this.predefinedDL_Multiselect.first.value = selected;
            }

            this.pdlMultiselectSubscription.unsubscribe();
        });

        this.ptlMultiselectSubscription = this.predefinedTL_Multiselect.changes.subscribe((comps: QueryList<MultiSelectComponent>) => {
            var selected: number[] = [];

            if (this.course.predefinedTheoryLessons != null) {

                for (var i = 0; i < this.course.predefinedTheoryLessons.length; i++) {
                    selected.push(this.course.predefinedTheoryLessons[i].id);
                }

                this.predefinedTL_Multiselect.first.value = selected;
            }

            this.ptlMultiselectSubscription.unsubscribe();
        });

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

                if(this.course.pricePackages.some(e => e.id === this.course.highlightedPricePackageId))
                this.pricePackageSelectedAsHighlighted  = this.pricePackages.find(e => e.id === this.course.highlightedPricePackageId);
            }
        });

    }

    updateHighlightedPricePackage(): void {
        console.log(this.pricePackageSelectedAsHighlighted);
    }

    pricePackagesChanged(): void{
        if(this.pricePackageSelectedAsHighlighted == null)
            return;

        for(var i = 0; i < this.pricePackages.length; i++)
        {
            if(!this.pricePackages[i].checked && this.pricePackageSelectedAsHighlighted.id == this.pricePackages[i].id)
            {
                this.pricePackageSelectedAsHighlighted = null;
                return;
            }
        }
    }

    show(courseId?: number): void {

        this.pricePackageSelectedAsHighlighted = null;

        // this._predefinedDrivingLessonsServiceProxy.getAllForLookup(this.licenseClassSelected).subscribe(result => {

        //     this.predefinedDrivingLessons = [];

        //     for (var i = 0; i < result.length; i++) {
        //         this.predefinedDrivingLessons.push(
        //             {
        //                 id: result[i].id,
        //                 dl: result[i].name
        //             }
        //         );
        //     }
        // });

        // this._predefinedTheoryLessonsServiceProxy.getAllForLookup().subscribe(result => {

        //     this.predefinedTheoryLessons = [];

        //     for (var i = 0; i < result.length; i++) {
        //         this.predefinedTheoryLessons.push(
        //             {
        //                 id: result[i].id,
        //                 tl: result[i].name
        //             }
        //         );
        //     }
        // });

        
        if (!courseId) {
            this.course = new CreateOrEditCourseDto();
            this.course.id = courseId;
            this.course.startDate = moment().startOf('day');
            this.course.lastEnrollmentDate = moment().startOf('day');
            this.officeName = '';

            this.licenseClassId = null;
            this.licenseClassSelected = '';

            this.course.visibleOnFrontPage = true;
            this.course.enrollmentAvailable = true;

            this.UpdateMultiSelect();

            this.active = true;
            this.modal.show();
        } else {
            this._coursesServiceProxy.getCourseForEdit(courseId).subscribe(result => {
                this.course = result.course;

                this.officeName = result.officeName;
                this.licenseClassSelected = result.course.licenseClass;
                
               

                this.UpdateMultiSelect();

                this.active = true;
                this.modal.show();


            });
        }
    }

    save(): void {
        this.saving = true;

        if (this.predefinedDL_Multiselect.first.value != null) {
            this.course.predefinedDrivingLessons = [];
            for (var i = 0; i < this.predefinedDL_Multiselect.first.value.length; i++) {
                var pddl: PredefinedDrivingLessonDto = new PredefinedDrivingLessonDto()
                pddl.id = Number(this.predefinedDL_Multiselect.first.value[i]);
                this.course.predefinedDrivingLessons.push(pddl);
            }
        }

        if (this.predefinedTL_Multiselect.first.value != null) {
            this.course.predefinedTheoryLessons = [];
            for (var i = 0; i < this.predefinedTL_Multiselect.first.value.length; i++) {
                var pttl: PredefinedTheoryLessonDto = new PredefinedTheoryLessonDto()
                pttl.id = Number(this.predefinedTL_Multiselect.first.value[i]);
                this.course.predefinedTheoryLessons.push(pttl);
            }
        }


        this.course.pricePackages = [];
        for (var i = 0; i < this.pricePackages.length; i++) {
            if(this.pricePackages[i].checked)
            {
                var pp: PricePackageDto = new PricePackageDto()
                pp.id = this.pricePackages[i].id;
                this.course.pricePackages.push(pp);
            }
        }


        this.course.licenseClass = this.licenseClassSelected;
        if(this.pricePackageSelectedAsHighlighted != null)
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

            this.predefinedDrivingLessons = [];

            for (var i = 0; i < result.length; i++) {
                this.predefinedDrivingLessons.push(
                    {
                        id: result[i].id,
                        dl: result[i].name
                    }
                );
            }
        });

        this._predefinedTheoryLessonsServiceProxy.getAllForLookup(this.licenseClassSelected).subscribe(result => {

            this.predefinedTheoryLessons = [];

            for (var i = 0; i < result.length; i++) {
                this.predefinedTheoryLessons.push(
                    {
                        id: result[i].id,
                        tl: result[i].name
                    }
                );
            }
        });
    }


    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
