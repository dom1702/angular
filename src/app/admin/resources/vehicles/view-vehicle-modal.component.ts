import { Component, ViewChild, Injector, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { GetVehicleForViewDto, VehicleDto , Powertrain, Gearbox} from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'viewVehicleModal',
    templateUrl: './view-vehicle-modal.component.html'
})
export class ViewVehicleModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    item: GetVehicleForViewDto;
    powertrain = Powertrain;
    gearbox = Gearbox;
    licenseClasses = 'None';


    constructor(
        injector: Injector
    ) {
        super(injector);
        this.item = new GetVehicleForViewDto();
        this.item.vehicle = new VehicleDto();
        this.updateLicenseClass();
    }

    show(item: GetVehicleForViewDto): void {
        this.item = item;

        this.updateLicenseClass();
        this.active = true;
        this.modal.show();
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }

    updateLicenseClass() : void 
    {
        if(this.item.vehicle.licenseClasses == null)
            return;

        for(var i = 0; i < this.item.vehicle.licenseClasses.length; i++)
        {
            if(i == 0)
                this.licenseClasses = this.item.vehicle.licenseClasses[i];
            else
                this.licenseClasses += ', ' + this.item.vehicle.licenseClasses[i];
        }
    }
}
