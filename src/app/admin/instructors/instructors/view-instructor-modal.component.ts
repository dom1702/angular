import { Component, ViewChild, Injector, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { GetInstructorForViewDto, InstructorDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'viewInstructorModal',
    templateUrl: './view-instructor-modal.component.html'
})
export class ViewInstructorModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    item: GetInstructorForViewDto;
    licenseClasses = 'None';

    constructor(
        injector: Injector
    ) {
        super(injector);
        this.item = new GetInstructorForViewDto();
        this.item.instructor = new InstructorDto();
        this.updateLicenseClass();
    }

    show(item: GetInstructorForViewDto): void {
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
        if(this.item.instructor.licenseClasses == null)
            return;

        for(var i = 0; i < this.item.instructor.licenseClasses.length; i++)
        {
            if(i == 0)
                this.licenseClasses = this.item.instructor.licenseClasses[i];
            else
                this.licenseClasses += ', ' + this.item.instructor.licenseClasses[i];
        }
    }
}
