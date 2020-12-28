import { Component, Injector, ViewEncapsulation, ViewChild, Input } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentsServiceProxy, StudentDto, PricePackagesServiceProxy, StudentInvoiceDto, StudentInvoicesServiceProxy, StudentFormsServiceProxy, CreatedFormDto, FormDto, FormsServiceProxy, DownloadStudentFormInput } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { FileDownloadService } from '@shared/utils/file-download.service';
import * as _ from 'lodash';
import { BsDropdownModule, BsDropdownConfig } from 'ngx-bootstrap/dropdown';

@Component({
    selector: 'students-overview-forms',
    templateUrl: './students-overview-forms.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()],
    providers: [{ provide: BsDropdownConfig, useValue: { isAnimated: true, autoClose: true } }]
})
export class StudentsOverviewFormsComponent extends AppComponentBase {

    @Input() student: StudentDto;

    invoices: StudentInvoiceDto[];
    createdForms: CreatedFormDto[];

    availableForms: FormDto[];
    selectedForm: FormDto;

    constructor(
        injector: Injector,
        private _studentsServiceProxy: StudentsServiceProxy,
        private _tokenAuth: TokenAuthServiceProxy,
        private _activatedRoute: ActivatedRoute,
        private _fileDownloadService: FileDownloadService,
        private _pricePackageServiceProxy: PricePackagesServiceProxy,
        private _studentInvoicesServiceProxy: StudentInvoicesServiceProxy,
        private _studentFormsServiceProxy: StudentFormsServiceProxy,
        private _formsServiceProxy: FormsServiceProxy,
        private _router: Router
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this._studentFormsServiceProxy.getAllCreatedFormsByStudentId(this.student.id).subscribe(result => {

            this.createdForms = result;

        });

        this._formsServiceProxy.getAllUnfiltered().subscribe(result => {

            this.availableForms = result;

        });
    }

    formSelected(form: FormDto) {
        this.selectedForm = form;
    }

    downloadForm() {
        if (this.selectedForm == null)
            return;

        var downloadInput = new DownloadStudentFormInput();
        downloadInput.blankFormId = this.selectedForm.id;
        downloadInput.studentId = this.student.id;

        this._studentFormsServiceProxy.downloadFormPdf(downloadInput)
            .subscribe((result) => {

                this._fileDownloadService.downloadTempFile(result);

                this._studentFormsServiceProxy.getAllCreatedFormsByStudentId(this.student.id).subscribe(result => {

                    this.createdForms = result;
        
                });
            });

    }

    // createNewInvoice(): void {
    //     this._router.navigate(['app/main/sales/studentInvoices/create-studentInvoice', { studentId: this.student.id }]);
    // }

    // editInvoice(invoiceId: number): void {
    //     this._router.navigate(['app/main/sales/studentInvoices/create-studentInvoice', { id: invoiceId }]);
    // }

    // deleteInvoice(invoiceId: number): void {
    //     this.message.confirm(
    //         '',
    //         (isConfirmed) => {
    //             if (isConfirmed) {
    //                 this._studentInvoicesServiceProxy.delete(invoiceId)
    //                     .subscribe(() => {

    //                         this.notify.success(this.l('SuccessfullyDeleted'));

    //                         this._studentInvoicesServiceProxy.getAllInvoicesByStudentId(this.student.id).subscribe(result => {

    //                             this.invoices = result;

    //                         });
    //                     });
    //             }
    //         }
    //     );
    // }

    // getPdf(studentInvoice: StudentInvoiceDto): void {
    //     this._studentInvoicesServiceProxy.createPdfById(studentInvoice.id)
    //     .subscribe((result) => {


    //         this._studentInvoicesServiceProxy.getAllInvoicesByStudentId(this.student.id).subscribe(result => {

    //             this.invoices = result;

    //         });

    //         this._fileDownloadService.downloadTempFile(result);
    //     });
    // }
}
