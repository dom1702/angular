import { Component, Injector, ViewEncapsulation, ViewChild, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StudentsServiceProxy, StudentDto, PricePackagesServiceProxy, PricePackageDto, StudentCourseDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { FileDownloadService } from '@shared/utils/file-download.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Subscription } from 'rxjs';
import { PricePackageLookupTableModalComponent } from './pricePackage-lookup-table-modal.component';
import { TableModule } from 'primeng/table';
import { CreateOrEditPricePackageModalComponent } from '@app/shared/common/sales/pricePackages/create-or-edit-pricePackage-modal.component';
import { StudentsOverviewComponent } from './students-overview.component';
import { ChangePricePackageModalComponent } from './change-price-package-modal.component';

@Component({
    selector: 'students-overview-pricePackage',
    templateUrl: './students-overview-pricePackage.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class StudentsOverviewPricePackageComponent extends AppComponentBase {

    @ViewChild('pricePackageLookupTableModal', { static: true }) pricePackageLookupTableModal: PricePackageLookupTableModalComponent;
    // This component is shared between this class and the price package admin part, maybe moving it into a shared folder?
    @ViewChild('createOrEditPricePackageModal', { static: true }) createOrEditPricePackageModal: CreateOrEditPricePackageModalComponent;
    @ViewChild('changePricePackageModal', { static: true }) changePricePackageModal: ChangePricePackageModalComponent;
    

    @Input() student: StudentDto;
    @Input() selectedStudentCourse: StudentCourseDto;
    @Input() parentOverview : StudentsOverviewComponent;

    pricePackage: PricePackageDto;

    pricePackageName: string = 'None';

    subscription : Subscription;
    
    loading : boolean;

    constructor(
        injector: Injector,
        private _studentsServiceProxy: StudentsServiceProxy,
        private _tokenAuth: TokenAuthServiceProxy,
        private _activatedRoute: ActivatedRoute,
        private _fileDownloadService: FileDownloadService,
        private _pricePackageServiceProxy: PricePackagesServiceProxy
    ) {
        super(injector);
    }

    ngOnInit(): void 
    {
       this.parentOverview.onPricePackagesTabSelected.subscribe(() => {

            this.refresh();

            this.subscription = this.parentOverview.courseChanged.subscribe(() =>
            {
                // At this point we need to wait a short time because Input variable student is not yet refreshed
                 setTimeout(() => {
                    this.refresh();
                }, 100);
            });
        });

        this.parentOverview.onPricePackagesTabDeselected.subscribe(() => {

            this.subscription.unsubscribe();
        });
    }

    refresh() : void{
 
        if (this.selectedStudentCourse.pricePackageId != null) {

            this.loading = true;
            this._pricePackageServiceProxy.getPricePackageForView(this.selectedStudentCourse.pricePackageId).subscribe(result => {

                this.pricePackage = result.pricePackage;
                this.pricePackageName = result.pricePackage.name;

                this.loading = false;
            });
        }
    }

    updatePricePackage(pricePackageId?: number) {

        this._pricePackageServiceProxy.getPricePackageForView(this.selectedStudentCourse.pricePackageId).subscribe(result => {

            this.pricePackage = result.pricePackage;
            this.pricePackageName = result.pricePackage.name;
        });

        this.parentOverview.UpdateStudentView();
    }

    updateAfterChangingPricePackage()
    {
        var newPricePackageId = this.changePricePackageModal.newPricePackageId;
        console.log(newPricePackageId);
        this._pricePackageServiceProxy.getPricePackageForView(newPricePackageId).subscribe(result => {

            this.pricePackage = result.pricePackage;
            this.pricePackageName = result.pricePackage.name;
        });

        this.parentOverview.UpdateStudentView();
    }

    changePricePackage()
    {
        this.changePricePackageModal.show(this.student.id, this.selectedStudentCourse.course.id, this.selectedStudentCourse.pricePackage);
    }

    editPricePackage() {
        this.createOrEditPricePackageModal.show(this.selectedStudentCourse.pricePackageId, true, false, false);
    }

    setPricePackageIdNull() {
        this.selectedStudentCourse.pricePackageId = null;
        this.pricePackageName = '';
    }

    openSelectPricePackageModal() {

        this.pricePackageLookupTableModal.id = this.selectedStudentCourse.pricePackageId;
        this.pricePackageLookupTableModal.displayName = this.pricePackageName;

        this.pricePackageLookupTableModal.show();
    }

    getNewPricePackageId() {

        this.selectedStudentCourse.pricePackageId = this.pricePackageLookupTableModal.id;
        this.pricePackageName = this.pricePackageLookupTableModal.displayName;
    }
}
