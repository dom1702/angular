import { Component, Injector, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { View, EventSettingsModel, DayService, WeekService, WorkWeekService, MonthService, AgendaService, MonthAgendaService, TimelineViewsService, TimelineMonthService, ScheduleComponent, PopupOpenEventArgs, CellClickEventArgs, EventClickArgs, NavigatingEventArgs, ActionEventArgs, EventRenderedArgs, WorkHoursModel } from '@syncfusion/ej2-angular-schedule';
import { SchedulerServiceProxy, GetAllVehiclesForSchedulerDto, VehicleForScheduler, EventType, VehiclesServiceProxy, InstructorsServiceProxy, PersonalSchedulerServiceProxy } from '@shared/service-proxies/service-proxies';
import { CreateOrEditDrivingLessonModalComponent } from '../lessons/drivingLessons/create-or-edit-drivingLesson-modal.component';
import { CreateEventTypeModalComponent } from '../scheduler/create-event-type-modal.component';
import { CreateOrEditTheoryLessonModalComponent } from '../lessons/theoryLessons/create-or-edit-theoryLesson-modal.component';
import { CreateOrEditEventModalComponent } from '../scheduler/create-or-edit-event-modal.component';
import { InstructorLookupTableModalComponent } from '@app/shared/common/lookup/instructor-lookup-table-modal.component';
import { StudentLookupTableModalComponent } from '@app/shared/common/lookup/student-lookup-table-modal.component';
import { CreateOrEditSimulatorLessonModalComponent } from '../lessons/simulatorLessons/create-or-edit-simulatorLesson-modal.component';
import { CalendarOptions, DateSelectArg, EventApi, EventClickArg, FullCalendarComponent } from '@fullcalendar/angular';


import { Calendar } from '@fullcalendar/core'; // include this line
import { reduce } from 'rxjs/operators';
import { DateTime } from 'luxon';
import { CreateOrEditExamDrivingModalComponent } from '../lessons/drivingLessons/create-or-edit-examDriving-modal.component';

@Component({
    providers: [DayService, WeekService, WorkWeekService, MonthService, AgendaService, MonthAgendaService, TimelineViewsService, TimelineMonthService],
    templateUrl: './personalScheduler.component.html',
    animations: [appModuleAnimation()]
})
export class PersonalSchedulerComponent extends AppComponentBase implements OnInit {

    @ViewChild('createOrEditDrivingLessonModal', { static: true })
    createOrEditDrivingLessonModal: CreateOrEditDrivingLessonModalComponent;

    @ViewChild('createOrEditExamDrivingModal', { static: true })
    createOrEditExamDrivingModal: CreateOrEditExamDrivingModalComponent;
  
    @ViewChild('createOrEditTheoryLessonModal', { static: true })
    createOrEditTheoryLessonModal: CreateOrEditTheoryLessonModalComponent;
  
    @ViewChild('createOrEditEventModal', { static: true })
    createOrEditEventModal: CreateOrEditEventModalComponent;
  
    @ViewChild('createOrEditSimulatorLessonModal', { static: true })
    createOrEditSimulatorLessonModal: CreateOrEditSimulatorLessonModalComponent;
  
    @ViewChild('createEventTypeModal', { static: true })
    createEventTypeModal: CreateEventTypeModalComponent;
  
    @ViewChild('instructorLookupTableModal', { static: true })
    instructorLookupTableModal: InstructorLookupTableModalComponent;
  
    @ViewChild('studentLookupTableModal', { static: true })
    studentLookupTableModal: StudentLookupTableModalComponent;
  
    @ViewChild('calendar') calendarComponent: FullCalendarComponent;
  
    currentInstructorFullName: string = '';
    instructorId: number;
  
    studentFullName = '';
    studentFirstName = '';
    studentLastName = '';
    studentId: number;
  
    startTime: Date;
  
    events: any[];
  
    options: any;
  
    showWeekends: boolean = false;
  
    simulatorFeatureEnabled;
    //calendarPlugins = [dayGridPlugin];
    calendarOptions: CalendarOptions = {
      //timeZone: 'UTC',
      schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives',
      initialView: 'timeGridWeek',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay,listWeek,resourceTimeGridDay'
      },
      themeSystem: 'bootstrap',
      weekends: false,
      views:
      {
        dayGridMonth: { // name of view
          titleFormat: { year: 'numeric', month: 'short', day: 'numeric' }
          // other view-specific options here
        },
        week:
        {
          dayHeaderFormat:
          {
            titleFormat: { year: 'numeric', month: '2-digit', day: '2-digit' },
            weekday: 'short'
          }
        }
      },
      slotLabelFormat: {
        hour: 'numeric',
        minute: '2-digit',
        omitZeroMinute: false,
        meridiem: false,
        hour12: false
      },
      slotMinTime: "06:00:00",
      nowIndicator: true,
      slotDuration: "00:15:00",
      dateClick: this.handleDateClick.bind(this), // bind is important!
      select: this.handleDateSelect.bind(this),
      eventClick: this.handleEventClick.bind(this),
      eventsSet: this.handleEvents.bind(this),
      events: this.updateEvents.bind(this),
      eventDidMount: (info) => {
        console.log(info);
        info.el.style.borderWidth = '4px';
       }
  
    };

    allowedToSeeOwnAppointments : boolean;
     allowedToSeeOwnDrivingLessons : boolean;
  
    eventTypeFilter: any = { drivingLessons: true, simulatorLessons: false, theoryLessons: true, otherEvents: true };
  
    vehiclesResources : any[] = [];
  
    constructor(
      injector: Injector,
      private _schedulerServiceProxy: SchedulerServiceProxy,
      private _personalSchedulerServiceProxy : PersonalSchedulerServiceProxy,
      private _vehiclesServiceProxy : VehiclesServiceProxy, 
      private _instructorsServiceProxy : InstructorsServiceProxy
    ) {
      super(injector);
    }
  
    ngOnInit(): void {
  
        this.allowedToSeeOwnAppointments = this.isGranted('OwnAppointments');
        this.allowedToSeeOwnDrivingLessons = this.isGranted('Pages.InstructorsOwnDrivingLessons') && this.isGranted('InstructorView');
  
      const name = Calendar.name;
      this.simulatorFeatureEnabled = abp.features.isEnabled("App.Simulator");
  
      // this._schedulerServiceProxy.getAllVehicles().subscribe(result =>
      //   {
      //     for (let i of result.vehicles) {
      //       this.vehiclesResources.push(
      //         {
      //           id: "veh_" + i.id,
      //           name: i.name,
      //           checked: false
      //         }
      //       );
      //     }
      //   });
  
  
  
          this.calendarOptions.resources = null;
    }
  
     updateResourcesList()
     {
    //   this.calendarOptions.resources = null;
  
    //   var res : any[] = [];
  
    //   for (let v of this.vehiclesResources) {
    //     if(v.checked)
    //     res.push({
    //       id: v.id,
    //       title : v.name
    //     });
    //   }
  
    //   this.calendarOptions.resources = res;
     }
  
    updateEvents(info, successCallback, failureCallback) {
      console.log(info);
  
      this._personalSchedulerServiceProxy.getAllEventsOfCurrentPerson(
        info.start,
        info.end,
        //this.vehicles.vehicles.map<number>(v => (v.id)),
        this.eventTypeFilter.drivingLessons,
        this.eventTypeFilter.theoryLessons,
        this.eventTypeFilter.otherEvents,
        this.eventTypeFilter.simulatorLessons).subscribe(result => {
  
          console.log(result);
  
          let data: any = [];
  
          for (var item of result) {
            var backgroundColor;
            switch (item.appointmentType) {
              case EventType.DrivingLesson:
                backgroundColor = '#F57F17';
                break;
              case EventType.TheoryLesson:
                backgroundColor = '#7fa900';
                break;
              case EventType.Event:
                backgroundColor = '#8e24aa';
                break;
              case EventType.Holiday:
                backgroundColor = '#8e24aa';
                break;
              case EventType.SimulatorLesson:
                backgroundColor = '#8e24aa';
                break;
            }
  
            var resourceIds : any[] = [];
  
            if(item.vehicleId != null)
            resourceIds.push("veh_" + item.vehicleId);
            if(item.instructorIds != null)
            {
            for(var instructorId of item.instructorIds.keys())
            resourceIds.push("instr_" + item.instructorIds[instructorId]); 
            }
  
            var borderColor = 'yellow';
            if(item.appointmentType == EventType.Event || item.appointmentType == EventType.Holiday)
            {
              borderColor = backgroundColor;
            }
            else
            {
            if(item.completed)
              borderColor = 'green';
            if(item.studentNotPresent)
              borderColor = 'red';
            }
  
            data.push(
              {
                //Id: item.id,
                id: item.id,
                title: item.subject,
                start: item.startTime.toJSDate(),
                end: item.endTime.toJSDate(),
                resourceIds: resourceIds,
                backgroundColor: backgroundColor,
                extendedProps: {
                  appointmentType: item.appointmentType
                },
                allDay: item.allDay,
                borderColor: borderColor
                //AppointmentType: item.appointmentType.toString(),
                // VehicleID: 1
              });
          }
  
          console.log(data);
  
          successCallback(data);
  
        });
    }
  
    eventRender(info)
    {
      console.log(info);
    }
  
    handleDateClick(arg) {
      console.log(arg);
      this.startTime = arg.date;

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

      //this.createEventTypeModal.show(this, this.isGranted('Pages.DrivingLessons.Create'), this.isGranted('Pages.DrivingLessons.Create'), true,
      //this.isGranted('Pages.SimulatorLessons.Create')); 
    }
  
    handleDateSelect(selectInfo: DateSelectArg) {
      const title = prompt('Please enter a new title for your event');
      const calendarApi = selectInfo.view.calendar;
  
      calendarApi.unselect(); // clear date selection
  
      if (title) {
        calendarApi.addEvent({
          // id: createEventId(),
          title,
          start: selectInfo.startStr,
  
          end: selectInfo.endStr,
          allDay: selectInfo.allDay
        });
      }
    };
  
    handleEventClick(clickInfo: EventClickArg) {
      if (clickInfo.event.extendedProps.appointmentType == EventType.DrivingLesson)
              this.createOrEditDrivingLessonModal.show(Number(clickInfo.event.id));
          else     if (clickInfo.event.extendedProps.appointmentType == EventType.TheoryLesson)
              this.createOrEditTheoryLessonModal.show(Number(clickInfo.event.id));
          else     if (clickInfo.event.extendedProps.appointmentType == EventType.Event)
              this.createOrEditEventModal.show(Number(clickInfo.event.id));
          else     if (clickInfo.event.extendedProps.appointmentType == EventType.SimulatorLesson)
              this.createOrEditSimulatorLessonModal.show(Number(clickInfo.event.id));
    }
  
    handleEvents(events: EventApi[]) {
      //this.currentEvents = events;
      // console.log(events);
    }
  
    toggleWeekendView() {
      this.calendarOptions.weekends = this.showWeekends;
    }
  
  

    openTheoryLessonModal(): void {
      this.createEventTypeModal.close();
       this.createOrEditTheoryLessonModal.show(null, null, this.startTime);
    }

    openExamModal(): void{
      this.createEventTypeModal.close();
      this.createOrEditExamDrivingModal.show(null, true, null, "", "", this.startTime);
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

    openDrivingLessonModal(): void {
                this.createEventTypeModal.close();
                this.createOrEditDrivingLessonModal.show(null, true, null, "", "", this.startTime);
            }
  
    refetchEvents() {
  
      let calendarApi = this.calendarComponent.getApi();
      calendarApi.refetchEvents();
    }
  
    setInstructorNull() {
      this.instructorId = null;
      this.currentInstructorFullName = '';
      this.refetchEvents();
    }
  
  
    getNewInstructorId() {
      if (this.instructorLookupTableModal.id == null)
        return;
  
      this.instructorId = this.instructorLookupTableModal.id;
      this.currentInstructorFullName = this.instructorLookupTableModal.firstName + ' ' + this.instructorLookupTableModal.lastName;
      this.refetchEvents();
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
      this.refetchEvents();
  
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
      this.refetchEvents();
  
    }
  
    refreshStudentFullName() {
      this.studentFullName = this.studentFirstName + ' ' + this.studentLastName;
    }
  }
  

// import { Component, Injector, OnInit, ViewChild } from '@angular/core';
// import { AppComponentBase } from '@shared/common/app-component-base';
// import { appModuleAnimation } from '@shared/animations/routerTransition';
// import { View, EventSettingsModel, DayService, WeekService, WorkWeekService, MonthService, AgendaService, MonthAgendaService, TimelineViewsService, TimelineMonthService, ScheduleComponent, PopupOpenEventArgs, CellClickEventArgs, EventClickArgs, NavigatingEventArgs, ActionEventArgs, EventRenderedArgs } from '@syncfusion/ej2-angular-schedule';
// import { PersonalSchedulerServiceProxy } from '@shared/service-proxies/service-proxies';
// import { CreateOrEditDrivingLessonModalComponent } from '../lessons/drivingLessons/create-or-edit-drivingLesson-modal.component';
// import { CreateEventTypeModalComponent } from '../scheduler/create-event-type-modal.component';
// import { CreateOrEditTheoryLessonModalComponent } from '../lessons/theoryLessons/create-or-edit-theoryLesson-modal.component';
// import { CreateOrEditEventModalComponent } from '../scheduler/create-or-edit-event-modal.component';
// import { IScheduler } from '../scheduler/scheduler-interface';
// import { CreateOrEditSimulatorLessonModalComponent } from '../lessons/simulatorLessons/create-or-edit-simulatorLesson-modal.component';
// import { DateTime } from 'luxon';


// @Component({
//     providers: [DayService, WeekService, WorkWeekService, MonthService, AgendaService, MonthAgendaService, TimelineViewsService, TimelineMonthService],
//     templateUrl: './personalScheduler.component.html',
//     animations: [appModuleAnimation()]
// })
// export class PersonalSchedulerComponent extends AppComponentBase implements IScheduler, OnInit {

//     @ViewChild('scheduleObj')
//     scheduleObj: ScheduleComponent;

//     @ViewChild('createOrEditDrivingLessonModal')
//     createOrEditDrivingLessonModal: CreateOrEditDrivingLessonModalComponent;

//     @ViewChild('createOrEditTheoryLessonModal')
//     createOrEditTheoryLessonModal: CreateOrEditTheoryLessonModalComponent;

//     @ViewChild('createOrEditSimulatorLessonModal')
//     createOrEditSimulatorLessonModal: CreateOrEditSimulatorLessonModalComponent;

//     @ViewChild('createOrEditEventModal')
//     createOrEditEventModal: CreateOrEditEventModalComponent;

//     @ViewChild('createEventTypeModal')
//     createEventTypeModal: CreateEventTypeModalComponent;

//     currentInstructorFullName: string = '';
//     instructorId: number;

//     studentFullName = '';
//     studentFirstName = '';
//     studentLastName = '';
//     studentId: number;

//     startTime: DateTime;

//     allowedToSeeOwnAppointments : boolean;
//     allowedToSeeOwnDrivingLessons : boolean;

//     eventTypeFilter: any = { drivingLessons: true, theoryLessons: true, otherEvents: true };

//     // public data: object[] = [];
//     public data: object[] = [{
//         Id: 2,
//         Subject: 'Meeting',
//         StartTime: new DateTime(),
//         EndTime: new DateTime(),
//         IsAllDay: false,
//         AppointmentType: -1
//     }];

//     public eventSettings: EventSettingsModel = {
//         dataSource: this.data
//     }

//     public currentView: View = 'Day';

//     constructor(
//         injector: Injector,
//         private _personalSchedulerServiceProxy: PersonalSchedulerServiceProxy
//     ) {
//         super(injector);
//     }

//     ngOnInit(): void {
//         this.allowedToSeeOwnAppointments = this.isGranted('OwnAppointments');
//         this.allowedToSeeOwnDrivingLessons = this.isGranted('Pages.InstructorsOwnDrivingLessons') && this.isGranted('InstructorView');

//         console.log(this.isGranted('Pages.InstructorsOwnDrivingLessons'));
//         console.log(this.isGranted('InstructorsView'));
//         console.log(this.isGranted('Something'));

//         this.updateCurrentView();
//     }

//     onPopupOpen(args: PopupOpenEventArgs): void {
//         args.cancel = true;
//         //this.createOrEditDrivingLessonModal.show();
//         //this.createEventTypeModal.show();
//     }

//     onCellClick(args: CellClickEventArgs): void {
//         //this.startTime = args.startTime;

//         if(!this.isGranted('Pages.InstructorsOwnDrivingLessons.Create') 
//         && !this.isGranted('OwnAppointments.Create'))
//             return;

//         if(!this.isGranted('Pages.InstructorsOwnDrivingLessons.Create'))
//         {
//             this.openEventModal();
//         }
//         else if(!this.isGranted('OwnAppointments.Create'))
//         {
//             this.openDrivingLessonModal();
//         }
//         else
//         {
//             this.createEventTypeModal.show(this, this.isGranted('Pages.InstructorsOwnDrivingLessons.Create'), false, 
//                 this.isGranted('OwnAppointments.Create'), false); 
//         }
//     }

//     onEventClick(args: EventClickArgs): void {
//         if (args.event["AppointmentType"] == 0)
//         {
//             if(this.isGranted('Pages.InstructorsOwnDrivingLessons.Edit'))
//             this.createOrEditDrivingLessonModal.show(args.event["Id"], true);
//         }
//         //else if (args.event["AppointmentType"] == 1)
//         //    this.createOrEditTheoryLessonModal.show(args.event["Id"]);
//         else if (args.event["AppointmentType"] == 2)
//         {
//             if(this.isGranted('OwnAppointments.Edit'))
//                 this.createOrEditEventModal.show(args.event["Id"], true);
//         }
//     }

//     Doubleclick(args: EventClickArgs): void {
//         console.log("Yay");
//     }

//     actionComplete(args: ActionEventArgs) {

//         if (args.requestType == "dateNavigate" || args.requestType == "viewNavigate") {
//             this.updateCurrentView();
//         }
//     }

//     schedulerCreated(args: Object) {
//         this.updateCurrentView();
//     }

//     navigating(args: NavigatingEventArgs): void {
//         // this.scheduleObj.showSpinner();
//         // console.log(args);
//         // this.scheduleObj.refresh();
//         // console.log(this.scheduleObj.getCurrentViewDates());

//         // if(args.action == 'date' && args.currentDate != null)
//         // {
//         //     if(this.scheduleObj.currentView == 'Day')
//         //     {
//         //         // Get events of this day
//         //     }

//         //     if(this.scheduleObj.currentView == 'Week')
//         //     {
//         //         // Get events of this week 
//         //     }

//         //     if(this.scheduleObj.currentView == 'Month')
//         //     {
//         //         // Get events of this month
//         //     }
//         // }

//         // if(args.action == 'view' && args.previousView == 'Day' && args.currentView == 'Week')
//         // {   
//         //     // changed from day to week
//         // }

//         // else if(args.action == 'view' && args.previousView == 'Week' && args.currentView == 'Month')
//         // {   
//         //     // changed from day to week
//         // }

//         // else if(args.action == 'view')
//         // {
//         //     // changed from month to week or month to day or week to day
//         // }

//         // this.updateView(args.currentDate, args.currentDate);
//     }

//     openDrivingLessonModal(): void {
//         this.createEventTypeModal.close();
//         this.createOrEditDrivingLessonModal.startTime = this.startTime.toJSDate();
//         this.createOrEditDrivingLessonModal.show(null, true);
//     }

//     openTheoryLessonModal(): void {
//         this.createEventTypeModal.close();
//         //this.createOrEditTheoryLessonModal.startTime = this.startTime;
//        // this.createOrEditTheoryLessonModal.show(null, null, this.startTime);
//     }

//     openEventModal(): void {
//         this.createEventTypeModal.close();
//         this.createOrEditEventModal.startTime = this.startTime.toJSDate();
//         this.createOrEditEventModal.show(null, true);
//     }

//     openSimulatorLessonModal(): void {
//         this.createEventTypeModal.close();
//         this.createOrEditSimulatorLessonModal.startTime = this.startTime.toJSDate();
//         this.createOrEditSimulatorLessonModal.show();
//     }

//     updateView(from: Date, to: Date): void {

//         this.data.length = 0;

//         if(!this.eventTypeFilter.drivingLessons && !this.eventTypeFilter.theoryLessons && !this.eventTypeFilter.otherEvents)
//         {
//             this.scheduleObj.refresh();
//             return;
//         }

//         this.scheduleObj.showSpinner();

//         // uncomment ...
//         // this._personalSchedulerServiceProxy.getAllEventsOfCurrentPerson(
//         //     moment(from),
//         //     moment(to),
//         //     this.eventTypeFilter.drivingLessons,
//         //     this.eventTypeFilter.theoryLessons,
//         //     this.eventTypeFilter.otherEvents,
//         //     false).subscribe(result => {

//         //         //console.log(result);

//         //         for (var item of result) {
//         //             this.data.push(
//         //                 {
//         //                     Id: item.id,
//         //                     Subject: item.subject,
//         //                     StartTime: item.startTime.toDate(),
//         //                     EndTime: item.endTime.toDate(),
//         //                     AppointmentType: item.appointmentType.toString()
//         //                 });
//         //         }

//         //         //console.log( this.data);

//         //         this.scheduleObj.refresh();

//         //         this.scheduleObj.hideSpinner();

//         //     });

//     }



//     updateCurrentView(): void {
//         var dates = this.scheduleObj.getCurrentViewDates();

//         if (dates == null || dates.length == 0)
//             return;

//         console.log(dates);

//         var fromDate: Date = new Date(dates[0].toString());
//         var toDate = new Date(dates[dates.length - 1].toString());
//         toDate.setDate(toDate.getDate() + 1);

//         console.log(fromDate);
//         console.log(toDate);

//         this.updateView(fromDate, toDate);
//     }

//     onEventRendered(args: EventRenderedArgs): void {
//         switch (args.data.AppointmentType) {
//             case '0':
//                 (args.element as HTMLElement).style.backgroundColor = '#F57F17';
//                 break;
//             case '1':
//                 (args.element as HTMLElement).style.backgroundColor = '#7fa900';
//                 break;
//             case '2':
//                 (args.element as HTMLElement).style.backgroundColor = '#8e24aa';
//                 break;
//         }
//     }
// }

