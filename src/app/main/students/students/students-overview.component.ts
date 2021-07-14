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

    title: string = this.l('StudentOverview');

    overallActive: boolean = false;
    overviewTabName: string = this.l("Overview");
    pricePackageTabName: string = this.l("PricePackage");
    studentInvoicesTabName: string = this.l("StudentInvoices");
    studentFormsTabName: string = this.l("Forms");
    studentTasksTabName: string = this.l("Tasks");
    lessonsTabName: string = this.l("Driving");
    theoryLessonsTabName: string = this.l("Theory");
    studentSchedulerTabName: string = this.l("Scheduler");
    studentSettingsTabName: string = this.l("StudentSettings");

    student: StudentDto;
    pricePackageName: string = "";
    studentsUserAccountIsActive : boolean = true;

    selectedStudentCourse: StudentCourseDto;
    studentCourses: StudentCourseDto[];

    drivingLessons: StudentCourseDrivingLessonsDto;

    loading : boolean;

    @Output() courseChanged = new EventEmitter();
    @Output() lessonsTabSelected = new EventEmitter();
    @Output() lessonsTabDeselected = new EventEmitter();
    @Output() theoryLessonsTabSelected = new EventEmitter();
    @Output() theoryLessonsTabDeselected = new EventEmitter();
    @Output() onPricePackagesTabSelected = new EventEmitter();
    @Output() onPricePackagesTabDeselected = new EventEmitter();
    @Output() onStudentInvoicesTabSelected = new EventEmitter();
    @Output() onStudentInvoicesTabDeselected = new EventEmitter();
    @Output() onFormsTabSelected = new EventEmitter();
    @Output() onFormsTabDeselected = new EventEmitter();
    @Output() onTodosTabSelected = new EventEmitter();
    @Output() onTodosTabDeselected = new EventEmitter();
    @Output() onSchedulerTabSelected = new EventEmitter();
    @Output() onSchedulerTabDeselected = new EventEmitter();
    @Output() onSettingsTabSelected = new EventEmitter();
    @Output() onSettingsTabDeselected = new EventEmitter();

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
            this.lessonsTabSelected.emit();
      }

      onLessonsTabDeselect(data: TabDirective): void {
            this.lessonsTabDeselected.emit();
      }

    onTheoryLessonsTabSelect(data: TabDirective): void {
            this.theoryLessonsTabSelected.emit();
    }

    onTheoryLessonsTabDeselect(data: TabDirective): void {
            this.theoryLessonsTabDeselected.emit();
    }

    onPricePackagesTabSelect(data: TabDirective): void {
        this.onPricePackagesTabSelected.emit();
    }
    onPricePackagesTabDeselect(data: TabDirective): void {
        this.onPricePackagesTabDeselected.emit();
    }

    onStudentInvoicesTabSelect(data: TabDirective): void {
        this.onStudentInvoicesTabSelected.emit();
    }

    onStudentInvoicesTabDeselect(data: TabDirective): void {
        this.onStudentInvoicesTabDeselected.emit();
    }

    onFormsTabSelect(data: TabDirective): void {
        this.onFormsTabSelected.emit();
    }

    onFormsTabDeselect(data: TabDirective): void {
        this.onFormsTabDeselected.emit();
    }

    onTodosTabSelect(data: TabDirective): void {
        this.onTodosTabSelected.emit();
    }

    onTodosTabDeselect(data: TabDirective): void {
        this.onTodosTabDeselected.emit();
    }

    onSchedulerTabSelect(data: TabDirective): void {
        this.onSchedulerTabSelected.emit();
    }

    onSchedulerTabDeselect(data: TabDirective): void {
        this.onSchedulerTabDeselected.emit();
    }

    onSettingsTabSelect(data: TabDirective): void {
        this.onSettingsTabSelected.emit();
    }

    onSettingsTabDeselect(data: TabDirective): void {
        this.onSettingsTabDeselected.emit();
    }

    ngOnInit(): void {
        this.loading = true;
        this.subscription = this._activatedRoute.params.subscribe(params => {

            const id = params['id'] || '';

            this._studentsServiceProxy.getStudentForView(id).subscribe(result => {

                this.student = result.student;

                this.studentsUserAccountIsActive = result.userAccountIsActive;

                this.title = this.l('StudentOverview') + " - " + this.student.firstName + " " + this.student.lastName + " (" + this.student.customerId + ")";

                this.overallActive = true;

                this._studentsServiceProxy.getAllCourses(this.student.id).subscribe(result => {

                    this.studentCourses = result

                    this.loading = false;

                    if(this.studentCourses.length > 0)
                    {
                        this.selectedStudentCourse = this.studentCourses[0];

                        // Emit manually once on start
                        this.CallCourseChanged();
                        
                        this.pricePackageName = this.selectedStudentCourse.pricePackageName;

                        if(this.selectedStudentCourse.pricePackageModified)
                            this.pricePackageName = this.pricePackageName + " ("+ this.l("ModifiedForThisStudentInfo") +")";
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

        this.setPricePackageName();
    }

    setPricePackageName()
    {
        if(this.selectedStudentCourse != null)
                        {
                            this.pricePackageName = this.selectedStudentCourse.pricePackageName;
        
                            if(this.selectedStudentCourse.pricePackageModified)
                                this.pricePackageName = this.pricePackageName + " ("+ this.l("ModifiedForThisStudentInfo") +")";
                        }
                        else
                            this.pricePackageName = "";
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
                        
                        this.setPricePackageName();
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
            this.l("RemoveStudentFromCourseQuestion"),
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
