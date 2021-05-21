import { Component, Injector, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { SchedulerServiceProxy, GetAllVehiclesForSchedulerDto, VehicleForScheduler, EventType, VehiclesServiceProxy, InstructorsServiceProxy, PersonalSchedulerServiceProxy, AddWorkingHourTimeslotInput } from '@shared/service-proxies/service-proxies';
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
import { IScheduler } from '../scheduler/scheduler-interface';
import { select } from '@syncfusion/ej2-schedule';
import { CreateOrEditWorkingHourModalComponent } from '@app/shared/common/scheduler/create-or-edit-workingHours-modal.component';

@Component({
  templateUrl: './personalScheduler.component.html',
  animations: [appModuleAnimation()]
})
export class PersonalSchedulerComponent extends AppComponentBase implements OnInit, IScheduler {

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

  @ViewChild('workingHourModal', { static: true })
  workingHourModal: CreateOrEditWorkingHourModalComponent;

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
    locale: abp.localization.currentLanguage.name,
    schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives',
    initialView: 'timeGridWeek',
    contentHeight: 'auto',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'timeGridWeek,timeGridDay,listWeek'
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
    firstDay : 1,
    slotMinTime: "06:00:00",
    nowIndicator: true,
    slotDuration: "00:15:00",
    selectable: true,
    editable: true,
    selectMirror: true,
    dateClick: this.handleDateClick.bind(this), // bind is important!
    select: this.handleDateSelect.bind(this),
    eventClick: this.handleEventClick.bind(this),
    eventsSet: this.handleEvents.bind(this),
    events: this.updateEvents.bind(this),
    selectOverlap: (event) => {
      return event.display !== 'background'; // Check if we overlapped any other background event here to not let it happen
    },
    eventDidMount: (info) => {
      // console.log(info);
      info.el.style.borderWidth = '4px';
    },
    eventContent: (info) => {
      //console.log(info);
      //info.el.style.borderWidth = '4px';
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
      if (info.event._def.extendedProps.appointmentType == 0) {
        let vehicleEl = document.createElement('div');
        if (info.event._def.extendedProps.startingLocation == null)
          info.event._def.extendedProps.startingLocation;
        arrayOfDomNodes.push(vehicleEl);
      }

      return { domNodes: arrayOfDomNodes }
    }

  };

  allowedToSeeOwnAppointments: boolean;
  allowedToSeeOwnDrivingLessons: boolean;

  eventTypeFilter: any = { drivingLessons: true, simulatorLessons: false, theoryLessons: true, otherEvents: true };

  vehiclesResources: any[] = [];

  constructor(
    injector: Injector,
    private _schedulerServiceProxy: SchedulerServiceProxy,
    private _personalSchedulerServiceProxy: PersonalSchedulerServiceProxy,
    private _vehiclesServiceProxy: VehiclesServiceProxy,
    private _instructorsServiceProxy: InstructorsServiceProxy
  ) {
    super(injector);
  }
  instructorsResources: any[];
  simulatorsResources: any[];

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

  updateResourcesList() {
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

          var resourceIds: any[] = [];

          if (item.vehicleId != null)
            resourceIds.push("veh_" + item.vehicleId);
          if (item.instructorIds != null) {
            for (var instructorId of item.instructorIds.keys())
              resourceIds.push("instr_" + item.instructorIds[instructorId]);
          }

          var borderColor = 'yellow';
          if (item.appointmentType == EventType.Event || item.appointmentType == EventType.Holiday) {
            borderColor = backgroundColor;
          }
          else {
            if (item.completed)
              borderColor = 'green';
            if (item.studentNotPresent)
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

        if(this.isGranted('InstructorView'))
        {
        this._personalSchedulerServiceProxy.getWorkingHours(info.start, info.end).subscribe((result) => 
        {
          console.log(result);
          for(var wo of result)
          {
            var resourceIds: any[] = [];
            resourceIds.push("instr_" + wo.instructorId);

            data.push(
              {
                id: wo.id,
                start: wo.startTime.toJSDate(),
                end: wo.endTime.toJSDate(),
                //resourceIds: resourceIds,
                display: 'background'
              }
            );
          }
          console.log(data);
          successCallback(data);
        });
      }
      else
      {
        successCallback(data);
      }

        //successCallback(data);

      });

   
  }

  eventRender(info) {
    console.log(info);
  }

  handleDateClick(arg) {
    console.log(arg);
    this.startTime = arg.date;

    if (!this.isGranted('Pages.InstructorsOwnDrivingLessons.Create')) {
      this.openEventModal();
    }
    else if (!this.isGranted('OwnAppointments.Create')) {
      this.openDrivingLessonModal();
    }
    else {
      this.createEventTypeModal.show(this, this.isGranted('Pages.InstructorsOwnDrivingLessons.Create'), false,
        this.isGranted('OwnAppointments.Create'), false);
    }

    //this.createEventTypeModal.show(this, this.isGranted('Pages.DrivingLessons.Create'), this.isGranted('Pages.DrivingLessons.Create'), true,
    //this.isGranted('Pages.SimulatorLessons.Create')); 
  }

  handleDateSelect(selectInfo: DateSelectArg) {
    console.log(selectInfo);

    if (((selectInfo.end.getTime() - selectInfo.start.getTime()) / 60000) == 15) {
      // In this case we don't use this callback because user just clicked on a timeslot
      return;
    }

    var workingHourTimeslot: AddWorkingHourTimeslotInput = new AddWorkingHourTimeslotInput();
    workingHourTimeslot.from = DateTime.fromJSDate(selectInfo.start);
    workingHourTimeslot.to = DateTime.fromJSDate(selectInfo.end);

    this._personalSchedulerServiceProxy.addWorkingHourTimeslot(workingHourTimeslot).subscribe();

    const calendarApi = selectInfo.view.calendar;
    calendarApi.unselect(); // clear date selection

    // if () {
    //   calendarApi.addEvent({
    //     // id: createEventId(),
    //     title,
    //     start: selectInfo.startStr,

    //     end: selectInfo.endStr,
    //     allDay: selectInfo.allDay
    //   });
    // }
  };

  handleEventClick(clickInfo: EventClickArg) {
    // if (args.event["AppointmentType"] == 0)
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
    if (clickInfo.event.extendedProps.appointmentType == EventType.DrivingLesson) {
      console.log(this.isGranted('Pages.InstructorsOwnDrivingLessons.Edit'));
      if (this.isGranted('Pages.InstructorsOwnDrivingLessons.Edit'))
        this.createOrEditDrivingLessonModal.show(Number(clickInfo.event.id), true);
    }
    else if (clickInfo.event.extendedProps.appointmentType == EventType.TheoryLesson)
      this.createOrEditTheoryLessonModal.show(Number(clickInfo.event.id));
    else if (clickInfo.event.extendedProps.appointmentType == EventType.Event) {
      if (this.isGranted('OwnAppointments.Edit'))
        this.createOrEditEventModal.show(Number(clickInfo.event.id), true);
    }
    else if (clickInfo.event.extendedProps.appointmentType == EventType.SimulatorLesson)
      this.createOrEditSimulatorLessonModal.show(Number(clickInfo.event.id));
  }

  handleEvents(events: EventApi[]) {
    //this.currentEvents = events;
    // console.log(events);
  }

  toggleWeekendView() {
    this.calendarOptions.weekends = this.showWeekends;
  }

  openWorkingHoursModal() : void 
  {
    const calendarApi = this.calendarComponent.getApi();

    var endDate = new Date();
    endDate.setDate(calendarApi.view.currentEnd.getDate() - 1);
    endDate.setUTCHours(0);
    endDate.setUTCMinutes(0);

    var startDate = new Date();
    startDate.setDate(calendarApi.view.currentStart.getDate());
    startDate.setUTCHours(0);
    startDate.setUTCMinutes(0);

    this.workingHourModal.show(DateTime.fromJSDate(startDate), DateTime.fromJSDate(endDate));
  }

  openTheoryLessonModal(): void {
    this.createEventTypeModal.close();
    this.createOrEditTheoryLessonModal.show(null, null, this.startTime);
  }

  openExamModal(): void {
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

  workingHoursSet()
  {
    this.refetchEvents();
  }
}