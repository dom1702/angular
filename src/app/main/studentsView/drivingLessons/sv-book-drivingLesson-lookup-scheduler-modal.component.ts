import { Component, ViewChild, Injector } from "@angular/core";
import { AppComponentBase } from "@shared/common/app-component-base";
import { EventSettingsModel, View, PopupOpenEventArgs, CellClickEventArgs, NavigatingEventArgs, EventRenderedArgs, ActionEventArgs } from "@syncfusion/ej2-schedule";
import * as moment from 'moment';
import { ModalDirective } from 'ngx-bootstrap';
import { ScheduleComponent, WeekService, TimelineViewsService, TimelineMonthService } from "@syncfusion/ej2-angular-schedule";

@Component({
    selector: 'svBookDrivingLessonLookupSchedulerModal',
    templateUrl: './sv-book-drivingLesson-lookup-scheduler-modal.component.html',
    providers: [WeekService, TimelineViewsService, TimelineMonthService]
})

export class SVBookDrivingLessonLookupSchedulerModalComponent extends AppComponentBase {
    
    @ViewChild('schedulerModal') 
    modal: ModalDirective;

    @ViewChild('scheduleObj')
    scheduleObj: ScheduleComponent;
  
    active = false;
    showWeekNumber = true;

    public currentView: View = 'Week';
    
    public eventSettings: EventSettingsModel = {
        dataSource:  [{
            Id: 0,
            Subject: "Theorey Lesson 1",
            StartTime: moment().startOf('day').toDate(),
            EndTime: moment().startOf('day').add(1, 'hour').toDate(),
            AppointmentType: "0"
        },
        {
            Id: 1,
            Subject: "Theorey Lesson 2",
            StartTime: moment().startOf('day').add(2, 'day').toDate(),
            EndTime: moment().startOf('day').add(2, 'day').add(1, 'hour').toDate(),
            AppointmentType: "1"
        },
        {
            Id: 1,
            Subject: "Vehicle Blocked",
            StartTime: moment().startOf('day').add(-2, 'day').toDate(),
            EndTime: moment().startOf('day').add(-2, 'day').add(4, 'hour').toDate(),
            AppointmentType: 2,
            IsBlock: "true",
             
        }],
        enableTooltip: true
    };
  
    public data: object[] = [{
        Id: 2,
        Subject: 'Meeting',
        StartTime: new Date(2019, 7, 2, 10, 0),
        EndTime: new Date(2019, 7, 2, 12, 30),
        IsAllDay: false,
        AppointmentType: -1
    }];

    constructor(injector: Injector) {
        super(injector);
    }
       
    show() : void {
        console.log("try show modal scheduler");
        //this.modal.show();
    }

    onItemSelect(item: any) {
        console.log(item);
    }

    onPopupOpen(args: PopupOpenEventArgs): void {
        args.cancel = true;
        //this.createOrEditDrivingLessonModal.show();
        //this.createEventTypeModal.show();
    }

    onCellClick(args: CellClickEventArgs): void {

        console.debug("Cell clicked " + args.element.toString());
    }

    navigating(args: NavigatingEventArgs): void {
        console.debug("navigating clicked! " + args.action.toString());
    }

    onEventRendered(args: EventRenderedArgs): void {
        switch (args.data.AppointmentType) {
            case '0':
                (args.element as HTMLElement).style.backgroundColor = '#F57F17';
                break;
            case '1':
                (args.element as HTMLElement).style.backgroundColor = '#7fa900';
                break;
            case '2':
                (args.element as HTMLElement).style.backgroundColor = '#8e24aa';
                break;
        }
    }

    actionComplete(args: ActionEventArgs) {

        console.log("action complete " + args.name.toString());
    }

    close(): void {
        this.active = false;
        this.modal.hide();
    }


}