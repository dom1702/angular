import { Component, ViewChild, Injector, Output, EventEmitter, OnInit} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from '@shared/common/app-component-base';
import { IScheduler } from './scheduler-interface';

@Component({
    selector: 'schedulerFilterModal',
    templateUrl: './scheduler-filter-modal.component.html'
})
export class SchedulerFilterModalComponent extends AppComponentBase implements OnInit{

    @ViewChild('filterModal') modal: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active :boolean;

    scheduler : IScheduler;

    constructor(
        injector: Injector,
    ) {
        super(injector);
    }

    ngOnInit() {
    }

    show(scheduler : IScheduler): void 
    {
        this.scheduler = scheduler

        this.active = true;
     
        this.modal.show();

    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
