import { Component, ViewChild, Injector, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { GetDrivingLessonTopicForViewDto, DrivingLessonTopicDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'viewDrivingLessonTopicModal',
    templateUrl: './view-drivingLessonTopic-modal.component.html'
})
export class ViewDrivingLessonTopicModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal') modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    item: GetDrivingLessonTopicForViewDto;


    constructor(
        injector: Injector
    ) {
        super(injector);
        this.item = new GetDrivingLessonTopicForViewDto();
        this.item.drivingLessonTopic = new DrivingLessonTopicDto();
    }

    show(item: GetDrivingLessonTopicForViewDto): void {
        this.item = item;
        this.active = true;
        this.modal.show();
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
