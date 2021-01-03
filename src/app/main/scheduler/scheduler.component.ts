import { Component, Injector, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { View, EventSettingsModel, DayService, WeekService, WorkWeekService, MonthService, AgendaService, MonthAgendaService, TimelineViewsService, TimelineMonthService, ScheduleComponent, PopupOpenEventArgs, CellClickEventArgs, EventClickArgs, NavigatingEventArgs, ActionEventArgs, EventRenderedArgs, WorkHoursModel } from '@syncfusion/ej2-angular-schedule';
import { SchedulerServiceProxy, GetAllVehiclesForSchedulerDto, VehicleForScheduler } from '@shared/service-proxies/service-proxies';
import { CreateOrEditDrivingLessonModalComponent } from '../lessons/drivingLessons/create-or-edit-drivingLesson-modal.component';
import { CreateEventTypeModalComponent } from './create-event-type-modal.component';
import { CreateOrEditTheoryLessonModalComponent } from '../lessons/theoryLessons/create-or-edit-theoryLesson-modal.component';
import { CreateOrEditEventModalComponent } from './create-or-edit-event-modal.component';
import { InstructorLookupTableModalComponent } from '@app/shared/common/lookup/instructor-lookup-table-modal.component';
import { StudentLookupTableModalComponent } from '@app/shared/common/lookup/student-lookup-table-modal.component';
import { CreateOrEditSimulatorLessonModalComponent } from '../lessons/simulatorLessons/create-or-edit-simulatorLesson-modal.component';
import { CalendarOptions, DateSelectArg, EventApi, EventClickArg, FullCalendarComponent } from '@fullcalendar/angular';


import { Calendar } from '@fullcalendar/core'; // include this line

@Component({
    providers: [DayService, WeekService, WorkWeekService, MonthService, AgendaService, MonthAgendaService, TimelineViewsService, TimelineMonthService],
    templateUrl: './scheduler.component.html',
    animations: [appModuleAnimation()]
})
export class SchedulerComponent extends AppComponentBase implements OnInit {

    @ViewChild('createOrEditDrivingLessonModal', { static: true })
    createOrEditDrivingLessonModal: CreateOrEditDrivingLessonModalComponent;

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

    showWeekends : boolean = false;

    simulatorFeatureEnabled;
    //calendarPlugins = [dayGridPlugin];
    calendarOptions: CalendarOptions = {
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
        resources: [
          {
            id: 'veh1',
            title: 'Tesla Model 3'
          },
          {
            id: 'veh2',
            title: 'Hyundai Kona Electric'
          }
        ],
        dateClick: this.handleDateClick.bind(this), // bind is important!
        select: this.handleDateSelect.bind(this),
        eventClick: this.handleEventClick.bind(this),
        eventsSet: this.handleEvents.bind(this),
        events: this.updateEvents.bind(this)
      
      };

    eventTypeFilter: any = { drivingLessons: true, simulatorLessons: false, theoryLessons: true, otherEvents: true };

    constructor(
        injector: Injector,
        private _schedulerServiceProxy: SchedulerServiceProxy
    ) {
        super(injector);
    }

    ngOnInit(): void {
 

        const name = Calendar.name; 
        this.simulatorFeatureEnabled = abp.features.isEnabled("App.Simulator");
    }

    updateEvents(info, successCallback, failureCallback)
    {
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

            let data : any = [];

            for (var item of result) {
                data.push(
                    {
                        //Id: item.id,
                        title: item.subject,
                        start: item.startTime.toJSDate(),
                        end: item.endTime.toJSDate(),
                        resourceId: "veh1"
                        //AppointmentType: item.appointmentType.toString(),
                       // VehicleID: 1
                    });
            }

            console.log(data);

            successCallback(data);

        });
    }

    handleDateClick(arg) {
        alert('date click! ' + arg.dateStr)
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
        if (confirm(`Are you sure you want to delete the event '${clickInfo.event.title}'`)) {
          clickInfo.event.remove();
        }
      }

      handleEvents(events: EventApi[]) {
        //this.currentEvents = events;
       // console.log(events);
      }

      toggleWeekendView()
      {
        this.calendarOptions.weekends = this.showWeekends;
      }

      updateCurrentView()
      {

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

    refetchEvents()
    {
      
      let calendarApi = this.calendarComponent.getApi();
      calendarApi.refetchEvents();
    }

    setInstructorNull() {
        this.instructorId = null;
        this.currentInstructorFullName = '';
        this.refetchEvents();
    }


    getNewInstructorId() {
        if(this.instructorLookupTableModal.id == null)
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
