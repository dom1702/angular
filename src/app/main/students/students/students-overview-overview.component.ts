import { Component, Injector, ViewEncapsulation, ViewChild, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { StudentsServiceProxy, StudentDto, StudentCoursePredefinedTheoryLessonDto, OnlineTheoryServiceProxy, StartNextOnlineTheoryLessonInput, FinishOnlineTheoryLessonInput, StudentCourseDrivingLessonsDto, TheoryLessonState } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { TokenAuthServiceProxy } from '@shared/service-proxies/service-proxies';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { FileDownloadService } from '@shared/utils/file-download.service';
import * as _ from 'lodash';
import * as moment from 'moment';
import { Subscription, Observable } from 'rxjs';
import { CreateOrEditStudentModalComponent } from './create-or-edit-student-modal.component';
import { StudentsOverviewComponent } from './students-overview.component';
import { StudentsOverviewPricePackageComponent } from './students-overview-pricePackage.component';
import { CreateOrEditStudentUserModalComponent } from './create-or-edit-student-user-modal.component';
import { CountriesService } from '@app/shared/common/services/countries.service';
import { LanguagesService } from '@app/shared/common/services/languages.service';
import { AssignStudentToCourseModalComponent } from './assign-student-to-course-modal.component';
import { SendMessageToStudentModalComponent } from './send-message-to-student-modal.component';
import { ImpersonationService } from '@app/admin/users/impersonation.service';
import { MoveToAnotherCourseModalComponent } from './move-to-another-course-modal.component';

@Component({
    selector: 'students-overview-overview',
    templateUrl: './students-overview-overview.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})
export class StudentsOverviewOverviewComponent extends AppComponentBase {

    @ViewChild('createOrEditStudentModal', { static: true }) createOrEditStudentModal: CreateOrEditStudentModalComponent;
    @ViewChild('createOrEditStudentUserModal', { static: true }) createOrEditStudentUserModal: CreateOrEditStudentUserModalComponent;
    @ViewChild('assignStudentToCourseModal', { static: true }) assignStudentToCourseModal: AssignStudentToCourseModalComponent;
    @ViewChild('sendMessageToStudentModal', { static: true }) sendMessageToStudentModal: SendMessageToStudentModalComponent;
    @ViewChild('moveToAnotherCourseModal', { static: true }) moveToAnotherCourseModal: MoveToAnotherCourseModalComponent;

    @Input() student: StudentDto;
    @Input() pricePackageName: string;
    @Input() parentOverview: StudentsOverviewComponent;

    licenseClasses = '-';
    licenseClassesAlreadyOwned = '-';

    birthCountry = '';
    nativeLanguage = '';

    theoryLessons: StudentCoursePredefinedTheoryLessonDto[];
    @Input() drivingLessons: StudentCourseDrivingLessonsDto;

    theoryLessonState = TheoryLessonState;

    constructor(
        injector: Injector,
        private _studentsServiceProxy: StudentsServiceProxy,
        private _tokenAuth: TokenAuthServiceProxy,
        private _activatedRoute: ActivatedRoute,
        private _fileDownloadService: FileDownloadService,
        private _countriesService: CountriesService,
        private _languagesService: LanguagesService,
        public _impersonationService: ImpersonationService,

        private _onlineTheory : OnlineTheoryServiceProxy
    ) {
        super(injector);
    }

    ngOnInit(): void {

        this.updateLicenseClass();
        this.updateLicenseClassesAlreadyOwned();
        this.updateBirthCountry();
        this.updateNativeLanguage();

        this.parentOverview.courseChanged.subscribe(() => {
            this._studentsServiceProxy.getPredefinedTheoryLessonsOfCourse(this.parentOverview.selectedStudentCourse.course.id, this.student.id).subscribe(result => {
                this.theoryLessons = result;
            });
        });

        // this.parentOverview.courseChanged.subscribe(() => {
        //     this._studentsServiceProxy.getPredefinedDrivingLessonsOfCourse(this.parentOverview.selectedStudentCourse.course.id, this.student.id).subscribe(result => {
        //         this.drivingLessons = result;
        //       console.log(this.drivingLessons);
        //     });
        // });
    }

    updateLicenseClass(): void {
        if (this.student.licenseClasses == null)
            return;

        for (var i = 0; i < this.student.licenseClasses.length; i++) {
            if (i == 0)
                this.licenseClasses = this.student.licenseClasses[i];
            else
                this.licenseClasses += ', ' + this.student.licenseClasses[i];
        }
    }

    updateLicenseClassesAlreadyOwned(): void {
        if (this.student.licenseClassesAlreadyOwned == null)
            return;

        for (var i = 0; i < this.student.licenseClassesAlreadyOwned.length; i++) {
            if (i == 0)
                this.licenseClassesAlreadyOwned = this.student.licenseClassesAlreadyOwned[i];
            else
                this.licenseClassesAlreadyOwned += ', ' + this.student.licenseClassesAlreadyOwned[i];
        }
    }

    updateBirthCountry(): void {
        this.birthCountry = this._countriesService.getName(this.student.birthCountry);
    }

    updateNativeLanguage(): void {
        this.nativeLanguage = this._languagesService.getName(this.student.nativeLanguage);
    }

    updateStudent() {
        this.parentOverview.UpdateStudentView().subscribe((any) => {

            // At this point we need to wait a short time because Input variable student is not yet refreshed
            setTimeout(() => {
                this.updateLicenseClass();
                this.updateLicenseClassesAlreadyOwned();
                this.updateBirthCountry();
                this.updateNativeLanguage();
            }, 10);

        });
    }

    editStudent(): void {
        this.createOrEditStudentModal.show(this.student.id);

        console.log(this.drivingLessons);
    }

    createOrEditUserAccount(): void {
        this.createOrEditStudentUserModal.show(this.student.lastName, this.student.firstName, this.student.email, this.student);

        // this._onlineTheory.finishOnlineTheoryLesson(new FinishOnlineTheoryLessonInput(
        // {
        //     predefinedTheoryLessonIdString: "C-1"
        // })).subscribe((result) => {
        //     console.log(result);
        // })
    }

    openAssignToCourseModal(): void {
        this.assignStudentToCourseModal.show(this.student);

        // var snotli : StartNextOnlineTheoryLessonInput = new StartNextOnlineTheoryLessonInput();
        // snotli.courseId = 1003;
        // this._onlineTheory.startNextOnlineTheoryLesson(snotli).subscribe((result) => {
        //     if(result.predefinedTheoryLessonIdString == "")
        //     console.log("everything completed");
        //     else
        //     console.log(result);
        // })
    }

    openMoveToAnotherCourseModal() : void
    {
        this.moveToAnotherCourseModal.show(this.student.id, this.parentOverview.studentCourses);
    }

    assignToCourse(): void {
        this.parentOverview.UpdateStudentView().subscribe();

        setTimeout(() => {
            this.parentOverview.CallCourseChanged();
        }, 1000);
    }

    openSendMessage() : void{
        this.sendMessageToStudentModal.show(this.student.id, this.student.email);
    }

    sendMail() : void
    {

    }


    movedToAnotherCourse()
    {
        this.parentOverview.UpdateStudentView().subscribe();

        setTimeout(() => {
            this.parentOverview.CallCourseChanged();
        }, 1000);
    }

    userAccountCreated() {
        this.updateStudent();

    }

    getAddressString() {
        if (this.student == null)
            return '';

        return this.student.street + ", " + this.student.zipCode + ", " + this.student.city;
    }

    impersonate()
    {
        this._impersonationService.impersonate(this.student.userId, this.appSession.tenantId);
    }
}
