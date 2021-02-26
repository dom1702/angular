import { Component, ViewChild, Injector, Output, EventEmitter, ViewEncapsulation} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { GetAllTodosForLookupTableDto, TodosServiceProxy } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import {LazyLoadEvent} from 'primeng/api';
import {Paginator} from 'primeng/paginator';
import {Table} from 'primeng/table';

@Component({
    selector: 'todoLookupTableModal',
    styleUrls: ['./todo-lookup-table-modal.component.less'],
    encapsulation: ViewEncapsulation.None,
    templateUrl: './todo-lookup-table-modal.component.html'
})
export class TodoLookupTableModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal') modal: ModalDirective;
    @ViewChild('dataTable') dataTable: Table;
    @ViewChild('paginator') paginator: Paginator;

    filterText = '';
    id: number;
    title: string;
    orderNo: number;
    
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();
    active = false;
    saving = false;

    constructor(
        injector: Injector,
        private _todoServiceProxy: TodosServiceProxy
    ) {
        super(injector);
    }

    show(): void {
        this.active = true;
        this.paginator.rows = 5;
        this.getAll();
        this.modal.show();
    }

    getAll(event?: LazyLoadEvent) {
        if (!this.active) {
            return;
        }

        if (this.primengTableHelper.shouldResetPaging(event)) {
            this.paginator.changePage(0);
            return;
        }

        this.primengTableHelper.showLoadingIndicator();

        this._todoServiceProxy.getAllTodosForLookup(
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

    setAndSave(todo: GetAllTodosForLookupTableDto) {
        this.id = todo.id;
        this.title = todo.displayName;
        this.orderNo = todo.orderNo;
        this.modal.hide();
        this.modalSave.emit(null);
    }

    close(): void {
        this.active = false;
        this.modal.hide();
        this.modalSave.emit(null);
    }
}
