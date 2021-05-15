import { Component, ViewChild, Injector, Output, EventEmitter } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as moment from 'moment';
import { LazyLoadEvent } from 'primeng/api';
import { Paginator } from 'primeng/paginator';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { PersonalSchedulerServiceProxy, UpdateMultipleWorkingHourTimeslotsInput, WorkingHourDto } from '@shared/service-proxies/service-proxies';
import { DateTime, Interval } from 'luxon';
import { result } from 'lodash';

class WorkingHourDay {
  isToday: boolean;
  day: DateTime;
  timeslots: WorkingHourTimeslot[];
}

class WorkingHourTimeslot {
  id: number;
  startTime: DateTime;
  endTime: DateTime;
}

@Component({
  selector: 'createOrEditWorkingHourModal',
  templateUrl: './create-or-edit-workingHours-modal.component.html'
})
export class CreateOrEditWorkingHourModalComponent extends AppComponentBase {

  @ViewChild('createOrEditModal') modal: ModalDirective;

  @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

  active = false;
  saving = false;

  workingHourDays: WorkingHourDay[] = [];

  currentEditTimeslot: WorkingHourTimeslot;
  currentStartTimeInEdit: Date;
  currentEndTimeInEdit: Date;
  // This is true in case this is a newly created timeslot currently in edit
  // We use this variable to delete the timeslot again if user clicked on cancel
  currentEditFreshTimeslot: WorkingHourTimeslot;

  deletedWorkingHourIds: number[];
  addedWorkingHours: WorkingHourDto[];
  editedWorkingHours: WorkingHourDto[];

  startTimeValid: boolean = true;
  endTimeValid: boolean = true;

  copyDateRange: Date[];

  minDate: Date;
  maxDate: Date;

  startTime : DateTime;
  endTime : DateTime;

  constructor(
    injector: Injector,
    private _personalSchedulerServiceProxy: PersonalSchedulerServiceProxy
  ) {
    super(injector);
  }


  show(startTime: DateTime, endTime: DateTime): void {

    this.startTime = startTime;
    this.endTime = endTime;

    console.log(this.startTime);
    console.log(this.endTime);

    this.workingHourDays = [];

    this.deletedWorkingHourIds = [];
    this.editedWorkingHours = [];
    this.addedWorkingHours = [];

    this.addWorkingHourDay(startTime);

    // If we have a bigger timespan than one day
    if (startTime.day != endTime.day) {
      var i = 1;
      var current: DateTime = startTime.plus({ days: 1 });

      while (i <= 7) {

        this.addWorkingHourDay(current);

        if (current.day == endTime.day)
          break;

        current = current.plus({ days: 1 });

        i++;
      }
    }

    this._personalSchedulerServiceProxy.getWorkingHours(startTime, endTime).subscribe((result) => {

      for (var woDay of this.workingHourDays) {
        for (var entry of result) {
          var start: DateTime = entry.startTime;
          if (start.day == woDay.day.day) {
            var timeslot: WorkingHourTimeslot = new WorkingHourTimeslot();
            timeslot.startTime = start;
            timeslot.endTime = entry.endTime;
            timeslot.id = entry.id;
            this.addWorkingHourTimeslot(woDay, timeslot);
          }
        }
      }

      this.minDate = this.workingHourDays[this.workingHourDays.length - 1].day.plus({ days: 1 }).toJSDate();
      this.maxDate = this.workingHourDays[this.workingHourDays.length - 1].day.plus({ days: 91 }).toJSDate();

    });

    this.clearDateRange();

    this.active = true;
    this.modal.show();

  }

  addWorkingHourDay(day: DateTime): any {
    //let newDay :DateTime = DateTime.local() ;
    //newDay.set(day);

    this.workingHourDays.push({
      isToday: day.hasSame(DateTime.local(), 'day'),
      day: day,
      timeslots: []
    });
  }

  addWorkingHourTimeslot(day: WorkingHourDay, timeslot: WorkingHourTimeslot) {
    for (var d of this.workingHourDays)
      if (d === day)
        d.timeslots.push(timeslot);
  }

  isTimeslotCurrentlyInEdit(timeslot: WorkingHourTimeslot): boolean {
    if (this.currentEditTimeslot === timeslot)
      return true;

    return false;
  }

  anyTimeslotCurrentlyInEdit(): boolean {
    return this.currentEditTimeslot != null;
  }

  editTimeslot(timeslot: WorkingHourTimeslot) {

    this.currentStartTimeInEdit = timeslot.startTime.toJSDate();
    this.currentEndTimeInEdit = timeslot.endTime.toJSDate();
    this.currentEditTimeslot = timeslot;
  }

  deleteTimeslot(timeslot: WorkingHourTimeslot) {
    // We only add it to the deleted list of it is not a newly created timeslot,
    // otherwise deleting it from the local list is sufficient
    if (timeslot.id != 0) {
      var entry = this.deletedWorkingHourIds.find(x => x == timeslot.id);

      if (entry == null)
        this.deletedWorkingHourIds.push(timeslot.id);
    }

    for (var woDay of this.workingHourDays) {
      woDay.timeslots.forEach((item, index) => {
        if (item === timeslot) woDay.timeslots.splice(index, 1);
      });
    }
  }

  saveTimeslot(timeslot: WorkingHourTimeslot) {

    if (this.currentEndTimeInEdit <= this.currentStartTimeInEdit) {
      abp.message.error("Start time may not be higher than end time", this.l('Error'));
      return;
    }

    var currentStartTimeInEditDateTime = DateTime.fromJSDate(this.currentStartTimeInEdit);
    var currentEndTimeInEditDateTime = DateTime.fromJSDate(this.currentEndTimeInEdit);

    if (timeslot.id == 0) {
      // It is a new timeslot so we check for overlap without ignoring a timeslot
      if (this.timeslotOverlaps(currentStartTimeInEditDateTime, currentEndTimeInEditDateTime, timeslot)) {
        abp.message.error("Time overlaps with another working hour definition", this.l('Error'));
        return;
      }
    }
    else {
      if (this.timeslotOverlaps(currentStartTimeInEditDateTime, currentEndTimeInEditDateTime, timeslot)) {
        abp.message.error("Time overlaps with another working hour definition", this.l('Error'));
        return;
      }
    }

    timeslot.startTime = DateTime.fromJSDate(this.currentStartTimeInEdit);
    timeslot.endTime = DateTime.fromJSDate(this.currentEndTimeInEdit);
    this.currentEditTimeslot = null;
    this.currentStartTimeInEdit = null;
    this.currentEndTimeInEdit = null;

    if (timeslot.id != 0) {
      // It is a new one, so we add it to the added list
      var entry = this.editedWorkingHours.find(x => x.id == timeslot.id);

      if (entry == null) {
        var wo: WorkingHourDto = new WorkingHourDto();
        wo.id = timeslot.id;
        wo.startTime = timeslot.startTime;
        wo.endTime = timeslot.endTime;
        this.editedWorkingHours.push(wo);
      }
      else {
        // It is already in edited list, we just update time 
        entry.startTime = timeslot.startTime;
        entry.endTime = timeslot.endTime;
      }
    }
  }

  cancelEdit() {
    this.currentEditTimeslot = null;
    this.currentStartTimeInEdit = null;
    this.currentEndTimeInEdit = null;

    if (this.currentEditFreshTimeslot != null) {
      this.deleteTimeslot(this.currentEditFreshTimeslot);
      this.currentEditFreshTimeslot = null;
    }
  }

  timeslotOverlaps(startTime: DateTime, endTime: DateTime, ignoreSlot: WorkingHourTimeslot) {
    var interval: Interval = Interval.fromDateTimes(startTime, endTime);
    for (var woDay of this.workingHourDays) {
      for (var woDaySlot of woDay.timeslots) {
        if (ignoreSlot == woDaySlot)
          continue;

        if (interval.overlaps(Interval.fromDateTimes(woDaySlot.startTime, woDaySlot.endTime)))
          return true;
      }
    }

    return false;
  }

  addNewTimeslot(day: WorkingHourDay) {
    var timeslot: WorkingHourTimeslot = new WorkingHourTimeslot();
    timeslot.startTime = day.day.set({ hour: 7, minute: 0 });
    timeslot.endTime = day.day.set({ hour: 15, minute: 0 });
    timeslot.id = 0;
    this.addWorkingHourTimeslot(day, timeslot);

    this.currentEditFreshTimeslot = timeslot;

    this.editTimeslot(timeslot);
  }

  getCurrentSlotInEdit() {
    return this.currentEditTimeslot;
  }

  save(): void {
    this.saving = true;

    for (var woDay of this.workingHourDays) {
      for (var slot of woDay.timeslots) {
        if (slot.id == 0) {
          var wo: WorkingHourDto = new WorkingHourDto();
          wo.id = slot.id;
          wo.startTime = slot.startTime;
          wo.endTime = slot.endTime;
          this.addedWorkingHours.push(wo);
        }
      }
    }

    var input: UpdateMultipleWorkingHourTimeslotsInput = new UpdateMultipleWorkingHourTimeslotsInput();
    input.addedWorkingHours = this.addedWorkingHours;
    input.editedWorkingHours = this.editedWorkingHours;
    input.deletedWorkingHourIds = this.deletedWorkingHourIds;

    if (this.copyDateRange != undefined) 
    {
      input.copyFromDateSource = this.startTime;
      input.copyToDateSource = this.endTime;
      input.copyFromDateTarget = DateTime.fromJSDate(this.copyDateRange[0]);
      input.copyToDateTarget = DateTime.fromJSDate(this.copyDateRange[1]);

      console.log(input.copyFromDateSource);
      console.log(input.copyToDateSource);

      this.message.confirm(
        '',
        '',
        (isConfirmed) => {
          if (isConfirmed) {

            this._personalSchedulerServiceProxy.updateMultipleWorkingHourTimeslots(input)
            .pipe(finalize(() => { this.saving = false; }))
              .subscribe(() => {
                this.notify.info(this.l('SavedSuccessfully'));
                this.close();
                this.modalSave.emit(null);
              });
          }
          else
        {
          this.saving = false;
        }
        }
        
      );
    }
    else 
    {
      this._personalSchedulerServiceProxy.updateMultipleWorkingHourTimeslots(input)
        .pipe(finalize(() => { this.saving = false; }))
        .subscribe(() => {
          this.notify.info(this.l('SavedSuccessfully'));
          this.close();
          this.modalSave.emit(null);
        });
    }
  }

  clearDateRange()
  {
    this.copyDateRange = undefined;
  }

  close(): void {

    this.active = false;
    this.modal.hide();
  }

}
