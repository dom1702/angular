import { Component, Injector, ViewEncapsulation, ViewChild, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentsServiceProxy, CourseDto, StudentsViewServiceProxy, StudentCourseDrivingLessonsDto, SVDrivingLessonDto  } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { FileDownloadService } from '@shared/utils/file-download.service';

import * as _ from 'lodash';
import { SVBookDrivingLessonLookupSchedulerModalComponent } from './sv-book-drivingLesson-lookup-scheduler-modal.component';
import { StudentViewHelper } from '../studentViewHelper.component';
import { LazyLoadEvent } from 'primeng/api';
import { Table } from 'primeng/table';
import { Paginator } from 'primeng/primeng';

@Component({
    templateUrl: './sv-drivingLesson.component.html',
    encapsulation: ViewEncapsulation.None,   
    animations: [appModuleAnimation()]
})

export class SVDrivingLessonComponent extends AppComponentBase implements OnInit {

    @ViewChild('dataTable') dataTable: Table;
    @ViewChild('paginator') paginator: Paginator;

    selectedStudentCourse: CourseDto;
    studentCourses: CourseDto[];

    drivingLessons: StudentCourseDrivingLessonsDto;

    drivingLessonsList : SVDrivingLessonDto[];
    
    constructor(
        injector: Injector,
        private _studentViewService: StudentsViewServiceProxy,
        private _helper : StudentViewHelper) {
        super(injector);
    }

    ngOnInit(): void {
        if(this._helper.studentsCourses != null && this._helper.studentData != null)
            this.loadData();

            this._helper.onInit().subscribe(() => {
            this.loadData();
        });
    }

    loadData()
    {
        this.loadCourseSelection();
        this.loadDrivingLessons();
    }

    loadCourseSelection()
    {
        this.studentCourses = [];

        if(this._helper.studentsCourses.length == 0)
        return;

        for(var i = 0; i < this._helper.studentsCourses.length; i++)
        {
            this.studentCourses.push(this._helper.studentsCourses[i].course);
        }

        this.selectedStudentCourse = this._helper.selectedCourse.course;
    }

    loadDrivingLessons()
    {
        if(this.selectedStudentCourse == null)
        return;

        abp.ui.setBusy(undefined, '', 1);
        this._studentViewService.getPredefinedDrivingLessonsOfCourse(this.selectedStudentCourse.id).subscribe((result) => 
        {
            abp.ui.clearBusy();
            this.drivingLessons = result;
        });

        this.getDrivingLessons();
    }

    getDrivingLessons(event?: LazyLoadEvent) {

        if(this.selectedStudentCourse == null)
        return;

        this.primengTableHelper.showLoadingIndicator();
        console.log(this.primengTableHelper.defaultRecordsCountPerPage);

        this._studentViewService.getAllDrivingLessonsOfStudent(
            this.selectedStudentCourse.id,
            this.primengTableHelper.getSorting(this.dataTable),
            0,
            999
        ).subscribe(result => {
            this.primengTableHelper.totalRecordsCount = result.totalCount;
            console.log(result.items);
            this.primengTableHelper.records = result.items;
            this.primengTableHelper.hideLoadingIndicator();
            abp.ui.clearBusy();
        });
    }

    courseChanged() : void{
        this._helper.setSelectedStudentCourse(this.selectedStudentCourse);

        this.loadDrivingLessons();
    }
}