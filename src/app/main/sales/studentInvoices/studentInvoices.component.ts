import { Component, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentInvoicesServiceProxy, StudentInvoiceDto  } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';
import { ViewStudentInvoiceModalComponent } from './view-studentInvoice-modal.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import {LazyLoadEvent} from 'primeng/api';
import {Paginator} from 'primeng/paginator';
import {Table} from 'primeng/table';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { EntityTypeHistoryModalComponent } from '@app/shared/common/entityHistory/entity-type-history-modal.component';
import * as _ from 'lodash';
import * as moment from 'moment';
import { DateTime } from 'luxon';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Component({
    templateUrl: './studentInvoices.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class StudentInvoicesComponent extends AppComponentBase {

    @ViewChild('viewStudentInvoiceModalComponent', { static: true }) viewStudentInvoiceModal: ViewStudentInvoiceModalComponent;
    @ViewChild('entityTypeHistoryModal', { static: true }) entityTypeHistoryModal: EntityTypeHistoryModalComponent;
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;


    advancedFiltersAreShown = false;
    filterText = '';
    recipientFirstNameFilter = '';
    recipientLastNameFilter = '';
    recipientStreetFilter = '';
    recipientZipCodeFilter = '';
    recipientCityFilter = '';
    maxDateFilter :DateTime;
		minDateFilter : DateTime;
    maxTotalAfterVatFilter : number;
		maxTotalAfterVatFilterEmpty : number;
		minTotalAfterVatFilter : number;
		minTotalAfterVatFilterEmpty : number;
    maxDateDueFilter : DateTime;
		minDateDueFilter : DateTime;


    _entityTypeFullName = 'Drima.Sales.StudentInvoice';
    entityHistoryEnabled = false;

    constructor(
        injector: Injector,
        private _studentInvoicesServiceProxy: StudentInvoicesServiceProxy,
        private _tokenAuth: TokenAuthServiceProxy,
        private _activatedRoute: ActivatedRoute,
        private _fileDownloadService: FileDownloadService,
        private _router: Router,
        private _http : HttpClient
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.entityHistoryEnabled = this.setIsEntityHistoryEnabled();
    }

    private setIsEntityHistoryEnabled(): boolean {
        let customSettings = (abp as any).custom;
        return customSettings.EntityHistory && customSettings.EntityHistory.isEnabled && _.filter(customSettings.EntityHistory.enabledEntities, entityType => entityType === this._entityTypeFullName).length === 1;
    }

    getStudentInvoices(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            return;
        }

        this.primengTableHelper.showLoadingIndicator();

        this._studentInvoicesServiceProxy.getAll(
            this.filterText,
            this.recipientFirstNameFilter,
            this.recipientLastNameFilter,
            this.recipientStreetFilter,
            this.recipientZipCodeFilter,
            this.recipientCityFilter,
            this.maxDateFilter,
            this.minDateFilter,
            this.maxTotalAfterVatFilter == null ? this.maxTotalAfterVatFilterEmpty: this.maxTotalAfterVatFilter,
            this.minTotalAfterVatFilter == null ? this.minTotalAfterVatFilterEmpty: this.minTotalAfterVatFilter,
            this.maxDateDueFilter,
            this.minDateDueFilter,
            this.primengTableHelper.getSorting(this.dataTable),
            this.primengTableHelper.getSkipCount(this.paginator, event),
            this.primengTableHelper.getMaxResultCount(this.paginator, event)
        ).subscribe(result => {
            this.primengTableHelper.totalRecordsCount = result.totalCount;
            this.primengTableHelper.records = result.items;
            this.primengTableHelper.hideLoadingIndicator();
        });
    }

    reloadPage(): void {
        this.paginator.changePage(this.paginator.getPage());
    }

    createStudentInvoice(): void {
        this._router.navigate(['app/main/sales/studentInvoices/create-studentInvoice']);
    }

    editStudentInvoice(id : number): void {
        this._router.navigate(['app/main/sales/studentInvoices/create-studentInvoice', { id: id }]);
    }

    showHistory(studentInvoice: StudentInvoiceDto): void {
        this.entityTypeHistoryModal.show({
            entityId: studentInvoice.id.toString(),
            entityTypeFullName: this._entityTypeFullName,
            entityTypeDescription: ''
        });
    }

    deleteStudentInvoice(studentInvoice: StudentInvoiceDto): void {
        this.message.confirm(
            '',
            '',
            (isConfirmed) => {
                if (isConfirmed) {
                    this._studentInvoicesServiceProxy.delete(studentInvoice.id)
                        .subscribe(() => {
                            this.reloadPage();
                            this.notify.success(this.l('SuccessfullyDeleted'));
                        });
                }
            }
        );
    }

    getPdf(studentInvoice: StudentInvoiceDto): void {
        this._studentInvoicesServiceProxy.createPdfById(studentInvoice.id)
        .subscribe((result) => {
           
            this._fileDownloadService.downloadTempFile(result);
        });

  
    }


    testPayment()
    {
        //  const crypto = require("crypto");
        // // //var createHmac = require('create-hmac')

        //  const ACCOUNT = "375917";
        //  const SECRET = "SAIPPUAKAUPPIAS";

        // const headers = {
        //     "checkout-account": ACCOUNT,
        //     "checkout-algorithm": "sha256",
        //     "checkout-method": "GET",
        //     "checkout-nonce": "564635208570151",
        //     "checkout-timestamp": Date.now.toString(),
        //   };

  

        

        // const calculateHmac = (secret, params, body) => {
        //     const hmacPayload = Object.keys(params)
        //       .sort()
        //       .map((key) => [key, params[key]].join(":"))
        //       .concat(body ? JSON.stringify(body) : "")
        //       .join("\n");
          
        //     return crypto.createHmac("sha256", secret).update(hmacPayload).digest("hex");
        //   };

        //   var signature = calculateHmac(SECRET, headers, '');

        //   console.log(signature);

        //   const headersGet = new HttpHeaders()
        //   .append('checkout-account', '375917')
        //   .append('checkout-algorithm', 'sha256')
        //   .append('checkout-method', 'GET')
        //   .append('checkout-timestamp', Date.now.toString()) //'yyyy-MM-ddTHH:mm:ssZ' ISO 8601
        //   .append('checkout-transaction-id', '')
        //   .append('cof-plugin-version', 'drima')
        //   .append('checkout-algorithm', 'sha256')
        //   .append('signature', signature);

        //   var result = this._http.get('api.checkout.fi/merchants/payment-providers?amount=1000&groups=mobile,creditcard', {headers: headersGet })

        //   console.log(result);
        console.log("go");
        this._studentInvoicesServiceProxy.getAllPaymentProviders().subscribe();
    }
}
