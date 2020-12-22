import { Component, ViewChild, Injector, Output, EventEmitter} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { finalize } from 'rxjs/operators';
import { ProductsServiceProxy, CreateOrEditProductDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as moment from 'moment';


@Component({
    selector: 'createOrEditProductModal',
    templateUrl: './create-or-edit-product-modal.component.html'
})
export class CreateOrEditProductModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal') modal: ModalDirective;


    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    product: CreateOrEditProductDto = new CreateOrEditProductDto();

    fullVat : string;
    reducedVat : string;

    vat : number;

    constructor(
        injector: Injector,
        private _productsServiceProxy: ProductsServiceProxy
    ) {
        super(injector);
    }

    show(productId?: number): void {

       this.fullVat = abp.setting.get("App.Invoice.FullVat");
       this.reducedVat = abp.setting.get("App.Invoice.ReducedVat");

        if (!productId) {
            this.product = new CreateOrEditProductDto();
            this.product.id = productId;

            this.vat = 0;

            this.active = true;
            this.modal.show();
        } else {
            this._productsServiceProxy.getProductForEdit(productId).subscribe(result => {
                this.product = result.product;

                if(this.product.vat == Number(this.fullVat))
                    this.vat = 0;
                else if(this.product.vat == Number(this.reducedVat))
                    this.vat = 1;
                else
                    this.vat = 2;

                this.active = true;
                this.modal.show();
            });
        }
    }

    save(): void {
            this.saving = true;

            if(this.vat == 0)
                this.product.vat = Number(this.fullVat);
            else if(this.vat == 1)
                this.product.vat = Number(this.reducedVat);
			
            this._productsServiceProxy.createOrEdit(this.product)
             .pipe(finalize(() => { this.saving = false;}))
             .subscribe(() => {
                this.notify.info(this.l('SavedSuccessfully'));
                this.close();
                this.modalSave.emit(null);
             });
    }

    close(): void {

        this.active = false;
        this.modal.hide();
    }
}
