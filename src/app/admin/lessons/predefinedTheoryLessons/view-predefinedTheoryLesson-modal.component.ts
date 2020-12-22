import { Component, ViewChild, Injector, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { GetPredefinedTheoryLessonForViewDto, PredefinedTheoryLessonDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'viewPredefinedTheoryLessonModal',
    templateUrl: './view-predefinedTheoryLesson-modal.component.html'
})
export class ViewPredefinedTheoryLessonModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal') modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    item: GetPredefinedTheoryLessonForViewDto;


    constructor(
        injector: Injector
    ) {
        super(injector);
        this.item = new GetPredefinedTheoryLessonForViewDto();
        this.item.predefinedTheoryLesson = new PredefinedTheoryLessonDto();
    }

    show(item: GetPredefinedTheoryLessonForViewDto): void {
        this.item = item;
        this.active = true;
        this.modal.show();
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
