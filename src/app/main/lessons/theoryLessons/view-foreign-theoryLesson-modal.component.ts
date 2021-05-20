import { Component, ViewChild, Injector, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { GetTheoryLessonForViewDto, TheoryLessonDto, TheoryLessonsServiceProxy } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'viewForeignTheoryLessonModal',
    templateUrl: './view-foreign-theoryLesson-modal.component.html'
})
export class ViewForeignTheoryLessonModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    item: GetTheoryLessonForViewDto;
    instructorList : string;
    studentList : string;
    topic : string;




    constructor(
        injector: Injector,
        private _theoryLessonsServiceProxy: TheoryLessonsServiceProxy
    ) {
        super(injector);
        this.item = new GetTheoryLessonForViewDto();
        this.item.theoryLesson = new TheoryLessonDto();
    }

    show(item: GetTheoryLessonForViewDto): void 
    {
        this.item = item;

        this.active = true;
        this.modal.show();
        // this._theoryLessonsServiceProxy.getTheoryLessonForView(item.theoryLesson.id).subscribe(result => {
            
           
        // });
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
