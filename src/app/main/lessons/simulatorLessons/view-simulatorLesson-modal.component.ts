import { Component, ViewChild, Injector, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { GetSimulatorLessonForViewDto, SimulatorLessonDto, SimulatorLessonState } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'viewSimulatorLessonModal',
    templateUrl: './view-simulatorLesson-modal.component.html'
})
export class ViewSimulatorLessonModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    item: GetSimulatorLessonForViewDto;

    lessonState = SimulatorLessonState;

    constructor(
        injector: Injector
    ) {
        super(injector);
        this.item = new GetSimulatorLessonForViewDto();
        this.item.simulatorLesson = new SimulatorLessonDto();
    }

    show(item: GetSimulatorLessonForViewDto): void {
        this.item = item;
        this.active = true;
        this.modal.show();
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
