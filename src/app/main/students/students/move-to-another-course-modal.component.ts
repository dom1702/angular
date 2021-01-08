import { Component, ViewChild, Injector, Output, EventEmitter, OnInit } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { CoursesServiceProxy, MoveToAnotherCourseInput, StudentsServiceProxy } from '@shared/service-proxies/service-proxies';
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

    studentsCourses;
    possibleTargetCourses;

    selectedStudentCourse;
    selectedTargetCourse;

    constructor(
        injector: Injector,
        private _studentsServiceProxy: StudentsServiceProxy,
        private _coursesServiceProxy: CoursesServiceProxy,
    ) {
        super(injector);
    }

    ngOnInit() {
       
    }

    show(studentId : number): void {
        this.studentId = studentId;
        this.active = true;
        this.saving = false;

        this._coursesServiceProxy.getMoveToAnotherCourseView(this.studentId).subscribe((result) =>
            {
                this.studentsCourses = result.studentsCourses;
                this.possibleTargetCourses = result.possibleTargetCourses;
            })

        this.modal.show();
    }

    move(): void {
        var input = new MoveToAnotherCourseInput();
        input.sourceCourseId = this.selectedStudentCourse.courseId;
        input.targetCourseId = this.selectedTargetCourse.courseId;

        this._coursesServiceProxy.moveToAnotherCourse(input).subscribe(result =>
        {
            if(result.success)
            {
                this.notify.info(this.l('SavedSuccessfully'));
                this.close();
            }
        });

        
    }

    close(): void {

        this.active = false;
        this.modal.hide();
    }
}
