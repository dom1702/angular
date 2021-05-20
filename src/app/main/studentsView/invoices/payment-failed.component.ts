import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import * as moment from 'moment';
import { PaymentFailedDto, PaymentFailedParameter, StudentsViewServiceProxy, SVStudentInvoicePerCourseDto } from '@shared/service-proxies/service-proxies';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { StudentPaymentModalComponent } from './student-payment-modal.component';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';


@Component({
    templateUrl: './payment-failed.component.html',
    animations: [appModuleAnimation()]
})
export class SVPaymentFailedComponent extends AppComponentBase implements OnInit{

    state = "";

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
        this.activatedRoute.queryParams.subscribe(params => {
            let data = params;
            console.log(data);

            // // test
            // this.state = "Payment accepted";
            // this.provider = "Credit Card";
            // this.amount = "EUR 300.00";
            // this.reference = "123456/1";

            // this.startTimer();


            var input: PaymentFailedDto = new PaymentFailedDto();
            input.parameters = [];

            var map = convertToParamMap(data);

            for (var k of map.keys) {
                var para: PaymentFailedParameter = new PaymentFailedParameter();
                para.key = k;
                para.value = map.get(k);
                input.parameters.push(para);
            }

            this._studentViewService.paymentFailed(input).subscribe((result) => {

                this.state = this.l("PaymentDeclined");

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
