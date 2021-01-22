import { Component, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentsServiceProxy, StudentDto  } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';
import { CreateOrEditStudentModalComponent } from './create-or-edit-student-modal.component';
import { ViewStudentModalComponent } from './view-student-modal.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import {LazyLoadEvent} from 'primeng/api';
import {Paginator} from 'primeng/paginator';
import {Table} from 'primeng/table';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { EntityTypeHistoryModalComponent } from '@app/shared/common/entityHistory/entity-type-history-modal.component';
import * as _ from 'lodash';
import * as moment from 'moment';
import { AssignStudentToCourseModalComponent } from './assign-student-to-course-modal.component';
import { DateTime } from 'luxon';

@Component({
    templateUrl: './students.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class StudentsComponent extends AppComponentBase {

    @ViewChild('createOrEditStudentModal', { static: true }) createOrEditStudentModal: CreateOrEditStudentModalComponent;
    @ViewChild('viewStudentModalComponent', { static: true }) viewStudentModal: ViewStudentModalComponent;
    @ViewChild('entityTypeHistoryModal', { static: true }) entityTypeHistoryModal: EntityTypeHistoryModalComponent;
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;
    @ViewChild('assignStudentToCourseModal', { static: true }) assignStudentToCourseModal: AssignStudentToCourseModalComponent;

    advancedFiltersAreShown = false;
    filterText = '';
    firstNameFilter = '';
    lastNameFilter = '';
    emailFilter = '';
    phoneNumberFilter = '';
    maxDateOfBirthFilter : DateTime;
		minDateOfBirthFilter : DateTime;
    cityFilter = '';
    zipCodeFilter = '';
    stateFilter = '';
    countryFilter = '';
        licenseClassClassFilter = '';
        ssnFilter = '';
        maxLastLoginFilter : DateTime;
		minLastLoginFilter : DateTime;


    _entityTypeFullName = 'Drima.Students.Student';
    entityHistoryEnabled = false;

    constructor(
        injector: Injector,
        private _studentsServiceProxy: StudentsServiceProxy,
        private _tokenAuth: TokenAuthServiceProxy,
        private _activatedRoute: ActivatedRoute,
        private _fileDownloadService: FileDownloadService,
        private _router: Router
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.entityHistoryEnabled = this.setIsEntityHistoryEnabled();
    }

    private setIsEntityHistoryEnabled(): boolean {
        let customSettings = (abp as any).custom;
        return customSettings.EntityHistory && customSettings.EntityHistory.isEnabled && _.filter(customSettings.EntityHistory.enabledEntities, entityType => entityType === this._entityTypeFullName).length === 1;
    }

    getStudents(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            return;
        }

        this.primengTableHelper.showLoadingIndicator();

        this._studentsServiceProxy.getAll(
            this.filterText,
            this.firstNameFilter,
            this.lastNameFilter,
            this.emailFilter,
            this.phoneNumberFilter,
            this.maxDateOfBirthFilter,
            this.minDateOfBirthFilter,
            this.ssnFilter,
            this.cityFilter,
            this.zipCodeFilter,
            this.stateFilter,
            this.countryFilter,
            this.licenseClassClassFilter,
            this.maxLastLoginFilter,
            this.minLastLoginFilter,
            this.primengTableHelper.getSorting(this.dataTable),
            this.primengTableHelper.getSkipCount(this.paginator, event),
            this.primengTableHelper.getMaxResultCount(this.paginator, event)
        ).subscribe(result => {
            this.primengTableHelper.totalRecordsCount = result.totalCount;
            this.primengTableHelper.records = result.items;
            this.primengTableHelper.hideLoadingIndicator();

            if(this.createOrEditStudentModal.assignToCourseAfterSave)
            {
                this.openAssignToCourseModal();
            }
        });
    }

    reloadPage(): void {
        this.paginator.changePage(this.paginator.getPage());
    }

    createStudent(): void {
        this.createOrEditStudentModal.show();
    }

    showHistory(student: StudentDto): void {
        this.entityTypeHistoryModal.show({
            entityId: student.id.toString(),
            entityTypeFullName: this._entityTypeFullName,
            entityTypeDescription: ''
        });
    }

    deleteStudent(student: StudentDto): void {
        this.message.confirm(
            '',
            '',
            (isConfirmed) => {
                if (isConfirmed) {
                    this._studentsServiceProxy.delete(student.id)
                        .subscribe(() => {
                            this.reloadPage();
                            this.notify.success(this.l('SuccessfullyDeleted'));
                        });
                }
            }
        );
    }

    goToOverview(id: number): void{
        this._router.navigate(['app/main/students/students/students-overview', { id: id }]);
    }

    formatClassesString(classesString : string) : string{
        if(classesString.toString() == '')
            return '-';

        var replaceString = classesString.toString().replace(",", ", ");
        return replaceString;
    }

    exportToExcel(): void {
        this._studentsServiceProxy.getStudentsToExcel(
        this.filterText,
            this.firstNameFilter,
            this.lastNameFilter,
            this.emailFilter,
            this.phoneNumberFilter,
            this.maxDateOfBirthFilter,
            this.minDateOfBirthFilter,
            this.cityFilter,
            this.zipCodeFilter,
            this.stateFilter,
            this.countryFilter,
            this.licenseClassClassFilter,
        )
        .subscribe(result => {
            this._fileDownloadService.downloadTempFile(result);
         });
    }

    openAssignToCourseModal(): void 
    {
        console.log(this.createOrEditStudentModal.student.id);
        console.log(this.createOrEditStudentModal.student.firstName);
        console.log(this.createOrEditStudentModal.student.lastName);
        var studentDto : StudentDto = new StudentDto();
        studentDto.id = this.createOrEditStudentModal.student.id;
        studentDto.firstName = this.createOrEditStudentModal.student.firstName;
        studentDto.lastName = this.createOrEditStudentModal.student.lastName;
        this.assignStudentToCourseModal.show(studentDto);
    }

     assignToCourse(): void {
    //     if(this.assignStudentToCourseModal.selectedCourse != null)
    //     {
    //         this.selectedCourseName = this.assignStudentToCourseModal.selectedCourse.courseName;
    //         this.student.selectedCourseId = this.assignStudentToCourseModal.selectedCourse.courseId;
    //         this.student.selectedPricePackageId = this.assignStudentToCourseModal.selectedPricePackage.id;
    //     }
    //     else   
    //     this.selectedCourseName = "";
     }

    // setCourseToNull(): void
    // {
    //     this.selectedCourseName = "";
    //     this.student.selectedCourseId = null;
    //     this.student.selectedPricePackageId = null;
    // }
}
