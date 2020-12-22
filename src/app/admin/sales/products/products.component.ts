import { Component, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProductsServiceProxy, ProductDto , ProductType } from '@shared/service-proxies/service-proxies';
import { NotifyService } from '@abp/notify/notify.service';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';
import { CreateOrEditProductModalComponent } from './create-or-edit-product-modal.component';
import { ViewProductModalComponent } from './view-product-modal.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/components/table/table';
import { Paginator } from 'primeng/components/paginator/paginator';
import { LazyLoadEvent } from 'primeng/components/common/lazyloadevent';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { EntityTypeHistoryModalComponent } from '@app/shared/common/entityHistory/entity-type-history-modal.component';
import * as _ from 'lodash';
import * as moment from 'moment';

@Component({
    templateUrl: './products.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class ProductsComponent extends AppComponentBase {

    @ViewChild('createOrEditProductModal') createOrEditProductModal: CreateOrEditProductModalComponent;
    @ViewChild('viewProductModalComponent') viewProductModal: ViewProductModalComponent;
    @ViewChild('entityTypeHistoryModal') entityTypeHistoryModal: EntityTypeHistoryModalComponent;
    @ViewChild('dataTable') dataTable: Table;
    @ViewChild('paginator') paginator: Paginator;

    advancedFiltersAreShown = false;
    filterText = '';
    nameFilter = '';
    maxPriceFilter : number;
		maxPriceFilterEmpty : number;
		minPriceFilter : number;
		minPriceFilterEmpty : number;
    maxVATFilter : number;
		maxVATFilterEmpty : number;
		minVATFilter : number;
		minVATFilterEmpty : number;
    productTypeFilter = -1;

    productType = ProductType;

    _entityTypeFullName = 'Drima.Sales.Product';
    entityHistoryEnabled = false;

    constructor(
        injector: Injector,
        private _productsServiceProxy: ProductsServiceProxy,
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

    getProducts(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            return;
        }

        this.primengTableHelper.showLoadingIndicator();

        this._productsServiceProxy.getAll(
            this.filterText,
            this.nameFilter,
            this.maxPriceFilter == null ? this.maxPriceFilterEmpty: this.maxPriceFilter,
            this.minPriceFilter == null ? this.minPriceFilterEmpty: this.minPriceFilter,
            this.maxVATFilter == null ? this.maxVATFilterEmpty: this.maxVATFilter,
            this.minVATFilter == null ? this.minVATFilterEmpty: this.minVATFilter,
            this.productTypeFilter,
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

    createProduct(): void {
        this.createOrEditProductModal.show();
    }

    showHistory(product: ProductDto): void {
        this.entityTypeHistoryModal.show({
            entityId: product.id.toString(),
            entityTypeFullName: this._entityTypeFullName,
            entityTypeDescription: ''
        });
    }

    deleteProduct(product: ProductDto): void {
        this.message.confirm(
            '',
            (isConfirmed) => {
                if (isConfirmed) {
                    this._productsServiceProxy.delete(product.id)
                        .subscribe(() => {
                            this.reloadPage();
                            this.notify.success(this.l('SuccessfullyDeleted'));
                        });
                }
            }
        );
    }

    exportToExcel(): void {
        this._productsServiceProxy.getProductsToExcel(
        this.filterText,
            this.nameFilter,
            this.maxPriceFilter == null ? this.maxPriceFilterEmpty: this.maxPriceFilter,
            this.minPriceFilter == null ? this.minPriceFilterEmpty: this.minPriceFilter,
            this.maxVATFilter == null ? this.maxVATFilterEmpty: this.maxVATFilter,
            this.minVATFilter == null ? this.minVATFilterEmpty: this.minVATFilter,
            this.productTypeFilter,
        )
        .subscribe(result => {
            this._fileDownloadService.downloadTempFile(result);
         });
    }
}
