import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';
import { DrimaCommonModule } from '@shared/common/common.module';
import { FormsModule } from '@angular/forms';
import { ServiceProxyModule } from '@shared/service-proxies/service-proxy.module';
import { UtilsModule } from '@shared/utils/utils.module';
import { NgxCaptchaModule } from 'ngx-captcha';
import { ModalModule } from 'ngx-bootstrap/modal';

import { OAuthModule } from 'angular-oauth2-oidc';

import { LocaleMappingService } from '@shared/locale-mapping.service';
import { PasswordModule } from 'primeng/password';

import { AppBsModalModule } from '@shared/common/appBsModal/app-bs-modal.module';
import { EnrollmentComponent } from './enrollment.component';
import { InlineSVGModule } from 'ng-inline-svg';

export function getRecaptchaLanguage(): string {
    return new LocaleMappingService().map('recaptcha', abp.localization.currentLanguage.name);
}

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        HttpClientModule,
        HttpClientJsonpModule,
        NgxCaptchaModule,
        ModalModule.forRoot(),
        DrimaCommonModule,
        UtilsModule,
        ServiceProxyModule,
        OAuthModule.forRoot(),
        PasswordModule,
        AppBsModalModule,
        InlineSVGModule
    ],
    declarations: [
      
        EnrollmentComponent
    ],
    providers: [

    ]
})
export class EnrollmentModule {

}
