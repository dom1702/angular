import { Component, ViewChild, Injector, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { GetStudentInvoiceForViewDto, StudentInvoiceDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'viewStudentInvoiceModal',
    templateUrl: './view-studentInvoice-modal.component.html'
})
export class ViewStudentInvoiceModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    item: GetStudentInvoiceForViewDto;


    constructor(
        injector: Injector
    ) {
        super(injector);
        this.item = new GetStudentInvoiceForViewDto();
        this.item.studentInvoice = new StudentInvoiceDto();
    }

    show(item: GetStudentInvoiceForViewDto): void {
        this.item = item;
        this.active = true;
        this.modal.show();
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
