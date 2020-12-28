import { Component, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VehiclesServiceProxy, VehicleDto , Powertrain, Gearbox } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';
import { CreateOrEditVehicleModalComponent } from './create-or-edit-vehicle-modal.component';
import { ViewVehicleModalComponent } from './view-vehicle-modal.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import {LazyLoadEvent} from 'primeng/api';
import {Paginator} from 'primeng/paginator';
import {Table} from 'primeng/table';
import { FileDownloadService } from '@shared/utils/file-download.service';
import * as _ from 'lodash';

@Component({
    templateUrl: './vehicles.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class VehiclesComponent extends AppComponentBase {

    @ViewChild('createOrEditVehicleModal', { static: true }) createOrEditVehicleModal: CreateOrEditVehicleModalComponent;
    @ViewChild('viewVehicleModalComponent', { static: true }) viewVehicleModal: ViewVehicleModalComponent;
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;

    advancedFiltersAreShown = false;
    filterText = '';
    nameFilter = '';
    brandFilter = '';
    modelFilter = '';
    yearFilter = '';
    licensePlateFilter = '';
    inUseFilter = -1;
    powertrainFilter = -1;
        licenseClassClassFilter = '';

    powertrain = Powertrain;
    gearbox = Gearbox;



    constructor(
        injector: Injector,
        private _vehiclesServiceProxy: VehiclesServiceProxy,
        private _tokenAuth: TokenAuthServiceProxy,
        private _activatedRoute: ActivatedRoute,
        private _fileDownloadService: FileDownloadService
    ) {
        super(injector);
    }

    getVehicles(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            return;
        }

        this.primengTableHelper.showLoadingIndicator();

        this._vehiclesServiceProxy.getAll(
            this.filterText,
            this.nameFilter,
            this.brandFilter,
            this.modelFilter,
            this.yearFilter,
            this.licensePlateFilter,
            this.inUseFilter,
            this.powertrainFilter,
            this.licenseClassClassFilter,
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

    createVehicle(): void {
        this.createOrEditVehicleModal.show();
    }

    deleteVehicle(vehicle: VehicleDto): void {
        this.message.confirm(
            '',
            '',
            (isConfirmed) => {
                if (isConfirmed) {
                    this._vehiclesServiceProxy.delete(vehicle.id)
                        .subscribe(() => {
                            this.reloadPage();
                            this.notify.success(this.l('SuccessfullyDeleted'));
                        });
                }
            }
        );
    }

    exportToExcel(): void {
        this._vehiclesServiceProxy.getVehiclesToExcel(
        this.filterText,
            this.nameFilter,
            this.brandFilter,
            this.modelFilter,
            this.yearFilter,
            this.licensePlateFilter,
            this.inUseFilter,
            this.powertrainFilter,
            this.licenseClassClassFilter,
        )
        .subscribe(result => {
            this._fileDownloadService.downloadTempFile(result);
         });
    }
}
