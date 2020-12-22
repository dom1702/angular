import { Component, ViewChild, Injector, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { GetTheoryLessonForViewDto, TheoryLessonDto, TheoryLessonsServiceProxy } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';

@Component({
    selector: 'viewTheoryLessonModal',
    templateUrl: './view-theoryLesson-modal.component.html'
})
export class ViewTheoryLessonModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal') modal: ModalDirective;
    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    item: GetTheoryLessonForViewDto;
    instructorList : string;
    studentList : string;
    topic : string;




    constructor(
        injector: Injector,
        private _theoryLessonsServiceProxy: TheoryLessonsServiceProxy
    ) {
        super(injector);
        this.item = new GetTheoryLessonForViewDto();
        this.item.theoryLesson = new TheoryLessonDto();
    }

    show(item: GetTheoryLessonForViewDto): void 
    {
        this._theoryLessonsServiceProxy.getTheoryLessonForView(item.theoryLesson.id).subscribe(result => {
            
            this.item = result;
            
            if(this.item.instructors != null && this.item.instructors.length > 0)
            {
                for(var i = 0; i < this.item.instructors.length; i++)
                {
                    if(i == 0)
                        this.instructorList = this.item.instructors[i].firstName + ' ' + this.item.instructors[i].lastName;
                    else
                    this.instructorList += ', ' + this.item.instructors[i].firstName + ' ' + this.item.instructors[i].lastName;
                }
            }
            else
            {
                this.instructorList = '-';
            }

            if(this.item.studentNames != null && this.item.studentNames.length > 0)
            {
                for(var i = 0; i < this.item.studentNames.length; i++)
                {
                    if(i == 0)
                        this.studentList = this.item.studentNames[i];
                    else
                    this.studentList += ', ' + this.item.studentNames[i];
                }
            }
            else
            {
                this.studentList = '-';
            }

            if(this.item.theoryLesson.topic != '')
                this.topic = this.item.theoryLesson.topic;
            else
                this.topic = '-';
            
            this.active = true;
            this.modal.show();
        });
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }
}
