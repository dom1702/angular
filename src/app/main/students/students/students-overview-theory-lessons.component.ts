import { Component, Injector, ViewEncapsulation, ViewChild, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentsServiceProxy, StudentDto, PricePackagesServiceProxy, StudentInvoiceDto, StudentInvoicesServiceProxy, StudentFormsServiceProxy, CreatedFormDto, FormDto, FormsServiceProxy, DownloadStudentFormInput, StudentCourseDrivingLessonsDto, DrivingLessonOfCourseDto, DrivingLessonsServiceProxy, SimulatorLessonsServiceProxy, TheoryLessonOfCourseDto, TheoryLessonsServiceProxy } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { FileDownloadService } from '@shared/utils/file-download.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import { BsDropdownModule, BsDropdownConfig } from 'ngx-bootstrap/dropdown';
import { StudentsOverviewComponent } from './students-overview.component';
import { Table } from 'primeng/table';
import { ViewDrivingLessonModalComponent } from '@app/main/lessons/drivingLessons/view-drivingLesson-modal.component';
import { result } from 'lodash';
import { CreateOrEditDrivingLessonModalComponent } from '@app/main/lessons/drivingLessons/create-or-edit-drivingLesson-modal.component';
import { CreateOrEditSimulatorLessonModalComponent } from '@app/main/lessons/simulatorLessons/create-or-edit-simulatorLesson-modal.component';
import { ViewSimulatorLessonModalComponent } from '@app/main/lessons/simulatorLessons/view-simulatorLesson-modal.component';
import { CreateOrEditExamDrivingModalComponent } from '@app/main/lessons/drivingLessons/create-or-edit-examDriving-modal.component';
import { CreateOrEditForeignTheoryLessonModalComponent } from '@app/main/lessons/theoryLessons/create-or-edit-foreign-theoryLesson-modal.component';
import { ViewTheoryLessonModalComponent } from '@app/main/lessons/theoryLessons/view-theoryLesson-modal.component';
import { ViewForeignTheoryLessonModalComponent } from '@app/main/lessons/theoryLessons/view-foreign-theoryLesson-modal.component';
import { Subscription } from 'rxjs';

@Component({
    selector: 'students-overview-theory-lessons',
    templateUrl: './students-overview-theory-lessons.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()],
    providers: [{ provide: BsDropdownConfig, useValue: { isAnimated: true, autoClose: true } }]
})
export class StudentsOverviewTheoryLessonsComponent extends AppComponentBase implements OnInit {

    @ViewChild('viewTheoryLessonModal') viewTheoryLessonModal: ViewTheoryLessonModalComponent;
    @ViewChild('viewForeignTheoryLessonModal') viewForeignTheoryLessonModal: ViewForeignTheoryLessonModalComponent;
    @ViewChild('createOrEditForeignTheoryLessonModal') createOrEditForeignTheoryLessonModal: CreateOrEditForeignTheoryLessonModalComponent;

    @Input() student: StudentDto;
    @Input() parentOverview: StudentsOverviewComponent;

    lessons: TheoryLessonOfCourseDto[];

    subscription : Subscription;

    loading : boolean;

    constructor(
        injector: Injector,
        private _studentsServiceProxy: StudentsServiceProxy,
        private _theoryLessonServiceProxy: TheoryLessonsServiceProxy,
        private _simulatorLessonServiceProxy: SimulatorLessonsServiceProxy,
        private _router: Router,
        private _fileDownloadService: FileDownloadService
    ) {
        super(injector);
    }

    ngOnInit(): void {

        this.parentOverview.theoryLessonsTabSelected.subscribe(() => {

            this.refresh();

            this.subscription = this.parentOverview.courseChanged.subscribe(() =>
            {
                // At this point we need to wait a short time because Input variable student is not yet refreshed
                 setTimeout(() => {
                    this.refresh();
                }, 100);
            });
        });

        this.parentOverview.theoryLessonsTabDeselected.subscribe(() => {

            this.subscription.unsubscribe();
        });
    }
    
    refresh() : void
    {
        this.loading = true;
        this._studentsServiceProxy.getAllTheoryLessonsOfCourse(this.parentOverview.selectedStudentCourse.course.id, this.student.id).subscribe(result => {
            this.lessons = result;
            this.loading = false;
            console.log(this.lessons);

            // var theoryLessons: any[] = [];

            // for (let i of this.lessons) {
            //     let lesson: any =
            //     {
            //         id: i.id,
            //         startTime: i.startTime,
            //         instructorNames: i.instructorNames,
            //         vehicleNameBrandModel: i.vehicleName, 
            //         length: i.length,
            //         completed: i.completed,
            //         doneOnSimulator: i.doneOnSimulator, // not implemented
            //         predefinedDrivingLessonId: i.predefinedDrivingLessonId,
            //         feedbackPdfFileGuid: i.feedbackPdfFile,
            //         isExam: i.isExam,
            //         billToStudent: i.billToStudent
            //     }

            //     if(lesson.predefinedDrivingLessonId == null && !lesson.isExam)
            //         lesson.predefinedDrivingLessonId = this.l('BasicLesson');
            //     else if(lesson.predefinedDrivingLessonId == null && lesson.isExam)
            //         lesson.predefinedDrivingLessonId = this.l('Exam');

            //     drivingLessons.push(lesson);
            // }
            // console.log(drivingLessons);

            this.primengTableHelper.totalRecordsCount = result.length;
            this.primengTableHelper.records = this.lessons;

            //console.log(this.primengTableHelper.records);
        });
    }

    showView(record): void
    {
        this._theoryLessonServiceProxy.getTheoryLessonForView(record.id).subscribe(result => {
            if(record.doneAtForeignSchool)
                this.viewForeignTheoryLessonModal.show(result);
            else
                this.viewTheoryLessonModal.show(result);
        });
    }

    deleteTheoryLesson(record): void {

        this.message.confirm(
            '',
            '',
            (isConfirmed) => {
                if (isConfirmed) {
                    this._theoryLessonServiceProxy.delete(record.id)
                        .subscribe(() => {
                            this.refresh();
                            this.notify.success(this.l('SuccessfullyDeleted'));
                        });
                }
            }
        );
    }

    addTheoryLessonManually() : void
    {
        this.createOrEditForeignTheoryLessonModal.show(this.parentOverview.selectedStudentCourse.course.licenseClass, this.parentOverview.selectedStudentCourse.course.id, this.parentOverview.student.id);
    }
}
