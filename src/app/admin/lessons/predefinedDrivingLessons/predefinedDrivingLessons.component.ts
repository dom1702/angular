import { Component, Injector, ViewEncapsulation, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PredefinedDrivingLessonsServiceProxy, PredefinedDrivingLessonDto  } from '@shared/service-proxies/service-proxies';
import { NotifyService } from '@abp/notify/notify.service';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';
import { CreateOrEditPredefinedDrivingLessonModalComponent } from './create-or-edit-predefinedDrivingLesson-modal.component';
import { ViewPredefinedDrivingLessonModalComponent } from './view-predefinedDrivingLesson-modal.component';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { Table } from 'primeng/components/table/table';
import { Paginator } from 'primeng/components/paginator/paginator';
import { LazyLoadEvent } from 'primeng/components/common/lazyloadevent';
import { FileDownloadService } from '@shared/utils/file-download.service';
import * as _ from 'lodash';
import * as moment from 'moment';

@Component({
    templateUrl: './predefinedDrivingLessons.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class PredefinedDrivingLessonsComponent extends AppComponentBase {

    @ViewChild('createOrEditPredefinedDrivingLessonModal') createOrEditPredefinedDrivingLessonModal: CreateOrEditPredefinedDrivingLessonModalComponent;
    @ViewChild('viewPredefinedDrivingLessonModalComponent') viewPredefinedDrivingLessonModal: ViewPredefinedDrivingLessonModalComponent;
    @ViewChild('dataTable') dataTable: Table;
    @ViewChild('paginator') paginator: Paginator;

    advancedFiltersAreShown = false;
    filterText = '';




    constructor(
        injector: Injector,
        private _predefinedDrivingLessonsServiceProxy: PredefinedDrivingLessonsServiceProxy,
        private _notifyService: NotifyService,
        private _tokenAuth: TokenAuthServiceProxy,
        private _activatedRoute: ActivatedRoute,
        private _fileDownloadService: FileDownloadService
    ) {
        super(injector);
    }

    getPredefinedDrivingLessons(event?: LazyLoadEvent) {
        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            return;
        }

        this.primengTableHelper.showLoadingIndicator();

        this._predefinedDrivingLessonsServiceProxy.getAll(
            this.filterText,
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

    createPredefinedDrivingLesson(): void {
        this.createOrEditPredefinedDrivingLessonModal.show();
    }

    deletePredefinedDrivingLesson(predefinedDrivingLesson: PredefinedDrivingLessonDto): void {
        this.message.confirm(
            '',
            this.l('AreYouSure'),
            (isConfirmed) => {
                if (isConfirmed) {
                    this._predefinedDrivingLessonsServiceProxy.delete(predefinedDrivingLesson.id)
                        .subscribe(() => {
                            this.reloadPage();
                            this.notify.success(this.l('SuccessfullyDeleted'));
                        });
                }
            }
        );
    }
}
