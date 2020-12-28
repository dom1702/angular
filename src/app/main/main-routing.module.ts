import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TestResourcesComponent } from './resources/testResources/testResources.component';
import { CoursesComponent } from './courses/courses/courses.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EnrollmentsComponent } from './enrollments/enrollments/enrollments.component';
import { DrivingLessonsComponent } from './lessons/drivingLessons/drivingLessons.component';
import { SimulatorLessonsComponent } from './lessons/simulatorLessons/simulatorLessons.component';
import { TheoryLessonsComponent } from './lessons/theoryLessons/theoryLessons.component';
import { PersonalSchedulerComponent } from './personalScheduler/personalScheduler.component';
import { CreateStudentInvoiceComponent } from './sales/studentInvoices/create-studentInvoice.component';
import { StudentInvoicesComponent } from './sales/studentInvoices/studentInvoices.component';
import { SchedulerComponent } from './scheduler/scheduler.component';
import { StudentsOverviewComponent } from './students/students/students-overview.component';
import { StudentsComponent } from './students/students/students.component';
import { SVDrivingLessonComponent } from './studentsView/drivingLessons/sv-drivingLesson.component';
import { SVFrequentlyAskedQuestionsComponent } from './studentsView/frequentlyAskedQuestions/sv-frequently-asked-questions.component';
import { SVInvoicesComponent } from './studentsView/invoices/sv-invoices.component';
import { SVOverviewComponent } from './studentsView/overview/sv-overview.component';
import { SVQuizComponent } from './studentsView/theoryCourse/sv-quiz.component';
import { SVQuizGuard } from './studentsView/theoryCourse/sv-quiz.guard';
import { SVTheoryLessonsComponent } from './studentsView/theoryLessons/sv-theoryLessons.component';
import { SVLicenseClassSelectionComponent } from './studentsView/theoryPractice/sv-licenseClassSelection.component';
import { SVLicenseClassTasksOverview } from './studentsView/theoryPractice/sv-licenseClassTasksOverview.component';
import { SVTheoryPracticeQuizComponent } from './studentsView/theoryPractice/sv-theoryPracticeQuiz.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                children: [
                    { path: 'resources/testResources', component: TestResourcesComponent, data: { permission: 'Pages.TestResources' }  },
                    { path: 'enrollments/enrollments', component: EnrollmentsComponent, data: { permission: 'Pages.Enrollments' }  },
                    { path: 'courses/courses', component: CoursesComponent, data: { permission: 'Pages.Courses' }  },
                    { path: 'lessons/simulatorLessons', component: SimulatorLessonsComponent, data: { permission: 'Pages.SimulatorLessons' }  },
                    { path: 'sales/studentInvoices', component: StudentInvoicesComponent, data: { permission: 'Pages.StudentInvoices' }  },
                    { path: 'lessons/drivingLessons', component: DrivingLessonsComponent, data: { permission: 'Pages.DrivingLessons' }  },
                    { path: 'students/students', component: StudentsComponent, data: { permission: 'Pages.Students' }  },
                    { path: 'lessons/theoryLessons', component: TheoryLessonsComponent, data: { permission: 'Pages.TheoryLessons' }  },
                    { path: 'scheduler', component: SchedulerComponent, data: { permission: 'Pages.Scheduler' } },
                    { path: 'personalScheduler', component: PersonalSchedulerComponent, data: { permission: 'Pages.PersonalScheduler' } },
                    { path: 'sales/studentInvoices/create-studentInvoice', component: CreateStudentInvoiceComponent, data: { permission: 'Pages.StudentInvoices.Create' }},
                    { path: 'students/students/students-overview', component: StudentsOverviewComponent },
                    { path: 'studentsView/overview', component: SVOverviewComponent, data: { permission: 'StudentView' } },
                    { path: 'studentsView/theoryLessons', component: SVTheoryLessonsComponent, data: { permission: 'StudentView' } },
                    { path: 'studentsView/drivingLessons', component: SVDrivingLessonComponent, data: { permission: 'StudentView' }},
                    { path: 'studentsView/frequentlyAskedQuestions', component: SVFrequentlyAskedQuestionsComponent, data: { permission: 'StudentView' }},
                    { path: 'studentsView/invoices', component: SVInvoicesComponent, data: { permission: 'StudentView' }},
                    { 
                        path: 'studentsView/theoryCourse/quiz', 
                        canDeactivate: [SVQuizGuard],
                        component: SVQuizComponent, 
                        data: { permission: 'StudentView' }
                    },
                   { path: 'studentsView/theoryPractice/licenseClassSelection', component: SVLicenseClassSelectionComponent, data: { permission: 'StudentView' }},
                   { path: 'studentsView/theoryPractice/licenseClassTasksOverview', component: SVLicenseClassTasksOverview, data: { permission: 'StudentView' }},
                   { 
                       path: 'studentsView/theoryPractice/quiz', 
                       component: SVTheoryPracticeQuizComponent, 
                       data: { permission: 'StudentView'},
                       canDeactivate: [SVQuizGuard]       
                    },
                    { path: 'dashboard', component: DashboardComponent, data: { permission: 'Pages.Tenant.Dashboard' } },
                    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
                    { path: '**', redirectTo: 'dashboard' }
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class MainRoutingModule { }
