import { Component, ViewChild, Injector, Output, EventEmitter } from "@angular/core";
import { ModalDirective } from "ngx-bootstrap/modal";
import { GetPaymentForViewDto, PaymentDto, PaymentMethod } from "@shared/service-proxies/service-proxies";
import { AppComponentBase } from "@shared/common/app-component-base";
import { CreateOrEditPaymentModalComponent } from "@app/main/sales/payments/create-or-edit-payment-modal.component";
import { StudentsOverviewInvoicesComponent } from "./students-overview-invoices.component";

@Component({
    selector: "studentsOverviewViewPaymentModal",
    templateUrl: "./students-overview-invoices-payment-modal.component.html",
})
export class StudentsOverviewViewPaymentModalComponent extends AppComponentBase {
    @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    @ViewChild("createOrEditPaymentModal", { static: true }) createOrEditPaymentModal: CreateOrEditPaymentModalComponent;

    active = false;
    saving = false;

    items: PaymentDto[] = [];
    paymentMethod = PaymentMethod;

    caller : StudentsOverviewInvoicesComponent;
    studentInvoiceId : number;

    constructor(injector: Injector) {
        super(injector);
    }

    show(items: PaymentDto[], studentInvoiceId : number, caller : StudentsOverviewInvoicesComponent): void {
        this.studentInvoiceId = studentInvoiceId;
        this.caller = caller;
        this.items = items;
        this.active = true;
        this.modal.show();
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }

    updatePayments()
    {
        this.caller.updateInvoicesAndOpenModalAgain(this.studentInvoiceId);
    }

    editPayment(id : number): void {
        this.createOrEditPaymentModal.show(id);
    }
}
