import { Component, ViewChild, Injector, Output, EventEmitter, OnInit } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { SendEmailToStudentInput, StudentsServiceProxy } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';


@Component({
    selector: 'sendMessageToStudentModal',
    templateUrl: './send-message-to-student-modal.component.html'
})
export class SendMessageToStudentModalComponent extends AppComponentBase implements OnInit {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    sending = false;

    studentId;
    messageToSend : string = '';
    sendToMail : string = '';

    constructor(
        injector: Injector,
        private _studentsServiceProxy: StudentsServiceProxy,
    ) {
        super(injector);
    }

    ngOnInit() {
       
    }

    show(studentId : number, email : string): void {
        this.messageToSend = '';
        this.studentId = studentId;
        this.sendToMail = email;
        this.active = true;
        this.sending = false;
        this.modal.show();
    }

    send(): void {
        var input = new SendEmailToStudentInput();
        input.studentId = this.studentId;
        input.message = this.messageToSend;
        this._studentsServiceProxy.sendEmailToStudent(input).subscribe(result => {
            this.sending = true;
            this.close();
        });
    }

    close(): void {

        this.active = false;
        this.modal.hide();
    }
}
