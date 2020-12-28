import { Component, ViewChild, Injector, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { GetLicenseClassForViewDto, LicenseClassDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'viewLicenseClassModal',
    templateUrl: './view-licenseClass-modal.component.html'
})
export class ViewLicenseClassModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    item: GetLicenseClassForViewDto;


    constructor(
        injector: Injector
    ) {
        super(injector);
        this.item = new GetLicenseClassForViewDto();
        this.item.licenseClass = new LicenseClassDto();
    }

    show(item: GetLicenseClassForViewDto): void {
        this.item = item;
        this.active = true;
        this.modal.show();
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
