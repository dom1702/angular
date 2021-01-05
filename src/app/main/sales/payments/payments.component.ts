import { Component, Injector, ViewEncapsulation, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { PaymentsServiceProxy, PaymentDto, PaymentMethod } from "@shared/service-proxies/service-proxies";
import { NotifyService } from "abp-ng2-module";
import { AppComponentBase } from "@shared/common/app-component-base";
import { TokenAuthServiceProxy } from "@shared/service-proxies/service-proxies";
import { CreateOrEditPaymentModalComponent } from "./create-or-edit-payment-modal.component";

import { ViewPaymentModalComponent } from "./view-payment-modal.component";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { Table } from "primeng/table";
import { Paginator } from "primeng/paginator";
import { LazyLoadEvent } from "primeng/api";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { EntityTypeHistoryModalComponent } from "@app/shared/common/entityHistory/entity-type-history-modal.component";
import { filter as _filter } from "lodash-es";
import { DateTime } from "luxon";

import { DateTimeService } from "@app/shared/common/timing/date-time.service";

@Component({
    templateUrl: "./payments.component.html",
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()],
})
export class PaymentsComponent extends AppComponentBase {
    @ViewChild("entityTypeHistoryModal", { static: true }) entityTypeHistoryModal: EntityTypeHistoryModalComponent;
    @ViewChild("createOrEditPaymentModal", { static: true }) createOrEditPaymentModal: CreateOrEditPaymentModalComponent;
    @ViewChild("viewPaymentModalComponent", { static: true }) viewPaymentModal: ViewPaymentModalComponent;

    @ViewChild("dataTable", { static: true }) dataTable: Table;
    @ViewChild("paginator", { static: true }) paginator: Paginator;

    advancedFiltersAreShown = false;
    filterText = "";
    maxDateFilter: DateTime;
    minDateFilter: DateTime;
    payerFilter = "";
    referenceFilter = "";
    maxAmountFilter: number;
    maxAmountFilterEmpty: number;
    minAmountFilter: number;
    minAmountFilterEmpty: number;
    paymentMethodFilter = -1;
    studentInvoiceUserFriendlyInvoiceIdFilter = "";

    paymentMethod = PaymentMethod;

    _entityTypeFullName = "Drima.Sales.Payment";
    entityHistoryEnabled = false;

    constructor(
        injector: Injector,
        private _paymentsServiceProxy: PaymentsServiceProxy,
        private _notifyService: NotifyService,
        private _tokenAuth: TokenAuthServiceProxy,
        private _activatedRoute: ActivatedRoute,
        private _fileDownloadService: FileDownloadService,
        private _dateTimeService: DateTimeService
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.entityHistoryEnabled = this.setIsEntityHistoryEnabled();
    }

    private setIsEntityHistoryEnabled(): boolean {
        let customSettings = (abp as any).custom;
        return (
            this.isGrantedAny("Pages.Administration.AuditLogs") &&
            customSettings.EntityHistory &&
            customSettings.EntityHistory.isEnabled &&
            _filter(customSettings.EntityHistory.enabledEntities, (entityType) => entityType === this._entityTypeFullName).length === 1
        );
    }

    getPayments(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            return;
        }

        this.primengTableHelper.showLoadingIndicator();

        this._paymentsServiceProxy
            .getAll(
                this.filterText,
                this.maxDateFilter === undefined ? this.maxDateFilter : this._dateTimeService.getEndOfDayForDate(this.maxDateFilter),
                this.minDateFilter === undefined ? this.minDateFilter : this._dateTimeService.getStartOfDayForDate(this.minDateFilter),
                this.payerFilter,
                this.referenceFilter,
                this.maxAmountFilter == null ? this.maxAmountFilterEmpty : this.maxAmountFilter,
                this.minAmountFilter == null ? this.minAmountFilterEmpty : this.minAmountFilter,
                this.paymentMethodFilter,
                this.studentInvoiceUserFriendlyInvoiceIdFilter,
                this.primengTableHelper.getSorting(this.dataTable),
                this.primengTableHelper.getSkipCount(this.paginator, event),
                this.primengTableHelper.getMaxResultCount(this.paginator, event)
            )
            .subscribe((result) => {
                this.primengTableHelper.totalRecordsCount = result.totalCount;
                this.primengTableHelper.records = result.items;
                this.primengTableHelper.hideLoadingIndicator();
            });
    }

    reloadPage(): void {
        this.paginator.changePage(this.paginator.getPage());
    }

    createPayment(): void {
        this.createOrEditPaymentModal.show();
    }

    showHistory(payment: PaymentDto): void {
        this.entityTypeHistoryModal.show({
            entityId: payment.id.toString(),
            entityTypeFullName: this._entityTypeFullName,
            entityTypeDescription: "",
        });
    }

    deletePayment(payment: PaymentDto): void {
        this.message.confirm("", this.l("AreYouSure"), (isConfirmed) => {
            if (isConfirmed) {
                this._paymentsServiceProxy.delete(payment.id).subscribe(() => {
                    this.reloadPage();
                    this.notify.success(this.l("SuccessfullyDeleted"));
                });
            }
        });
    }

    exportToExcel(): void {
        this._paymentsServiceProxy
            .getPaymentsToExcel(
                this.filterText,
                this.maxDateFilter === undefined ? this.maxDateFilter : this._dateTimeService.getEndOfDayForDate(this.maxDateFilter),
                this.minDateFilter === undefined ? this.minDateFilter : this._dateTimeService.getStartOfDayForDate(this.minDateFilter),
                this.payerFilter,
                this.referenceFilter,
                this.maxAmountFilter == null ? this.maxAmountFilterEmpty : this.maxAmountFilter,
                this.minAmountFilter == null ? this.minAmountFilterEmpty : this.minAmountFilter,
                this.paymentMethodFilter,
                this.studentInvoiceUserFriendlyInvoiceIdFilter
            )
            .subscribe((result) => {
                this._fileDownloadService.downloadTempFile(result);
            });
    }
}
