import { Component, ViewChild, Injector, Output, EventEmitter, OnInit, ViewEncapsulation, QueryList, ViewChildren, ChangeDetectorRef} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { TheoryLessonsServiceProxy, CreateOrEditTheoryLessonDto, InstructorDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { DLLicenseClassLookupTableModalComponent } from '@app/shared/common/lookup/drivingLesson-licenseClass-lookup-table-modal.component';
import {LazyLoadEvent} from 'primeng/api';
import {Paginator} from 'primeng/paginator';
import {Table} from 'primeng/table';
import { PrimengTableHelper } from '@shared/helpers/PrimengTableHelper';
import { Subscription } from 'rxjs';
import { DateTimeService } from '@app/shared/common/timing/date-time.service';
import { DateTime } from 'luxon';

@Component({
    selector: 'createOrEditTheoryLessonModal',
    encapsulation: ViewEncapsulation.None,
    templateUrl: './create-or-edit-theoryLesson-modal.component.html'
})
export class CreateOrEditTheoryLessonModalComponent extends AppComponentBase implements OnInit {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @ViewChild('licenseClassLookupTableModal', { static: true }) licenseClassLookupTableModal: DLLicenseClassLookupTableModalComponent;


    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    theoryLesson: CreateOrEditTheoryLessonDto = new CreateOrEditTheoryLessonDto();

    licenseClass = '';
    startTime: Date;

    startTimeTime : Date;

    dropdownListIds = [];
    dropdownList = [];
    selectedItems = [];
    dropdownSettings = {};
    placeholder = this.l('Select');

    theoryLessonId;

    primengTableHelper = new PrimengTableHelper();

    constructor(
        injector: Injector,
        private _theoryLessonsServiceProxy: TheoryLessonsServiceProxy,
        private _dateTimeService: DateTimeService
    ) {
        super(injector);
    }

    ngOnInit() 
    {
        this.dropdownSettings = {
            singleSelection: false,
            idField: 'item_id',
            textField: 'item_text',
            selectAllText: this.l('SelectAll'),
            unSelectAllText: this.l('UnselectAll'),
            allowSearchFilter: false,
            noDataAvailablePlaceholderText: this.l('NoData')
        };
    }

 

    show(theoryLessonId?: number, event?: LazyLoadEvent, startTime? : DateTime): void {

        this.theoryLessonId = theoryLessonId;

        if (!theoryLessonId) {
            this.theoryLesson = new CreateOrEditTheoryLessonDto();
            this.theoryLesson.id = theoryLessonId;

             if(startTime != null)
                 this.startTime = startTime.toJSDate();
             else
                 this.startTime = new Date();

            this.startTimeTime = new Date();

            this.licenseClass = '';

            this.active = true;
            this.updateInstructors(false);

            this.modal.show();
        } else {
            this._theoryLessonsServiceProxy.getTheoryLessonForEdit(theoryLessonId).subscribe(result => {
                this.theoryLesson = result.theoryLesson;

                this.licenseClass = result.theoryLesson.licenseClass;
                this.startTime = result.theoryLesson.startTime.toJSDate(); 

                this.startTimeTime = result.theoryLesson.startTime.toJSDate(); 

                this.active = true;
                this.updateInstructors(true);
                this.modal.show();
                //console.log(this.dataTable);
                //this.updateStudents(event);
            });
        }
    }

    save(): void {
        //console.log('save');
            this.saving = true;

            this.theoryLesson.instructors = [];

            this.startTime.setHours(this.startTimeTime.getHours());
            this.startTime.setMinutes(this.startTimeTime.getMinutes());
            this.theoryLesson.startTime = this._dateTimeService.fromJSDate(this.startTime);
  
            //this.theoryLesson.startTime.minute = this.startTimeTime.getMinutes();
            console.log(this.theoryLesson.startTime);

            for (var instructor of this.selectedItems)
            {
                var i = new InstructorDto();
                i.id = this.dropdownListIds[instructor.item_id];
                this.theoryLesson.instructors.push(
                    i
                );
              //  console.log(i.id);
            }

            this._theoryLessonsServiceProxy.createOrEdit(this.theoryLesson)
             .pipe(finalize(() => { this.saving = false;}))
             .subscribe(() => {

                // this._theoryLessonsServiceProxy.addStudentToLesson(input)
                // .subscribe(() => {
                //     this.updateStudents();
                //     this.reloadPage();
                //     this.notify.success(this.l('SavedSuccessfully'));
                // });

                this.notify.info(this.l('SavedSuccessfully'));
                this.close();
                this.modalSave.emit(null);
             });
    }

    updateInstructors(drivingLessonEdit : boolean ) : void
    {
      //  console.log(this.active);
        if (!this.active) {
            return;
        }

        //this.primengTableHelper.showLoadingIndicator();

        this._theoryLessonsServiceProxy.getAllInstructorForLookupTable(
            "",
            "",
            0,
            1000).subscribe(result => {
             //   console.log("in");
                // for(var r = 0; r < result.items.length; r++)
                //     console.log(result.items[r].id);
    
                this.dropdownList = [];
                this.dropdownListIds = [];
                this.selectedItems = [];

                for (var _i = 0; _i < result.items.length; _i++) 
                {   
                    this.dropdownList.push(
                    {
                        item_id: _i, 
                        item_text: result.items[_i].displayName
                    });

                    this.dropdownListIds.push(result.items[_i].id);
                }

                if(drivingLessonEdit)
                {
                    for (var item of this.dropdownList) {
                       // console.log(this.theoryLesson.instructors.length);
                        for (var instructor of this.theoryLesson.instructors) {
                           // console.log(instructor.id);
                           // console.log(this.dropdownListIds[item.item_id]);
                            if(this.dropdownListIds[item.item_id] == instructor.id)
                            {
                               // console.log("Add it now" + instructor.id);
                                this.selectedItems.push(
                                    {
                                        item_id: item.item_id,
                                        item_text: item.item_text
                                    }
                                );
                            }
                        }
                        
                    }

                    //console.log(this.selectedItems.length);
                }

                //this.primengTableHelper.hideLoadingIndicator();
            });
    }

        openSelectLicenseClassModal() {
        //this.theoryLessonLicenseClassLookupTableModal.id = this.theoryLesson.licenseClass;
        this.licenseClassLookupTableModal.displayName = this.licenseClass;
        this.licenseClassLookupTableModal.show();
    }

        setLicenseClassNull() {
        this.theoryLesson.licenseClass = null;
        this.licenseClass = '';
    }


        getNewLicenseClass() {
        this.theoryLesson.licenseClass = this.licenseClassLookupTableModal.displayName;
        this.licenseClass = this.licenseClassLookupTableModal.displayName;
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
