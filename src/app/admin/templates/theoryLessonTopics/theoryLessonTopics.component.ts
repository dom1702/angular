import { Component, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Http } from '@angular/http';
import { TheoryLessonTopicsServiceProxy, TheoryLessonTopicDto  } from '@shared/service-proxies/service-proxies';
import { NotifyService } from '@abp/notify/notify.service';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';
import { CreateOrEditTheoryLessonTopicModalComponent } from './create-or-edit-theoryLessonTopic-modal.component';
import { ViewTheoryLessonTopicModalComponent } from './view-theoryLessonTopic-modal.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/components/table/table';
import { Paginator } from 'primeng/components/paginator/paginator';
import { LazyLoadEvent } from 'primeng/components/common/lazyloadevent';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { EntityTypeHistoryModalComponent } from '@app/shared/common/entityHistory/entity-type-history-modal.component';
import * as _ from 'lodash';
import * as moment from 'moment';

@Component({
    templateUrl: './theoryLessonTopics.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class TheoryLessonTopicsComponent extends AppComponentBase {

    @ViewChild('createOrEditTheoryLessonTopicModal') createOrEditTheoryLessonTopicModal: CreateOrEditTheoryLessonTopicModalComponent;
    @ViewChild('viewTheoryLessonTopicModalComponent') viewTheoryLessonTopicModal: ViewTheoryLessonTopicModalComponent;
    @ViewChild('entityTypeHistoryModal') entityTypeHistoryModal: EntityTypeHistoryModalComponent;
    @ViewChild('dataTable') dataTable: Table;
    @ViewChild('paginator') paginator: Paginator;

    advancedFiltersAreShown = false;
    filterText = '';
    topicFilter = '';


    _entityTypeFullName = 'Drima.Templates.TheoryLessonTopic';
    entityHistoryEnabled = false;

    constructor(
        injector: Injector,
        private _theoryLessonTopicsServiceProxy: TheoryLessonTopicsServiceProxy,
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

    getTheoryLessonTopics(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            return;
        }

        this.primengTableHelper.showLoadingIndicator();

        this._theoryLessonTopicsServiceProxy.getAll(
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

    createTheoryLessonTopic(): void {
        this.createOrEditTheoryLessonTopicModal.show();
    }

    showHistory(theoryLessonTopic: TheoryLessonTopicDto): void {
        this.entityTypeHistoryModal.show({
            entityId: theoryLessonTopic.id.toString(),
            entityTypeFullName: this._entityTypeFullName,
            entityTypeDescription: ''
        });
    }

    deleteTheoryLessonTopic(theoryLessonTopic: TheoryLessonTopicDto): void {
        this.message.confirm(
            '',
            (isConfirmed) => {
                if (isConfirmed) {
                    this._theoryLessonTopicsServiceProxy.delete(theoryLessonTopic.id)
                        .subscribe(() => {
                            this.reloadPage();
                            this.notify.success(this.l('SuccessfullyDeleted'));
                        });
                }
            }
        );
    }

    exportToExcel(): void {
        this._theoryLessonTopicsServiceProxy.getTheoryLessonTopicsToExcel(
        this.filterText,
            this.topicFilter,
        )
        .subscribe(result => {
            this._fileDownloadService.downloadTempFile(result);
         });
    }
}
