import { Component, Injector, ViewEncapsulation, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { TestResourcesServiceProxy, TestResourceDto } from "@shared/service-proxies/service-proxies";
import { NotifyService } from "abp-ng2-module";
import { AppComponentBase } from "@shared/common/app-component-base";
import { TokenAuthServiceProxy } from "@shared/service-proxies/service-proxies";
import { CreateOrEditTestResourceModalComponent } from "./create-or-edit-testResource-modal.component";

import { ViewTestResourceModalComponent } from "./view-testResource-modal.component";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { Table } from "primeng/table";
import { Paginator } from "primeng/paginator";
import { LazyLoadEvent } from "primeng/api";
import { FileDownloadService } from "@shared/utils/file-download.service";
import { filter as _filter } from "lodash-es";
import { DateTime } from "luxon";

import { DateTimeService } from "@app/shared/common/timing/date-time.service";

@Component({
    templateUrl: "./testResources.component.html",
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()],
})
export class TestResourcesComponent extends AppComponentBase {
    @ViewChild("createOrEditTestResourceModal", { static: true }) createOrEditTestResourceModal: CreateOrEditTestResourceModalComponent;
    @ViewChild("viewTestResourceModalComponent", { static: true }) viewTestResourceModal: ViewTestResourceModalComponent;

    @ViewChild("dataTable", { static: true }) dataTable: Table;
    @ViewChild("paginator", { static: true }) paginator: Paginator;

    advancedFiltersAreShown = false;
    filterText = "";
    nameFilter = "";
    vehicleNameFilter = "";
    officeNameFilter = "";

    constructor(
        injector: Injector,
        private _testResourcesServiceProxy: TestResourcesServiceProxy,
        private _notifyService: NotifyService,
        private _tokenAuth: TokenAuthServiceProxy,
        private _activatedRoute: ActivatedRoute,
        private _fileDownloadService: FileDownloadService,
        private _dateTimeService: DateTimeService
    ) {
        super(injector);
    }

    getTestResources(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            return;
        }

        this.primengTableHelper.showLoadingIndicator();

        this._testResourcesServiceProxy
            .getAll(
                this.filterText,
                this.nameFilter,
                this.vehicleNameFilter,
                this.officeNameFilter,
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

    createTestResource(): void {
        this.createOrEditTestResourceModal.show();
    }

    deleteTestResource(testResource: TestResourceDto): void {
        this.message.confirm("", this.l("AreYouSure"), (isConfirmed) => {
            if (isConfirmed) {
                this._testResourcesServiceProxy.delete(testResource.id).subscribe(() => {
                    this.reloadPage();
                    this.notify.success(this.l("SuccessfullyDeleted"));
                });
            }
        });
    }

    exportToExcel(): void {
        this._testResourcesServiceProxy
            .getTestResourcesToExcel(this.filterText, this.nameFilter, this.vehicleNameFilter, this.officeNameFilter)
            .subscribe((result) => {
                this._fileDownloadService.downloadTempFile(result);
            });
    }
}
