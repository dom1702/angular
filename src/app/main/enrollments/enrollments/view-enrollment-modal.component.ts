import { Component, ViewChild, Injector, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { GetEnrollmentForViewDto, EnrollmentDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'viewEnrollmentModal',
    templateUrl: './view-enrollment-modal.component.html'
})
export class ViewEnrollmentModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal') modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    item: GetEnrollmentForViewDto;


    constructor(
        injector: Injector
    ) {
        super(injector);
        this.item = new GetEnrollmentForViewDto();
        this.item.enrollment = new EnrollmentDto();
    }

    show(item: GetEnrollmentForViewDto): void {
        this.item = item;
        this.active = true;
        this.modal.show();
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
