import { Component, ViewChild, Injector, Output, EventEmitter} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { EnrollmentsServiceProxy, CreateOrEditEnrollmentDto ,EnrollmentCourseLookupTableDto
					,EnrollmentOfficeLookupTableDto
					} from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as moment from 'moment';
import { DateTimeService } from '@app/shared/common/timing/date-time.service';

@Component({
    selector: 'createOrEditEnrollmentModal',
    templateUrl: './create-or-edit-enrollment-modal.component.html'
})
export class CreateOrEditEnrollmentModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    enrollment: CreateOrEditEnrollmentDto = new CreateOrEditEnrollmentDto();

    courseName = '';
    officeName = '';

	allCourses: EnrollmentCourseLookupTableDto[];
						allOffices: EnrollmentOfficeLookupTableDto[];
					
    constructor(
        injector: Injector,
        private _enrollmentsServiceProxy: EnrollmentsServiceProxy,
        private _dateTimeService: DateTimeService
    ) {
        super(injector);
    }

    show(enrollmentId?: number): void {

        if (!enrollmentId) {
            this.enrollment = new CreateOrEditEnrollmentDto();
            this.enrollment.id = enrollmentId;
            this.enrollment.enrollmentDate = this._dateTimeService.getStartOfDay();
            this.courseName = '';
            this.officeName = '';

            this.active = true;
            this.modal.show();
        } else {
            this._enrollmentsServiceProxy.getEnrollmentForEdit(enrollmentId).subscribe(result => {
                this.enrollment = result.enrollment;

                this.courseName = result.courseName;
                this.officeName = result.officeName;

                this.active = true;
                this.modal.show();
            });
        }
        this._enrollmentsServiceProxy.getAllCourseForTableDropdown().subscribe(result => {						
						this.allCourses = result;
					});
					this._enrollmentsServiceProxy.getAllOfficeForTableDropdown().subscribe(result => {						
						this.allOffices = result;
					});
					
    }

    save(): void {
            this.saving = true;

			
            this._enrollmentsServiceProxy.createOrEdit(this.enrollment)
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
