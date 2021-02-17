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
            allowSearchFilter: false
        };
    }

    show(todoId?: number): void {
        if (!todoId) {
            this.todo = new CreateOrEditTodoDto();
            this.todo.id = todoId;

            this.active = true;
            this.updateLicenseClass(false);
            this.modal.show();
        } else {
            this._todosServiceProxy.getTodoForEdit(todoId).subscribe((result) => {
                this.todo = result.todo;

                this.active = true;
                this.updateLicenseClass(true);
                this.modal.show();
            });
        }
    }

    updateLicenseClass(isEdit: boolean): void {
        if (!this.active) {
            return;
        }

        this.primengTableHelper.showLoadingIndicator();

        this._licenseClassService.getAllLicenseClassesForLookupTable(
            "",
            "",
            0,
            1000).subscribe(result => {

                // for(var r = 0; r < result.items.length; r++)
                //     console.log(result.items[r].id);

                this.dropdownList = [];
                this.selectedItems = [];

                for (var _i = 0; _i < result.items.length; _i++) {
                    this.dropdownList.push(
                        {
                            item_id: _i,
                            item_text: result.items[_i].displayName
                        });
                }

                if (isEdit) {
                    for (var item of this.dropdownList) {
                        for (var todoClasses of this.todo.licenseClasses) {
                            if (item.item_text == todoClasses) {
                                this.selectedItems.push(
                                    {
                                        item_id: item.item_id,
                                        item_text: item.item_text
                                    }
                                );
                            }
                        }
                    }

                    //console.log(this.selectedItems.length);
                }

                this.primengTableHelper.hideLoadingIndicator();
            });
    }

    save(): void {
        this.saving = true;

        this.todo.licenseClasses = [];

        for (var licenseClass of this.selectedItems) {
            this.todo.licenseClasses.push(
                licenseClass.item_text
            );
        }

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
