import { Component, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { StudentInvoicesServiceProxy, StudentInvoiceDto  } from '@shared/service-proxies/service-proxies';
import { NotifyService } from '@abp/notify/notify.service';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';
import { ViewStudentInvoiceModalComponent } from './view-studentInvoice-modal.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/components/table/table';
import { Paginator } from 'primeng/components/paginator/paginator';
import { LazyLoadEvent } from 'primeng/components/common/lazyloadevent';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { EntityTypeHistoryModalComponent } from '@app/shared/common/entityHistory/entity-type-history-modal.component';
import * as _ from 'lodash';
import * as moment from 'moment';

@Component({
    templateUrl: './studentInvoices.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class StudentInvoicesComponent extends AppComponentBase {

    @ViewChild('viewStudentInvoiceModalComponent') viewStudentInvoiceModal: ViewStudentInvoiceModalComponent;
    @ViewChild('entityTypeHistoryModal') entityTypeHistoryModal: EntityTypeHistoryModalComponent;
    @ViewChild('dataTable') dataTable: Table;
    @ViewChild('paginator') paginator: Paginator;


    advancedFiltersAreShown = false;
    filterText = '';
    recipientFirstNameFilter = '';
    recipientLastNameFilter = '';
    recipientStreetFilter = '';
    recipientZipCodeFilter = '';
    recipientCityFilter = '';
    maxDateFilter : moment.Moment;
		minDateFilter : moment.Moment;
    maxTotalAfterVatFilter : number;
		maxTotalAfterVatFilterEmpty : number;
		minTotalAfterVatFilter : number;
		minTotalAfterVatFilterEmpty : number;
    maxDateDueFilter : moment.Moment;
		minDateDueFilter : moment.Moment;


    _entityTypeFullName = 'Drima.Sales.StudentInvoice';
    entityHistoryEnabled = false;

    constructor(
        injector: Injector,
        private _studentInvoicesServiceProxy: StudentInvoicesServiceProxy,
        private _notifyService: NotifyService,
        private _tokenAuth: TokenAuthServiceProxy,
        private _activatedRoute: ActivatedRoute,
        private _fileDownloadService: FileDownloadService,
        private _router: Router
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
}
