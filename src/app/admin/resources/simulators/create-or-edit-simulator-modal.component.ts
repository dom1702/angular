import { Component, ViewChild, Injector, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { SimulatorsServiceProxy, CreateOrEditSimulatorDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { SimulatorOfficeLookupTableModalComponent } from './simulator-office-lookup-table-modal.component';


@Component({
    selector: 'createOrEditSimulatorModal',
    templateUrl: './create-or-edit-simulator-modal.component.html'
})
export class CreateOrEditSimulatorModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @ViewChild('simulatorOfficeLookupTableModal') simulatorOfficeLookupTableModal: SimulatorOfficeLookupTableModalComponent;


    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    simulator: CreateOrEditSimulatorDto = new CreateOrEditSimulatorDto();

    officeName = '';

    simulatorCode = '';

    constructor(
        injector: Injector,
        private _simulatorsServiceProxy: SimulatorsServiceProxy
    ) {
        super(injector);
    }

    show(simulatorId?: number): void {

        this.simulatorCode = '';

        if (!simulatorId) {
            this.simulator = new CreateOrEditSimulatorDto();
            this.simulator.id = simulatorId;
            this.officeName = '';
            this.simulator.inUse = true;
            this.active = true;
            this.modal.show();
        } else {
            this._simulatorsServiceProxy.getSimulatorForEdit(simulatorId).subscribe(result => {
                this.simulator = result.simulator;

                this.officeName = result.officeName;
                this.simulatorCode = result.simulator.simulatorCode;

                this.active = true;
                this.modal.show();
            });
        }
    }

    save(): void {
        this.saving = true;

        this.simulator.simulatorCode = this.simulatorCode;
        this._simulatorsServiceProxy.createOrEdit(this.simulator)
            .pipe(finalize(() => { this.saving = false; }))
            .subscribe(() => {
                this.notify.info(this.l('SavedSuccessfully'));
                this.close();
                this.modalSave.emit(null);
            });
    }

    openSelectOfficeModal() {
        this.simulatorOfficeLookupTableModal.id = this.simulator.officeId;
        this.simulatorOfficeLookupTableModal.displayName = this.officeName;
        this.simulatorOfficeLookupTableModal.show();
    }


    setOfficeIdNull() {
        this.simulator.officeId = null;
        this.officeName = '';
    }


    getNewOfficeId() {
        this.simulator.officeId = this.simulatorOfficeLookupTableModal.id;
        this.officeName = this.simulatorOfficeLookupTableModal.displayName;
    }


    close(): void {

        this.active = false;
        this.modal.hide();
    }

    generateNewCode(): void {
        if (this.simulator.id) {
            this.message.confirm(
                'This will overwrite the existing API key. You will have to change it in the simulators configuration.',
                '',
                (isConfirmed) => {
                    if (isConfirmed) {
                        this._simulatorsServiceProxy.createApiKey().subscribe(result => {
                            this.simulatorCode = result;
                        })
                    }
                }
            );
        }
        else
        {
            this._simulatorsServiceProxy.createApiKey().subscribe(result => {
                this.simulatorCode = result;
            })
        }
    }

    copy(): void {
        //navigator.clipboard.writeText(this.simulatorCode).then().catch(e => console.error(e));
    }
}
