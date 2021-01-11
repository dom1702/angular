import { Component, ViewChild, Injector, Output, EventEmitter, OnInit } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { CoursesServiceProxy, GetFreeCoursesForStudentDto, MoveToAnotherCourseInput, PricePackageDto, StudentCourseDto, StudentsServiceProxy } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { result } from 'lodash-es';


@Component({
    selector: 'moveToAnotherCourseModal',
    templateUrl: './move-to-another-course-modal.component.html'
})
export class MoveToAnotherCourseModalComponent extends AppComponentBase implements OnInit {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    studentId;

    studentsCourses : StudentCourseDto[];
    possibleTargetCourses : GetFreeCoursesForStudentDto[];
    selectedPricePackage: PricePackageDto;

    selectedStudentCourse;
    selectedTargetCourse;

    showExpiredCourses : boolean;
    sendEnrollmentMail : boolean;

    constructor(
        injector: Injector,
        private _studentsServiceProxy: StudentsServiceProxy,
    ) {
        super(injector);
    }

    ngOnInit() {
       
    }

    show(studentId : number, studentsCourses : StudentCourseDto[]): void {
        this.showExpiredCourses = false;
        this.studentId = studentId;
        this.studentsCourses = studentsCourses;
        this.possibleTargetCourses = null;
        this.selectedTargetCourse = null;
        this.active = true;
        this.saving = false;

        // this._studentsServiceProxy.getMoveToAnotherCourseView(this.studentId).subscribe((result) =>
        //     {
        //         this.studentsCourses = result.studentsCourses;
        //         this.possibleTargetCourses = result.possibleTargetCourses;
        //     })

        this._studentsServiceProxy.getFreeCoursesForStudent(this.studentId, this.showExpiredCourses).subscribe(result =>
            {
                this.possibleTargetCourses = result;
            });

        this.modal.show();
    }

    showExpiredCoursesChanged() : void
    {
        this.possibleTargetCourses = null;
        this.selectedTargetCourse = null;

        this._studentsServiceProxy.getFreeCoursesForStudent(this.studentId, this.showExpiredCourses).subscribe(result =>
            {
                this.possibleTargetCourses = result;
                this.selectedPricePackage = null;
                this.sendEnrollmentMail = false;
            });
    }

    save(): void {
        var input = new MoveToAnotherCourseInput();
        input.studentId = this.studentId;
        input.sourceCourseId = this.selectedStudentCourse.course.id;
        input.targetCourseId = this.selectedTargetCourse.courseId;
        input.targetPricePackageId = this.selectedPricePackage.id;

        this._studentsServiceProxy.moveToAnotherCourse(input).subscribe(result =>
        {
            if(result.success)
            {
                this.notify.info(this.l('SavedSuccessfully'));
                this.modalSave.emit(null);
                this.close();
             
            }
        });

        
    }

    close(): void {

        this.active = false;
        this.modal.hide();
    }
}
