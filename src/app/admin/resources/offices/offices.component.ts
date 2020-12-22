import { Component, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { OfficesServiceProxy, OfficeDto  } from '@shared/service-proxies/service-proxies';
import { NotifyService } from '@abp/notify/notify.service';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';
import { CreateOrEditOfficeModalComponent } from './create-or-edit-office-modal.component';
import { ViewOfficeModalComponent } from './view-office-modal.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/components/table/table';
import { Paginator } from 'primeng/components/paginator/paginator';
import { LazyLoadEvent } from 'primeng/components/common/lazyloadevent';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { EntityTypeHistoryModalComponent } from '@app/shared/common/entityHistory/entity-type-history-modal.component';
import * as _ from 'lodash';
import * as moment from 'moment';

@Component({
    templateUrl: './offices.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class OfficesComponent extends AppComponentBase {

    @ViewChild('createOrEditOfficeModal') createOrEditOfficeModal: CreateOrEditOfficeModalComponent;
    @ViewChild('viewOfficeModalComponent') viewOfficeModal: ViewOfficeModalComponent;
    @ViewChild('entityTypeHistoryModal') entityTypeHistoryModal: EntityTypeHistoryModalComponent;
    @ViewChild('dataTable') dataTable: Table;
    @ViewChild('paginator') paginator: Paginator;

    advancedFiltersAreShown = false;
    filterText = '';
    nameFilter = '';
    streetFilter = '';
    cityFilter = '';
    zipCodeFilter = '';
    stateFilter = '';
    countryFilter = '';
    phoneNumberFilter = '';
    emailFilter = '';


    _entityTypeFullName = 'Drima.Resources.Office';
    entityHistoryEnabled = false;

    constructor(
        injector: Injector,
        private _officesServiceProxy: OfficesServiceProxy,
        private _notifyService: NotifyService,
        private _tokenAuth: TokenAuthServiceProxy,
        private _activatedRoute: ActivatedRoute,
        private _fileDownloadService: FileDownloadService
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

    getOffices(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            return;
        }

        this.primengTableHelper.showLoadingIndicator();

        this._officesServiceProxy.getAll(
            this.filterText,
            this.nameFilter,
            this.streetFilter,
            this.cityFilter,
            this.zipCodeFilter,
            this.stateFilter,
            this.countryFilter,
            this.phoneNumberFilter,
            this.emailFilter,
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

    createOffice(): void {
        this.createOrEditOfficeModal.show();
    }

    showHistory(office: OfficeDto): void {
        this.entityTypeHistoryModal.show({
            entityId: office.id.toString(),
            entityTypeFullName: this._entityTypeFullName,
            entityTypeDescription: ''
        });
    }

    deleteOffice(office: OfficeDto): void {
        this.message.confirm(
            '',
            (isConfirmed) => {
                if (isConfirmed) {
                    this._officesServiceProxy.delete(office.id)
                        .subscribe(() => {
                            this.reloadPage();
                            this.notify.success(this.l('SuccessfullyDeleted'));
                        });
                }
            }
        );
    }

    exportToExcel(): void {
        this._officesServiceProxy.getOfficesToExcel(
        this.filterText,
            this.nameFilter,
            this.streetFilter,
            this.cityFilter,
            this.zipCodeFilter,
            this.stateFilter,
            this.countryFilter,
            this.phoneNumberFilter,
            this.emailFilter,
        )
        .subscribe(result => {
            this._fileDownloadService.downloadTempFile(result);
         });
    }
}
