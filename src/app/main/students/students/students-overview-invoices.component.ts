import { Component, Injector, ViewEncapsulation, ViewChild, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentsServiceProxy, StudentDto, PricePackagesServiceProxy, PricePackageDto, StudentInvoiceDto, StudentInvoicesServiceProxy, PaymentDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { FileDownloadService } from '@shared/utils/file-download.service';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';
import { PricePackageLookupTableModalComponent } from './pricePackage-lookup-table-modal.component';
import { StudentsOverviewComponent } from './students-overview.component';
import { StudentsOverviewViewPaymentModalComponent } from './students-overview-invoices-payment-modal.component';

@Component({
    selector: 'students-overview-invoices',
    templateUrl: './students-overview-invoices.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class StudentsOverviewInvoicesComponent extends AppComponentBase {

    @Input() student: StudentDto;
    @Input() parentOverview : StudentsOverviewComponent;

    @ViewChild('studentsOverviewViewPaymentModal', { static: true }) studentsOverviewViewPaymentModal: StudentsOverviewViewPaymentModalComponent;

    invoices: StudentInvoiceDto[];

    showInvoicesOfAllCourses : boolean;

    subscription : Subscription;

    constructor(
        injector: Injector,
        private _studentsServiceProxy: StudentsServiceProxy,
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

        this.parentOverview.onStudentInvoicesTabSelected.subscribe(() => {

            this.updateInvoices();

            this.subscription = this.parentOverview.courseChanged.subscribe(() => {
                this._studentInvoicesServiceProxy.getAllInvoicesByStudentId(this.student.id, 
                    (this.showInvoicesOfAllCourses) ? undefined : this.parentOverview.selectedStudentCourse.course.id).subscribe(result => {
                        //console.log(result);
                    this.invoices = result;
                });
            });
 
        });

        this.parentOverview.onStudentInvoicesTabDeselected.subscribe(() => {

            this.subscription.unsubscribe();
 
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

    updateInvoicesAndOpenModalAgain(invoiceId : number)
    {
        this._studentInvoicesServiceProxy.getAllInvoicesByStudentId(this.student.id, 
            (this.showInvoicesOfAllCourses) ? undefined : this.parentOverview.selectedStudentCourse.course.id).subscribe(result => {
            this.invoices = result;
            console.log(this.invoices);
            console.log(invoiceId);
            var item = this.invoices.find(x => x.id === invoiceId);
            console.log(item);
            this.openPaymentModal(item);
        });
    }

    getPayersAddressString() {
        if (this.student == null)
            return '';

        return this.student.payersStreet + ", " + this.student.payersZipCode + ", " + this.student.payersCity;
    }

    openPaymentModal(invoice) {
        this.studentsOverviewViewPaymentModal.show(invoice.payments, invoice.id, this);
    }
}
