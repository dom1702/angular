import { Component, ViewChild, Injector, Output, EventEmitter} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { finalize } from 'rxjs/operators';
import { TheoryLessonTopicsServiceProxy, CreateOrEditTheoryLessonTopicDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as moment from 'moment';


@Component({
    selector: 'createOrEditTheoryLessonTopicModal',
    templateUrl: './create-or-edit-theoryLessonTopic-modal.component.html'
})
export class CreateOrEditTheoryLessonTopicModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal') modal: ModalDirective;


    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    theoryLessonTopic: CreateOrEditTheoryLessonTopicDto = new CreateOrEditTheoryLessonTopicDto();



    constructor(
        injector: Injector,
        private _theoryLessonTopicsServiceProxy: TheoryLessonTopicsServiceProxy
    ) {
        super(injector);
    }

    show(theoryLessonTopicId?: number): void {

        if (!theoryLessonTopicId) {
            this.theoryLessonTopic = new CreateOrEditTheoryLessonTopicDto();
            this.theoryLessonTopic.id = theoryLessonTopicId;

            this.active = true;
            this.modal.show();
        } else {
            this._theoryLessonTopicsServiceProxy.getTheoryLessonTopicForEdit(theoryLessonTopicId).subscribe(result => {
                this.theoryLessonTopic = result.theoryLessonTopic;


                this.active = true;
                this.modal.show();
            });
        }
    }

    save(): void {
            this.saving = true;

			
            this._theoryLessonTopicsServiceProxy.createOrEdit(this.theoryLessonTopic)
             .pipe(finalize(() => { this.saving = false;}))
             .subscribe(() => {
                this.notify.info(this.l('SavedSuccessfully'));
                this.close();
                this.modalSave.emit(null);
             });
    }







    close(): void {

        this.active = false;
        this.modal.hide();
    }
}
