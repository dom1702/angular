import { Component, ViewChild, Injector, Output, EventEmitter, OnInit } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { AppointmentsServiceProxy, CreateOrEditAppointmentDto, OwnAppointmentsServiceProxy } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TimepickerComponent } from 'ngx-bootstrap/timepicker';
import { StudentLookupTableModalComponent } from '@app/shared/common/lookup/student-lookup-table-modal.component';
import { InstructorLookupTableModalComponent } from '@app/shared/common/lookup/instructor-lookup-table-modal.component';
import { DateTimeService } from '@app/shared/common/timing/date-time.service';
import { DateTime } from 'luxon';

@Component({
    selector: 'createOrEditEventModal',
    templateUrl: './create-or-edit-event-modal.component.html',
})
export class CreateOrEditEventModalComponent extends AppComponentBase implements OnInit {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @ViewChild('studentLookupTableModal', { static: true }) studentLookupTableModal: StudentLookupTableModalComponent;
    @ViewChild('instructorLookupTableModal', { static: true }) instructorLookupTableModal: InstructorLookupTableModalComponent;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    ismeridian: boolean = false;

    active = false;
    saving = false;
    startTime: Date = new Date();
    endTime: Date = new Date();
    event: CreateOrEditAppointmentDto = new CreateOrEditAppointmentDto();

    currentInstructorFullName: string = '';

    studentFullName = '';
    studentFirstName = '';
    studentLastName = '';

    personId: number;
    isPersonalAppointment: boolean;

    personSelected: boolean;
    studentSelected: boolean;
    instructorSelected: boolean;
    userSelected: boolean;
    disallowPersonSelection: boolean;

    constructor(
        injector: Injector,
        private _appointmentsServiceProxy: AppointmentsServiceProxy,
        private _ownAppointmentsServiceProxy: OwnAppointmentsServiceProxy,
        private _dateTimeService: DateTimeService
    ) {
        super(injector);
    }

    ngOnInit() {
        this.ismeridian = false;
    }

    onItemSelect(item: any) {
        console.log(item);
    }

    onSelectAll(items: any) {
        console.log(items);
    }

    show(eventId?: number, isPersonalAppointment: boolean = false): void {

        this.isPersonalAppointment = isPersonalAppointment;

        if (isPersonalAppointment) {
            this.userSelected = true;
            this.personSelected = true;
            this.personId = 0;
            this.disallowPersonSelection = true;

            if (!eventId) {
                this.event = new CreateOrEditAppointmentDto();
                this.event.id = eventId;

                //this.endTime = new DateTime(this.startTime);
                //this.endTime.setHours(this.endTime.getHours() + 1);

                this.event.startTime = this._dateTimeService.getStartOfDay();
                this.event.endTime = this._dateTimeService.getStartOfDay().plus({ minutes: 60 });

                this.active = true;

                this.modal.show();
            } else {
                this._ownAppointmentsServiceProxy.getAppointmentForEdit(eventId).subscribe(result => {
                    this.event = result.appointment;
                   // this.startTime = result.appointment.startTime.toDate();
                   // this.endTime = result.appointment.endTime.toDate();
                    this.personId = result.appointment.personId;

                    this.active = true;
                    this.modal.show();
                });
            }
        }
        else {
            this.studentSelected = false;
            this.instructorSelected = false;
            this.userSelected = false;
            this.personSelected = false;
            this.personId = null;
            this.disallowPersonSelection = false;

            if (!eventId) {
                this.event = new CreateOrEditAppointmentDto();
                this.event.id = eventId;

              //  this.endTime = new Date(this.startTime);
               // this.endTime.setHours(this.endTime.getHours() + 1);

               // this.event.startTime = moment().startOf('day');
                //this.event.endTime = moment().startOf('day').add(60); '';

                this.active = true;

                this.modal.show();
            } else {
                this._appointmentsServiceProxy.getAppointmentForEdit(eventId).subscribe(result => {
                    this.event = result.appointment;
                  //  this.startTime = result.appointment.startTime.toDate();
                  //  this.endTime = result.appointment.endTime.toDate();
                    this.personId = result.appointment.personId;
                    this.personSelected = true;
                    this.disallowPersonSelection = true;

                    this.active = true;
                    this.modal.show();
                });
            }
        }
    }

    save(): void {
        this.saving = true;

       // this.event.startTime = moment(this.startTime);
       // this.event.endTime = moment(this.endTime);

       // this.event.startTime.hours(this.startTime.getHours());
       // this.event.startTime.minutes(this.startTime.getMinutes());
       // this.event.endTime.hours(this.endTime.getHours());
       // this.event.endTime.minutes(this.endTime.getMinutes());

        this.event.personId = this.personId;

        if (this.isPersonalAppointment) {
            this._ownAppointmentsServiceProxy.createOrEdit(this.event)
                .pipe(finalize(() => { this.saving = false; }))
                .subscribe(() => {
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                    this.modalSave.emit(null);
                });
        }
        else {
            this._appointmentsServiceProxy.createOrEdit(this.event)
                .pipe(finalize(() => { this.saving = false; }))
                .subscribe(() => {
                    this.notify.info(this.l('SavedSuccessfully'));
                    this.close();
                    this.modalSave.emit(null);
                });
        }
    }

    delete(): void {
        this.message.confirm(
            '',
            '',
            (isConfirmed) => {
                if (isConfirmed) {

                    if (this.isPersonalAppointment) {
                        this._ownAppointmentsServiceProxy.delete(this.event.id)
                        .subscribe(() => {
                            this.notify.success(this.l('SuccessfullyDeleted'));
                            this.close();
                            this.modalSave.emit(null);
                        });
                    }
                    else{
                    this._appointmentsServiceProxy.delete(this.event.id)
                        .subscribe(() => {
                            this.notify.success(this.l('SuccessfullyDeleted'));
                            this.close();
                            this.modalSave.emit(null);
                        });
                    }
                }
            }
        );
    }

    personTypeSelected(n: number) {
        if (n == 0) {
            this.studentSelected = true;
            this.instructorSelected = false;
            this.userSelected = false;
        }

        if (n == 1) {
            this.studentSelected = false;
            this.instructorSelected = true;
            this.userSelected = false;
        }

        if (n == 2) {
            this.studentSelected = false;
            this.instructorSelected = false;
            this.userSelected = true;
        }
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }

    setInstructorNull() {
        this.personId = null;
        this.currentInstructorFullName = '';
        this.personSelected = false;
    }


    getNewInstructorId() {
        this.personId = this.instructorLookupTableModal.id;

        if (this.personId != null) {
            this.currentInstructorFullName = this.instructorLookupTableModal.firstName + ' ' + this.instructorLookupTableModal.lastName;
            this.personSelected = true;
        }
        else {
            this.currentInstructorFullName = "";
        }
    }

    openSelectInstructorModal() {
        this.instructorLookupTableModal.show();
    }

    setStudentIdNull() {
        this.studentFirstName = '';
        this.studentLastName = '';
        this.personId = null;
        this.refreshStudentFullName();
        this.personSelected = false;
    }

    openSelectStudentModal() {
        this.studentLookupTableModal.firstName = this.studentFirstName;
        this.studentLookupTableModal.lastName = this.studentLastName;
        this.refreshStudentFullName();
        this.studentLookupTableModal.show();
    }

    getNewStudentId() {

        this.personId = this.studentLookupTableModal.id;

        if (this.personId != null) {
            this.studentFirstName = this.studentLookupTableModal.firstName;
            this.studentLastName = this.studentLookupTableModal.lastName;
            this.refreshStudentFullName();
            this.personSelected = true;
        }

        else {
            this.studentFirstName = "";
            this.studentLastName = "";
            this.refreshStudentFullName();
        }
    }

    refreshStudentFullName() {
        this.studentFullName = this.studentFirstName + ' ' + this.studentLastName;
    }
}
