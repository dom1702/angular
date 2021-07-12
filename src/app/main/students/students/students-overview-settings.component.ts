import { Component, Injector, ViewEncapsulation, ViewChild, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentsServiceProxy, StudentDto, PricePackagesServiceProxy, PricePackageDto, StudentInvoiceDto, StudentInvoicesServiceProxy, PaymentDto, TodoDto, TodosServiceProxy, AddTodoToStudentInput, StudentTodoDto, ChangeTodoStateInput, UpdateOrderOfStudentInput } from '@shared/service-proxies/service-proxies';
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
        private _tokenAuth: TokenAuthServiceProxy,
        private _activatedRoute: ActivatedRoute,
        private _fileDownloadService: FileDownloadService,
        private _todoServiceProxy: TodosServiceProxy,
        private _router: Router
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

    apply()
    {
        
    }
}
