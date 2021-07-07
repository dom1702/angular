import { Component, ViewChild, Injector, Output, EventEmitter, OnInit, ViewChildren, QueryList } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { DrivingLessonsServiceProxy, CreateOrEditDrivingLessonDto, InstructorDto, InstructorsOwnDrivingLessonsServiceProxy, CourseDto, PredefinedDrivingLessonDto, StudentCourseDto, StudentsServiceProxy, PagedResultDtoOfVehicleLicenseClassLookupTableDto, CreateMultipleDrivingLessonsInput } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { DrivingLessonTopicLookupTableModalComponent } from './drivingLessonTopic-lookup-table-modal.component';
import { DLLicenseClassLookupTableModalComponent } from '../../../shared/common/lookup/drivingLesson-licenseClass-lookup-table-modal.component';
import { DLStudentLookupTableModalComponent } from './drivingLesson-student-lookup-table-modal.component';
import { TimepickerComponent } from 'ngx-bootstrap/timepicker';
import { VehicleLookupTableModalComponent } from '@app/shared/common/lookup/vehicle-lookup-table-modal.component';
import { FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';
import { MultiSelectComponent } from '@syncfusion/ej2-angular-dropdowns';
import { InstructorLookupTableModalComponent } from '@app/shared/common/lookup/instructor-lookup-table-modal.component';
import { Subscription } from 'rxjs';
import { DateTimeService } from '@app/shared/common/timing/date-time.service';
import { DateTime } from 'luxon';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { Router } from '@angular/router';

@Component({
    selector: 'createOrEditDrivingLessonModal',
    templateUrl: './create-or-edit-drivingLesson-modal.component.html',
})
export class CreateOrEditDrivingLessonModalComponent extends AppComponentBase implements OnInit {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @ViewChild('drivingLessonTopicLookupTableModal', { static: true }) drivingLessonTopicLookupTableModal: DrivingLessonTopicLookupTableModalComponent;
    @ViewChild('licenseClassLookupTableModal', { static: true }) licenseClassLookupTableModal: DLLicenseClassLookupTableModalComponent;
    @ViewChild('studentLookupTableModal', { static: true }) studentLookupTableModal: DLStudentLookupTableModalComponent;
    @ViewChild('vehicleLookupTableModal', { static: true }) vehicleLookupTableModal: VehicleLookupTableModalComponent;


    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    ismeridian: boolean = false;

    active = false;
    saving = false;
    startTime: Date;
    startTimeTime: Date;

    drivingLesson: CreateOrEditDrivingLessonDto = new CreateOrEditDrivingLessonDto();

    drivingLessonTopic = '';
    licenseClass = '';
    studentFirstName = '';
    studentLastName = '';
    studentFullName = '';
    vehicleName = '';

    instructorPersonalLesson: boolean;
    instructorId?: number;

    instructors = [];
    instructorsSelectedItems = [];
    dropdownSettings: IDropdownSettings;
    placeholder = this.l('Select');

    showStudentSelection = false;
    studentSelected = false;

    selectedStudentCourse: CourseDto;
    studentCourses: CourseDto[];

    selectedPdl;

    numberOfLessonsAddition: string = this.l("NumberOfLessonsMinutesPerLessonAddition");

    setTopicNameAutomatically: boolean = true;

    currentStudentDefaultInstructorId;

    currentState = 0;

    pdlCheckboxesList;
    numberOfCheckedPdls = 0;

    // With this variables we will disable setting the students default instructor/vehicle
    instructorSetExternallyOnShow = false;
    vehicleSetExternallyOnShow = false;

    constructor(
        injector: Injector,
        private _drivingLessonsServiceProxy: DrivingLessonsServiceProxy,
        private _instructorsOwnDrivingLessonsServiceProxy: InstructorsOwnDrivingLessonsServiceProxy,
        private _studentsServiceProxy: StudentsServiceProxy,
        private _dateTimeService: DateTimeService,
        private _router: Router
    ) {
        super(injector);

    }

    ngOnInit() {
        this.dropdownSettings =
        {
            singleSelection: false,
            idField: 'item_id',
            textField: 'item_text',
            selectAllText: this.l('SelectAll'),
            unSelectAllText: this.l('UnselectAll'),
            allowSearchFilter: false,
            noDataAvailablePlaceholderText: this.l('NoData')
        };

        this.ismeridian = false;

        var minutesPerLesson = abp.setting.get("App.CoreData.DurationDrivingLesson");
        this.numberOfLessonsAddition = "(á " + minutesPerLesson + " minutes)";

        this.numberOfCheckedPdls = 0;
    }

    updateState() {
        if (this.currentState == 1) {
            this.drivingLesson.completed = false;
            this.drivingLesson.studentNotPresent = false;
        }
        else if (this.currentState == 2) {
            this.drivingLesson.completed = true;
            this.drivingLesson.studentNotPresent = false;
        }
        else if (this.currentState == 3) {
            this.drivingLesson.completed = false;
            this.drivingLesson.studentNotPresent = true;
        }
        console.log(this.currentState);
    }

    onItemSelect(item: any) {
        console.log(item);
    }

    onSelectAll(items: any) {
        console.log(items);
    }

    show(drivingLessonId?: number, instructorPersonalLesson: boolean = false, studentId: number = null,
        studentFirstName: string = "", studentLastName: string = "", startTime: Date = null, preselectedCourseId: number = null,
        instructorId: number = null, vehicleId: number = null, vehicleName: string = null): void {

        if (instructorId != null)
            this.instructorSetExternallyOnShow = true;
        else
            this.instructorSetExternallyOnShow = false;

        if (vehicleId != null)
            this.vehicleSetExternallyOnShow = true;
        else
            this.vehicleSetExternallyOnShow = false;

        this.instructorPersonalLesson = instructorPersonalLesson;
        this.selectedPdl = null;

        if (!drivingLessonId) {

            this.currentState = 1;
            this.drivingLesson = new CreateOrEditDrivingLessonDto();
            this.drivingLesson.billToStudent = true;

            if (studentId != null) {
                this.drivingLesson.studentId = studentId;
                this.studentFirstName = studentFirstName;
                this.studentLastName = studentLastName;
                this.studentSelected = true;
                this.showStudentSelection = false;
                this.refreshCourses(preselectedCourseId);
            }
            else {
                this.studentFirstName = '';
                this.studentLastName = '';
                this.showStudentSelection = true;
            }

            this.drivingLesson.id = drivingLessonId;
            this.drivingLesson.startTime = this._dateTimeService.getStartOfDay();
            if (startTime != null) {
                this.startTime = startTime;
                this.startTimeTime = startTime;
            }
            else {
                this.startTime = this._dateTimeService.getDate().toJSDate();
                this.startTimeTime = this._dateTimeService.getDate().toJSDate();
            }

            this.drivingLessonTopic = '';
            this.licenseClass = '';

            this.vehicleName = '';
            this.drivingLesson.length = 1;
            this.drivingLesson.addingMinutesAfter = 0;
            this.refreshStudentFullName();
            
            if(vehicleId != null)
            {
                this.drivingLesson.vehicleId = vehicleId;
                this.vehicleName = vehicleName;
            }

            this._drivingLessonsServiceProxy.getAllInstructorForLookupTable(
                "",
                "",
                0,
                1000).subscribe(result => {
                    this.instructors = [];
                    this.instructorsSelectedItems = [];

                    for (var i = 0; i < result.items.length; i++) {
                        this.instructors.push(
                            {
                                item_id: result.items[i].id,
                                item_text: result.items[i].displayName
                            });
                        if (instructorId != null && result.items[i].id == instructorId) {
                            this.instructorsSelectedItems.push({
                                item_id: result.items[i].id,
                                item_text: result.items[i].displayName
                            });
                        }
                    }
                });

            this.active = true;

            this.modal.show();
        } else if (this.instructorPersonalLesson) {
            this._instructorsOwnDrivingLessonsServiceProxy.getDrivingLessonForEdit(drivingLessonId).subscribe(result => {
                this.drivingLesson = result.drivingLesson;
                this.drivingLessonTopic = result.drivingLesson.topic;
                this.licenseClass = result.drivingLesson.licenseClass;
                this.studentFirstName = (result.studentFirstName == null) ? "" : result.studentFirstName;
                this.studentLastName = (result.studentLastName == null) ? "" : result.studentLastName;
                this.vehicleName = result.vehicleNameBrandModel;
                this.refreshStudentFullName();

                this.startTime = result.drivingLesson.startTime.toJSDate();
                this.startTimeTime = result.drivingLesson.startTime.toJSDate();

                this.showStudentSelection = false;
                this.studentSelected = true;
                this.selectedStudentCourse = null;
                this.studentCourses = null;

                if (this.drivingLesson.completed)
                    this.currentState = 2;
                else if (this.drivingLesson.studentNotPresent)
                    this.currentState = 3;
                else
                    this.currentState = 1;

                this._drivingLessonsServiceProxy.getCoursesForCreateOrEdit(this.drivingLesson.studentId).subscribe(result2 => {
                    this.studentCourses = result2.courses;

                    for (let course of this.studentCourses) {
                        if (course.id == result.drivingLesson.courseId) {
                            this.selectedStudentCourse = course;


                            for (let pdl of course.predefinedDrivingLessons) {
                                if (pdl.lessonIdString == result.drivingLesson.predefinedDrivingLessonId)
                                    this.selectedPdl = pdl;
                            }
                        }
                    }
                });

                this.active = true;
                this.updateInstructors(true);

                this.modal.show();
            });
        } else {
            this._drivingLessonsServiceProxy.getDrivingLessonForEdit(drivingLessonId).subscribe(result => {
                this.drivingLesson = result.drivingLesson;
                this.drivingLessonTopic = result.drivingLesson.topic;
                this.licenseClass = result.drivingLesson.licenseClass;
                this.studentFirstName = (result.studentFirstName == null) ? "" : result.studentFirstName;
                this.studentLastName = (result.studentLastName == null) ? "" : result.studentLastName;
                this.vehicleName = result.vehicleNameBrandModel;
                this.refreshStudentFullName();

                this.startTime = result.drivingLesson.startTime.toJSDate();
                this.startTimeTime = result.drivingLesson.startTime.toJSDate();

                this.showStudentSelection = false;
                this.studentSelected = true;
                this.selectedStudentCourse = null;
                this.studentCourses = null;

                if (this.drivingLesson.completed)
                    this.currentState = 2;
                else if (this.drivingLesson.studentNotPresent)
                    this.currentState = 3;
                else
                    this.currentState = 1;

                this._drivingLessonsServiceProxy.getAllInstructorForLookupTable(
                    "",
                    "",
                    0,
                    1000).subscribe(result => {
                        this.instructors = [];
                        this.instructorsSelectedItems = [];

                        for (var i = 0; i < result.items.length; i++) {
                            this.instructors.push(
                                {
                                    item_id: result.items[i].id,
                                    item_text: result.items[i].displayName
                                }
                            );
                        }

                        if (this.drivingLesson.instructors != null && this.drivingLesson.instructors.length > 0) {
                            for (var item of this.instructors) {
                                for (var instr of this.drivingLesson.instructors) {
                                    if (item.item_id == instr.id) {
                                        this.instructorsSelectedItems.push(
                                            {
                                                item_id: item.item_id,
                                                item_text: item.item_text
                                            }
                                        );
                                    }
                                }
                            }
                        }
                    });



                this._drivingLessonsServiceProxy.getCoursesForCreateOrEdit(this.drivingLesson.studentId).subscribe(result2 => {
                    this.studentCourses = result2.courses;

                    for (let course of this.studentCourses) {
                        if (course.id == result.drivingLesson.courseId) {
                            this.selectedStudentCourse = course;


                            for (let pdl of course.predefinedDrivingLessons) {
                                if (pdl.lessonIdString == result.drivingLesson.predefinedDrivingLessonId)
                                    this.selectedPdl = pdl;
                            }
                        }
                    }
                });

                this.active = true;

                this.modal.show();
            });
        }
    }

    getTopicName(pdlName: string): string {
        if (!this.setTopicNameAutomatically)
            return this.drivingLessonTopic;
        if (pdlName == '')
            return this.drivingLesson.topic = this.selectedStudentCourse.licenseClass + " - " + this.studentFirstName + " " + this.studentLastName;
        else
            return this.drivingLesson.topic = this.selectedStudentCourse.licenseClass + " - " + pdlName + " - " + this.studentFirstName + " " + this.studentLastName;
    }

    save(): void {
        this.saving = true;

        if (!this.setTopicNameAutomatically)
            this.drivingLesson.topic = this.drivingLessonTopic;

        this.startTime.setHours(this.startTimeTime.getHours());
        this.startTime.setMinutes(this.startTimeTime.getMinutes());
        this.drivingLesson.startTime = this._dateTimeService.fromJSDate(this.startTime);

        this.drivingLesson.courseId = this.selectedStudentCourse.id;
        this.drivingLesson.doneAtForeignSchool = false;
        this.drivingLesson.foreignSchoolName = "";

        this.drivingLesson.instructors = [];
        for (var instrSelected of this.instructorsSelectedItems) {
            var instr: InstructorDto = new InstructorDto()
            instr.id = instrSelected.item_id;
            this.drivingLesson.instructors.push(instr);
        }

        // If this is set user edited an already existing lesson or the number of checked pdls is none or one, use the normal CreateOrEdit endpoints
        if (this.drivingLesson.id != null || this.numberOfCheckedPdls == 0 || this.numberOfCheckedPdls == 1) {

            //If driving lesson already exists, just use the one from the radio button list
            if (this.drivingLesson.id != null) {
                if (this.selectedPdl) {
                    this.drivingLesson.topic = this.getTopicName(this.selectedPdl.name);
                    this.drivingLesson.predefinedDrivingLessonId = this.selectedPdl.lessonIdString;
                }
                else {
                    this.drivingLesson.topic = this.getTopicName('');
                    this.drivingLesson.predefinedDrivingLessonId = null;
                }
            }
            else { // else get it from the checkox list 
                if (this.numberOfCheckedPdls == 0) {
                    this.drivingLesson.predefinedDrivingLessonId = null;
                    this.drivingLesson.topic = this.getTopicName('');
                }
                else {
                    for (var pdl of this.pdlCheckboxesList) {
                        if (pdl.checked) {
                            this.drivingLesson.predefinedDrivingLessonId = pdl.id;

                            this.drivingLesson.topic = this.getTopicName(pdl.name);
                            console.log(this.drivingLesson.topic);
                        }
                    }
                }
            }

            if (this.instructorPersonalLesson) {
                this._instructorsOwnDrivingLessonsServiceProxy.createOrEdit(this.drivingLesson)
                    .pipe(finalize(() => { this.saving = false; }))
                    .subscribe(() => {
                        this.notify.info(this.l('SavedSuccessfully'));
                        this.close();
                        this.modalSave.emit(null);
                    });
            }
            else {
                this._drivingLessonsServiceProxy.createOrEdit(this.drivingLesson)
                    .pipe(finalize(() => { this.saving = false; }))
                    .subscribe(() => {
                        this.notify.info(this.l('SavedSuccessfully'));
                        this.close();
                        this.modalSave.emit(null);
                    });
            }
        }
        else { //Definitely a new driving lesson and more than one pdl checked
            if (this.instructorPersonalLesson) {
                // this._instructorsOwnDrivingLessonsServiceProxy.createOrEdit(this.drivingLesson)
                //     .pipe(finalize(() => { this.saving = false; }))
                //     .subscribe(() => {
                //         this.notify.info(this.l('SavedSuccessfully'));
                //         this.close();
                //         this.modalSave.emit(null);
                //     });
            }
            else {
                this.drivingLesson.topic = this.getTopicName("$pdl");

                var lessonIdStrings = [];
                for (var pdl of this.pdlCheckboxesList)
                    if (pdl.checked)
                        lessonIdStrings.push(pdl.id);

                var input: CreateMultipleDrivingLessonsInput = new CreateMultipleDrivingLessonsInput()

                input.drivingLesson = this.drivingLesson;
                input.predefinedLessonIdStrings = lessonIdStrings;

                this._drivingLessonsServiceProxy.createMultiple(input)
                    .pipe(finalize(() => { this.saving = false; }))
                    .subscribe(() => {
                        this.notify.info(this.l('SavedSuccessfully'));
                        this.close();
                        this.modalSave.emit(null);
                    });
            }
        }
    }

    updateInstructors(drivingLessonEdit: boolean): void {
        // console.log(this.active);
        if (!this.active) {
            return;
        }

        this.primengTableHelper.showLoadingIndicator();

        this._drivingLessonsServiceProxy.getAllInstructorForLookupTable(
            "",
            "",
            0,
            1000).subscribe(result => {
                this.instructors = [];

                for (var i = 0; i < result.items.length; i++) {
                    this.instructors.push(
                        {
                            item_id: result.items[i].id,
                            item_text: result.items[i].displayName
                        }
                    );
                }
            });
    }

    updateCheck() {
        console.log(this.selectedPdl);
    }

    openSelectDrivingLessonTopicModal() {
        this.drivingLessonTopicLookupTableModal.id = 0;
        this.drivingLessonTopicLookupTableModal.displayName = this.drivingLessonTopic;
        this.drivingLessonTopicLookupTableModal.show();
    }
    openSelectLicenseClassModal() {
        //this.licenseClassLookupTableModal.id = this.drivingLesson.licenseClass;
        this.licenseClassLookupTableModal.displayName = this.licenseClass;
        this.licenseClassLookupTableModal.show();
    }

    openSelectVehicleModal() {
        //this.licenseClassLookupTableModal.id = this.drivingLesson.licenseClass;
        //this.vehicleLookupTableModal.displayName = this.licenseClass;
        this.vehicleLookupTableModal.show();
    }

    setVehicleNull() {
        this.drivingLesson.vehicleId = null;
        this.vehicleName = '';
    }

    setTopicNull() {
        this.drivingLesson.topic = null;
        this.drivingLessonTopic = '';
    }
    setLicenseClassNull() {
        this.drivingLesson.licenseClass = null;
        this.licenseClass = '';
    }

    setStudentIdNull() {
        this.drivingLesson.studentId = null;
        this.studentFirstName = '';
        this.studentLastName = '';
        this.refreshStudentFullName();
        this.studentSelected = false;
        this.selectedPdl = undefined;
    }

    openSelectStudentModal() {

        this.studentLookupTableModal.id = this.drivingLesson.studentId;
        this.studentLookupTableModal.firstName = this.studentFirstName;
        this.studentLookupTableModal.lastName = this.studentLastName;
        this.refreshStudentFullName();
        this.studentLookupTableModal.show();
    }

    getNewStudentId() {
        if (this.studentLookupTableModal.id == null)
            return;

        this.drivingLesson.studentId = this.studentLookupTableModal.id;
        this.studentFirstName = this.studentLookupTableModal.firstName;
        this.studentLastName = this.studentLookupTableModal.lastName;
        this.refreshStudentFullName();
        this.studentSelected = true;

        this.refreshCourses();
    }

    courseSelected() {
        this.updateCheckboxList();
    }

    refreshCourses(preselectedCourseId: number = null) {
        this._drivingLessonsServiceProxy.getCoursesForCreateOrEdit(this.drivingLesson.studentId).subscribe(result => {
            this.studentCourses = result.courses

            if (this.studentCourses.length > 0) {
                if (preselectedCourseId) {
                    for (var i of this.studentCourses)
                        if (i.id == preselectedCourseId)
                            this.selectedStudentCourse = i;
                }
                else {
                    this.selectedStudentCourse = this.studentCourses[0];
                }
                this.updateCheckboxList();
            }

            this.currentStudentDefaultInstructorId = result.defaultInstructorId;
            this.drivingLesson.startingLocation = result.defaultStartingLocation;

            if (!this.instructorSetExternallyOnShow) {
                this.instructorsSelectedItems = [];

                for (var item of this.instructors) {
                    if (item.item_id == this.currentStudentDefaultInstructorId) {
                        //if (this.instructorsSelectedItems.find(x => x.id == this.currentStudentDefaultInstructorId)) {
                        this.instructorsSelectedItems.push(
                            {
                                item_id: item.item_id,
                                item_text: item.item_text
                            }
                        );
                        //}
                    }
                }
            }

            if(!this.vehicleSetExternallyOnShow)
            {
                this.drivingLesson.vehicleId = result.defaultVehicleId;
                this.vehicleName = result.defaultVehicleName
            }
        })
    }

    updateCheckboxList() {
        this.pdlCheckboxesList = [];

        for (var pdl of this.selectedStudentCourse.predefinedDrivingLessons) {
            this.pdlCheckboxesList.push(
                {
                    id: pdl.lessonIdString,
                    name: pdl.name,
                    checked: false
                }
            )
        }

        this.numberOfCheckedPdls = 0;
    }

    updatedCheckboxList() {
        var numberOfChecked = 0;

        for (var pdl of this.pdlCheckboxesList) {
            if (pdl.checked)
                numberOfChecked++;
        }

        if (numberOfChecked > 1)
            this.setTopicNameAutomatically = true;

        this.numberOfCheckedPdls = numberOfChecked;
        console.log(this.pdlCheckboxesList);
        console.log(this.numberOfCheckedPdls);
    }

    getNewTopic() {

        this.drivingLesson.topic = this.drivingLessonTopicLookupTableModal.displayName;
        this.drivingLesson.description = this.drivingLessonTopicLookupTableModal.description;
        this.drivingLessonTopic = this.drivingLessonTopicLookupTableModal.displayName;
    }
    getNewLicenseClass() {
        this.drivingLesson.licenseClass = this.licenseClassLookupTableModal.displayName;
        this.licenseClass = this.licenseClassLookupTableModal.displayName;
    }

    getNewVehicle() {
        if (this.vehicleLookupTableModal.id == null)
            return;

        this.drivingLesson.vehicleId = this.vehicleLookupTableModal.id;
        this.vehicleName = this.vehicleLookupTableModal.name + ' ( ' + this.vehicleLookupTableModal.brand + ' ' + this.vehicleLookupTableModal.model + ')';
    }

    refreshStudentFullName() {
        this.studentFullName = this.studentFirstName + ' ' + this.studentLastName;
    }

    delete(): void {
        this.message.confirm(
            '',
            '',
            (isConfirmed) => {
                if (isConfirmed) {

                    if (this.instructorPersonalLesson) {
                        this._instructorsOwnDrivingLessonsServiceProxy.delete(this.drivingLesson.id)
                            .subscribe(() => {
                                this.notify.success(this.l('SuccessfullyDeleted'));
                                this.close();
                                this.modalSave.emit(null);
                            });
                    } else {
                        this._drivingLessonsServiceProxy.delete(this.drivingLesson.id)
                            .subscribe(() => {
                                this.notify.success(this.l('SuccessfullyDeleted'));
                                this.close();
                                this.modalSave.emit(null);
                            });
                    }
                }
            }
        );
    }

    close(): void {
        this.active = false;
        this.modal.hide();

        this.studentSelected = null;
    }

    goToStudentOverview(): void {
        var studentId = this.drivingLesson.studentId;
        this.close();
        this._router.navigate(['app/main/students/students/students-overview', { id: studentId }]);
    }

    instructorSelected(): boolean {
        if (this.instructorPersonalLesson)
            return true;

        return this.instructorsSelectedItems != null && this.instructorsSelectedItems.length > 0;
    }

    vehicleSelected(): boolean {
        return this.drivingLesson.vehicleId != null;
    }
}
