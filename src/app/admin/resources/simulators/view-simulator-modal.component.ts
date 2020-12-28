import { Component, ViewChild, Injector, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { GetSimulatorForViewDto, SimulatorDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'viewSimulatorModal',
    templateUrl: './view-simulator-modal.component.html'
})
export class ViewSimulatorModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    item: GetSimulatorForViewDto;


    constructor(
        injector: Injector
    ) {
        super(injector);
        this.item = new GetSimulatorForViewDto();
        this.item.simulator = new SimulatorDto();
    }

    show(item: GetSimulatorForViewDto): void {
        this.item = item;
        console.log(this.item);
        this.active = true;
        this.modal.show();
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
