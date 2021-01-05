import { Component, ViewChild, Injector, Output, EventEmitter } from "@angular/core";
import { ModalDirective } from "ngx-bootstrap/modal";
import { finalize } from "rxjs/operators";
import { PaymentsServiceProxy, CreateOrEditPaymentDto } from "@shared/service-proxies/service-proxies";
import { AppComponentBase } from "@shared/common/app-component-base";
import { DateTime } from "luxon";

import { DateTimeService } from "@app/shared/common/timing/date-time.service";
import { PaymentStudentInvoiceLookupTableModalComponent } from "./payment-studentInvoice-lookup-table-modal.component";

@Component({
    selector: "createOrEditPaymentModal",
    templateUrl: "./create-or-edit-payment-modal.component.html",
})
export class CreateOrEditPaymentModalComponent extends AppComponentBase {
    @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;
    @ViewChild("paymentStudentInvoiceLookupTableModal", { static: true })
    paymentStudentInvoiceLookupTableModal: PaymentStudentInvoiceLookupTableModalComponent;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    payment: CreateOrEditPaymentDto = new CreateOrEditPaymentDto();

    studentInvoiceUserFriendlyInvoiceId = "";

    constructor(injector: Injector, private _paymentsServiceProxy: PaymentsServiceProxy, private _dateTimeService: DateTimeService) {
        super(injector);
    }

    show(paymentId?: number): void {
        if (!paymentId) {
            this.payment = new CreateOrEditPaymentDto();
            this.payment.id = paymentId;
            this.payment.date = this._dateTimeService.getStartOfDay();
            this.studentInvoiceUserFriendlyInvoiceId = "";

            this.active = true;
            this.modal.show();
        } else {
            this._paymentsServiceProxy.getPaymentForEdit(paymentId).subscribe((result) => {
                this.payment = result.payment;

                this.studentInvoiceUserFriendlyInvoiceId = result.studentInvoiceUserFriendlyInvoiceId;

                this.active = true;
                this.modal.show();
            });
        }
    }

    save(): void {
        this.saving = true;

        this._paymentsServiceProxy
            .createOrEdit(this.payment)
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

    openSelectStudentInvoiceModal() {
        this.paymentStudentInvoiceLookupTableModal.id = this.payment.studentInvoiceId;
        this.paymentStudentInvoiceLookupTableModal.displayName = this.studentInvoiceUserFriendlyInvoiceId;
        this.paymentStudentInvoiceLookupTableModal.show();
    }

    setStudentInvoiceIdNull() {
        this.payment.studentInvoiceId = null;
        this.studentInvoiceUserFriendlyInvoiceId = "";
    }

    getNewStudentInvoiceId() {
        this.payment.studentInvoiceId = this.paymentStudentInvoiceLookupTableModal.id;
        this.studentInvoiceUserFriendlyInvoiceId = this.paymentStudentInvoiceLookupTableModal.displayName;
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
