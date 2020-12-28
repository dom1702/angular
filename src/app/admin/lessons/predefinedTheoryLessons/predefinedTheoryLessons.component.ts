import { Component, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PredefinedTheoryLessonsServiceProxy, PredefinedTheoryLessonDto  } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';
import { CreateOrEditPredefinedTheoryLessonModalComponent } from './create-or-edit-predefinedTheoryLesson-modal.component';
import { ViewPredefinedTheoryLessonModalComponent } from './view-predefinedTheoryLesson-modal.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import {LazyLoadEvent} from 'primeng/api';
import {Paginator} from 'primeng/paginator';
import {Table} from 'primeng/table';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { EntityTypeHistoryModalComponent } from '@app/shared/common/entityHistory/entity-type-history-modal.component';
import * as _ from 'lodash';

@Component({
    templateUrl: './predefinedTheoryLessons.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class PredefinedTheoryLessonsComponent extends AppComponentBase {

    @ViewChild('createOrEditPredefinedTheoryLessonModal', { static: true }) createOrEditPredefinedTheoryLessonModal: CreateOrEditPredefinedTheoryLessonModalComponent;
    @ViewChild('viewPredefinedTheoryLessonModalComponent', { static: true }) viewPredefinedTheoryLessonModal: ViewPredefinedTheoryLessonModalComponent;
    @ViewChild('entityTypeHistoryModal', { static: true }) entityTypeHistoryModal: EntityTypeHistoryModalComponent;
    @ViewChild('dataTable', { static: true }) dataTable: Table;
    @ViewChild('paginator', { static: true }) paginator: Paginator;

    advancedFiltersAreShown = false;
    filterText = '';
    nameFilter = '';
    maxLengthFilter : number;
		maxLengthFilterEmpty : number;
		minLengthFilter : number;
		minLengthFilterEmpty : number;


    _entityTypeFullName = 'Drima.Lessons.PredefinedTheoryLesson';
    entityHistoryEnabled = false;

    constructor(
        injector: Injector,
        private _predefinedTheoryLessonsServiceProxy: PredefinedTheoryLessonsServiceProxy,
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
        return this.isGrantedAny('Pages.Administration.AuditLogs') && customSettings.EntityHistory && customSettings.EntityHistory.isEnabled && _.filter(customSettings.EntityHistory.enabledEntities, entityType => entityType === this._entityTypeFullName).length === 1;
    }

    getPredefinedTheoryLessons(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            return;
        }

        this.primengTableHelper.showLoadingIndicator();

        this._predefinedTheoryLessonsServiceProxy.getAll(
            this.filterText,
            this.nameFilter,
            this.maxLengthFilter == null ? this.maxLengthFilterEmpty: this.maxLengthFilter,
            this.minLengthFilter == null ? this.minLengthFilterEmpty: this.minLengthFilter,
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

    createPredefinedTheoryLesson(): void {
        this.createOrEditPredefinedTheoryLessonModal.show();
    }

    showHistory(predefinedTheoryLesson: PredefinedTheoryLessonDto): void {
        this.entityTypeHistoryModal.show({
            entityId: predefinedTheoryLesson.id.toString(),
            entityTypeFullName: this._entityTypeFullName,
            entityTypeDescription: ''
        });
    }

    deletePredefinedTheoryLesson(predefinedTheoryLesson: PredefinedTheoryLessonDto): void {
        this.message.confirm(
            '',
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this._predefinedTheoryLessonsServiceProxy.delete(predefinedTheoryLesson.id)
                        .subscribe(() => {
                            this.reloadPage();
                            this.notify.success(this.l('SuccessfullyDeleted'));
                        });
                }
            }
        );
    }
}
