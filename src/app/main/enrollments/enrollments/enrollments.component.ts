import { Component, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EnrollmentsServiceProxy, EnrollmentDto, GetEnrollmentForViewDto, ApproveEnrollmentInput, DenyEnrollmentInput, RevertEnrollmentInput  } from '@shared/service-proxies/service-proxies';
import { NotifyService } from '@abp/notify/notify.service';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';
import { CreateOrEditEnrollmentModalComponent } from './create-or-edit-enrollment-modal.component';
import { ViewEnrollmentModalComponent } from './view-enrollment-modal.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/components/table/table';
import { Paginator } from 'primeng/components/paginator/paginator';
import { LazyLoadEvent } from 'primeng/components/common/lazyloadevent';
import { FileDownloadService } from '@shared/utils/file-download.service';
import * as _ from 'lodash';
import * as moment from 'moment';

@Component({
    templateUrl: './enrollments.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class EnrollmentsComponent extends AppComponentBase {

    @ViewChild('createOrEditEnrollmentModal') createOrEditEnrollmentModal: CreateOrEditEnrollmentModalComponent;
    @ViewChild('viewEnrollmentModalComponent') viewEnrollmentModal: ViewEnrollmentModalComponent;
    @ViewChild('dataTable') dataTable: Table;
    @ViewChild('paginator') paginator: Paginator;

    @ViewChild('newDataTable') newDataTable: Table;

    newRecords : any[];

    advancedFiltersAreShown = false;
    filterText = '';
    firstNameFilter = '';
    lastNameFilter = '';
    socialSecurityNoFilter = '';
    payersSocialSecurityNoFilter = '';
    payersNameFilter = '';
    licenseClassFilter = '';
    approvedFilter = -1;
    maxEnrollmentDateFilter : moment.Moment;
		minEnrollmentDateFilter : moment.Moment;
        courseNameFilter = '';
        officeNameFilter = '';




    constructor(
        injector: Injector,
        private _enrollmentsServiceProxy: EnrollmentsServiceProxy,
        private _notifyService: NotifyService,
        private _tokenAuth: TokenAuthServiceProxy,
        private _activatedRoute: ActivatedRoute,
        private _fileDownloadService: FileDownloadService
    ) {
        super(injector);
    }

    getEnrollments(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            return;
        }

        this.primengTableHelper.showLoadingIndicator();

        this._enrollmentsServiceProxy.getAll(
            this.filterText,
            this.firstNameFilter,
            this.lastNameFilter,
            this.socialSecurityNoFilter,
            this.payersSocialSecurityNoFilter,
            this.payersNameFilter,
            this.licenseClassFilter,
            this.approvedFilter,
            this.maxEnrollmentDateFilter,
            this.minEnrollmentDateFilter,
            this.courseNameFilter,
            this.officeNameFilter,
            false,
            this.primengTableHelper.getSorting(this.dataTable),
            this.primengTableHelper.getSkipCount(this.paginator, event),
            this.primengTableHelper.getMaxResultCount(this.paginator, event)
        ).subscribe(result => {
            this.primengTableHelper.totalRecordsCount = result.totalCount;
            this.primengTableHelper.records = result.items;
         
            this.getUnapprovedEnrollments();
            this.primengTableHelper.hideLoadingIndicator();
        });
    }

    getUnapprovedEnrollments()
    {
        this.newRecords = [];

        for(var r of this.primengTableHelper.records)
        {
            if(!r.enrollment.approved && !r.enrollment.denied)
                this.newRecords.push(r);
        }

        // var otherRecords = [];

        // for(var r of this.primengTableHelper.records)
        // {
        //     if(r.enrollment.approved || r.enrollment.denied)
        //         otherRecords.push(r);
        // }

        // this.primengTableHelper.records = [];
        // this.primengTableHelper.records = Array.from(otherRecords);
        // this.primengTableHelper.totalRecordsCount = this.primengTableHelper.records.length;
    }   

    reloadPage(): void {
        this.paginator.changePage(this.paginator.getPage());
    }

    createEnrollment(): void {
        this.createOrEditEnrollmentModal.show();
    }

    revertEnrollment(enrollment: EnrollmentDto): void {
        this.message.confirm(
            '',
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    var input : RevertEnrollmentInput = new RevertEnrollmentInput();
                    input.enrollment = enrollment;
                    this._enrollmentsServiceProxy.revertEnrollment(input)
                        .subscribe((result) => {

                            if(result.revertSuccessfull)
                            {
                                this.reloadPage();
                                this.notify.success(this.l('SuccessfullyReverted'));
                            }
                            else
                            {
                                this.notify.error(this.l('NoReversionPossibleDueToTime'));
                            }
                        });
                }
            }
        );
    }

    approveEnrollment(item: GetEnrollmentForViewDto)
    {
        this.message.confirm(
            'Do you really want to approve this enrollment?',
            'Approving',
            (isConfirmed) => {
                if (isConfirmed) {
                    console.log("YES");
                    var input : ApproveEnrollmentInput = new ApproveEnrollmentInput();
                    input.enrollment = item.enrollment;
            
                    this._enrollmentsServiceProxy.approveEnrollment(input).subscribe(result => 
                        {
                            console.log(result.newStudentCreated);
                            console.log(result.studentAlreadyExisted);
                            this.reloadPage();
                        });

                 
                }
            }
        );
        
    }

    denyEnrollment(item: GetEnrollmentForViewDto)
    {
        this.message.confirm(
            'Do you really want to approve this enrollment?',
            'Approving',
            (isConfirmed) => {
                if (isConfirmed) {
                    var input : DenyEnrollmentInput = new DenyEnrollmentInput();
                    input.enrollment = item.enrollment;
            
                    this._enrollmentsServiceProxy.denyEnrollment(input).subscribe(result => 
                        {
                            this.reloadPage();
                        });

                   
                }
            }
        );
       
    }

    exportToExcel(): void {
        this._enrollmentsServiceProxy.getEnrollmentsToExcel(
        this.filterText,
            this.firstNameFilter,
            this.lastNameFilter,
            this.socialSecurityNoFilter,
            this.payersSocialSecurityNoFilter,
            this.payersNameFilter,
            this.licenseClassFilter,
            this.approvedFilter,
            this.maxEnrollmentDateFilter,
            this.minEnrollmentDateFilter,
            this.courseNameFilter,
            this.officeNameFilter,
        )
        .subscribe(result => {
            this._fileDownloadService.downloadTempFile(result);
         });
    }
}
