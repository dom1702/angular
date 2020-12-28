import { Component, ViewChild, Injector, Output, EventEmitter, QueryList, ViewChildren, AfterViewInit} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { PricePackagesServiceProxy, CreateOrEditPricePackageDto, ProductsServiceProxy, PricePackageItemDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as moment from 'moment';
import {LazyLoadEvent} from 'primeng/api';
import {Paginator} from 'primeng/paginator';
import {Table} from 'primeng/table';
import { Subscription } from 'rxjs';
import { PrimengTableHelper } from '@shared/helpers/PrimengTableHelper';
import { ViewProductModalComponent } from '../../../../admin/sales/products/view-product-modal.component';
import { PricePackageProductLookupTableModalComponent } from './pricePackage-product-lookup-table-modal.component';
import { FormGroup, FormArray, FormBuilder, Validators } from '@angular/forms';


@Component({
    selector: 'createOrEditPricePackageModal',
    templateUrl: './create-or-edit-pricePackage-modal.component.html'
})
export class CreateOrEditPricePackageModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal') modal: ModalDirective;
    @ViewChild('productLookupTableModal') productLookupTableModal: PricePackageProductLookupTableModalComponent;
    @ViewChild('viewProductModal') viewProductModal: ViewProductModalComponent;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    dataTable : Table;
    paginator : Paginator;

    pricePackageId;

    priceEditable : boolean;
    nameEditable : boolean;
    descriptionEditable : boolean;

    pricePackage: CreateOrEditPricePackageDto = new CreateOrEditPricePackageDto();

    primengTableHelper = new PrimengTableHelper();

    itemForm: FormGroup;

    itemFormSubscription: Subscription;

    constructor(
        injector: Injector,
        private _pricePackagesServiceProxy: PricePackagesServiceProxy,
        private _productsServiceProxy: ProductsServiceProxy,
        private fb: FormBuilder
    ) {
        super(injector);
    }


    show(pricePackageId?: number, priceEditable: boolean = false, nameEditable = true, descriptionEditable = true): void {

        this.priceEditable = priceEditable;
        this.nameEditable = nameEditable;
        this.descriptionEditable = descriptionEditable;

        this.itemForm = this.fb.group({

            items: this.fb.array([
      
              // this.fb.group({
              //   product: ['1', Validators.required],
              //   qty: ['1'],
              //   priceBeforeVat: ['1'],
              //   itemVat: ['1', Validators.required],
              //   priceAfterVat: ['1', Validators.required],
              //   sum: ['1', Validators.required]
              // })
      
            ])
      
          });

        if (!pricePackageId) {
            this.pricePackage = new CreateOrEditPricePackageDto();
            //this.pricePackage.id = pricePackageId;

        

            this.active = true;
            this.modal.show();
        } else {
            this._pricePackagesServiceProxy.getPricePackageForEdit(pricePackageId).subscribe(result => {
                this.pricePackage = result.pricePackage;

                this.pricePackageId = pricePackageId;

                var control = <FormArray>this.itemForm.get('items');

                for(var i = 0; i < this.pricePackage.products.length; i++)
                {
                  this.addItem();
      
                  control.at(control.length - 1).get('productId').setValue(result.pricePackage.products[i].productId);
                  control.at(control.length - 1).get('productName').setValue(result.pricePackage.products[i].productName);
                  control.at(control.length - 1).get('qty').setValue(result.pricePackage.products[i].quantity);
                  control.at(control.length - 1).get('itemVat').setValue(result.pricePackage.products[i].itemVat);
                  control.at(control.length - 1).get('priceAfterVat').setValue(result.pricePackage.products[i].priceAfterVat);
                  control.at(control.length - 1).get('sum').setValue(result.pricePackage.products[i].quantity * result.pricePackage.products[i].priceAfterVat);
                }

                this.active = true;
                this.modal.show();
            });
        }

        this.subscribeToItemFormValueChanges();
    }

    get getFormData(): FormArray {
        return <FormArray>this.itemForm.get('items');
      }

    addItem() {
        const control = <FormArray>this.itemForm.get('items');
        control.push(this.getEmptyItem());
      }



    getEmptyItem(): FormGroup {
        return this.fb.group({
          productId: [''],
          productName: ['', Validators.required],
          qty: ['1'],
          itemVat: [''],
          priceAfterVat: ['0'],
          sum: ['0']
        });
      }

    getItemControlLabel(id: number, type: string) {
        const control = <FormArray>this.itemForm.get('items');
        return control.at(id).get(type).value;
      }

    updateProducts(event?: LazyLoadEvent): void
    {
        if(this.dataTable == null || this.paginator == null)
            return;

        this._pricePackagesServiceProxy.getAllProductsOfPricePackage(
            this.pricePackageId,
            this.primengTableHelper.getSorting(this.dataTable),
            this.primengTableHelper.getSkipCount(this.paginator, event),
            this.primengTableHelper.getMaxResultCount(this.paginator, event)
        ).subscribe(result => {
            this.primengTableHelper.totalRecordsCount = result.totalCount;
            this.primengTableHelper.records = result.items;
            this.primengTableHelper.hideLoadingIndicator();
        });
    }

    remove(index: number) {
        const control = <FormArray>this.itemForm.get('items');
        control.removeAt(index);
      }

    updateItems() {
        this.unsubscribeToItemFormValueChanges();
    
        var control = <FormArray>this.itemForm.get('items');
    
        for (var i = 0; i < control.length; i++) {
          control.at(i).get('sum').setValue(control.at(i).get('qty').value * control.at(i).get('priceAfterVat').value);
        }
    
        this.subscribeToItemFormValueChanges();
      }

    save(): void {
        this.saving = true;

        var control = <FormArray>this.itemForm.get('items');

        this.pricePackage.products = new Array();

        for (var i = 0; i < control.length; i++) {

            var newItem : PricePackageItemDto = new PricePackageItemDto();

            newItem.productId = control.at(i).get('productId').value;
            newItem.productName = control.at(i).get('productName').value;
            newItem.quantity = control.at(i).get('qty').value;
            newItem.priceAfterVat = control.at(i).get('priceAfterVat').value;
            newItem.itemVat = control.at(i).get('itemVat').value;

            this.pricePackage.products.push(newItem);
        }

        this._pricePackagesServiceProxy.createOrEdit(this.pricePackage)
            .pipe(finalize(() => { this.saving = false;}))
            .subscribe(() => {
            this.notify.info(this.l('SavedSuccessfully'));
            this.close();
            this.modalSave.emit(null);
            });
    }


    openSelectProductModal() 
    {
      this.productLookupTableModal.id = this.pricePackageId;
      this.productLookupTableModal.show(this.pricePackageId);
    }

    openProductViewModal(id : number)
    {
        this._productsServiceProxy.getProductForView(id)
        .subscribe(result => {
            this.viewProductModal.show(result);
        });
    }

    getNewProductId() 
    {
        if(this.productLookupTableModal.id == -1)
            return;

        this.primengTableHelper.showLoadingIndicator();

        var control = <FormArray>this.itemForm.get('items');

        for (var i = 0; i < control.length; i++) {
            if (control.at(i).get('productId').value == this.productLookupTableModal.id)
            {
                control.at(i).get('qty').setValue(control.at(i).get('qty').value + 1);
                this.primengTableHelper.hideLoadingIndicator();
                return;
            }
        }

        this._productsServiceProxy.getProductForView(this.productLookupTableModal.id)
        .subscribe(result => {

            this.addItem();

            var control = <FormArray>this.itemForm.get('items');
          
            control.at(control.length - 1).get('productId').setValue(result.product.id);
            control.at(control.length - 1).get('productName').setValue(result.product.name);
            control.at(control.length - 1).get('qty').setValue(1);
            control.at(control.length - 1).get('itemVat').setValue(result.product.vat);
            control.at(control.length - 1).get('priceAfterVat').setValue(result.product.price);
            control.at(control.length - 1).get('sum').setValue(result.product.price);

            this.primengTableHelper.hideLoadingIndicator();
        });
    }

    reloadPage(): void {
        this.paginator.changePage(this.paginator.getPage());
    }

    close(): void {

        this.unsubscribeToItemFormValueChanges();

        this.active = false;
        this.modal.hide();
    }

    subscribeToItemFormValueChanges() {
        this.itemFormSubscription = this.itemForm.valueChanges.subscribe((value) => {
    
          this.updateItems();
    
        });
      }
    
      unsubscribeToItemFormValueChanges() {
        if (this.itemFormSubscription != null)
          this.itemFormSubscription.unsubscribe();
      }
}
