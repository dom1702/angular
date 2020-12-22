import { Component, ViewChild, Injector, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { GetPredefinedDrivingLessonForViewDto, PredefinedDrivingLessonDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'viewPredefinedDrivingLessonModal',
    templateUrl: './view-predefinedDrivingLesson-modal.component.html'
})
export class ViewPredefinedDrivingLessonModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal') modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    item: GetPredefinedDrivingLessonForViewDto;


    constructor(
        injector: Injector
    ) {
        super(injector);
        this.item = new GetPredefinedDrivingLessonForViewDto();
        this.item.predefinedDrivingLesson = new PredefinedDrivingLessonDto();
    }

    show(item: GetPredefinedDrivingLessonForViewDto): void {
        this.item = item;
        this.active = true;
        this.modal.show();
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
