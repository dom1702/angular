import { Component, Injector, ViewEncapsulation, ViewChild, Output, EventEmitter } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

import { StudentsServiceProxy, StudentDto, StudentCourseDto, StudentCourseDrivingLessonsDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { FileDownloadService } from '@shared/utils/file-download.service';
import * as _ from 'lodash';
import { Subscription, Observable, Observer } from 'rxjs';
import { TabDirective, TabsModule } from 'ngx-bootstrap/tabs';
import { StudentsOverviewPricePackageComponent } from './students-overview-pricePackage.component';

@Component({
    templateUrl: './students-overview.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class StudentsOverviewComponent extends AppComponentBase {

    //@ViewChild(StudentsOverviewPricePackageComponent) pricePackageView: StudentsOverviewPricePackageComponent;

    subscription: Subscription;

    overallActive: boolean = false;
    overviewTabName: string = this.l("Overview");
    pricePackageTabName: string = this.l("PricePackage");
    studentInvoicesTabName: string = this.l("StudentInvoices");
    studentFormsTabName: string = this.l("Forms");
    lessonsTabName: string = this.l("Lessons");

    student: StudentDto;
    pricePackageName: string = "";

    selectedStudentCourse: StudentCourseDto;
    studentCourses: StudentCourseDto[];

    drivingLessons: StudentCourseDrivingLessonsDto;

    @Output() courseChanged = new EventEmitter();
    @Output() lessonsTabSelected = new EventEmitter();

    constructor(
        injector: Injector,
        private _studentsServiceProxy: StudentsServiceProxy,
        private _tokenAuth: TokenAuthServiceProxy,
        private _activatedRoute: ActivatedRoute,
        private _fileDownloadService: FileDownloadService,
        private location: Location
    ) {
        super(injector);
    }

    onLessonsTabSelect(data: TabDirective): void {
        if(data.heading === this.lessonsTabName)
            this.lessonsTabSelected.emit();
      }

    ngOnInit(): void {

        this.subscription = this._activatedRoute.params.subscribe(params => {

            const id = params['id'] || '';

            this._studentsServiceProxy.getStudentForView(id).subscribe(result => {

                this.student = result.student;

                this.overallActive = true;

                this._studentsServiceProxy.getAllCourses(this.student.id).subscribe(result => {

                    this.studentCourses = result

                    if(this.studentCourses.length > 0)
                    {
                        this.selectedStudentCourse = this.studentCourses[0];

                        // Emit manually once on start
                        this.CallCourseChanged();
                        
                        this.pricePackageName = this.selectedStudentCourse.pricePackageName;

                        if(this.selectedStudentCourse.pricePackageModified)
                            this.pricePackageName = this.pricePackageName + " (modified for this particular student)";
                    }
                });
            });
        });
    }
    

    public CallCourseChanged() : void 
    {
        this.courseChanged.emit();

        this._studentsServiceProxy.getPredefinedDrivingLessonsOfCourse(this.selectedStudentCourse.course.id, this.student.id).subscribe(result => {
            this.drivingLessons = result;
          console.log(this.drivingLessons);
        });
    }

    public UpdateStudentView(): Observable<any> {
    
        return Observable.create((observer: Observer<any>) => {
            this._studentsServiceProxy.getStudentForView(this.student.id).subscribe(result => {

                this.student = result.student;

                this._studentsServiceProxy.getAllCourses(this.student.id).subscribe(result => {
                    this.studentCourses = result;

                    if(this.studentCourses.length > 0)
                    {
                        this.selectedStudentCourse = this.studentCourses[0];
                        
                        if(this.selectedStudentCourse != null)
                        {
                            this.pricePackageName = this.selectedStudentCourse.pricePackageName;
        
                            if(this.selectedStudentCourse.pricePackageModified)
                                this.pricePackageName = this.pricePackageName + " (modified for this particular student)";
                        }
                        else
                            this.pricePackageName = "";
                    }
                    else
                    {
                        this.selectedStudentCourse = null;
                        this.pricePackageName = "";
                    }

                    observer.next(null)
                    observer.complete()
                });

              
            });

        });
    }

    removeFromSelectedCourse() : void{
        this.message.confirm(
            'Do you really want to remove this student from the currently selected course?',
            '',
            (isConfirmed) => {
                if (isConfirmed) {
                    this._studentsServiceProxy.removeFromCourse(this.student.id, this.selectedStudentCourse.course.id, true).subscribe(() => {
                        this.notify.success(this.l('SuccessfullyRemoved'));
                        this.UpdateStudentView().subscribe();
                    })
                }
            }
        );
       
    }

    goBack() {
        this.location.back();
    }
}
