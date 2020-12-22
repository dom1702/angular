import { Component, ViewChild, Injector, Output, EventEmitter, OnInit, ViewChildren, QueryList } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { finalize } from 'rxjs/operators';
import { DrivingLessonsServiceProxy, CreateOrEditDrivingLessonDto, InstructorDto, InstructorsOwnDrivingLessonsServiceProxy, CourseDto, PredefinedDrivingLessonDto, StudentCourseDto, StudentsServiceProxy } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as moment from 'moment';
import { DrivingLessonTopicLookupTableModalComponent } from './drivingLessonTopic-lookup-table-modal.component';
import { DLLicenseClassLookupTableModalComponent } from '../../../shared/common/lookup/drivingLesson-licenseClass-lookup-table-modal.component';
import { DLStudentLookupTableModalComponent } from './drivingLesson-student-lookup-table-modal.component';
import { TimepickerComponent } from 'ngx-bootstrap/timepicker';
import { VehicleLookupTableModalComponent } from '@app/shared/common/lookup/vehicle-lookup-table-modal.component';
import { FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';
import { MultiSelectComponent } from '@syncfusion/ej2-angular-dropdowns';
import { InstructorLookupTableModalComponent } from '@app/shared/common/lookup/instructor-lookup-table-modal.component';
import { Subscription } from 'rxjs';

@Component({
    selector: 'createOrEditExamDrivingModal',
    templateUrl: './create-or-edit-examDriving-modal.component.html',
})
export class CreateOrEditExamDrivingModalComponent extends AppComponentBase implements OnInit {

    @ViewChild('createOrEditModal') modal: ModalDirective;
    @ViewChild('drivingLessonTopicLookupTableModal') drivingLessonTopicLookupTableModal: DrivingLessonTopicLookupTableModalComponent;
    @ViewChild('licenseClassLookupTableModal') licenseClassLookupTableModal: DLLicenseClassLookupTableModalComponent;
    @ViewChild('studentLookupTableModal') studentLookupTableModal: DLStudentLookupTableModalComponent;
    @ViewChild('vehicleLookupTableModal') vehicleLookupTableModal: VehicleLookupTableModalComponent;


    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    ismeridian: boolean = false;

    active = false;
    saving = false;
    startTime: Date = new Date();
    drivingLesson: CreateOrEditDrivingLessonDto = new CreateOrEditDrivingLessonDto();

    drivingLessonTopic = '';
    licenseClass = '';
    studentFirstName = '';
    studentLastName = '';
    studentFullName = '';
    vehicleName = '';

    instructorPersonalLesson: boolean;
    instructorId?: number;

    @ViewChildren('instructor_multiselect') insturctor_Multiselect: QueryList<MultiSelectComponent>;
    instructors: Object[];
    fields: Object = { text: 'instr', value: 'id' };
    placeholderInstructorSelection: string = 'Select instructors';
    private instructorMultiselectSubscription: Subscription;

    showStudentSelection = false;
    studentSelected = false;

    selectedStudentCourse: CourseDto;
    studentCourses: CourseDto[];

    selectedPdl;

    numberOfLessonsAddition: string = "(á -- minutes)";

    setTopicNameAutomatically: boolean = true;

    currentStudentDefaultInstructorId;

    constructor(
        injector: Injector,
        private _drivingLessonsServiceProxy: DrivingLessonsServiceProxy,
        private _instructorsOwnDrivingLessonsServiceProxy: InstructorsOwnDrivingLessonsServiceProxy,
        private _studentsServiceProxy: StudentsServiceProxy,
    ) {
        super(injector);
    }

    ngOnInit() {
        this.ismeridian = false;

        var minutesPerLesson = abp.setting.get("App.CoreData.DurationDrivingLesson");
        this.numberOfLessonsAddition = "(á " + minutesPerLesson + " minutes)";
    }

    onItemSelect(item: any) {
        console.log(item);
    }

    onSelectAll(items: any) {
        console.log(items);
    }

    updateMultiSelect(id: number) {
        this.instructorMultiselectSubscription = this.insturctor_Multiselect.changes.subscribe((comps: QueryList<MultiSelectComponent>) => {
            var selected: number[] = [];

            if (this.drivingLesson.instructors != null) {

                for (var i = 0; i < this.drivingLesson.instructors.length; i++) {
                    selected.push(this.drivingLesson.instructors[i].id);
                }

                this.insturctor_Multiselect.first.value = selected;
            }
            else if (id != null) {
                selected.push(id);

                this.insturctor_Multiselect.first.value = selected;
            }

            this.instructorMultiselectSubscription.unsubscribe();
        });
    }

    show(drivingLessonId?: number, instructorPersonalLesson: boolean = false, studentId: number = null, 
        studentFirstName:string = "", studentLastName:string = ""): void {

        this.instructorPersonalLesson = instructorPersonalLesson;
        this.selectedPdl = null;

        if (!drivingLessonId) {

            this.drivingLesson = new CreateOrEditDrivingLessonDto();

            if(studentId != null)
            {
                this.drivingLesson.studentId = studentId;
                this.studentFirstName = studentFirstName;
                this.studentLastName = studentLastName;
                this.studentSelected = true;
                this.showStudentSelection = false;
                this.refreshCourses();
            }
            else
            {
                this.studentFirstName = '';
                this.studentLastName = '';
                this.showStudentSelection = true;
            }
        
            this.drivingLesson.id = drivingLessonId;
            this.drivingLesson.startTime = moment().startOf('day');
            this.drivingLessonTopic = '';
            this.licenseClass = '';
           
            this.vehicleName = '';
            this.drivingLesson.length = 1;
            this.drivingLesson.addingMinutesAfter = 0;
            this.refreshStudentFullName();

            this.active = true;
            this.updateInstructors(false);

            this.updateMultiSelect(null);

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
                this.startTime = result.drivingLesson.startTime.toDate();

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
                this.startTime = result.drivingLesson.startTime.toDate();

                this.showStudentSelection = false;
                this.studentSelected = true;
                this.selectedStudentCourse = null;
                this.studentCourses = null;

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

                this.updateMultiSelect(null);

                this.modal.show();
            });
        }
    }

    save(): void {
        this.saving = true;

        if (!this.setTopicNameAutomatically)
            this.drivingLesson.topic = this.drivingLessonTopic;
        else
            this.drivingLesson.topic = this.selectedStudentCourse.licenseClass + " - " + this.studentFirstName + " " + this.studentLastName;

        this.drivingLesson.instructors = [];

        //this.drivingLesson.startTime.date(this.startTime.getDay());
        this.drivingLesson.startTime = moment(this.startTime);
        this.drivingLesson.startTime.hours(this.startTime.getHours());
        this.drivingLesson.startTime.minutes(this.startTime.getMinutes());

        this.drivingLesson.isExam = true;

        if (this.selectedPdl) {
            this.drivingLesson.predefinedDrivingLessonId = this.selectedPdl.lessonIdString;
        }
        else {
            this.drivingLesson.predefinedDrivingLessonId = null;
        }

        this.drivingLesson.courseId = this.selectedStudentCourse.id;

        if (this.insturctor_Multiselect.first.value != null) {
            this.drivingLesson.instructors = [];
            for (var j = 0; j < this.insturctor_Multiselect.first.value.length; j++) {
                var ins: InstructorDto = new InstructorDto()
                ins.id = Number(this.insturctor_Multiselect.first.value[j]);
                this.drivingLesson.instructors.push(ins);
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
                            id: result.items[i].id,
                            instr: result.items[i].displayName
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

        // this._studentsServiceProxy.getAllCourses(this.drivingLesson.studentId).subscribe(result => {
        //     this.studentCourses = result

        //     if(this.studentCourses.length > 0)
        //     {
        //         console.log(this.studentCourses[0]);
        //         this.selectedStudentCourse = this.studentCourses[0];
        //     }
        // });

        this.refreshCourses();
    }

    refreshCourses()
    {
        this._drivingLessonsServiceProxy.getCoursesForCreateOrEdit(this.drivingLesson.studentId).subscribe(result => {
            this.studentCourses = result.courses

            if (this.studentCourses.length > 0) {
                this.selectedStudentCourse = this.studentCourses[0];
            }

            this.currentStudentDefaultInstructorId = result.defaultInstructorId;
            this.drivingLesson.startingLocation = result.defaultStartingLocation;

            this.updateMultiSelect(this.currentStudentDefaultInstructorId);
        })
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
        this.drivingLesson.vehicleId = this.vehicleLookupTableModal.id;
        this.vehicleName = this.vehicleLookupTableModal.name + ' ( ' + this.vehicleLookupTableModal.brand + ' ' + this.vehicleLookupTableModal.model + ')';
    }

    refreshStudentFullName() {
        this.studentFullName = this.studentFirstName + ' ' + this.studentLastName;
    }

    delete(): void {
        this.message.confirm(
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
}
