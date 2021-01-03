import { NgModule } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { AppUiCustomizationService } from '@shared/common/ui/app-ui-customization.service';
import { EnrollmentComponent } from './enrollment.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: EnrollmentComponent,
                children: [

                    { path: '**', redirectTo: '' }
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class EnrollmentRoutingModule {
    constructor(
        private router: Router,
        private _uiCustomizationService: AppUiCustomizationService
    ) {
       
    }

}
