import { Component, Injector, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { StudentViewHelper } from '../studentViewHelper.component';
import { StudentsViewServiceProxy } from '@shared/service-proxies/service-proxies';


@Component({
    templateUrl: './sv-theoryPractice.component.html',
    animations: [appModuleAnimation()]
})
export class SVTheoryPracticeComponent extends AppComponentBase implements OnInit {

    constructor(
        injector: Injector,
        private _studentViewService : StudentsViewServiceProxy,
        private _helper : StudentViewHelper
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
        console.log(this._helper.studentsCourses);
        console.log(this._helper.studentData);
    }
}
