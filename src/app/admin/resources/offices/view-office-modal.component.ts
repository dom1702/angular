import { Component, ViewChild, Injector, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { GetOfficeForViewDto, OfficeDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'viewOfficeModal',
    templateUrl: './view-office-modal.component.html'
})
export class ViewOfficeModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal') modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    item: GetOfficeForViewDto;


    constructor(
        injector: Injector
    ) {
        super(injector);
        this.item = new GetOfficeForViewDto();
        this.item.office = new OfficeDto();
    }

    show(item: GetOfficeForViewDto): void {
        this.item = item;
        this.active = true;
        this.modal.show();
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
