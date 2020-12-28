import { Component, ViewChild, Injector, Output, EventEmitter, OnInit, ViewEncapsulation, AfterViewInit, QueryList, ViewChildren, ChangeDetectorRef} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { TheoryLessonsServiceProxy, CreateOrEditTheoryLessonDto, InstructorDto, StudentTheoryLessonInput, GetStudentsOfTheoryLessonDto, TheoryLessonDto, GetStudentForViewDto, StudentsServiceProxy } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import {LazyLoadEvent} from 'primeng/api';
import {Paginator} from 'primeng/paginator';
import {Table} from 'primeng/table';
import { PrimengTableHelper } from '@shared/helpers/PrimengTableHelper';
import { Subscription } from 'rxjs';
import { TLStudentLookupTableModalComponent } from './theoryLesson-student-lookup-table-modal.component';
import { ViewStudentModalComponent } from '@app/main/students/students/view-student-modal.component';

@Component({
    selector: 'editStudentsTheoryLessonModal',
    encapsulation: ViewEncapsulation.None,
    templateUrl: './edit-students-theoryLesson-modal.component.html'
})
export class EditStudentsTheoryLessonModalComponent extends AppComponentBase implements AfterViewInit {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @ViewChild('studentLookupTableModal', { static: true }) studentLookupTableModal: TLStudentLookupTableModalComponent;
    @ViewChild('viewStudentModal', { static: true }) viewStudentModal: ViewStudentModalComponent;
    @ViewChildren('dataTableStudents') dataTableList: QueryList<Table>;
    @ViewChildren('paginatorStudents') paginatorList: QueryList<Paginator>;


    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    dataTable : Table;
    paginator : Paginator;

    theoryLessonId;

    primengTableHelper = new PrimengTableHelper();

    private dataTableSubscription : Subscription;
    private paginatorSubscription : Subscription;

    constructor(
        injector: Injector,
        private _theoryLessonsServiceProxy: TheoryLessonsServiceProxy,
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

    show(theoryLesson : TheoryLessonDto, event?: LazyLoadEvent): void {

        this.theoryLessonId = theoryLesson.id;

        this.active = true;
        this.modal.show();
    }

    updateStudents(event?: LazyLoadEvent): void
    {
        if(this.dataTable == null || this.paginator == null)
            return;

        this._theoryLessonsServiceProxy.getAllStudentsOfLesson(
            this.theoryLessonId,
            this.primengTableHelper.getSorting(this.dataTable),
            this.primengTableHelper.getSkipCount(this.paginator, event),
            this.primengTableHelper.getMaxResultCount(this.paginator, event)
        ).subscribe(result => {
            this.primengTableHelper.totalRecordsCount = result.totalCount;
            this.primengTableHelper.records = result.items;
            this.primengTableHelper.hideLoadingIndicator();
        });
    }

    deleteStudentFromTheoryLesson(studentId : number) : void
    {
        // let input : StudentTheoryLessonInput = new StudentTheoryLessonInput();
        // input.studentId = studentId;
        // input.theoryLessonId = this.theoryLessonId;
        console.log("delete");
        this.message.confirm(
            '',
            '',
            (isConfirmed) => {
                if (isConfirmed) {
                    this._theoryLessonsServiceProxy.deleteStudentFromLesson(studentId, this.theoryLessonId)
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
      this.studentLookupTableModal.id = this.theoryLessonId;
      this.studentLookupTableModal.show(this.theoryLessonId);
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
        if(this.studentLookupTableModal.id == -1)
            return;

        let input : StudentTheoryLessonInput = new StudentTheoryLessonInput();
        input.studentId = this.studentLookupTableModal.id;
        input.theoryLessonId = this.theoryLessonId;

        // var record = new GetStudentsOfTheoryLessonDto();
        // record.id = this.studentLookupTableModal.id;
        // record.firstName = this.studentLookupTableModal.firstName;
        // record.lastName = this.studentLookupTableModal.lastName;

        // this.primengTableHelper.records.push(record);
        // this.primengTableHelper.totalRecordsCount++;
        // this.studentsIdsToAddOnSave.push(record.id);

        this._theoryLessonsServiceProxy.addStudentToLesson(input)
            .subscribe(() => {
                this.updateStudents();
                this.reloadPage();
                this.notify.success(this.l('SavedSuccessfully'));
            });
    }

    reloadPage(): void {
        this.paginator.changePage(this.paginator.getPage());
    }


    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
