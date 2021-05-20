import { Component, ViewChild, Injector, Output, EventEmitter, OnInit } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from '@shared/common/app-component-base';
import { IScheduler } from './scheduler-interface';
import { InstructorsServiceProxy, SchedulerServiceProxy, SimulatorsServiceProxy } from '@shared/service-proxies/service-proxies';

@Component({
    selector: 'schedulerFilterModal',
    templateUrl: './scheduler-filter-modal.component.html'
})
export class SchedulerFilterModalComponent extends AppComponentBase implements OnInit {

    @ViewChild('filterModal') modal: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active: boolean;

    scheduler: IScheduler;

    vehiclesResources: any[] = [];
    instructorsResources: any[] = [];
    simulatorsResources: any[] = [];

    simulatorFeatureEnabled;

    // vehiclesResourcesOriginal: any[] = [];
    // instructorsResourcesOriginal: any[] = [];
    // simulatorsResourcesOriginal: any[] = [];

    constructor(
        injector: Injector,
        private _schedulerServiceProxy: SchedulerServiceProxy,
        private _instructorsServiceProxy: InstructorsServiceProxy,
        private _simulatorsServiceProxy: SimulatorsServiceProxy
    ) {
        super(injector);
    }

    ngOnInit() {
        this.simulatorFeatureEnabled = abp.features.isEnabled("App.Simulator");
    }

    show(scheduler: IScheduler): void {
        this.scheduler = scheduler;

        this.vehiclesResources = scheduler.vehiclesResources;
        this.instructorsResources = scheduler.instructorsResources;
        this.simulatorsResources = scheduler.simulatorsResources;

        // this.vehiclesResourcesOriginal = scheduler.vehiclesResources;
        // this.instructorsResourcesOriginal = scheduler.instructorsResources;
        // this.simulatorsResourcesOriginal = scheduler.simulatorsResources;

        this.active = true;

        this.modal.show();
    }

    close(): void {
        this.active = false;

        // this.vehiclesResources = this.vehiclesResourcesOriginal;
        // this.instructorsResources = this.instructorsResourcesOriginal;
        // this.simulatorsResources = this.simulatorsResourcesOriginal;

        this.modal.hide();
    }

    apply()
    {
        this.close();
        this.modalSave.emit(null);
    }

    selectAllInstructors() {
        this.instructorsResources.forEach(function (el) { el.checked = true; });
    }

    deselectAllInstructors() {
        this.instructorsResources.forEach(function (el) { el.checked = false; });
    }

    selectAllVehicles() {
        this.vehiclesResources.forEach(function (el) { el.checked = true; });
    }

    deselectAllVehicles() {
        this.vehiclesResources.forEach(function (el) { el.checked = false; });
    }

    selectAllSimulators() {
        this.simulatorsResources.forEach(function (el) { el.checked = true; });
    }

    deselectAllSimulators() {
        this.simulatorsResources.forEach(function (el) { el.checked = false; });
    }
}
