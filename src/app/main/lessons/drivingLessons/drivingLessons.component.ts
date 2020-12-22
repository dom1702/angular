import { Component, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Http } from '@angular/http';
import { DrivingLessonsServiceProxy, DrivingLessonDto  } from '@shared/service-proxies/service-proxies';
import { NotifyService } from '@abp/notify/notify.service';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';
import { CreateOrEditDrivingLessonModalComponent } from './create-or-edit-drivingLesson-modal.component';
import { ViewDrivingLessonModalComponent } from './view-drivingLesson-modal.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/components/table/table';
import { Paginator } from 'primeng/components/paginator/paginator';
import { LazyLoadEvent } from 'primeng/components/common/lazyloadevent';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { EntityTypeHistoryModalComponent } from '@app/shared/common/entityHistory/entity-type-history-modal.component';
import * as _ from 'lodash';
import * as moment from 'moment';

@Component({
    templateUrl: './drivingLessons.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class DrivingLessonsComponent extends AppComponentBase {

    @ViewChild('createOrEditDrivingLessonModal') createOrEditDrivingLessonModal: CreateOrEditDrivingLessonModalComponent;
    @ViewChild('viewDrivingLessonModalComponent') viewDrivingLessonModal: ViewDrivingLessonModalComponent;
    @ViewChild('entityTypeHistoryModal') entityTypeHistoryModal: EntityTypeHistoryModalComponent;
    @ViewChild('dataTable') dataTable: Table;
    @ViewChild('paginator') paginator: Paginator;

    advancedFiltersAreShown = false;
    filterText = '';
    maxLengthFilter : number;
		maxLengthFilterEmpty : number;
		minLengthFilter : number;
		minLengthFilterEmpty : number;
    maxStartTimeFilter : moment.Moment;
		minStartTimeFilter : moment.Moment;
    completedFilter = -1;
        drivingLessonTopicTopicFilter = '';
        licenseClassClassFilter = '';
        instructorFilter = '';

        


    _entityTypeFullName = 'Drima.Lessons.DrivingLesson';
    entityHistoryEnabled = false;

    constructor(
        injector: Injector,
        private _drivingLessonsServiceProxy: DrivingLessonsServiceProxy,
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

    getDrivingLessons(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            return;

           
        }

        this.primengTableHelper.showLoadingIndicator();
        console.log(this.primengTableHelper.defaultRecordsCountPerPage);
        this._drivingLessonsServiceProxy.getAll(
            this.filterText,
            this.maxLengthFilter == null ? this.maxLengthFilterEmpty: this.maxLengthFilter,
            this.minLengthFilter == null ? this.minLengthFilterEmpty: this.minLengthFilter,
            this.maxStartTimeFilter,
            this.minStartTimeFilter,
            this.completedFilter,
            this.drivingLessonTopicTopicFilter,
            this.licenseClassClassFilter,
            this.instructorFilter,
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

    createDrivingLesson(): void {
        this.createOrEditDrivingLessonModal.show();
    }

    showHistory(drivingLesson: DrivingLessonDto): void {
        this.entityTypeHistoryModal.show({
            entityId: drivingLesson.id.toString(),
            entityTypeFullName: this._entityTypeFullName,
            entityTypeDescription: ''
        });
    }

    deleteDrivingLesson(drivingLesson: DrivingLessonDto): void {
        this.message.confirm(
            '',
            (isConfirmed) => {
                if (isConfirmed) {
                    this._drivingLessonsServiceProxy.delete(drivingLesson.id)
                        .subscribe(() => {
                            this.reloadPage();
                            this.notify.success(this.l('SuccessfullyDeleted'));
                        });
                }
            }
        );
    }

    exportToExcel(): void {
        this._drivingLessonsServiceProxy.getDrivingLessonsToExcel(
        this.filterText,
            this.maxLengthFilter == null ? this.maxLengthFilterEmpty: this.maxLengthFilter,
            this.minLengthFilter == null ? this.minLengthFilterEmpty: this.minLengthFilter,
            this.maxStartTimeFilter,
            this.minStartTimeFilter,
            this.completedFilter,
            this.drivingLessonTopicTopicFilter,
            this.licenseClassClassFilter,
        )
        .subscribe(result => {
            this._fileDownloadService.downloadTempFile(result);
         });
    }
}
