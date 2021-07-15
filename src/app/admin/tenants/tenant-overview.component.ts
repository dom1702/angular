import { Component, Injector, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ImpersonationService } from '@app/admin/users/impersonation.service';
import { CommonLookupModalComponent } from '@app/shared/common/lookup/common-lookup-modal.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { AppComponentBase } from '@shared/common/app-component-base';
import { CommonLookupServiceProxy, EntityDtoOfInt64, FindUsersInput, GetStudentCourseBillingsFromTenantOutput, NameValueDto, StudentCourseBillingDto, TenantBillingServiceProxy, TenantListDto, TenantServiceProxy } from '@shared/service-proxies/service-proxies';
import { DateTime } from 'luxon';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { Table } from 'primeng/table';
import { CreateTenantModalComponent } from './create-tenant-modal.component';
import { EditTenantModalComponent } from './edit-tenant-modal.component';
import { TenantFeaturesModalComponent } from './tenant-features-modal.component';
import { EntityTypeHistoryModalComponent } from '@app/shared/common/entityHistory/entity-type-history-modal.component';
import { filter as _filter } from 'lodash-es';
import { finalize } from 'rxjs/operators';
import { DateTimeService } from '@app/shared/common/timing/date-time.service';
import { Subscription } from 'rxjs';

@Component({
    templateUrl: './tenant-overview.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class TenantOverviewComponent extends AppComponentBase implements OnInit {

    @ViewChild('impersonateUserLookupModal', {static: true}) impersonateUserLookupModal: CommonLookupModalComponent;
    @ViewChild('editTenantModal', {static: true}) editTenantModal: EditTenantModalComponent;
    @ViewChild('tenantFeaturesModal', {static: true}) tenantFeaturesModal: TenantFeaturesModalComponent;
    @ViewChild('entityTypeHistoryModal', {static: true}) entityTypeHistoryModal: EntityTypeHistoryModalComponent;

    _entityTypeFullName = 'Drima.MultiTenancy.Tenant';
    entityHistoryEnabled = false;

    subscription: Subscription;

    minDate : DateTime;
    maxDate : DateTime;
    studentCustomerId : string;

    studentCourseBillings : GetStudentCourseBillingsFromTenantOutput[];

    constructor(
        injector: Injector,
        private _tenantService: TenantServiceProxy,
        private _activatedRoute: ActivatedRoute,
        private _commonLookupService: CommonLookupServiceProxy,
        private _impersonationService: ImpersonationService,
        private _dateTimeService: DateTimeService,
        private _tenantBillingService : TenantBillingServiceProxy
    ) {
        super(injector);
    }


    ngOnInit(): void {
        // this.impersonateUserLookupModal.configure({
        //     title: this.l('SelectAUser'),
        //     dataSource: (skipCount: number, maxResultCount: number, filter: string, tenantId?: number) => {
        //         let input = new FindUsersInput();
        //         input.filter = filter;
        //         input.maxResultCount = maxResultCount;
        //         input.skipCount = skipCount;
        //         input.tenantId = tenantId;
        //         return this._commonLookupService.findUsers(input);
        //     }
        // });

        this.subscription = this._activatedRoute.params.subscribe(params => {

            const id = params['id'] || '';

           // var input : GetStudentCourseBillingsFromTenantInput;

             this._tenantBillingService.getStudentCourseBillingsFromTenant(id, this.minDate, this.maxDate, this.studentCustomerId).subscribe(result => {

                console.log(result);
                this.studentCourseBillings = result;
            //     this.student = result.student;

                // this.studentsUserAccountIsActive = result.userAccountIsActive;

                // this.title = this.l('StudentOverview') + " - " + this.student.firstName + " " + this.student.lastName + " (" + this.student.customerId + ")";

                // this.overallActive = true;

                // this._studentsServiceProxy.getAllCourses(this.student.id).subscribe(result => {

                //     this.studentCourses = result

                //     this.loading = false;

                //     if(this.studentCourses.length > 0)
                //     {
                //         this.selectedStudentCourse = this.studentCourses[0];

                //         // Emit manually once on start
                //         this.CallCourseChanged();
                        
                //         this.pricePackageName = this.selectedStudentCourse.pricePackageName;

                //         if(this.selectedStudentCourse.pricePackageModified)
                //             this.pricePackageName = this.pricePackageName + " ("+ this.l("ModifiedForThisStudentInfo") +")";
                //     }
                // });
             });
        });
    }

    private setIsEntityHistoryEnabled(): void {
        let customSettings = (abp as any).custom;
        this.entityHistoryEnabled = customSettings.EntityHistory && customSettings.EntityHistory.isEnabled && _filter(customSettings.EntityHistory.enabledEntities, entityType => entityType === this._entityTypeFullName).length === 1;
    }

    showUserImpersonateLookUpModal(record: any): void {
        this.impersonateUserLookupModal.tenantId = record.id;
        this.impersonateUserLookupModal.show();
    }

    unlockUser(record: any): void {
        this._tenantService.unlockTenantAdmin(new EntityDtoOfInt64({ id: record.id })).subscribe(() => {
            this.notify.success(this.l('UnlockedTenandAdmin', record.name));
        });
    }

    showHistory(tenant: TenantListDto): void {
        this.entityTypeHistoryModal.show({
            entityId: tenant.id.toString(),
            entityTypeFullName: this._entityTypeFullName,
            entityTypeDescription: tenant.tenancyName
        });
    }

    impersonateUser(item: NameValueDto): void {
        this._impersonationService
            .impersonate(
                parseInt(item.value),
                this.impersonateUserLookupModal.tenantId
            );
    }
}
