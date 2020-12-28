import { Component, ViewChild, Injector, Output, EventEmitter } from "@angular/core";
import { ModalDirective } from "ngx-bootstrap/modal";
import { GetTestResourceForViewDto, TestResourceDto } from "@shared/service-proxies/service-proxies";
import { AppComponentBase } from "@shared/common/app-component-base";

@Component({
    selector: "viewTestResourceModal",
    templateUrl: "./view-testResource-modal.component.html",
})
export class ViewTestResourceModalComponent extends AppComponentBase {
    @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    item: GetTestResourceForViewDto;

    constructor(injector: Injector) {
        super(injector);
        this.item = new GetTestResourceForViewDto();
        this.item.testResource = new TestResourceDto();
    }

    show(item: GetTestResourceForViewDto): void {
        this.item = item;
        this.active = true;
        this.modal.show();
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
