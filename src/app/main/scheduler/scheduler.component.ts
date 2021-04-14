import { Component, Injector, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { View, EventSettingsModel, DayService, WeekService, WorkWeekService, MonthService, AgendaService, MonthAgendaService, TimelineViewsService, TimelineMonthService, ScheduleComponent, PopupOpenEventArgs, CellClickEventArgs, EventClickArgs, NavigatingEventArgs, ActionEventArgs, EventRenderedArgs, WorkHoursModel } from '@syncfusion/ej2-angular-schedule';
import { SchedulerServiceProxy, GetAllVehiclesForSchedulerDto, VehicleForScheduler, EventType, VehiclesServiceProxy, InstructorsServiceProxy } from '@shared/service-proxies/service-proxies';
import { CreateOrEditDrivingLessonModalComponent } from '../lessons/drivingLessons/create-or-edit-drivingLesson-modal.component';
import { CreateEventTypeModalComponent } from './create-event-type-modal.component';
import { CreateOrEditTheoryLessonModalComponent } from '../lessons/theoryLessons/create-or-edit-theoryLesson-modal.component';
import { CreateOrEditEventModalComponent } from './create-or-edit-event-modal.component';
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
  templateUrl: './scheduler.component.html',
  animations: [appModuleAnimation()]
})
export class SchedulerComponent extends AppComponentBase implements OnInit {

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
    //timeZone: 'local',
    locale: abp.localization.currentLanguage.name,
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
          weekday: 'short', month: 'numeric', day: 'numeric', omitCommas: true
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
    eventContent: (info) => {
      console.log(info);
      // info.el.style.borderWidth = '4px';
      // var node = document.createElement('div');
      // node.append(document.createTextNode('lol'));
      // info.el.append(node);
      let arrayOfDomNodes = [];

      let timeEl = document.createElement('div');
      timeEl.innerHTML = info.timeText;
      arrayOfDomNodes.push(timeEl);
      let topicEl = document.createElement('div');
      topicEl.innerHTML = info.event._def.title;
      arrayOfDomNodes.push(topicEl);
      if(info.event._def.extendedProps.appointmentType == 0)
      {
        let vehicleEl = document.createElement('div');
        vehicleEl.innerHTML = info.event._def.extendedProps.vehicleName + " - " + info.event._def.extendedProps.startingLocation;
        arrayOfDomNodes.push(vehicleEl);
      }

      return { domNodes: arrayOfDomNodes }
     }

  };

  eventTypeFilter: any = { drivingLessons: true, simulatorLessons: false, theoryLessons: true, otherEvents: true };

  vehiclesResources : any[] = [];
  instructorsResources: any[] = [];

  constructor(
    injector: Injector,
    private _schedulerServiceProxy: SchedulerServiceProxy,
    private _vehiclesServiceProxy : VehiclesServiceProxy, 
    private _instructorsServiceProxy : InstructorsServiceProxy
  ) {
    super(injector);
  }

  ngOnInit(): void {

    const name = Calendar.name;
    this.simulatorFeatureEnabled = abp.features.isEnabled("App.Simulator");

    this._schedulerServiceProxy.getAllVehicles().subscribe(result =>
      {
        for (let i of result.vehicles) {
          this.vehiclesResources.push(
            {
              id: "veh_" + i.id,
              name: i.name,
              checked: false
            }
          );
        }
      });

      this._instructorsServiceProxy.getAllForLookupTable("", "", 0, 999).subscribe(result =>
        {
          for (let i of result.items) {
            this.instructorsResources.push(
              {
                id: "instr_" + i.id,
                name: i.firstName + " " + i.lastName,
                checked: false
              }
            );
          }
        });

        this.calendarOptions.resources = null;
  }

  updateResourcesList()
  {
    this.calendarOptions.resources = null;

    var res : any[] = [];

    for (let v of this.vehiclesResources) {
      if(v.checked)
      res.push({
        id: v.id,
        title : v.name
      });
    }

    for (let v of this.instructorsResources) {
      if(v.checked)
      res.push({
        id: v.id,
        title : v.name
      });
    }

    this.calendarOptions.resources = res;
  }

  updateEvents(info, successCallback, failureCallback) {
    console.log(info);

    this._schedulerServiceProxy.getAllAppointments(
      info.start,
      info.end,
      (this.studentId == null) ? -1 : this.studentId,
      (this.instructorId == null) ? -1 : this.instructorId,
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
            case EventType.DrivingExam:
              backgroundColor = '#F17F17';
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
                appointmentType: item.appointmentType,
                vehicleName: item.vehicleName,
                startingLocation: item.startingLocation
              },
              allDay: item.allDay,
              borderColor: borderColor,
            
              //AppointmentType: item.appointmentType.toString(),
              // VehicleID: 1
            });
        }

        console.log(data);

        successCallback(data);

      });
  }



  handleDateClick(arg) {
    console.log(arg);
    this.startTime = arg.date;
    this.createEventTypeModal.show(this, this.isGranted('Pages.DrivingLessons.Create'), this.isGranted('Pages.DrivingLessons.Create'), true,
    this.isGranted('Pages.SimulatorLessons.Create')); 
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
            else     if (clickInfo.event.extendedProps.appointmentType == EventType.DrivingExam)
            this.createOrEditExamDrivingModal.show(Number(clickInfo.event.id));
            
  }

  handleEvents(events: EventApi[]) {
    //this.currentEvents = events;
    // console.log(events);
  }

  toggleWeekendView() {
    this.calendarOptions.weekends = this.showWeekends;
  }



  openDrivingLessonModal(): void {
    this.createEventTypeModal.close();
    console.log(this.startTime);

    this.createOrEditDrivingLessonModal.show(null, false, null, "", "", this.startTime);
  }

  openExamModal(): void{
    this.createEventTypeModal.close();
    this.createOrEditExamDrivingModal.show(null, false, null, "", "", this.startTime);
  }

  openTheoryLessonModal(): void {
    this.createEventTypeModal.close();
     this.createOrEditTheoryLessonModal.show(null, null, this.startTime);
  }

  openEventModal(): void {
    this.createEventTypeModal.close();
    this.createOrEditEventModal.startTime = this.startTime;
    this.createOrEditEventModal.show();
  }

  openSimulatorLessonModal(): void {
    this.createEventTypeModal.close();
      this.createOrEditSimulatorLessonModal.startTime = this.startTime;
    this.createOrEditSimulatorLessonModal.show();
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
