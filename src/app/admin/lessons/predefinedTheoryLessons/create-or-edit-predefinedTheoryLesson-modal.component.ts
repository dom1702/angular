import { Component, ViewChild, Injector, Output, EventEmitter} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { PredefinedTheoryLessonsServiceProxy, CreateOrEditPredefinedTheoryLessonDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'createOrEditPredefinedTheoryLessonModal',
    templateUrl: './create-or-edit-predefinedTheoryLesson-modal.component.html'
})
export class CreateOrEditPredefinedTheoryLessonModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    predefinedTheoryLesson: CreateOrEditPredefinedTheoryLessonDto = new CreateOrEditPredefinedTheoryLessonDto();



    constructor(
        injector: Injector,
        private _predefinedTheoryLessonsServiceProxy: PredefinedTheoryLessonsServiceProxy
    ) {
        super(injector);
    }

    show(predefinedTheoryLessonId?: number): void {

        if (!predefinedTheoryLessonId) {
            this.predefinedTheoryLesson = new CreateOrEditPredefinedTheoryLessonDto();
            this.predefinedTheoryLesson.id = predefinedTheoryLessonId;

            this.active = true;
            this.modal.show();
        } else {
            this._predefinedTheoryLessonsServiceProxy.getPredefinedTheoryLessonForEdit(predefinedTheoryLessonId).subscribe(result => {
                this.predefinedTheoryLesson = result.predefinedTheoryLesson;


                this.active = true;
                this.modal.show();
            });
        }
        
    }

    save(): void {
            this.saving = true;

			
            this._predefinedTheoryLessonsServiceProxy.createOrEdit(this.predefinedTheoryLesson)
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
