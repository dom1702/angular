import { Component, ViewChild, Injector, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { GetTheoryLessonTopicForViewDto, TheoryLessonTopicDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'viewTheoryLessonTopicModal',
    templateUrl: './view-theoryLessonTopic-modal.component.html'
})
export class ViewTheoryLessonTopicModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    item: GetTheoryLessonTopicForViewDto;


    constructor(
        injector: Injector
    ) {
        super(injector);
        this.item = new GetTheoryLessonTopicForViewDto();
        this.item.theoryLessonTopic = new TheoryLessonTopicDto();
    }

    show(item: GetTheoryLessonTopicForViewDto): void {
        this.item = item;
        this.active = true;
        this.modal.show();
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
