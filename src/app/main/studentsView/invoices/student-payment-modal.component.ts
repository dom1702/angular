import { Component, ViewChild, Injector, Output, EventEmitter } from "@angular/core";
import { ModalDirective } from "ngx-bootstrap/modal";
import { finalize } from "rxjs/operators";
import { PaymentsServiceProxy, CreateOrEditPaymentDto, StudentInvoicesServiceProxy, PaymentProviderDto, StudentsViewServiceProxy, SVCourseInvoiceDto } from "@shared/service-proxies/service-proxies";
import { AppComponentBase } from "@shared/common/app-component-base";
import { DateTime } from "luxon";

import { DateTimeService } from "@app/shared/common/timing/date-time.service";

@Component({
    selector: "studentPaymentModal",
    templateUrl: "./student-payment-modal.component.html",
})
export class StudentPaymentModalComponent extends AppComponentBase {
    @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    loading = false;

    studentInvoiceUserFriendlyInvoiceId = "";
    invoice: SVCourseInvoiceDto;

    constructor(injector: Injector,
        private _paymentsServiceProxy: PaymentsServiceProxy,
        private _dateTimeService: DateTimeService,
        private _studentInvoicesServiceProxy: StudentInvoicesServiceProxy,
        private _studentViewService: StudentsViewServiceProxy) {
        super(injector);
    }

    show(invoice: SVCourseInvoiceDto): void {
        this.active = true;
        this.modal.show();

        this.invoice = invoice;
    }

    payInstallment(installment) {

        this.loading = true;

        this._studentViewService.createPayment(this.invoice.studentInvoiceId, installment.installmentName).subscribe((result) => {
            this.loading = false;
            if (result.succeeded) {
                window.location.href = result.url;
            }
            else {
                console.log("Failed");
            }
        });
    }

    payCompletely() {

    }

    isPaid(installmentId)
    {
        for(var payment of this.invoice.payments)
        {
            if(payment.installmentId == installmentId)
                return true;
        }

        return false;
    }

    getPaymentTime(installmentId)
    {
        for(var payment of this.invoice.payments)
        {
            if(payment.installmentId == installmentId)
                return payment.date;
        }
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
