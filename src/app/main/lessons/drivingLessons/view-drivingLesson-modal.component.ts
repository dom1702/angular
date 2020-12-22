import { Component, ViewChild, Injector, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { GetDrivingLessonForViewDto, DrivingLessonDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as moment from 'moment';

@Component({
    selector: 'viewDrivingLessonModal',
    templateUrl: './view-drivingLesson-modal.component.html'
})
export class ViewDrivingLessonModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal') modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    item: GetDrivingLessonForViewDto;
    instructorList : string;
    studentName : string;
    topic : string;
    descr : string;


    constructor(
        injector: Injector
    ) {
        super(injector);
        this.item = new GetDrivingLessonForViewDto();
        this.item.drivingLesson = new DrivingLessonDto();
    }

    show(item: GetDrivingLessonForViewDto): void {
        this.item = item;

        if(this.item.instructors != null && this.item.instructors.length > 0)
        {
            for(var i = 0; i < this.item.instructors.length; i++)
            {
                if(i == 0)
                    this.instructorList = this.item.instructors[i].firstName + ' ' + this.item.instructors[i].lastName;
                else
                this.instructorList += ', ' + this.item.instructors[i].firstName + ' ' + this.item.instructors[i].lastName;
            }
        }
        else
        {
            this.instructorList = '-';
        }

        if(this.item.studentFullName != '')
            this.studentName = this.item.studentFullName + ' (' + this.item.drivingLesson.studentId + ')';
        else
            this.studentName = '-';

        if(this.item.drivingLesson.topic != '')
            this.topic = this.item.drivingLesson.topic;
        else
            this.topic = '-';

            if(this.item.description != '')
            this.descr = this.item.description;
        else
            this.descr = '-';

        this.active = true;
        this.modal.show();
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
