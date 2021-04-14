import { Component, ViewChild, Injector, Output, EventEmitter, OnInit, ViewEncapsulation, QueryList, ViewChildren, ChangeDetectorRef } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { TheoryLessonsServiceProxy, CreateOrEditTheoryLessonDto, InstructorDto, PredefinedTheoryLessonDto, TheoryLessonState, CreateOrEditForeignTheoryLessonDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { DLLicenseClassLookupTableModalComponent } from '@app/shared/common/lookup/drivingLesson-licenseClass-lookup-table-modal.component';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { Table } from 'primeng/table';
import { PrimengTableHelper } from '@shared/helpers/PrimengTableHelper';
import { Subscription } from 'rxjs';
import { DateTimeService } from '@app/shared/common/timing/date-time.service';
import { DateTime } from 'luxon';
import { OfficeLookupTableModalComponent } from '@app/shared/common/lookup/office-lookup-table-modal.component';

@Component({
    selector: 'createOrEditForeignTheoryLessonModal',
    encapsulation: ViewEncapsulation.None,
    templateUrl: './create-or-edit-foreign-theoryLesson-modal.component.html'
})
export class CreateOrEditForeignTheoryLessonModalComponent extends AppComponentBase implements OnInit {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    theoryLesson: CreateOrEditForeignTheoryLessonDto = new CreateOrEditForeignTheoryLessonDto();

    startTime: Date;
    startTimeTime: Date;

    theoryLessonId;

    predefinedTheoryLessons: PredefinedTheoryLessonDto[];
    selectedPtl;

    completed : boolean;

    courseId;
    studentId;
    licenseClass;

    primengTableHelper = new PrimengTableHelper();

    constructor(
        injector: Injector,
        private _theoryLessonsServiceProxy: TheoryLessonsServiceProxy,
        private _dateTimeService: DateTimeService
    ) {
        super(injector);
    }

    ngOnInit() {
       
    }



    show(licenseClass : string, courseId : number, studentId : number, theoryLessonId?: number, event?: LazyLoadEvent, startTime?: Date): void {

        this.selectedPtl = null;
        this.completed = false;

        this.theoryLessonId = theoryLessonId;

        if (!theoryLessonId) {
            this.theoryLesson = new CreateOrEditForeignTheoryLessonDto();
            this.theoryLesson.id = theoryLessonId;

            this.courseId = courseId;
            this.studentId = studentId;
            this.licenseClass = licenseClass;

            if (startTime != null)
                this.startTime = startTime;
            else
                this.startTime = new Date();

            this.startTimeTime = new Date();

            this.active = true;

            this.refreshPredefinedTheoryLessons(this.licenseClass, '');

            this.modal.show();
        } else {
            // this._theoryLessonsServiceProxy.getTheoryLessonForEdit(theoryLessonId).subscribe(result => {
            //     this.theoryLesson = result.theoryLesson;

            //     this.startTime = result.theoryLesson.startTime.toJSDate();

            //     this.startTimeTime = result.theoryLesson.startTime.toJSDate();

            //     this.refreshPredefinedTheoryLessons(licenseClass, this.theoryLesson.predefinedTheoryLessonId);

            //     if(this.theoryLesson.currentState == TheoryLessonState.Completed)
            //         this.completed = true;

            //     this.active = true;
            //     this.modal.show();
            // });
        }
    }

    save(): void {
        this.saving = true;

        this.startTime.setHours(this.startTimeTime.getHours());
        this.startTime.setMinutes(this.startTimeTime.getMinutes());
        this.theoryLesson.startTime = this._dateTimeService.fromJSDate(this.startTime);

        this.theoryLesson.topic = this.selectedPtl.name;
        this.theoryLesson.predefinedTheoryLessonId = this.selectedPtl.lessonIdString;
      
        this.theoryLesson.courseId = this.courseId;
        this.theoryLesson.studentId = this.studentId;
        this.theoryLesson.licenseClass = this.licenseClass;

        this._theoryLessonsServiceProxy.createOrEditForeignSchool(this.theoryLesson)
            .pipe(finalize(() => { this.saving = false; }))
            .subscribe(() => {
                this.notify.info(this.l('SavedSuccessfully'));
                this.close();
                this.modalSave.emit(null);
            });
    }

   

    refreshPredefinedTheoryLessons(licenseClass: string, ptlId: string) {
        this._theoryLessonsServiceProxy.getPredefinedTheoryLessonsForCreateOrEdit(licenseClass).subscribe(result => {
            this.predefinedTheoryLessons = result.predefinedTheoryLessons;
            if (ptlId != '') {
                for (let ptl of this.predefinedTheoryLessons) {
                    if (ptl.lessonIdString == ptlId)
                        this.selectedPtl = ptl;
                }
            }
        });
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
