import { Component, Injector, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import * as moment from 'moment';
import { CourseDto, StudentsViewServiceProxy, StudentCoursePredefinedTheoryLessonDto, OnlineTheoryServiceProxy, StartNextOnlineTheoryLessonInput, FinishOnlineTheoryLessonInput, StudentCourseDrivingLessonsDto, SVGetAllTodosOutput, SVChangeTodoStateInput } from '@shared/service-proxies/service-proxies';
import { StudentViewHelper } from '../studentViewHelper.component';


@Component({
    templateUrl: './sv-overview.component.html',
    animations: [appModuleAnimation()]
})
export class SVOverviewComponent extends AppComponentBase implements OnInit, OnDestroy {

    selectedStudentCourse: CourseDto;
    studentCourses: CourseDto[];

    // Could later be moved to the helper class as it is used also by the theory lesson / driving lesson part
    theoryLessons: StudentCoursePredefinedTheoryLessonDto[];
    drivingLessons: StudentCourseDrivingLessonsDto;
    todos: SVGetAllTodosOutput;

    additionalInformation: string;

    finishId;

    constructor(
        injector: Injector,
        private _studentViewService : StudentsViewServiceProxy,
        private _onlineTheoryService : OnlineTheoryServiceProxy,
        public _helper : StudentViewHelper
    ) {
        super(injector);
    }

    ngOnInit(): void {
        if(this._helper.studentsCourses != null && this._helper.studentData != null)
            this.loadData();

            this._helper.onInit().subscribe(() => {
            this.loadData();
        });
    }

    loadData()
    {
        this.loadCourseSelection();
        this.loadTheoryLessons();
        this.loadDrivingLessons();
        this.loadTodos();

        this.additionalInformation = this._helper.studentData.additionalInformation;
    }

    loadCourseSelection()
    {
        this.studentCourses = [];

        if(this._helper.studentsCourses.length == 0)
            return;

        for(var i = 0; i < this._helper.studentsCourses.length; i++)
        {
            this.studentCourses.push(this._helper.studentsCourses[i].course);
        }

        this.selectedStudentCourse = this._helper.selectedCourse.course;
    }

    loadTheoryLessons()
    {
        if(this.selectedStudentCourse == null)
            return;

        this._studentViewService.getPredefinedTheoryLessonsOfCourse(this.selectedStudentCourse.id).subscribe((result) => 
        {
            this.theoryLessons = result;
            //console.log(this.theoryLessons);
        });
    }

    loadDrivingLessons()
    {
        if(this.selectedStudentCourse == null)
            return;

        this._studentViewService.getPredefinedDrivingLessonsOfCourse(this.selectedStudentCourse.id).subscribe((result) => 
        {
            this.drivingLessons = result;
            //console.log(result);
        });
    }

    loadTodos()
    {
        if(this.selectedStudentCourse == null)
            return;

        this._studentViewService.getAllTodos(this.selectedStudentCourse.id).subscribe((result) => 
        {
            this.todos = result;
            console.log(result);
        });
    }

    ngOnDestroy(): void {
  
    }

    courseChanged() : void{
        this._helper.setSelectedStudentCourse(this.selectedStudentCourse);

        this.loadTheoryLessons();
        this.loadDrivingLessons();
        this.loadTodos();
    }

    prepareLessonStart()
    {
        this._onlineTheoryService.prepareLessonStart().subscribe((result) => {
            console.log(result);
        });
    }

    startNextOnlineTheoryLesson()
    {
        var input : StartNextOnlineTheoryLessonInput= new StartNextOnlineTheoryLessonInput();
        input.courseId = this.selectedStudentCourse.id;
        input.studentPhoneNumber = "123456789";

        this._onlineTheoryService.startNextOnlineTheoryLesson(input).subscribe((result) => {
            this.finishId = result.predefinedTheoryLessonIdString;
            console.log(result);
            this.courseChanged();
        });
    }

    finishOnlineTheoryLesson()
    {
        var input : FinishOnlineTheoryLessonInput = new FinishOnlineTheoryLessonInput();
        input.predefinedTheoryLessonIdString = this.finishId;

        this._onlineTheoryService.finishOnlineTheoryLesson(input).subscribe((result) => {
            console.log(result);
            this.finishId = "";
            this.courseChanged();
        });
    }

    updateCheckedTasks(task)
    {
        console.log(task);

        var input : SVChangeTodoStateInput = new SVChangeTodoStateInput();
        input.todoId = task.id;
        input.courseId = this.selectedStudentCourse.id;
        input.completed = task.completed;

        var title = '';
        var message = '';
        if(task.completed) // means that the student checked complete
        {
            title = this.l('TaskDoneQuestion');
        }
        else
        {
            title = this.l('TaskAlreadyCompleted');
            message = "Do you really want to undo the task completion?";
        }

        this.message.confirm(
            message,
            title,
            (isConfirmed) => {
                if (isConfirmed) {

                    this._studentViewService.changeTodoState(input).subscribe(result =>
                        {
                            this.notify.success(this.l('SuccessfullySaved'));
                        });
                }
                else
                {
                    task.completed = !task.completed;
                }
            }
        );

        
    }
}
