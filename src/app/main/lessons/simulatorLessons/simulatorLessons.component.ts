import { Component, Injector, ViewEncapsulation, ViewChild, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SimulatorLessonsServiceProxy, SimulatorLessonDto, SimulatorLessonState  } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';
import { CreateOrEditSimulatorLessonModalComponent } from './create-or-edit-simulatorLesson-modal.component';
import { ViewSimulatorLessonModalComponent } from './view-simulatorLesson-modal.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import {LazyLoadEvent} from 'primeng/api';
import {Paginator} from 'primeng/paginator';
import {Table} from 'primeng/table';
import { FileDownloadService } from '@shared/utils/file-download.service';
import * as _ from 'lodash';
import { DateTime } from 'luxon';
import { EntityTypeHistoryModalComponent } from '@app/shared/common/entityHistory/entity-type-history-modal.component';

@Component({
    templateUrl: './simulatorLessons.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class SimulatorLessonsComponent extends AppComponentBase implements OnInit{

    @ViewChild('createOrEditSimulatorLessonModal', { static: true }) createOrEditSimulatorLessonModal: CreateOrEditSimulatorLessonModalComponent;
    @ViewChild('viewSimulatorLessonModalComponent', { static: true }) viewSimulatorLessonModal: ViewSimulatorLessonModalComponent;
    @ViewChild('entityTypeHistoryModal', { static: true }) entityTypeHistoryModal: EntityTypeHistoryModalComponent;
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;

    advancedFiltersAreShown = false;
    filterText = '';
    maxStartTimeFilter : DateTime;
		minStartTimeFilter : DateTime;
    completedFilter = -1;
    topicFilter = '';
        personLastNameFilter = '';
        simulatorNameFilter = '';

        lessonState = SimulatorLessonState;

        _entityTypeFullName = 'Drima.Lessons.SimulatorLesson';
        entityHistoryEnabled = false;


    constructor(
        injector: Injector,
        private _simulatorLessonsServiceProxy: SimulatorLessonsServiceProxy,
        private _tokenAuth: TokenAuthServiceProxy,
        private _activatedRoute: ActivatedRoute,
        private _fileDownloadService: FileDownloadService
    ) {
        super(injector);
    }

    ngOnInit()
    {
        this.entityHistoryEnabled = this.setIsEntityHistoryEnabled();
    }

    private setIsEntityHistoryEnabled(): boolean {
        let customSettings = (abp as any).custom;
        return customSettings.EntityHistory && customSettings.EntityHistory.isEnabled && _.filter(customSettings.EntityHistory.enabledEntities, entityType => entityType === this._entityTypeFullName).length === 1;
    }

    getSimulatorLessons(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            return;
        }

        this.primengTableHelper.showLoadingIndicator();

        this._simulatorLessonsServiceProxy.getAll(
            this.filterText,
            this.maxStartTimeFilter,
            this.minStartTimeFilter,
            this.completedFilter,
            this.topicFilter,
            this.personLastNameFilter,
            this.simulatorNameFilter,
            this.primengTableHelper.getSorting(this.dataTable),
            this.primengTableHelper.getSkipCount(this.paginator, event),
            this.primengTableHelper.getMaxResultCount(this.paginator, event)
        ).subscribe(result => {
            this.primengTableHelper.totalRecordsCount = result.totalCount;
            this.primengTableHelper.records = result.items;
            console.log(result.items);
            this.primengTableHelper.hideLoadingIndicator();
        });
    }

    reloadPage(): void {
        this.paginator.changePage(this.paginator.getPage());
    }

    createSimulatorLesson(): void {
        this.createOrEditSimulatorLessonModal.show();
    }

    downloadFeedbackPdf(id : number) : void 
    {
        this._simulatorLessonsServiceProxy.downloadFeedbackPdf(id)
        .subscribe((result) => {
           
            this._fileDownloadService.downloadTempFile(result);
        });
    }

    deleteSimulatorLesson(simulatorLesson: SimulatorLessonDto): void {
        this.message.confirm(
            '',
            '',
            (isConfirmed) => {
                if (isConfirmed) {
                    this._simulatorLessonsServiceProxy.delete(simulatorLesson.id)
                        .subscribe(() => {
                            this.reloadPage();
                            this.notify.success(this.l('SuccessfullyDeleted'));
                        });
                }
            }
        );
    }

    showHistory(simulatorLesson: SimulatorLessonDto): void {
        this.entityTypeHistoryModal.show({
            entityId: simulatorLesson.id.toString(),
            entityTypeFullName: this._entityTypeFullName,
            entityTypeDescription: ''
        });
    }
}
