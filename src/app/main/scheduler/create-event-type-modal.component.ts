import { Component, ViewChild, Injector, Output, EventEmitter, OnInit} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { finalize } from 'rxjs/operators';
import { DrivingLessonsServiceProxy, CreateOrEditDrivingLessonDto, InstructorDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as moment from 'moment';
import { TimepickerComponent } from 'ngx-bootstrap/timepicker';
import { SchedulerComponent } from './scheduler.component';
import { IScheduler } from './scheduler-interface';

@Component({
    selector: 'createEventTypeModal',
    templateUrl: './create-event-type-modal.component.html'
})
export class CreateEventTypeModalComponent extends AppComponentBase implements OnInit{

    @ViewChild('createOrEditModal') modal: ModalDirective;


    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active :boolean;

    scheduler : IScheduler;

    allowCreateDrivingLesson : boolean;
    allowCreateTheoryLesson : boolean;
    allowCreateEvent: boolean;
    allowCreateSimulatorLesson : boolean;

    saving : boolean;

    constructor(
        injector: Injector,
        private _drivingLessonsServiceProxy: DrivingLessonsServiceProxy
    ) {
        super(injector);
    }

    ngOnInit() {

    }

    show(scheduler : IScheduler, allowCreateDrivingLesson : boolean, allowCreateTheoryLesson : boolean, allowCreateEvent : boolean, allowCreateSimulatorLesson : boolean): void 
    {
        this.allowCreateDrivingLesson = allowCreateDrivingLesson;
        this.allowCreateTheoryLesson = allowCreateTheoryLesson;
        this.allowCreateEvent = allowCreateEvent;

        if(abp.features.isEnabled("App.Simulator"))
            this.allowCreateSimulatorLesson = allowCreateSimulatorLesson;
        else
            this.allowCreateSimulatorLesson = false;

        this.scheduler = scheduler

        this.active = true;
     
        this.modal.show();

    }

    openDrivingLessonModal(): void
    {
        this.scheduler.openDrivingLessonModal();
    }

    openTheoryLessonModal(): void
    {
        this.scheduler.openTheoryLessonModal();
    }

    openEventModal(): void
    {
        this.scheduler.openEventModal();
    }

    openSimulatorLessonModal(): void
    {
        this.scheduler.openSimulatorLessonModal();
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
