import { Component, ViewChild, Injector, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { GetStudentForViewDto, StudentDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'viewStudentModal',
    templateUrl: './view-student-modal.component.html'
})
export class ViewStudentModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    item: GetStudentForViewDto;
    licenseClasses = 'None';

    constructor(
        injector: Injector
    ) {
        super(injector);
        this.item = new GetStudentForViewDto();
        this.item.student = new StudentDto();
        this.updateLicenseClass();
    }

    show(item: GetStudentForViewDto): void {
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
        if(this.item.student.licenseClasses == null)
            return;

        for(var i = 0; i < this.item.student.licenseClasses.length; i++)
        {
            if(i == 0)
                this.licenseClasses = this.item.student.licenseClasses[i];
            else
                this.licenseClasses += ', ' + this.item.student.licenseClasses[i];
        }
    }
}
