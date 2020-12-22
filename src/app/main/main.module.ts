import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { UtilsModule } from '@shared/utils/utils.module';
import { CountoModule } from 'angular2-counto';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { DashboardComponent } from './dashboard/dashboard.component';
import { MainRoutingModule } from './main-routing.module';

import { BsDatepickerConfig, BsDaterangepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgxBootstrapDatePickerConfigService } from 'assets/ngx-bootstrap/ngx-bootstrap-datepicker-config.service';
import { LicenseClassLookupTableModalComponent } from '@app/admin/instructors/instructors/licenseClass-lookup-table-modal.component';
import { OfficeLookupTableModalComponent } from '@app/admin/instructors/instructors/office-lookup-table-modal.component';
import { CoursesComponent } from './courses/courses/courses.component';
import { CreateOrEditCourseModalComponent } from './courses/courses/create-or-edit-course-modal.component';
import { ViewCourseModalComponent } from './courses/courses/view-course-modal.component';
import { CreateOrEditEnrollmentModalComponent } from './enrollments/enrollments/create-or-edit-enrollment-modal.component';
import { EnrollmentsComponent } from './enrollments/enrollments/enrollments.component';
import { ViewEnrollmentModalComponent } from './enrollments/enrollments/view-enrollment-modal.component';
import { CreateOrEditDrivingLessonModalComponent } from './lessons/drivingLessons/create-or-edit-drivingLesson-modal.component';
import { CreateOrEditExamDrivingModalComponent } from './lessons/drivingLessons/create-or-edit-examDriving-modal.component';
import { DLStudentLookupTableModalComponent } from './lessons/drivingLessons/drivingLesson-student-lookup-table-modal.component';
import { DrivingLessonsComponent } from './lessons/drivingLessons/drivingLessons.component';
import { DrivingLessonTopicLookupTableModalComponent } from './lessons/drivingLessons/drivingLessonTopic-lookup-table-modal.component';
import { ViewDrivingLessonModalComponent } from './lessons/drivingLessons/view-drivingLesson-modal.component';
import { CreateOrEditSimulatorLessonModalComponent } from './lessons/simulatorLessons/create-or-edit-simulatorLesson-modal.component';
import { SimulatorLessonPersonLookupTableModalComponent } from './lessons/simulatorLessons/simulatorLesson-person-lookup-table-modal.component';
import { SimulatorLessonSimulatorLookupTableModalComponent } from './lessons/simulatorLessons/simulatorLesson-simulator-lookup-table-modal.component';
import { SimulatorLessonsComponent } from './lessons/simulatorLessons/simulatorLessons.component';
import { ViewSimulatorLessonModalComponent } from './lessons/simulatorLessons/view-simulatorLesson-modal.component';
import { CreateOrEditTheoryLessonModalComponent } from './lessons/theoryLessons/create-or-edit-theoryLesson-modal.component';
import { EditStudentsTheoryLessonModalComponent } from './lessons/theoryLessons/edit-students-theoryLesson-modal.component';
import { TLStudentLookupTableModalComponent } from './lessons/theoryLessons/theoryLesson-student-lookup-table-modal.component';
import { TheoryLessonsComponent } from './lessons/theoryLessons/theoryLessons.component';
import { ViewTheoryLessonModalComponent } from './lessons/theoryLessons/view-theoryLesson-modal.component';
import { PersonalSchedulerComponent } from './personalScheduler/personalScheduler.component';
import { CreateStudentInvoiceComponent } from './sales/studentInvoices/create-studentInvoice.component';
import { InvoiceProductLookupTableModalComponent } from './sales/studentInvoices/invoice-product-lookup-table-modal.component';
import { InvoiceStudentLookupTableModalComponent } from './sales/studentInvoices/invoice-student-lookup-table-modal.component';
import { SplitInvoiceModalComponent } from './sales/studentInvoices/splitInvoice-modal.component';
import { StudentInvoicesComponent } from './sales/studentInvoices/studentInvoices.component';
import { ViewStudentInvoiceModalComponent } from './sales/studentInvoices/view-studentInvoice-modal.component';
import { CreateEventTypeModalComponent } from './scheduler/create-event-type-modal.component';
import { CreateOrEditEventModalComponent } from './scheduler/create-or-edit-event-modal.component';
import { SchedulerComponent } from './scheduler/scheduler.component';
import { AssignStudentToCourseModalComponent } from './students/students/assign-student-to-course-modal.component';
import { CreateOrEditStudentModalComponent } from './students/students/create-or-edit-student-modal.component';
import { CreateOrEditStudentUserModalComponent } from './students/students/create-or-edit-student-user-modal.component';
import { PricePackageLookupTableModalComponent } from './students/students/pricePackage-lookup-table-modal.component';
import { SendMessageToStudentModalComponent } from './students/students/send-message-to-student-modal.component';
import { StudentsOverviewFormsComponent } from './students/students/students-overview-forms.component';
import { StudentsOverviewInvoicesComponent } from './students/students/students-overview-invoices.component';
import { StudentsOverviewLessonsComponent } from './students/students/students-overview-lessons.component';
import { StudentsOverviewOverviewComponent } from './students/students/students-overview-overview.component';
import { StudentsOverviewPricePackageComponent } from './students/students/students-overview-pricePackage.component';
import { StudentsOverviewComponent } from './students/students/students-overview.component';
import { StudentsComponent } from './students/students/students.component';
import { ViewStudentModalComponent } from './students/students/view-student-modal.component';
import { SVBookDrivingLessonLookupSchedulerModalComponent } from './studentsView/drivingLessons/sv-book-drivingLesson-lookup-scheduler-modal.component';
import { SVDrivingLessonComponent } from './studentsView/drivingLessons/sv-drivingLesson.component';
import { SVFrequentlyAskedQuestionsComponent } from './studentsView/frequentlyAskedQuestions/sv-frequently-asked-questions.component';
import { SVInvoicesComponent } from './studentsView/invoices/sv-invoices.component';
import { SVOverviewComponent } from './studentsView/overview/sv-overview.component';
import { ConvertToSaveUrlPipe } from './studentsView/theoryCourse/convert-to-saveUrl.pipe';
import { SVQuizClosedTabComponent } from './studentsView/theoryCourse/customTabs/sv-quiz-closedTab.component';
import { SVQuizFinishedTabComponent } from './studentsView/theoryCourse/customTabs/sv-quiz-finishedTab.component';
import { SVQuestionComponent } from './studentsView/theoryCourse/sv-question.component';
import { SVQuizComponent } from './studentsView/theoryCourse/sv-quiz.component';
import { SVTheoryCourseComponent } from './studentsView/theoryCourse/sv-theory-course.component';
import { SVTheoryLessonsComponent } from './studentsView/theoryLessons/sv-theoryLessons.component';
import { SVLicenseClassDimensionInfoComponent } from './studentsView/theoryPractice/customElements/sv-licenseClassDimensionInfo.componet';
import { SVLicenseClassSelectionComponent } from './studentsView/theoryPractice/sv-licenseClassSelection.component';
import { SVLicenseClassTasksOverview } from './studentsView/theoryPractice/sv-licenseClassTasksOverview.component';
import { SVTheoryPracticeComponent } from './studentsView/theoryPractice/sv-theoryPractice.component';
import { SVTheoryPracticeQuizComponent } from './studentsView/theoryPractice/sv-theoryPracticeQuiz.component';
import { SVTheoryPracticeResultsComponent } from './studentsView/theoryPractice/sv-theoryPracticeResults.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { FileUploadModule } from 'ng2-file-upload';
import { TimepickerModule } from 'ngx-bootstrap/timepicker';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { EditorModule } from 'primeng/editor';
import { InputMaskModule } from 'primeng/inputmask';
import { MessagesModule } from 'primeng/messages';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { TabViewModule } from 'primeng/tabview';

import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ScheduleAllModule } from '@syncfusion/ej2-angular-schedule';
import { NumericTextBoxModule } from '@syncfusion/ej2-angular-inputs';
import { ButtonsModule } from 'ngx-bootstrap/buttons';
import { AccordionModule, MessageModule,  CheckboxModule, CarouselModule, CodeHighlighterModule, ButtonModule, CardModule, SelectButtonModule, MessageService, ScrollPanelModule} from 'primeng/primeng';
import { RadioButtonModule} from 'primeng/radiobutton';
import { MultiSelectModule } from '@syncfusion/ej2-angular-dropdowns';
import { AlertModule } from 'ngx-bootstrap/alert';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import {ToastModule} from 'primeng/toast';
import { PaginationModule } from 'ngx-bootstrap';
import { CheckBoxModule } from '@syncfusion/ej2-angular-buttons';

NgxBootstrapDatePickerConfigService.registerNgxBootstrapDatePickerLocales();

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ModalModule,
        TabsModule,
        TooltipModule,
        AppCommonModule,
        UtilsModule,
        MainRoutingModule,
        CountoModule,
        BsDatepickerModule.forRoot(),
        BsDropdownModule.forRoot(),
        PopoverModule.forRoot(),
        
        FileUploadModule,
        AutoCompleteModule,
        PaginatorModule,
        EditorModule,
        InputMaskModule,		
        TableModule,
        ReactiveFormsModule,
        //TabsModule.forRoot(), try this if its not working
        NgxChartsModule,
        NgMultiSelectDropDownModule.forRoot(),
        ScheduleAllModule,
        NumericTextBoxModule,
        TimepickerModule.forRoot(),
        ButtonsModule.forRoot(),
        TabViewModule,
        AccordionModule,
        RadioButtonModule,
        MessageModule,
        MessagesModule,
        CheckboxModule,
        MultiSelectModule,
        AlertModule.forRoot(),
        ProgressbarModule.forRoot(),
        ToastModule,
        CarouselModule,
        CardModule,
        SelectButtonModule,
        PaginationModule.forRoot(),
        ScrollPanelModule,
        CheckBoxModule 
    ],
    declarations: [
        DashboardComponent,
        TheoryLessonsComponent,
      ViewTheoryLessonModalComponent,		
      CreateOrEditTheoryLessonModalComponent,
      StudentsComponent,
      ViewStudentModalComponent,		
      CreateOrEditStudentModalComponent,
      DrivingLessonsComponent,
      ViewDrivingLessonModalComponent,		
      CreateOrEditDrivingLessonModalComponent,
      CreateOrEditExamDrivingModalComponent,
      DrivingLessonTopicLookupTableModalComponent,
      DLStudentLookupTableModalComponent,
      TLStudentLookupTableModalComponent,
      SchedulerComponent,
      CreateEventTypeModalComponent,
      CreateOrEditEventModalComponent,
      EditStudentsTheoryLessonModalComponent,
      StudentInvoicesComponent,
      ViewStudentInvoiceModalComponent,
      CreateStudentInvoiceComponent,
      InvoiceStudentLookupTableModalComponent,
      InvoiceProductLookupTableModalComponent,
      DLLicenseClassLookupTableModalComponent,
      PricePackageLookupTableModalComponent,
      StudentsOverviewComponent,
      StudentsOverviewOverviewComponent,
      StudentsOverviewPricePackageComponent,
      StudentsOverviewInvoicesComponent,
      StudentsOverviewFormsComponent,
      StudentsOverviewLessonsComponent,
      InstructorLookupTableModalComponent,
      CreateOrEditStudentUserModalComponent,
      SVOverviewComponent,
      SVTheoryLessonsComponent,
      SVInvoicesComponent,
      VehicleLookupTableModalComponent,
      StudentLookupTableModalComponent,
      SVDrivingLessonComponent,
      PersonalSchedulerComponent,
      SVBookDrivingLessonLookupSchedulerModalComponent,
      SimulatorLessonsComponent,
      ViewSimulatorLessonModalComponent,		
      CreateOrEditSimulatorLessonModalComponent,
      SimulatorLessonPersonLookupTableModalComponent,
      SimulatorLessonSimulatorLookupTableModalComponent,
      SVFrequentlyAskedQuestionsComponent,
      SVTheoryCourseComponent,
      SVQuizComponent,
      SVQuizFinishedTabComponent,
      SVQuizClosedTabComponent,
      SVQuestionComponent,
      ConvertToSaveUrlPipe,
      CoursesComponent,
      ViewCourseModalComponent,		
      CreateOrEditCourseModalComponent,
      OfficeLookupTableModalComponent,
      AssignStudentToCourseModalComponent,
      SVLicenseClassSelectionComponent,
      SVTheoryPracticeQuizComponent,
      SVLicenseClassTasksOverview,
      SVTheoryPracticeResultsComponent,
      SVLicenseClassDimensionInfoComponent,
      EnrollmentsComponent,
      ViewEnrollmentModalComponent,		
      CreateOrEditEnrollmentModalComponent,
      LicenseClassLookupTableModalComponent,
      SendMessageToStudentModalComponent,
      SVTheoryPracticeComponent,
      SplitInvoiceModalComponent
    ],
    providers: [
        { provide: BsDatepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerConfig },
        { provide: BsDaterangepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDaterangepickerConfig },
        { provide: BsLocaleService, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerLocale }
    ]
})
export class MainModule { }
