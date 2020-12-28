import { Component, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SimulatorsServiceProxy, SimulatorDto, SimulatorType  } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';
import { CreateOrEditSimulatorModalComponent } from './create-or-edit-simulator-modal.component';
import { ViewSimulatorModalComponent } from './view-simulator-modal.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import {LazyLoadEvent} from 'primeng/api';
import {Paginator} from 'primeng/paginator';
import {Table} from 'primeng/table';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { EntityTypeHistoryModalComponent } from '@app/shared/common/entityHistory/entity-type-history-modal.component';
import * as _ from 'lodash';

@Component({
    templateUrl: './simulators.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class SimulatorsComponent extends AppComponentBase {

    @ViewChild('createOrEditSimulatorModal', { static: true }) createOrEditSimulatorModal: CreateOrEditSimulatorModalComponent;
    @ViewChild('viewSimulatorModalComponent', { static: true }) viewSimulatorModal: ViewSimulatorModalComponent;
    @ViewChild('entityTypeHistoryModal', { static: true }) entityTypeHistoryModal: EntityTypeHistoryModalComponent;
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;

    advancedFiltersAreShown = false;
    filterText = '';
    nameFilter = '';
    manufacturerFilter = '';
    modelFilter = '';
    modulesFilter = '';
    inUseFilter = -1;
        officeNameFilter = '';


    _entityTypeFullName = 'Drima.Resources.Simulator';
    entityHistoryEnabled = false;

    constructor(
        injector: Injector,
        private _simulatorsServiceProxy: SimulatorsServiceProxy,
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

    getSimulators(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            return;
        }

        this.primengTableHelper.showLoadingIndicator();

        this._simulatorsServiceProxy.getAll(
            this.filterText,
            this.nameFilter,
            this.manufacturerFilter,
            this.modelFilter,
            this.modulesFilter,
            this.inUseFilter,
            this.officeNameFilter,
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

    createSimulator(): void {
        this.createOrEditSimulatorModal.show();
    }

    showHistory(simulator: SimulatorDto): void {
        this.entityTypeHistoryModal.show({
            entityId: simulator.id.toString(),
            entityTypeFullName: this._entityTypeFullName,
            entityTypeDescription: ''
        });
    }

    deleteSimulator(simulator: SimulatorDto): void {
        this.message.confirm(
            '',
            '',
            (isConfirmed) => {
                if (isConfirmed) {
                    this._simulatorsServiceProxy.delete(simulator.id)
                        .subscribe(() => {
                            this.reloadPage();
                            this.notify.success(this.l('SuccessfullyDeleted'));
                        });
                }
            }
        );
    }

    exportToExcel(): void {
        this._simulatorsServiceProxy.getSimulatorsToExcel(
        this.filterText,
            this.nameFilter,
            this.manufacturerFilter,
            this.modelFilter,
            this.modulesFilter,
            this.inUseFilter,
            this.officeNameFilter,
        )
        .subscribe(result => {
            this._fileDownloadService.downloadTempFile(result);
         });
    }
}
