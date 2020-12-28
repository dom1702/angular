import { Component, ViewChild, Injector, Output, EventEmitter } from "@angular/core";
import { ModalDirective } from "ngx-bootstrap/modal";
import { finalize } from "rxjs/operators";
import { TestResourcesServiceProxy, CreateOrEditTestResourceDto, TestResourceOfficeLookupTableDto } from "@shared/service-proxies/service-proxies";
import { AppComponentBase } from "@shared/common/app-component-base";
import { DateTime } from "luxon";

import { DateTimeService } from "@app/shared/common/timing/date-time.service";
import { TestResourceVehicleLookupTableModalComponent } from "./testResource-vehicle-lookup-table-modal.component";

@Component({
    selector: "createOrEditTestResourceModal",
    templateUrl: "./create-or-edit-testResource-modal.component.html",
})
export class CreateOrEditTestResourceModalComponent extends AppComponentBase {
    @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;
    @ViewChild("testResourceVehicleLookupTableModal", { static: true })
    testResourceVehicleLookupTableModal: TestResourceVehicleLookupTableModalComponent;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    testResource: CreateOrEditTestResourceDto = new CreateOrEditTestResourceDto();

    vehicleName = "";
    officeName = "";

    allOffices: TestResourceOfficeLookupTableDto[];

    constructor(injector: Injector, private _testResourcesServiceProxy: TestResourcesServiceProxy, private _dateTimeService: DateTimeService) {
        super(injector);
    }

    show(testResourceId?: number): void {
        if (!testResourceId) {
            this.testResource = new CreateOrEditTestResourceDto();
            this.testResource.id = testResourceId;
            this.vehicleName = "";
            this.officeName = "";

            this.active = true;
            this.modal.show();
        } else {
            this._testResourcesServiceProxy.getTestResourceForEdit(testResourceId).subscribe((result) => {
                this.testResource = result.testResource;

                this.vehicleName = result.vehicleName;
                this.officeName = result.officeName;

                this.active = true;
                this.modal.show();
            });
        }
        this._testResourcesServiceProxy.getAllOfficeForTableDropdown().subscribe((result) => {
            this.allOffices = result;
        });
    }

    save(): void {
        this.saving = true;

        this._testResourcesServiceProxy
            .createOrEdit(this.testResource)
            .pipe(
                finalize(() => {
                    this.saving = false;
                })
            )
            .subscribe(() => {
                this.notify.info(this.l("SavedSuccessfully"));
                this.close();
                this.modalSave.emit(null);
            });
    }

    openSelectVehicleModal() {
        this.testResourceVehicleLookupTableModal.id = this.testResource.vehicleId;
        this.testResourceVehicleLookupTableModal.displayName = this.vehicleName;
        this.testResourceVehicleLookupTableModal.show();
    }

    setVehicleIdNull() {
        this.testResource.vehicleId = null;
        this.vehicleName = "";
    }

    getNewVehicleId() {
        this.testResource.vehicleId = this.testResourceVehicleLookupTableModal.id;
        this.vehicleName = this.testResourceVehicleLookupTableModal.displayName;
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
