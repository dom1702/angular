import { Component, ViewChild, Injector, Output, EventEmitter} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { finalize } from 'rxjs/operators';
import { DrivingLessonTopicsServiceProxy, CreateOrEditDrivingLessonTopicDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as moment from 'moment';


@Component({
    selector: 'createOrEditDrivingLessonTopicModal',
    templateUrl: './create-or-edit-drivingLessonTopic-modal.component.html'
})
export class CreateOrEditDrivingLessonTopicModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal') modal: ModalDirective;


    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    drivingLessonTopic: CreateOrEditDrivingLessonTopicDto = new CreateOrEditDrivingLessonTopicDto();



    constructor(
        injector: Injector,
        private _drivingLessonTopicsServiceProxy: DrivingLessonTopicsServiceProxy
    ) {
        super(injector);
    }

    show(drivingLessonTopicId?: number): void {

        if (!drivingLessonTopicId) {
            this.drivingLessonTopic = new CreateOrEditDrivingLessonTopicDto();
            this.drivingLessonTopic.id = drivingLessonTopicId;

            this.active = true;
            this.modal.show();
        } else {
            this._drivingLessonTopicsServiceProxy.getDrivingLessonTopicForEdit(drivingLessonTopicId).subscribe(result => {
                this.drivingLessonTopic = result.drivingLessonTopic;


                this.active = true;
                this.modal.show();
            });
        }
    }

    save(): void {
            this.saving = true;

			
            this._drivingLessonTopicsServiceProxy.createOrEdit(this.drivingLessonTopic)
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
