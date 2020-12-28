import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { View, EventSettingsModel, DayService, WeekService, WorkWeekService, MonthService, AgendaService, MonthAgendaService, TimelineViewsService, TimelineMonthService, ScheduleComponent, PopupOpenEventArgs, CellClickEventArgs, EventClickArgs, NavigatingEventArgs, ActionEventArgs, EventRenderedArgs, WorkHoursModel } from '@syncfusion/ej2-angular-schedule';
import { SchedulerServiceProxy, GetAllVehiclesForSchedulerDto, VehicleForScheduler } from '@shared/service-proxies/service-proxies';
import * as moment from 'moment';
import { CreateOrEditDrivingLessonModalComponent } from '../lessons/drivingLessons/create-or-edit-drivingLesson-modal.component';
import { CreateEventTypeModalComponent } from './create-event-type-modal.component';
import { CreateOrEditTheoryLessonModalComponent } from '../lessons/theoryLessons/create-or-edit-theoryLesson-modal.component';
import { CreateOrEditEventModalComponent } from './create-or-edit-event-modal.component';
import { InstructorLookupTableModalComponent } from '@app/shared/common/lookup/instructor-lookup-table-modal.component';
import { StudentLookupTableModalComponent } from '@app/shared/common/lookup/student-lookup-table-modal.component';
import { IScheduler } from './scheduler-interface';
import { CreateOrEditSimulatorLessonModalComponent } from '../lessons/simulatorLessons/create-or-edit-simulatorLesson-modal.component';
import { Query, Predicate } from '@syncfusion/ej2-data';

@Component({
    providers: [DayService, WeekService, WorkWeekService, MonthService, AgendaService, MonthAgendaService, TimelineViewsService, TimelineMonthService],
    templateUrl: './scheduler.component.html',
    animations: [appModuleAnimation()]
})
export class SchedulerComponent extends AppComponentBase implements IScheduler, OnInit {

    @ViewChild('scheduleObj')
    scheduleObj: ScheduleComponent;

    @ViewChild('createOrEditDrivingLessonModal')
    createOrEditDrivingLessonModal: CreateOrEditDrivingLessonModalComponent;

    @ViewChild('createOrEditTheoryLessonModal')
    createOrEditTheoryLessonModal: CreateOrEditTheoryLessonModalComponent;

    @ViewChild('createOrEditEventModal')
    createOrEditEventModal: CreateOrEditEventModalComponent;

    @ViewChild('createOrEditSimulatorLessonModal')
    createOrEditSimulatorLessonModal: CreateOrEditSimulatorLessonModalComponent;

    @ViewChild('createEventTypeModal')
    createEventTypeModal: CreateEventTypeModalComponent;

    @ViewChild('instructorLookupTableModal')
    instructorLookupTableModal: InstructorLookupTableModalComponent;

    @ViewChild('studentLookupTableModal')
    studentLookupTableModal: StudentLookupTableModalComponent;

    currentInstructorFullName: string = '';
    instructorId: number;

    studentFullName = '';
    studentFirstName = '';
    studentLastName = '';
    studentId: number;

    startTime: Date;

    simulatorFeatureEnabled;

    //vehicles : GetAllVehiclesForSchedulerDto;

    eventTypeFilter: any = { drivingLessons: true, simulatorLessons: false, theoryLessons: true, otherEvents: true };

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
        private _schedulerServiceProxy: SchedulerServiceProxy
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.eventTypeFilter.drivingLessons = true;
        
        this.updateCurrentView();

        this.simulatorFeatureEnabled = abp.features.isEnabled("App.Simulator");

        // this.vehicles = new GetAllVehiclesForSchedulerDto();
        // this.vehicles.vehicles = [];
        // this._schedulerServiceProxy.getAllVehicles().subscribe(result => {
        //     this.vehicles = result;
        // });
    }

    // onChange(args) {
    //     var ele = document.querySelectorAll('.e-resource');
    //     var filteredData = [];
    //     for (var i = 0; i < ele.length; i++) {
    //       if (ele[i].getAttribute('aria-checked') === 'true') {
    //         debugger;
    //         var fildata = this.filter(ele[i].firstElementChild.children[0].id);
    //         filteredData = filteredData.concat(fildata);
    //       }
    //     }
    //     this.scheduleObj.eventSettings.dataSource = filteredData;
    //     this.scheduleObj.dataBind();
    //   }
    //   filter(id) {
    //     var dm = new ej.data.DataManager({ json: data });
    //     var CurData = dm.executeLocal(new ej.data.Query().where("Category", 'equal', id));
    //     return CurData;
    //   }

    onPopupOpen(args: PopupOpenEventArgs): void {
        args.cancel = true;
        //this.createOrEditDrivingLessonModal.show();
        //this.createEventTypeModal.show();
    }

    onCellClick(args: CellClickEventArgs): void {
    //    console.log(args);
        this.startTime = args.startTime;
        this.createEventTypeModal.show(this, this.isGranted('Pages.DrivingLessons.Create'), this.isGranted('Pages.DrivingLessons.Create'), true,
        this.isGranted('Pages.SimulatorLessons.Create')); 
    }

    onEventClick(args: EventClickArgs): void {
        //console.log(args.event["AppointmentType"]);
        //console.log(args.event["Id"]);

        if (args.event["AppointmentType"] == 0)
            this.createOrEditDrivingLessonModal.show(args.event["Id"]);
        else if (args.event["AppointmentType"] == 1)
            this.createOrEditTheoryLessonModal.show(args.event["Id"]);
        else if (args.event["AppointmentType"] == 2)
            this.createOrEditEventModal.show(args.event["Id"]);
        else if (args.event["AppointmentType"] == 4)
            this.createOrEditSimulatorLessonModal.show(args.event["Id"]);
    }

    Doubleclick(args: EventClickArgs): void {
        console.log("Yay");
    }

    actionComplete(args: ActionEventArgs) {

        if (args.requestType == "dateNavigate" || args.requestType == "viewNavigate") {
            this.updateCurrentView();
        }
    }

    schedulerCreated(args: Object) 
    {
        setTimeout(() => 
        {
            this.updateCurrentView();
        },
        500);
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
        //this.createOrEditDrivingLessonModal.startTime = this.startTime;
        this.createOrEditDrivingLessonModal.show();
    }

    openTheoryLessonModal(): void {
        this.createEventTypeModal.close();
  
       // this.createOrEditTheoryLessonModal.show(null, null, this.startTime);
    }

    openEventModal(): void {
        this.createEventTypeModal.close();
        //this.createOrEditEventModal.startTime = this.startTime;
        this.createOrEditEventModal.show();
    }
    
    openSimulatorLessonModal(): void {
        this.createEventTypeModal.close();
      //  this.createOrEditSimulatorLessonModal.startTime = this.startTime;
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

        //console.log(moment(from).startOf('day'));
        //console.log(moment(to).startOf('day'));

        // uncommented ....
        // this._schedulerServiceProxy.getAllAppointments(
        //     moment(from),
        //     moment(to),
        //     (this.studentId == null) ? -1 : this.studentId,
        //     (this.instructorId == null) ? -1 : this.instructorId,
        //     //this.vehicles.vehicles.map<number>(v => (v.id)),
        //     this.eventTypeFilter.drivingLessons,
        //     this.eventTypeFilter.theoryLessons,
        //     this.eventTypeFilter.otherEvents,
        //     this.eventTypeFilter.simulatorLessons).subscribe(result => {

        //         //console.log(result);

        //         for (var item of result) {
        //             this.data.push(
        //                 {
        //                     Id: item.id,
        //                     Subject: item.subject,
        //                     StartTime: item.startTime.toDate(),
        //                     EndTime: item.endTime.toDate(),
        //                     AppointmentType: item.appointmentType.toString(),
        //                    // VehicleID: 1
        //                 });
        //         }

        //         //console.log( this.data);

        //         this.scheduleObj.refresh();

        //         this.scheduleObj.hideSpinner();

        //     });

    }



    updateCurrentView(): void {
        var dates = this.scheduleObj.getCurrentViewDates();

        if (dates == null || dates.length == 0)
            return;

        //console.log(dates);

        var fromDate: Date = new Date(dates[0].toString());
        var toDate = new Date(dates[dates.length - 1].toString());
        toDate.setDate(toDate.getDate() + 1);

        //console.log(fromDate);
        //console.log(toDate);

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

    setInstructorNull() {
        this.instructorId = null;
        this.currentInstructorFullName = '';

        this.updateCurrentView();
    }


    getNewInstructorId() {
        if(this.instructorLookupTableModal.id == null)
        return;

        this.instructorId = this.instructorLookupTableModal.id;
        this.currentInstructorFullName = this.instructorLookupTableModal.firstName + ' ' + this.instructorLookupTableModal.lastName;

        this.updateCurrentView();
    }

    openSelectInstructorModal() {
        //this.vehicleLicenseClassLookupTableModal.id = this.vehicle.licenseClassId;
        //this.vehicleLicenseClassLookupTableModal.displayName = this.licenseClassClass;
        this.instructorLookupTableModal.show();
    }

    setStudentIdNull() {
        this.studentFirstName = '';
        this.studentLastName = '';
        this.studentId = null;
        this.refreshStudentFullName();
        this.updateCurrentView();
    }

    openSelectStudentModal() {
        this.studentLookupTableModal.firstName = this.studentFirstName;
        this.studentLookupTableModal.lastName = this.studentLastName;
        this.refreshStudentFullName();
        this.studentLookupTableModal.show();
    }

    getNewStudentId() {
        this.studentFirstName = this.studentLookupTableModal.firstName;
        this.studentLastName = this.studentLookupTableModal.lastName;
        this.studentId = this.studentLookupTableModal.id;
        this.refreshStudentFullName();
        this.updateCurrentView();
    }

    refreshStudentFullName() {
        this.studentFullName = this.studentFirstName + ' ' + this.studentLastName;
    }
}
