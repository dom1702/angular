import { Component, ViewChild, Injector, Output, EventEmitter } from "@angular/core";
import { ModalDirective } from "ngx-bootstrap/modal";
import { finalize } from "rxjs/operators";
import { PaymentsServiceProxy, CreateOrEditPaymentDto, StudentInvoicesServiceProxy, PaymentProviderDto, StudentsViewServiceProxy } from "@shared/service-proxies/service-proxies";
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

    paymentProviderDtos : PaymentProviderDto[];

    constructor(injector: Injector, 
        private _paymentsServiceProxy: PaymentsServiceProxy, 
        private _dateTimeService: DateTimeService,
        private _studentInvoicesServiceProxy: StudentInvoicesServiceProxy,
        private _studentViewService: StudentsViewServiceProxy) {
        super(injector);
    }

    show(studentInvoiceId?: number): void {
        this.active = true;
        this.modal.show();

        this.loading = true;

        // this._studentViewService.getAllPaymentProviders().subscribe((result) =>
        // {
        //     this.paymentProviderDtos = result;
        //     console.log(this.paymentProviderDtos);
        //     this.loading = false;
        // });

        this._studentViewService.createPayment(studentInvoiceId).subscribe();
    }

    save(): void {
        // this.saving = true;

        // this._paymentsServiceProxy
        //     .createOrEdit(this.payment)
        //     .pipe(
        //         finalize(() => {
        //             this.saving = false;
        //         })
        //     )
        //     .subscribe(() => {
        //         this.notify.info(this.l("SavedSuccessfully"));
        //         this.close();
        //         this.modalSave.emit(null);
        //     });
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
