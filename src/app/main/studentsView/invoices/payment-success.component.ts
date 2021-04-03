import { Component, Injector, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import * as moment from 'moment';
import { PaymentSucceededDto, PaymentSucceededParameter, StudentsViewServiceProxy, SVStudentInvoicePerCourseDto } from '@shared/service-proxies/service-proxies';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { StudentPaymentModalComponent } from './student-payment-modal.component';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';


@Component({
    templateUrl: './payment-success.component.html',
    animations: [appModuleAnimation()]
})
export class SVPaymentSuccessComponent extends AppComponentBase implements OnInit, OnDestroy {

    accepted: boolean = false;
    state = "";
    provider = "";
    amount = "";
    reference = "";

    timeLeft: number = 7;
    interval;

    constructor(
        injector: Injector,
        private router: Router,
        private activatedRoute: ActivatedRoute,
        private _fileDownloadService: FileDownloadService,
        private _studentViewService: StudentsViewServiceProxy,
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.accepted = false;
        this.activatedRoute.queryParams.subscribe(params => {
            let data = params;

            // // test
            // this.state = "Payment accepted";
            // this.provider = "Credit Card";
            // this.amount = "EUR 300.00";
            // this.reference = "123456/1";

            // this.startTimer();

            var input: PaymentSucceededDto = new PaymentSucceededDto();
            input.parameters = [];

            var map = convertToParamMap(data);

            for (var k of map.keys) {
                var para: PaymentSucceededParameter = new PaymentSucceededParameter();
                para.key = k;
                para.value = map.get(k);
                input.parameters.push(para);
            }

            this._studentViewService.paymentSucceeded(input).subscribe((result) => {

                // This means that the link was called more than once, therefore we do nothing
                if(result == null)
                    return;

                this.accepted = result.paymentAccepted;
                var state = result.paymentAccepted;
                if (state)
                    this.state = this.l("PaymentAccepted");
                else
                    this.state = this.l("PaymentDeclined");

                if (this.accepted) {
                    switch (result.providerName) {
                        case "mobile":
                            this.provider = this.l('MobilePayment');
                            break;
                        case "bank":
                            this.provider = this.l('BankPayment');
                            break;
                        case "creditcard":
                            this.provider = this.l('CreditCard');
                            break;
                        case "credit":
                            this.provider = this.l('CreditPayment');
                            break;
                    }

                    this.amount = result.totalAmount.toString() + " €";
                    this.reference = result.reference;
                }

                this.startTimer();
            });
        });
    }

    ngOnDestroy() {
        this.pauseTimer();
    }

    startTimer() {
        this.interval = setInterval(() => {
            if (this.timeLeft > 1) {
                this.timeLeft--;
            } else {
                this.router.navigateByUrl("/app/main/studentsView/invoices");
            }
        }, 1000)
    }

    pauseTimer() {
        clearInterval(this.interval);
    }

}
