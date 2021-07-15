import { Component, Injector, ViewEncapsulation, ViewChild, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StudentsViewServiceProxy, TenantDashboardServiceProxy, SVTheoryLessonDto, StudentCoursePredefinedTheoryLessonDto, CourseDto, OnlineTheoryServiceProxy  } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';

import * as _ from 'lodash';
import { StudentViewHelper } from '../studentViewHelper.component';
import {LazyLoadEvent} from 'primeng/api';
import {Paginator} from 'primeng/paginator';
import {Table} from 'primeng/table';

@Component({
    templateUrl: './sv-theoryLessons.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class SVTheoryLessonsComponent extends AppComponentBase implements OnInit {

    @ViewChild('dataTable', { static: true }) dataTable: Table;
    
    selectedStudentCourse: CourseDto;
    studentCourses: CourseDto[];

    theoryLessons: StudentCoursePredefinedTheoryLessonDto[];
    theoryLessonsList : SVTheoryLessonDto[];

    helper : StudentViewHelper;
       
    constructor(
        injector: Injector,
        private _studentViewService: StudentsViewServiceProxy,
        private _helper : StudentViewHelper,
        private _onlineTheoryService : OnlineTheoryServiceProxy
    ) {
        super(injector);
        this.helper = _helper;
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
        this.loadTheoryLessons();
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

    loadTheoryLessons()
    {
        if(this.selectedStudentCourse == null)
            return;

        this._studentViewService.getPredefinedTheoryLessonsOfCourse(this.selectedStudentCourse.id).subscribe((result) => 
        {
            this.theoryLessons = result;
        });

        this.getTheoryLessons();
    }

    getTheoryLessons(event?: LazyLoadEvent) {

        if(this.selectedStudentCourse == null)
            return;
            
        this.primengTableHelper.showLoadingIndicator();
        console.log(this.primengTableHelper.defaultRecordsCountPerPage);

        this._studentViewService.getAllTheoryLessonsOfStudent(
            this.selectedStudentCourse.id
        ).subscribe(result => {
            this.primengTableHelper.totalRecordsCount = result.totalCount;
            console.log(result.items);
            this.primengTableHelper.records = result.items;
            this.primengTableHelper.hideLoadingIndicator();
        });
    }

    courseChanged() : void{
        this._helper.setSelectedStudentCourse(this.selectedStudentCourse);
        this.loadTheoryLessons();
    }
}
