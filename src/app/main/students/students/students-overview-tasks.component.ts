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
import { TodoLookupTableModalComponent } from '@app/shared/common/lookup/todo-lookup-table-modal.component';

@Component({
    selector: 'students-overview-tasks',
    templateUrl: './students-overview-tasks.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class StudentsOverviewTasksComponent extends AppComponentBase {

    @Input() student: StudentDto;
    @Input() parentOverview: StudentsOverviewComponent;

    @ViewChild('todoLookupTableModal', { static: true }) todoLookupTableModal: TodoLookupTableModalComponent;


    todos: StudentTodoDto[];
    todosMoved: StudentTodoDto[];

    showApplyButton : boolean;

    subscription : Subscription;

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
        this._todoServiceProxy.getAllTodosFromStudent(this.student.id, this.parentOverview.selectedStudentCourse.course.id).subscribe(result => {

            this.primengTableHelper.totalRecordsCount = result.todos.length;
            this.primengTableHelper.records = result.todos;
            this.todos = result.todos;
            this.todosMoved = result.todos;
            this.showApplyButton = false;
        });
    }

    deleteTodo(todoId: number): void {
        this.message.confirm(
            '',
            '',
            (isConfirmed) => {
                if (isConfirmed) {
                    this._todoServiceProxy.removeTodoFromStudent(this.student.id, todoId, this.parentOverview.selectedStudentCourse.course.id).subscribe(result => {
                        this.notify.success(this.l('SuccessfullyDeleted'));
                        this.refresh();
                    });
                }
            }
        );
    }

    openSelectTodoModal() {
        this.todoLookupTableModal.show();
    }

    getNewTodoId() {

        if(this.todoLookupTableModal.id != null)
        {
            var input : AddTodoToStudentInput = new AddTodoToStudentInput();
            input.courseId = this.parentOverview.selectedStudentCourse.course.id;
            input.todoId = this.todoLookupTableModal.id;
            input.studentId = this.student.id;
            input.orderNo = this.todoLookupTableModal.orderNo;
            this._todoServiceProxy.addTodoToStudent(input).subscribe(result => {
                this.refresh();
            });
            
        }
    }

    markCompleted(todo: StudentTodoDto): void {

        if(todo.completed)
        return;
        var input : ChangeTodoStateInput = new ChangeTodoStateInput();
        input.courseId = this.parentOverview.selectedStudentCourse.course.id;
        input.todoId = todo.id;
        input.studentId = this.student.id;
        input.completed = true;
        this._todoServiceProxy.changeTodoState(input).subscribe(result => {
            this.refresh();
        });
    }

    markUncompleted(todo: StudentTodoDto): void {
        if(!todo.completed)
        return;
        var input : ChangeTodoStateInput = new ChangeTodoStateInput();
        input.courseId = this.parentOverview.selectedStudentCourse.course.id;
        input.todoId = todo.id;
        input.studentId = this.student.id;
        input.completed = false;
        this._todoServiceProxy.changeTodoState(input).subscribe(result => {
            this.refresh();
        });
    }

    moveUp(todo: StudentTodoDto): void {

        for(var i = 0; i < this.todosMoved.length; i++)
        {
            if(this.todosMoved[i] == todo)
            {
                if(i == 0)
                    return;

                var d = this.todosMoved[i-1];
                this.todosMoved[i-1] = this.todosMoved[i];
                this.todosMoved[i] = d;

                this.showApplyButton = true;

                return;
            }
        }      
    }

    moveDown(todo: StudentTodoDto): void {
        for(var i = 0; i < this.todosMoved.length; i++)
        {
            if(this.todosMoved[i] == todo)
            {
                if(i == this.todosMoved.length - 1)
                    return;

                var d = this.todosMoved[i+1];
                this.todosMoved[i+1] = this.todosMoved[i];
                this.todosMoved[i] = d;

                this.showApplyButton = true;

                return;
            }
        }     
    }

    applyMoved()
    {   
        for(var i = 0; i < this.todosMoved.length; i++)
        {
            this.todosMoved[i].orderNo = i+1;
        }
        var input = new UpdateOrderOfStudentInput();
        input.todos = this.todosMoved;
        input.courseId = this.parentOverview.selectedStudentCourse.course.id;
        input.studentId = this.student.id;

        this._todoServiceProxy.updateOrderOfStudent(input).subscribe(result => 
            {
                this.showApplyButton = false;
                this.notify.success(this.l('SuccessfullySaved'));
            })
    }
}
