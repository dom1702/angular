import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import * as moment from 'moment';
import { StudentsViewServiceProxy, SVStudentInvoicePerCourseDto } from '@shared/service-proxies/service-proxies';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { StudentPaymentModalComponent } from './student-payment-modal.component';


@Component({
    templateUrl: './sv-invoices.component.html',
    animations: [appModuleAnimation()]
})
export class SVInvoicesComponent extends AppComponentBase implements OnInit{

    @ViewChild('studentPaymentModal', {static: true}) studentPaymentModal : StudentPaymentModalComponent; 
    invoicesPerCourse : SVStudentInvoicePerCourseDto[];

    constructor(
        injector: Injector,
        private _fileDownloadService: FileDownloadService,
        private _studentViewService: StudentsViewServiceProxy,
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this._studentViewService.getAllStudentInvoices().subscribe((result) =>
        {
            this.invoicesPerCourse = result;
        });
     
    }

    downloadInvoice(studentInvoiceId)
    {
        this._studentViewService.downloadInvoice(studentInvoiceId)
        .subscribe((result) => {
            this._fileDownloadService.downloadTempFile(result);
        });
    }

    payNow(studentInvoiceId)
    {
        this._studentViewService.createPayment(studentInvoiceId).subscribe((result) => 
        {
            if(result.succeeded)
            {
                window.location.href = result.url;
            }
            else
            {
                console.log("Failed");
            }
        });
        //this.studentPaymentModal.show(studentInvoiceId);
    }

    paymentSuccess()
    {

    }
}
