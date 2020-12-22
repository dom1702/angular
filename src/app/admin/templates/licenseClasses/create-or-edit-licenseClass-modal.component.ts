import { Component, ViewChild, Injector, Output, EventEmitter} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { finalize } from 'rxjs/operators';
import { LicenseClassesServiceProxy, CreateOrEditLicenseClassDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as moment from 'moment';
import { FileUploader, FileUploaderOptions } from 'ng2-file-upload';
import { IAjaxResponse } from 'abp-ng2-module/dist/src/abpHttpInterceptor';
import { TokenService } from 'abp-ng2-module/dist/src/auth/token.service';
import { AppConsts } from '@shared/AppConsts';


@Component({
    selector: 'createOrEditLicenseClassModal',
    templateUrl: './create-or-edit-licenseClass-modal.component.html'
})
export class CreateOrEditLicenseClassModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal') modal: ModalDirective;


    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    licenseClass: CreateOrEditLicenseClassDto = new CreateOrEditLicenseClassDto();

    classImageUploader: FileUploader;

    constructor(
        injector: Injector,
        private _licenseClassesServiceProxy: LicenseClassesServiceProxy,
        private _tokenService: TokenService
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.initUploader();
    }

    initUploader() : void {
        this.classImageUploader = this.createUploader(
            '/TenantCustomization/UploadInvoiceLogo',
            result => {
                //this._tenantSettingsService.updateInvoiceLogoId(result.id);
                //this._tenantSettingsService.updateInvoiceLogoFileType(result.fileType);
                this.updateClassImageThumbnail();
            }
        );
    }

    createUploader(url: string, success?: (result: any) => void): FileUploader {
        const uploader = new FileUploader({ url: AppConsts.remoteServiceBaseUrl + url });

        uploader.onAfterAddingFile = (file) => {
            file.withCredentials = false;
        };

        uploader.onSuccessItem = (item, response, status) => {
            const ajaxResponse = <IAjaxResponse>JSON.parse(response);
            if (ajaxResponse.success) {
                this.notify.info(this.l('SavedSuccessfully'));
                if (success) {
                    success(ajaxResponse.result);
                }
            } else {
                this.message.error(ajaxResponse.error.message);
            }
        };

        const uploaderOptions: FileUploaderOptions = {};
        uploaderOptions.authToken = 'Bearer ' + this._tokenService.getToken();
        uploaderOptions.removeAfterUpload = true;
        uploader.setOptions(uploaderOptions);
        return uploader;
    }

    updateClassImageThumbnail()
    {
        // this._tenantSettingsService.getInvoiceLogo().subscribe((result: any) => {
        //     if(result == null)
        //     {
        //         this.invoiceLogo = null;
        //     }
        //     else
        //     {
        //        let objectURL = 'data:image/jpeg;base64,' + result;
        //         this.invoiceLogo = this.sanitizer.bypassSecurityTrustUrl(objectURL);
        //     }
        // });
    }

    show(licenseClassId?: number): void {

        if (!licenseClassId) {
            this.licenseClass = new CreateOrEditLicenseClassDto();
            this.licenseClass.id = licenseClassId;

            this.active = true;
            this.modal.show();
        } else {
            this._licenseClassesServiceProxy.getLicenseClassForEdit(licenseClassId).subscribe(result => {
                this.licenseClass = result.licenseClass;


                this.active = true;
                this.modal.show();
            });
        }
    }

    save(): void {
            this.saving = true;

			
            this._licenseClassesServiceProxy.createOrEdit(this.licenseClass)
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
