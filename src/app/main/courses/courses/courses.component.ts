import { Component, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CoursesServiceProxy, CourseDto  } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';
import { CreateOrEditCourseModalComponent } from './create-or-edit-course-modal.component';
import { ViewCourseModalComponent } from './view-course-modal.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import {LazyLoadEvent} from 'primeng/api';
import {Paginator} from 'primeng/paginator';
import {Table} from 'primeng/table';
import { FileDownloadService } from '@shared/utils/file-download.service';
import * as _ from 'lodash';
import { DateTime } from 'luxon';
import { EditStudentsCourseModalComponent } from './edit-students-course-modal.component';

@Component({
    templateUrl: './courses.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class CoursesComponent extends AppComponentBase {

    @ViewChild('createOrEditCourseModal', { static: true }) createOrEditCourseModal: CreateOrEditCourseModalComponent;
    @ViewChild('viewCourseModalComponent', { static: true }) viewCourseModal: ViewCourseModalComponent;
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;
    @ViewChild('editStudentsCourseModalComponent', { static: true }) editStudentsCourseModalComponent: EditStudentsCourseModalComponent;

    advancedFiltersAreShown = false;
    filterText = '';
    nameFilter = '';
    maxStartDateFilter : DateTime;
		minStartDateFilter : DateTime;
    lastEnrollmentDateFilter = '';
    courseNumberFilter = '';
    visibleOnFrontPageFilter = -1;
    enrollmentAvailableFilter = -1;
        officeNameFilter = '';




    constructor(
        injector: Injector,
        private _coursesServiceProxy: CoursesServiceProxy,
        private _tokenAuth: TokenAuthServiceProxy,
        private _activatedRoute: ActivatedRoute,
        private _fileDownloadService: FileDownloadService
    ) {
        super(injector);
    }

    getCourses(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            return;
        }

        this.primengTableHelper.showLoadingIndicator();

        this._coursesServiceProxy.getAll(
            this.filterText,
            this.nameFilter,
            this.maxStartDateFilter,
            this.minStartDateFilter,
            this.courseNumberFilter,
            this.visibleOnFrontPageFilter,
            this.enrollmentAvailableFilter,
            this.officeNameFilter,
            this.primengTableHelper.getSorting(this.dataTable),
            this.primengTableHelper.getSkipCount(this.paginator, event),
            this.primengTableHelper.getMaxResultCount(this.paginator, event)
        ).subscribe(result => {
            this.primengTableHelper.totalRecordsCount = result.totalCount;
            this.primengTableHelper.records = result.items;
            this.primengTableHelper.hideLoadingIndicator();
        });
    }

    reloadPage(): void {
        this.paginator.changePage(this.paginator.getPage());
    }

    createCourse(): void {
        this.createOrEditCourseModal.show();
    }

    deleteCourse(course: CourseDto): void {
        this.message.confirm(
            '',
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this._coursesServiceProxy.delete(course.id)
                        .subscribe(() => {
                            this.reloadPage();
                            this.notify.success(this.l('SuccessfullyDeleted'));
                        });
                }
            }
        );
    }

    exportToExcel(): void {
        this._coursesServiceProxy.getCoursesToExcel(
        this.filterText,
            this.nameFilter,
            this.maxStartDateFilter,
            this.minStartDateFilter,
            this.lastEnrollmentDateFilter,
            this.courseNumberFilter,
            this.visibleOnFrontPageFilter,
            this.enrollmentAvailableFilter,
            this.officeNameFilter,
        )
        .subscribe(result => {
            this._fileDownloadService.downloadTempFile(result);
         });
    }
}
