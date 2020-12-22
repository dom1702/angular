import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import * as moment from 'moment';
import { StudentsViewServiceProxy, SVStudentInvoicePerCourseDto } from '@shared/service-proxies/service-proxies';
import { FileDownloadService } from '@shared/utils/file-download.service';


@Component({
    templateUrl: './sv-invoices.component.html',
    animations: [appModuleAnimation()]
})
export class SVInvoicesComponent extends AppComponentBase implements OnInit{

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
}
