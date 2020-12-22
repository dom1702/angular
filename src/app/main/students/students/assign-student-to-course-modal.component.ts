import { Component, ViewChild, Injector, Output, EventEmitter, OnInit } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { finalize } from 'rxjs/operators';
import { StudentsServiceProxy, CreateOrEditStudentDto, StudentDto, GetFreeCoursesForStudentDto, PricePackageDto, AssignToCourseInput } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as moment from 'moment';

@Component({
    selector: 'assignStudentToCourseModal',
    templateUrl: './assign-student-to-course-modal.component.html'
})
export class AssignStudentToCourseModalComponent extends AppComponentBase implements OnInit {

    @ViewChild('assignToCourseModal') modal: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    student : StudentDto;

    selectedCourse: GetFreeCoursesForStudentDto;
    availableCourses: GetFreeCoursesForStudentDto[];

    selectedPricePackage: PricePackageDto;

    sendEnrollmentMail : boolean;
    showExpiredCourses : boolean;

    constructor(
        injector: Injector,
        private _studentsServiceProxy: StudentsServiceProxy,
    ) {
        super(injector);
    }

    ngOnInit() {

        

    }

    show(student: StudentDto): void {

        this.showExpiredCourses = false;
        this.selectedCourse = null;
        this.student = student;
        this.availableCourses = null;

        this._studentsServiceProxy.getFreeCoursesForStudent(this.student.id, this.showExpiredCourses).subscribe(result => {
            this.availableCourses = result
        this.selectedPricePackage = null;
        this.sendEnrollmentMail = false;
        });

        this.active = true;
        this.modal.show();
 
    }

    save(): void {
        this.saving = true;

        var input : AssignToCourseInput = new AssignToCourseInput();

        input.studentId = this.student.id;
        input.courseId = this.selectedCourse.courseId;
        input.pricePackage = this.selectedPricePackage;
        input.sendEnrollmentEmail = this.sendEnrollmentMail;

        this._studentsServiceProxy.assignToCourse(input)
            .pipe(finalize(() => { this.saving = false; }))
            .subscribe(() => {
                this.notify.info(this.l('SavedSuccessfully'));
                this.close();
                this.modalSave.emit(null);
            });
    }

    showExpiredCoursesChanged() : void
    {
        this.availableCourses = null;
        this.selectedCourse = null;

        this._studentsServiceProxy.getFreeCoursesForStudent(this.student.id, this.showExpiredCourses).subscribe(result => {
            this.availableCourses = result

        this.selectedPricePackage = null;
        this.sendEnrollmentMail = false;
        });
    }

    close(): void {

        this.active = false;
        this.modal.hide();
    }
}
