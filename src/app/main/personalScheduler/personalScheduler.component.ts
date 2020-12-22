import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { View, EventSettingsModel, DayService, WeekService, WorkWeekService, MonthService, AgendaService, MonthAgendaService, TimelineViewsService, TimelineMonthService, ScheduleComponent, PopupOpenEventArgs, CellClickEventArgs, EventClickArgs, NavigatingEventArgs, ActionEventArgs, EventRenderedArgs } from '@syncfusion/ej2-angular-schedule';
import { PersonalSchedulerServiceProxy } from '@shared/service-proxies/service-proxies';
import * as moment from 'moment';
import { CreateOrEditDrivingLessonModalComponent } from '../lessons/drivingLessons/create-or-edit-drivingLesson-modal.component';
import { CreateEventTypeModalComponent } from '../scheduler/create-event-type-modal.component';
import { CreateOrEditTheoryLessonModalComponent } from '../lessons/theoryLessons/create-or-edit-theoryLesson-modal.component';
import { CreateOrEditEventModalComponent } from '../scheduler/create-or-edit-event-modal.component';
import { IScheduler } from '../scheduler/scheduler-interface';
import { CreateOrEditSimulatorLessonModalComponent } from '../lessons/simulatorLessons/create-or-edit-simulatorLesson-modal.component';


@Component({
    providers: [DayService, WeekService, WorkWeekService, MonthService, AgendaService, MonthAgendaService, TimelineViewsService, TimelineMonthService],
    templateUrl: './personalScheduler.component.html',
    animations: [appModuleAnimation()]
})
export class PersonalSchedulerComponent extends AppComponentBase implements IScheduler, OnInit {

    @ViewChild('scheduleObj')
    scheduleObj: ScheduleComponent;

    @ViewChild('createOrEditDrivingLessonModal')
    createOrEditDrivingLessonModal: CreateOrEditDrivingLessonModalComponent;

    @ViewChild('createOrEditTheoryLessonModal')
    createOrEditTheoryLessonModal: CreateOrEditTheoryLessonModalComponent;

    @ViewChild('createOrEditSimulatorLessonModal')
    createOrEditSimulatorLessonModal: CreateOrEditSimulatorLessonModalComponent;

    @ViewChild('createOrEditEventModal')
    createOrEditEventModal: CreateOrEditEventModalComponent;

    @ViewChild('createEventTypeModal')
    createEventTypeModal: CreateEventTypeModalComponent;

    currentInstructorFullName: string = '';
    instructorId: number;

    studentFullName = '';
    studentFirstName = '';
    studentLastName = '';
    studentId: number;

    startTime: Date;

    allowedToSeeOwnAppointments : boolean;
    allowedToSeeOwnDrivingLessons : boolean;

    eventTypeFilter: any = { drivingLessons: true, theoryLessons: true, otherEvents: true };

    // public data: object[] = [];
    public data: object[] = [{
        Id: 2,
        Subject: 'Meeting',
        StartTime: new Date(2019, 7, 2, 10, 0),
        EndTime: new Date(2019, 7, 2, 12, 30),
        IsAllDay: false,
        AppointmentType: -1
    }];

    public eventSettings: EventSettingsModel = {
        dataSource: this.data
    }

    public currentView: View = 'Day';

    constructor(
        injector: Injector,
        private _personalSchedulerServiceProxy: PersonalSchedulerServiceProxy
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.allowedToSeeOwnAppointments = this.isGranted('OwnAppointments');
        this.allowedToSeeOwnDrivingLessons = this.isGranted('Pages.InstructorsOwnDrivingLessons') && this.isGranted('InstructorView');

        console.log(this.isGranted('Pages.InstructorsOwnDrivingLessons'));
        console.log(this.isGranted('InstructorsView'));
        console.log(this.isGranted('Something'));

        this.updateCurrentView();
    }

    onPopupOpen(args: PopupOpenEventArgs): void {
        args.cancel = true;
        //this.createOrEditDrivingLessonModal.show();
        //this.createEventTypeModal.show();
    }

    onCellClick(args: CellClickEventArgs): void {
        this.startTime = args.startTime;

        if(!this.isGranted('Pages.InstructorsOwnDrivingLessons.Create') 
        && !this.isGranted('OwnAppointments.Create'))
            return;

        if(!this.isGranted('Pages.InstructorsOwnDrivingLessons.Create'))
        {
            this.openEventModal();
        }
        else if(!this.isGranted('OwnAppointments.Create'))
        {
            this.openDrivingLessonModal();
        }
        else
        {
            this.createEventTypeModal.show(this, this.isGranted('Pages.InstructorsOwnDrivingLessons.Create'), false, 
                this.isGranted('OwnAppointments.Create'), false); 
        }
    }

    onEventClick(args: EventClickArgs): void {
        if (args.event["AppointmentType"] == 0)
        {
            if(this.isGranted('Pages.InstructorsOwnDrivingLessons.Edit'))
            this.createOrEditDrivingLessonModal.show(args.event["Id"], true);
        }
        //else if (args.event["AppointmentType"] == 1)
        //    this.createOrEditTheoryLessonModal.show(args.event["Id"]);
        else if (args.event["AppointmentType"] == 2)
        {
            if(this.isGranted('OwnAppointments.Edit'))
                this.createOrEditEventModal.show(args.event["Id"], true);
        }
    }

    Doubleclick(args: EventClickArgs): void {
        console.log("Yay");
    }

    actionComplete(args: ActionEventArgs) {

        if (args.requestType == "dateNavigate" || args.requestType == "viewNavigate") {
            this.updateCurrentView();
        }
    }

    schedulerCreated(args: Object) {
        this.updateCurrentView();
    }

    navigating(args: NavigatingEventArgs): void {
        // this.scheduleObj.showSpinner();
        // console.log(args);
        // this.scheduleObj.refresh();
        // console.log(this.scheduleObj.getCurrentViewDates());

        // if(args.action == 'date' && args.currentDate != null)
        // {
        //     if(this.scheduleObj.currentView == 'Day')
        //     {
        //         // Get events of this day
        //     }

        //     if(this.scheduleObj.currentView == 'Week')
        //     {
        //         // Get events of this week 
        //     }

        //     if(this.scheduleObj.currentView == 'Month')
        //     {
        //         // Get events of this month
        //     }
        // }

        // if(args.action == 'view' && args.previousView == 'Day' && args.currentView == 'Week')
        // {   
        //     // changed from day to week
        // }

        // else if(args.action == 'view' && args.previousView == 'Week' && args.currentView == 'Month')
        // {   
        //     // changed from day to week
        // }

        // else if(args.action == 'view')
        // {
        //     // changed from month to week or month to day or week to day
        // }

        // this.updateView(args.currentDate, args.currentDate);
    }

    openDrivingLessonModal(): void {
        this.createEventTypeModal.close();
        this.createOrEditDrivingLessonModal.startTime = this.startTime;
        this.createOrEditDrivingLessonModal.show(null, true);
    }

    openTheoryLessonModal(): void {
        this.createEventTypeModal.close();
        //this.createOrEditTheoryLessonModal.startTime = this.startTime;
        this.createOrEditTheoryLessonModal.show(null, null, this.startTime);
    }

    openEventModal(): void {
        this.createEventTypeModal.close();
        this.createOrEditEventModal.startTime = this.startTime;
        this.createOrEditEventModal.show(null, true);
    }

    openSimulatorLessonModal(): void {
        this.createEventTypeModal.close();
        this.createOrEditSimulatorLessonModal.startTime = this.startTime;
        this.createOrEditSimulatorLessonModal.show();
    }

    updateView(from: Date, to: Date): void {

        this.data.length = 0;

        if(!this.eventTypeFilter.drivingLessons && !this.eventTypeFilter.theoryLessons && !this.eventTypeFilter.otherEvents)
        {
            this.scheduleObj.refresh();
            return;
        }

        this.scheduleObj.showSpinner();

        this._personalSchedulerServiceProxy.getAllEventsOfCurrentPerson(
            moment(from),
            moment(to),
            this.eventTypeFilter.drivingLessons,
            this.eventTypeFilter.theoryLessons,
            this.eventTypeFilter.otherEvents,
            false).subscribe(result => {

                //console.log(result);

                for (var item of result) {
                    this.data.push(
                        {
                            Id: item.id,
                            Subject: item.subject,
                            StartTime: item.startTime.toDate(),
                            EndTime: item.endTime.toDate(),
                            AppointmentType: item.appointmentType.toString()
                        });
                }

                //console.log( this.data);

                this.scheduleObj.refresh();

                this.scheduleObj.hideSpinner();

            });

    }



    updateCurrentView(): void {
        var dates = this.scheduleObj.getCurrentViewDates();

        if (dates == null || dates.length == 0)
            return;

        console.log(dates);

        var fromDate: Date = new Date(dates[0].toString());
        var toDate = new Date(dates[dates.length - 1].toString());
        toDate.setDate(toDate.getDate() + 1);

        console.log(fromDate);
        console.log(toDate);

        this.updateView(fromDate, toDate);
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
}
