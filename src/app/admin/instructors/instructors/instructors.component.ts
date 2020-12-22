import { Component, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Http } from '@angular/http';
import { InstructorsServiceProxy, InstructorDto  } from '@shared/service-proxies/service-proxies';
import { NotifyService } from '@abp/notify/notify.service';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';
import { CreateOrEditInstructorModalComponent } from './create-or-edit-instructor-modal.component';
import { ViewInstructorModalComponent } from './view-instructor-modal.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/components/table/table';
import { Paginator } from 'primeng/components/paginator/paginator';
import { LazyLoadEvent } from 'primeng/components/common/lazyloadevent';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { EntityTypeHistoryModalComponent } from '@app/shared/common/entityHistory/entity-type-history-modal.component';
import * as _ from 'lodash';
import * as moment from 'moment';
import { CreateOrEditInstructorUserModalComponent } from './create-or-edit-instructor-user-modal.component';

@Component({
    templateUrl: './instructors.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class InstructorsComponent extends AppComponentBase {

    @ViewChild('createOrEditInstructorModal') createOrEditInstructorModal: CreateOrEditInstructorModalComponent;
    @ViewChild('viewInstructorModalComponent') viewInstructorModal: ViewInstructorModalComponent;
    @ViewChild('entityTypeHistoryModal') entityTypeHistoryModal: EntityTypeHistoryModalComponent;
    @ViewChild('dataTable') dataTable: Table;
    @ViewChild('paginator') paginator: Paginator;

    @ViewChild('createOrEditInstructorUserModal') createOrEditInstructorUserModal: CreateOrEditInstructorUserModalComponent;

    advancedFiltersAreShown = false;
    filterText = '';
    firstNameFilter = '';
    lastNameFilter = '';
    maxDateOfBirthFilter : moment.Moment;
		minDateOfBirthFilter : moment.Moment;
    cityFilter = '';
    zipCodeFilter = '';
    stateFilter = '';
    countryFilter = '';
        licenseClassClassFilter = '';


    _entityTypeFullName = 'Drima.Instructors.Instructor';
    entityHistoryEnabled = false;

    constructor(
        injector: Injector,
        private _instructorsServiceProxy: InstructorsServiceProxy,
        private _notifyService: NotifyService,
        private _tokenAuth: TokenAuthServiceProxy,
        private _activatedRoute: ActivatedRoute,
        private _fileDownloadService: FileDownloadService
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.entityHistoryEnabled = this.setIsEntityHistoryEnabled();
    }

    private setIsEntityHistoryEnabled(): boolean {
        let customSettings = (abp as any).custom;
        return customSettings.EntityHistory && customSettings.EntityHistory.isEnabled && _.filter(customSettings.EntityHistory.enabledEntities, entityType => entityType === this._entityTypeFullName).length === 1;
    }

    getInstructors(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            return;
        }

        this.primengTableHelper.showLoadingIndicator();

        this._instructorsServiceProxy.getAll(
            this.filterText,
            this.firstNameFilter,
            this.lastNameFilter,
            this.maxDateOfBirthFilter,
            this.minDateOfBirthFilter,
            this.cityFilter,
            this.zipCodeFilter,
            this.stateFilter,
            this.countryFilter,
            this.licenseClassClassFilter,
            this.primengTableHelper.getSorting(this.dataTable),
            this.primengTableHelper.getSkipCount(this.paginator, event),
            this.primengTableHelper.getMaxResultCount(this.paginator, event)
        ).subscribe(result => {
            this.primengTableHelper.totalRecordsCount = result.totalCount;
            this.primengTableHelper.records = result.items;
            this.primengTableHelper.hideLoadingIndicator();
        });
    }

    reloadPage(): void {
        this.paginator.changePage(this.paginator.getPage());
    }

    createInstructor(): void {
        this.createOrEditInstructorModal.show();
    }

    showHistory(instructor: InstructorDto): void {
        this.entityTypeHistoryModal.show({
            entityId: instructor.id.toString(),
            entityTypeFullName: this._entityTypeFullName,
            entityTypeDescription: ''
        });
    }

    deleteInstructor(instructor: InstructorDto): void {
        this.message.confirm(
            '',
            (isConfirmed) => {
                if (isConfirmed) {
                    this._instructorsServiceProxy.delete(instructor.id)
                        .subscribe(() => {
                            this.reloadPage();
                            this.notify.success(this.l('SuccessfullyDeleted'));
                        });
                }
            }
        );
    }

    exportToExcel(): void {
        this._instructorsServiceProxy.getInstructorsToExcel(
        this.filterText,
            this.firstNameFilter,
            this.lastNameFilter,
            this.maxDateOfBirthFilter,
            this.minDateOfBirthFilter,
            this.cityFilter,
            this.zipCodeFilter,
            this.stateFilter,
            this.countryFilter,
            this.licenseClassClassFilter,
        )
        .subscribe(result => {
            this._fileDownloadService.downloadTempFile(result);
         });
    }

    createUserAccount(instructor : InstructorDto): void {
        this.createOrEditInstructorUserModal.show(instructor.lastName, instructor.firstName, instructor.email, instructor);
    }

    userAccountCreated()
    {
        this.reloadPage();
    }
}
