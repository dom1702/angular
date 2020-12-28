import { Component, ViewChild, Injector, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { GetPricePackageForViewDto, PricePackageDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'viewPricePackageModal',
    templateUrl: './view-pricePackage-modal.component.html'
})
export class ViewPricePackageModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal') modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    item: GetPricePackageForViewDto;


    constructor(
        injector: Injector
    ) {
        super(injector);
        this.item = new GetPricePackageForViewDto();
        this.item.pricePackage = new PricePackageDto();
    }

    show(item: GetPricePackageForViewDto): void {
        this.item = item;
        this.active = true;
        this.modal.show();
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
