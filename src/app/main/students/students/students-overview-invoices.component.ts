import { Component, Injector, ViewEncapsulation, ViewChild, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Http } from '@angular/http';
import { StudentsServiceProxy, StudentDto, PricePackagesServiceProxy, PricePackageDto, StudentInvoiceDto, StudentInvoicesServiceProxy } from '@shared/service-proxies/service-proxies';
import { NotifyService } from '@abp/notify/notify.service';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { FileDownloadService } from '@shared/utils/file-download.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { PricePackageLookupTableModalComponent } from './pricePackage-lookup-table-modal.component';
import { StudentsOverviewComponent } from './students-overview.component';

@Component({
    selector: 'students-overview-invoices',
    templateUrl: './students-overview-invoices.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class StudentsOverviewInvoicesComponent extends AppComponentBase {

    @Input() student: StudentDto;
    @Input() parentOverview : StudentsOverviewComponent;

    invoices: StudentInvoiceDto[];

    showInvoicesOfAllCourses : boolean;

    constructor(
        injector: Injector,
        private _studentsServiceProxy: StudentsServiceProxy,
        private _notifyService: NotifyService,
        private _tokenAuth: TokenAuthServiceProxy,
        private _activatedRoute: ActivatedRoute,
        private _fileDownloadService: FileDownloadService,
        private _pricePackageServiceProxy: PricePackagesServiceProxy,
        private _studentInvoicesServiceProxy: StudentInvoicesServiceProxy,
        private _router: Router
    ) {
        super(injector);
    }

    ngOnInit(): void {

        this.parentOverview.courseChanged.subscribe(() => {
            this._studentInvoicesServiceProxy.getAllInvoicesByStudentId(this.student.id, 
                (this.showInvoicesOfAllCourses) ? undefined : this.parentOverview.selectedStudentCourse.course.id).subscribe(result => {
                this.invoices = result;
            });
        });
       
    }

    createNewInvoice(): void {
        this._router.navigate(['app/main/sales/studentInvoices/create-studentInvoice', { studentId: this.student.id, 
            courseId: this.parentOverview.selectedStudentCourse.course.id }]);
    }

    editInvoice(invoiceId: number): void {
        this._router.navigate(['app/main/sales/studentInvoices/create-studentInvoice', { id: invoiceId }]);
    }

    deleteInvoice(invoiceId: number): void {
        this.message.confirm(
            '',
            (isConfirmed) => {
                if (isConfirmed) {
                    this._studentInvoicesServiceProxy.delete(invoiceId)
                        .subscribe(() => {

                            this.notify.success(this.l('SuccessfullyDeleted'));

                            this._studentInvoicesServiceProxy.getAllInvoicesByStudentId(this.student.id, 
                                (this.showInvoicesOfAllCourses) ? undefined : this.parentOverview.selectedStudentCourse.course.id).subscribe(result => {

                                this.invoices = result;

                            });
                        });
                }
            }
        );
    }

    getPdf(studentInvoice: StudentInvoiceDto): void {
        this._studentInvoicesServiceProxy.createPdfById(studentInvoice.id)
        .subscribe((result) => {

            
            this._studentInvoicesServiceProxy.getAllInvoicesByStudentId(this.student.id, 
                (this.showInvoicesOfAllCourses) ? undefined : this.parentOverview.selectedStudentCourse.course.id).subscribe(result => {

                this.invoices = result;

            });
           
            this._fileDownloadService.downloadTempFile(result);
        });
    }

    updateInvoices()
    {
        this._studentInvoicesServiceProxy.getAllInvoicesByStudentId(this.student.id, 
            (this.showInvoicesOfAllCourses) ? undefined : this.parentOverview.selectedStudentCourse.course.id).subscribe(result => {
            this.invoices = result;
        });
    }

    getPayersAddressString() {
        if (this.student == null)
            return '';

        return this.student.payersStreet + ", " + this.student.payersZipCode + ", " + this.student.payersCity;
    }
}
