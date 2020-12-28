import { Component, Injector, ViewEncapsulation, ViewChild, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentsServiceProxy, StudentDto, PricePackagesServiceProxy, StudentInvoiceDto, StudentInvoicesServiceProxy, StudentFormsServiceProxy, CreatedFormDto, FormDto, FormsServiceProxy, DownloadStudentFormInput, StudentCourseDrivingLessonsDto, DrivingLessonOfCourseDto, DrivingLessonsServiceProxy, SimulatorLessonsServiceProxy } from '@shared/service-proxies/service-proxies';
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

@Component({
    selector: 'students-overview-lessons',
    templateUrl: './students-overview-lessons.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()],
    providers: [{ provide: BsDropdownConfig, useValue: { isAnimated: true, autoClose: true } }]
})
export class StudentsOverviewLessonsComponent extends AppComponentBase implements OnInit {

    @ViewChild('viewDrivingLessonModal') viewDrivingLessonModal: ViewDrivingLessonModalComponent;
    @ViewChild('createOrEditDrivingLessonModal') createOrEditDrivingLessonModal: CreateOrEditDrivingLessonModalComponent;
    @ViewChild('createOrEditExamDrivingModal') createOrEditExamDrivingModal: CreateOrEditExamDrivingModalComponent;
    @ViewChild('createOrEditSimulatorLessonModal') createOrEditSimulatorLessonModal: CreateOrEditSimulatorLessonModalComponent;
    @ViewChild('viewSimulatorLessonModal') viewSimulatorLessonModal: ViewSimulatorLessonModalComponent;

    @Input() student: StudentDto;
    @Input() parentOverview: StudentsOverviewComponent;

    lessons: DrivingLessonOfCourseDto[];

    constructor(
        injector: Injector,
        private _studentsServiceProxy: StudentsServiceProxy,
        private _drivingLessonServiceProxy: DrivingLessonsServiceProxy,
        private _simulatorLessonServiceProxy: SimulatorLessonsServiceProxy,
        private _router: Router,
        private _fileDownloadService: FileDownloadService
    ) {
        super(injector);
    }

    ngOnInit(): void {

        this.parentOverview.lessonsTabSelected.subscribe(() => {

            if(this.lessons != null)
                return;

            this.refresh();
        });


    }
    
    refresh() : void
    {
        this._studentsServiceProxy.getAllDrivingLessonsOfCourse(this.parentOverview.selectedStudentCourse.course.id, this.student.id).subscribe(result => {
            this.lessons = result;

            console.log(this.lessons);

            var drivingLessons: any[] = [];

            for (let i of this.lessons) {
                let lesson: any =
                {
                    id: i.id,
                    startTime: i.startTime,
                    instructorNames: i.instructorNames,
                    vehicleNameBrandModel: i.vehicleName, 
                    length: i.length,
                    completed: i.completed,
                    doneOnSimulator: i.doneOnSimulator, // not implemented
                    predefinedDrivingLessonId: i.predefinedDrivingLessonId,
                    feedbackPdfFileGuid: i.feedbackPdfFile,
                    isExam: i.isExam
                }

                if(lesson.predefinedDrivingLessonId == null && !lesson.isExam)
                    lesson.predefinedDrivingLessonId = this.l('BasicLesson');
                else if(lesson.predefinedDrivingLessonId == null && lesson.isExam)
                    lesson.predefinedDrivingLessonId = this.l('Exam');

                drivingLessons.push(lesson);
            }

            this.primengTableHelper.totalRecordsCount = drivingLessons.length;
            this.primengTableHelper.records = drivingLessons;

            //console.log(this.primengTableHelper.records);
        });
    }

    showView(record): void
    {
        if(record.doneOnSimulator)
        {
            this._simulatorLessonServiceProxy.getSimulatorLessonForView(record.id).subscribe(result => {
                this.viewSimulatorLessonModal.show(result);
            })
        }
        else
        {
            this._drivingLessonServiceProxy.getDrivingLessonForView(record.id).subscribe(result => {
                this.viewDrivingLessonModal.show(result);
            })
    
        }
    }

    createOrEdit(record): void
    {
        if(record.isExam)
        {
            this.createOrEditExamDrivingModal.show(record.id);
        }
        else if(record.doneOnSimulator)
        {
            this.createOrEditSimulatorLessonModal.show(record.id);
        }
        else
        {
            this.createOrEditDrivingLessonModal.show(record.id);
    
        }
    }

    deleteDrivingLesson(record): void {

        if(record.doneOnSimulator)
        {
            this.message.confirm(
                '',
                '',
                (isConfirmed) => {
                    if (isConfirmed) {
                        this._simulatorLessonServiceProxy.delete(record.id)
                            .subscribe(() => {
                                this.refresh();
                                this.notify.success(this.l('SuccessfullyDeleted'));
                            });
                    }
                }
            );
        }
        else
        {
            this.message.confirm(
                '',
                '',
                (isConfirmed) => {
                    if (isConfirmed) {
                        this._drivingLessonServiceProxy.delete(record.id)
                            .subscribe(() => {
                                this.refresh();
                                this.notify.success(this.l('SuccessfullyDeleted'));
                            });
                    }
                }
            );
        }
    }

    createDrivingLesson(): void {
        // Instructor specific lesson with preselected instructor must work too !!!
        this.createOrEditDrivingLessonModal.show(null, false, this.parentOverview.student.id, this.parentOverview.student.firstName, this.parentOverview.student.lastName);
    }

    createExam(): void {
        // Instructor specific lesson with preselected instructor must work too !!!
        this.createOrEditExamDrivingModal.show(null, false, this.parentOverview.student.id, this.parentOverview.student.firstName, this.parentOverview.student.lastName);
    }

    createSimulatorLesson(): void {
        this.createOrEditSimulatorLessonModal.show(null, this.parentOverview.student.id, this.parentOverview.student.firstName + " " + this.parentOverview.student.lastName);
    }

    downloadFeedbackPdf(record): void
    {
        this._simulatorLessonServiceProxy.downloadFeedbackPdf(record.id)
        .subscribe((result) => {
           
            this._fileDownloadService.downloadTempFile(result);
        });
    }
}
