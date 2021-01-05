import { Component, ViewChild, Injector, Output, EventEmitter } from "@angular/core";
import { ModalDirective } from "ngx-bootstrap/modal";
import { GetPaymentForViewDto, PaymentDto, PaymentMethod } from "@shared/service-proxies/service-proxies";
import { AppComponentBase } from "@shared/common/app-component-base";

@Component({
    selector: "viewPaymentModal",
    templateUrl: "./view-payment-modal.component.html",
})
export class ViewPaymentModalComponent extends AppComponentBase {
    @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    item: GetPaymentForViewDto;
    paymentMethod = PaymentMethod;

    constructor(injector: Injector) {
        super(injector);
        this.item = new GetPaymentForViewDto();
        this.item.payment = new PaymentDto();
    }

    show(item: GetPaymentForViewDto): void {
        this.item = item;
        this.active = true;
        this.modal.show();
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
