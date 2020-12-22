import { Injector, OnInit, OnDestroy, Injectable } from "@angular/core";
import { AppComponentBase } from "@shared/common/app-component-base";
import { SignalDispatcher, ISignal } from "strongly-typed-events";
import { StudentsViewServiceProxy, SVStudentCoursesDto, StudentDto, CourseDto } from "@shared/service-proxies/service-proxies";

@Injectable({
    providedIn: 'root',
  })
export class StudentViewHelper extends AppComponentBase {

    private didDispatch : boolean;
    private _onInit = new SignalDispatcher();

    public studentsCourses : SVStudentCoursesDto[];
    public selectedCourse : SVStudentCoursesDto;
    public studentData : StudentDto;

    constructor(
        injector: Injector,
        private _studentViewService : StudentsViewServiceProxy
    ) {
        super(injector);
        this.init();
    }
  

    init(): void {
        this.didDispatch = false;

        if(this.studentData != null)
            return;

        this._studentViewService.getCoursesWithPP().subscribe((result) => 
        {
            this.studentsCourses = result;
            if(this.studentsCourses.length > 0)
                this.selectedCourse = this.studentsCourses[0];
           
            this.checkDispatch();
        });

        this._studentViewService.getStudent().subscribe((result) => 
        {
            this.studentData = result;
           
            this.checkDispatch();
        });
    }

    private checkDispatch() : void
    {
        if(this.studentsCourses != null && this.studentData != null)
        {
            if(!this.didDispatch)
            this._onInit.dispatch();
        }
    }

    public onInit() {
        return this._onInit.asEvent();
      }

    public setSelectedStudentCourse(course : CourseDto)
    {
        for(var i = 0; i < this.studentsCourses.length; i++)
            if(this.studentsCourses[i].course.id == course.id)
                this.selectedCourse = this.studentsCourses[i];
    }
}