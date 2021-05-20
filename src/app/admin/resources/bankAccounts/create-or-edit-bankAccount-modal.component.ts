import { Component, ViewChild, Injector, Output, EventEmitter } from "@angular/core";
import { ModalDirective } from "ngx-bootstrap/modal";
import { finalize } from "rxjs/operators";
import { BankAccountsServiceProxy, CreateOrEditBankAccountDto } from "@shared/service-proxies/service-proxies";
import { AppComponentBase } from "@shared/common/app-component-base";
import { DateTime } from "luxon";

import { DateTimeService } from "@app/shared/common/timing/date-time.service";

@Component({
    selector: "createOrEditBankAccountModal",
    templateUrl: "./create-or-edit-bankAccount-modal.component.html",
})
export class CreateOrEditBankAccountModalComponent extends AppComponentBase {
    @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    bankAccount: CreateOrEditBankAccountDto = new CreateOrEditBankAccountDto();

    constructor(injector: Injector, private _bankAccountsServiceProxy: BankAccountsServiceProxy, private _dateTimeService: DateTimeService) {
        super(injector);
    }

    show(bankAccountId?: number): void {
        if (!bankAccountId) {
            this.bankAccount = new CreateOrEditBankAccountDto();
            this.bankAccount.id = bankAccountId;

            this.active = true;
            this.modal.show();
        } else {
            this._bankAccountsServiceProxy.getBankAccountForEdit(bankAccountId).subscribe((result) => {
                this.bankAccount = result.bankAccount;

                this.active = true;
                this.modal.show();
            });
        }
    }

    save(): void {
        this.saving = true;

        this._bankAccountsServiceProxy
            .createOrEdit(this.bankAccount)
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

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
