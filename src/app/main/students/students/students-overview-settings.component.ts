import { Component, Injector, ViewEncapsulation, ViewChild, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentsServiceProxy, StudentDto, PricePackagesServiceProxy, PricePackageDto, StudentInvoiceDto, StudentInvoicesServiceProxy, PaymentDto, TodoDto, TodosServiceProxy, AddTodoToStudentInput, StudentTodoDto, ChangeTodoStateInput, UpdateOrderOfStudentInput, UpdateStudentViewFeaturesInput } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { FileDownloadService } from '@shared/utils/file-download.service';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { StudentsOverviewComponent } from './students-overview.component';

@Component({
    selector: 'students-overview-settings',
    templateUrl: './students-overview-settings.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class StudentsOverviewSettingsComponent extends AppComponentBase {

    @Input() student: StudentDto;
    
    @Input() parentOverview: StudentsOverviewComponent;

    showApplyButton : boolean;

    subscription : Subscription;

    loading : boolean;

    constructor(
        injector: Injector,
        private _studentsServiceProxy: StudentsServiceProxy,
    ) {
        super(injector);
    }

    ngOnInit(): void {

        this.parentOverview.onTodosTabSelected.subscribe(() => {

            this.refresh();

            this.subscription = this.parentOverview.courseChanged.subscribe(() => {
                this.refresh();
            });
        });

        this.parentOverview.onTodosTabDeselected.subscribe(() => {
            this.subscription.unsubscribe();
            
        });
    }

    refresh()
    {
        this.loading = true;
        // this._todoServiceProxy.getAllTodosFromStudent(this.student.id, this.parentOverview.selectedStudentCourse.course.id).subscribe(result => {
        //     this.loading = false;
        //     this.primengTableHelper.totalRecordsCount = result.todos.length;
        //     this.primengTableHelper.records = result.todos;
        //     this.todos = result.todos;
        //     this.todosMoved = result.todos;
        //     this.showApplyButton = false;
        // });
    }

    change()
    {
        this.showApplyButton = true;
    }

    apply()
    {
        var input : UpdateStudentViewFeaturesInput = new UpdateStudentViewFeaturesInput();
        input.allowLearningPath = this.parentOverview.selectedStudentCourse.allowLearningPath;
        input.allowOnlineTheoryLessons = this.parentOverview.selectedStudentCourse.allowOnlineTheoryLessons;
        input.allowTheoryExamPractice = this.parentOverview.selectedStudentCourse.allowTheoryExamPractice;
        input.allowStudyingBook = this.parentOverview.selectedStudentCourse.allowStudyingBook;
        input.allowDrivingLessonBooking = this.parentOverview.selectedStudentCourse.allowDrivingLessonBooking;
        input.studentId = this.student.id;
        input.courseId = this.parentOverview.selectedStudentCourse.course.id;

        this.message.confirm(
            this.l('StudentSettingsBillingInfo'),
            this.l('Billing'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this._studentsServiceProxy.updateStudentViewFeatures(input).subscribe((result) =>
                    {
                        this.showApplyButton = false;
                        this.notify.success(this.l('SavedSuccessfully'));
                    });
                }
            }
        );
        
    }
}
