import { Component, ViewChild, Injector, Output, EventEmitter, OnInit } from "@angular/core";
import { ModalDirective } from "ngx-bootstrap/modal";
import { finalize } from "rxjs/operators";
import { TodosServiceProxy, CreateOrEditTodoDto, LicenseClassesServiceProxy } from "@shared/service-proxies/service-proxies";
import { AppComponentBase } from "@shared/common/app-component-base";
import { DateTime } from "luxon";

import { DateTimeService } from "@app/shared/common/timing/date-time.service";

@Component({
    selector: "createOrEditTodoModal",
    templateUrl: "./create-or-edit-todo-modal.component.html",
})
export class CreateOrEditTodoModalComponent extends AppComponentBase implements OnInit {
    @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    dropdownList = [];
    selectedItems = [];
    dropdownSettings = {};
    placeholder = 'None';

    todo: CreateOrEditTodoDto = new CreateOrEditTodoDto();

    constructor(injector: Injector, private _todosServiceProxy: TodosServiceProxy, private _dateTimeService: DateTimeService, private _licenseClassService : LicenseClassesServiceProxy) {
        super(injector);
    }

    ngOnInit()
    {
        this.dropdownSettings = {
            singleSelection: false,
            idField: 'item_id',
            textField: 'item_text',
            selectAllText: 'Select All',
            unSelectAllText: 'Unselect All',
            allowSearchFilter: false,
            limitSelection: 1
        };
    }

    show(todoId?: number): void {
        if (!todoId) {
            this.todo = new CreateOrEditTodoDto();
            this.todo.id = todoId;

            this.active = true;
            this.modal.show();
        } else {
            this._todosServiceProxy.getTodoForEdit(todoId).subscribe((result) => {
                this.todo = result.todo;

                this.active = true;
                this.modal.show();
            });
        }
    }


    save(): void {
        this.saving = true;

        this._todosServiceProxy
            .createOrEdit(this.todo)
            .pipe(
                finalize(() => {
                    this.saving = false;
                })
            )
            .subscribe(() => {
                this.notify.info(this.l("SavedSuccessfully"));
                this.close();
                this.modalSave.emit(null);
            });
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
