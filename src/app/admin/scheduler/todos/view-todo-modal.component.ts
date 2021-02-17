import { Component, ViewChild, Injector, Output, EventEmitter } from "@angular/core";
import { ModalDirective } from "ngx-bootstrap/modal";
import { GetTodoForViewDto, TodoDto } from "@shared/service-proxies/service-proxies";
import { AppComponentBase } from "@shared/common/app-component-base";

@Component({
    selector: "viewTodoModal",
    templateUrl: "./view-todo-modal.component.html",
})
export class ViewTodoModalComponent extends AppComponentBase {
    @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    item: GetTodoForViewDto;

    constructor(injector: Injector) {
        super(injector);
        this.item = new GetTodoForViewDto();
        this.item.todo = new TodoDto();
    }

    show(item: GetTodoForViewDto): void {
        this.item = item;
        this.active = true;
        this.modal.show();
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
