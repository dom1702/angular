import { Component, ViewChild, Injector, Output, EventEmitter, OnInit, ViewEncapsulation, AfterViewInit, QueryList, ViewChildren, ChangeDetectorRef} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { TheoryLessonsServiceProxy, CreateOrEditTheoryLessonDto, InstructorDto, StudentTheoryLessonInput, GetStudentsOfTheoryLessonDto, TheoryLessonDto, GetStudentForViewDto, StudentsServiceProxy, CoursesServiceProxy, CourseDto, AssignToCourseInput, StudentDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import {LazyLoadEvent} from 'primeng/api';
import {Paginator} from 'primeng/paginator';
import {Table} from 'primeng/table';
import { PrimengTableHelper } from '@shared/helpers/PrimengTableHelper';
import { Subscription } from 'rxjs';
import { ViewStudentModalComponent } from '@app/main/students/students/view-student-modal.component';
import { CourseStudentLookupTableModalComponent } from './course-student-lookup-table-modal.component';
import { AssignStudentToCourseModalComponent } from '@app/main/students/students/assign-student-to-course-modal.component';

@Component({
    selector: 'editStudentsCourseModal',
    encapsulation: ViewEncapsulation.None,
    templateUrl: './edit-students-course-modal.component.html'
})
export class EditStudentsCourseModalComponent extends AppComponentBase implements AfterViewInit {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @ViewChild('studentLookupTableModal', { static: true }) studentLookupTableModal: CourseStudentLookupTableModalComponent;
    @ViewChild('viewStudentModal', { static: true }) viewStudentModal: ViewStudentModalComponent;
    @ViewChild('assignStudentToCourseModal', { static: true }) assignStudentToCourseModalComponent: AssignStudentToCourseModalComponent;
    @ViewChildren('dataTableStudents') dataTableList: QueryList<Table>;
    @ViewChildren('paginatorStudents') paginatorList: QueryList<Paginator>;


    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    dataTable : Table;
    paginator : Paginator;

    courseId;

    primengTableHelper = new PrimengTableHelper();

    private dataTableSubscription : Subscription;
    private paginatorSubscription : Subscription;

    constructor(
        injector: Injector,
        private _coursesServiceProxy: CoursesServiceProxy,
        private _studentServiceProxy: StudentsServiceProxy
    ) {
        super(injector);
    }

    ngAfterViewInit()
    {
        this.dataTableSubscription = this.dataTableList.changes.subscribe((comps: QueryList<Table>) =>
        { 
            this.dataTable = comps.first;
             if(this.paginator != null)
                 this.updateStudents();

                 this.dataTableSubscription.unsubscribe();
        });

        this.paginatorSubscription = this.paginatorList.changes.subscribe((comps: QueryList<Paginator>) =>
        {
            this.paginator = comps.first;
             if(this.dataTable != null)
                 this.updateStudents();

                 this.paginatorSubscription.unsubscribe();
        });
    }

    show(course : CourseDto, event?: LazyLoadEvent): void {

        this.courseId = course.id;

        this.active = true;
        this.modal.show();
    }

    updateStudents(event?: LazyLoadEvent): void
    {
        if(this.dataTable == null || this.paginator == null)
            return;

        this._coursesServiceProxy.getAllStudentsOfCourse(
            this.courseId,
            this.primengTableHelper.getSorting(this.dataTable),
            this.primengTableHelper.getSkipCount(this.paginator, event),
            this.primengTableHelper.getMaxResultCount(this.paginator, event)
        ).subscribe(result => {
            this.primengTableHelper.totalRecordsCount = result.totalCount;
            this.primengTableHelper.records = result.items;
            this.primengTableHelper.hideLoadingIndicator();
        });
    }

    deleteStudentFromCourse(studentId : number) : void
    {
        // let input : StudentTheoryLessonInput = new StudentTheoryLessonInput();
        // input.studentId = studentId;
        // input.theoryLessonId = this.theoryLessonId;

        this.message.confirm(
            '',
            '',
            (isConfirmed) => {
                if (isConfirmed) {
                    this._studentServiceProxy.removeFromCourse(studentId, this.courseId, true)
                        .subscribe(() => {
                            this.updateStudents();
                            this.reloadPage();
                            this.notify.success(this.l('SuccessfullyDeleted'));
                        });
                }
            }
        );
    }

    save(): void {
        
    }

    openSelectStudentModal() 
    {
      this.studentLookupTableModal.show(this.courseId);
    }

    openStudentViewModal(id : number)
    {
        this._studentServiceProxy.getStudentForView(id)
        .subscribe(result => {
            this.viewStudentModal.show(result);
        });
    }

    getNewStudentId()
    {
        if(this.studentLookupTableModal.id == null)
        return;
        var student = new StudentDto();
        student.id = this.studentLookupTableModal.id;
        student.firstName = this.studentLookupTableModal.firstName;
        student.lastName = this.studentLookupTableModal.lastName;
        this.assignStudentToCourseModalComponent.show(student, this.courseId);
    }

    assignedStudentToNewCourse()
    {
        this.updateStudents();
    }

    reloadPage(): void {
        this.paginator.changePage(this.paginator.getPage());
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
