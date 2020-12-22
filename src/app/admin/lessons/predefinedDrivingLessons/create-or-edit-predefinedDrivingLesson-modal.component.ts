import { Component, ViewChild, Injector, Output, EventEmitter} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { finalize } from 'rxjs/operators';
import { PredefinedDrivingLessonsServiceProxy, CreateOrEditPredefinedDrivingLessonDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as moment from 'moment';

@Component({
    selector: 'createOrEditPredefinedDrivingLessonModal',
    templateUrl: './create-or-edit-predefinedDrivingLesson-modal.component.html'
})
export class CreateOrEditPredefinedDrivingLessonModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal') modal: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    predefinedDrivingLesson: CreateOrEditPredefinedDrivingLessonDto = new CreateOrEditPredefinedDrivingLessonDto();



    constructor(
        injector: Injector,
        private _predefinedDrivingLessonsServiceProxy: PredefinedDrivingLessonsServiceProxy
    ) {
        super(injector);
    }

    show(predefinedDrivingLessonId?: number): void {

        if (!predefinedDrivingLessonId) {
            this.predefinedDrivingLesson = new CreateOrEditPredefinedDrivingLessonDto();
            this.predefinedDrivingLesson.id = predefinedDrivingLessonId;

            this.active = true;
            this.modal.show();
        } else {
            this._predefinedDrivingLessonsServiceProxy.getPredefinedDrivingLessonForEdit(predefinedDrivingLessonId).subscribe(result => {
                this.predefinedDrivingLesson = result.predefinedDrivingLesson;


                this.active = true;
                this.modal.show();
            });
        }
    }

    save(): void {
            this.saving = true;

			
            this._predefinedDrivingLessonsServiceProxy.createOrEdit(this.predefinedDrivingLesson)
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
