import { Component, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DrivingLessonTopicsServiceProxy, DrivingLessonTopicDto  } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';
import { CreateOrEditDrivingLessonTopicModalComponent } from './create-or-edit-drivingLessonTopic-modal.component';
import { ViewDrivingLessonTopicModalComponent } from './view-drivingLessonTopic-modal.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import {LazyLoadEvent} from 'primeng/api';
import {Paginator} from 'primeng/paginator';
import {Table} from 'primeng/table';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { EntityTypeHistoryModalComponent } from '@app/shared/common/entityHistory/entity-type-history-modal.component';
import * as _ from 'lodash';
import * as moment from 'moment';

@Component({
    templateUrl: './drivingLessonTopics.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class DrivingLessonTopicsComponent extends AppComponentBase {

    @ViewChild('createOrEditDrivingLessonTopicModal', { static: true }) createOrEditDrivingLessonTopicModal: CreateOrEditDrivingLessonTopicModalComponent;
    @ViewChild('viewDrivingLessonTopicModalComponent', { static: true }) viewDrivingLessonTopicModal: ViewDrivingLessonTopicModalComponent;
    @ViewChild('entityTypeHistoryModal', { static: true }) entityTypeHistoryModal: EntityTypeHistoryModalComponent;
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;

    advancedFiltersAreShown = false;
    filterText = '';
    topicFilter = '';


    _entityTypeFullName = 'Drima.Templates.DrivingLessonTopic';
    entityHistoryEnabled = false;

    constructor(
        injector: Injector,
        private _drivingLessonTopicsServiceProxy: DrivingLessonTopicsServiceProxy,
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

    getDrivingLessonTopics(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            return;
        }

        this.primengTableHelper.showLoadingIndicator();

        this._drivingLessonTopicsServiceProxy.getAll(
            this.filterText,
            this.topicFilter,
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

    createDrivingLessonTopic(): void {
        this.createOrEditDrivingLessonTopicModal.show();
    }

    showHistory(drivingLessonTopic: DrivingLessonTopicDto): void {
        this.entityTypeHistoryModal.show({
            entityId: drivingLessonTopic.id.toString(),
            entityTypeFullName: this._entityTypeFullName,
            entityTypeDescription: ''
        });
    }

    deleteDrivingLessonTopic(drivingLessonTopic: DrivingLessonTopicDto): void {
        this.message.confirm(
            '',
            '',
            (isConfirmed) => {
                if (isConfirmed) {
                    this._drivingLessonTopicsServiceProxy.delete(drivingLessonTopic.id)
                        .subscribe(() => {
                            this.reloadPage();
                            this.notify.success(this.l('SuccessfullyDeleted'));
                        });
                }
            }
        );
    }

    exportToExcel(): void {
        this._drivingLessonTopicsServiceProxy.getDrivingLessonTopicsToExcel(
        this.filterText,
            this.topicFilter,
        )
        .subscribe(result => {
            this._fileDownloadService.downloadTempFile(result);
         });
    }
}
