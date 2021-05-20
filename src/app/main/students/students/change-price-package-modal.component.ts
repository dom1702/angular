import { Component, ViewChild, Injector, Output, EventEmitter, OnInit } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { ChangePricePackageInput, CoursesServiceProxy, GetFreeCoursesForStudentDto, MoveToAnotherCourseInput, PricePackageDto, StudentCourseDto, StudentsServiceProxy } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { result } from 'lodash-es';


@Component({
    selector: 'changePricePackageModal',
    templateUrl: './change-price-package-modal.component.html'
})
export class ChangePricePackageModalComponent extends AppComponentBase implements OnInit {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    studentId;

    currentCourseId;
    possibleTargetPricePackages : PricePackageDto[];

    currentPricePackage: PricePackageDto;
    targetPricePackage;

    newPricePackageId;

    constructor(
        injector: Injector,
        private _studentsServiceProxy: StudentsServiceProxy,
        private _coursesServiceProxy: CoursesServiceProxy,
    ) {
        super(injector);
    }

    ngOnInit() {
       
    }

    show(studentId : number, currentCourseId : number, currentPricePackage : PricePackageDto): void {
        this.newPricePackageId = null;
        this.studentId = studentId;
        this.currentCourseId = currentCourseId;
        this.currentPricePackage = currentPricePackage;

        this.active = true;
        this.saving = false;

        this._coursesServiceProxy.getPricePackagesOfCourse(this.currentCourseId).subscribe(result =>
            {
                this.possibleTargetPricePackages = result.pricePackages;
            });

        this.modal.show();
    }

    save(): void {
         var input = new ChangePricePackageInput();
         input.studentId = this.studentId;
         input.courseId = this.currentCourseId;
         input.sourcePricePackageId = this.currentPricePackage.id;
         input.targetPricePackageId = this.targetPricePackage.id;

        this._studentsServiceProxy.changePricePackage(input).subscribe(result =>
        {
                this.newPricePackageId = result.newPricePackageId;
                this.notify.info(this.l('SavedSuccessfully'));
                this.modalSave.emit();
                this.close();
             
        
        });

        
    }

    close(): void {

        this.active = false;
        this.modal.hide();
    }
}
