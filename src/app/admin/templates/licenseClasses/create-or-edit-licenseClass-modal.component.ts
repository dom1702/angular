import { Component, ViewChild, Injector, Output, EventEmitter} from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { LicenseClassesServiceProxy, CreateOrEditLicenseClassDto, PredefinedDrivingLessonsServiceProxy, PredefinedTheoryLessonsServiceProxy, PredefinedDrivingLessonDto, PredefinedTheoryLessonDto } from '@shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import * as moment from 'moment';
import { FileUploader, FileUploaderOptions } from 'ng2-file-upload';
import { AppConsts } from '@shared/AppConsts';
import { IDropdownSettings } from 'ng-multiselect-dropdown';

interface PredefinedLesson {
    name: string,
    id: number
}

@Component({
    selector: 'createOrEditLicenseClassModal',
    templateUrl: './create-or-edit-licenseClass-modal.component.html'
})
export class CreateOrEditLicenseClassModalComponent extends AppComponentBase {

    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;


    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();

    active = false;
    saving = false;

    licenseClass: CreateOrEditLicenseClassDto = new CreateOrEditLicenseClassDto();

    predefinedDrivingLessons: PredefinedLesson[] = [];
    predefinedTheoryLessons: PredefinedLesson[]= [];

    selectedPredefinedDrivingLessons: PredefinedLesson[]= [];
    selectedPredefinedTheoryLessons: PredefinedLesson[]= [];

    // Multiselect dropdowns
    pdlList = [];
    pdlselectedItems = [];
    ptlList = [];
    ptlselectedItems = [];
    dropdownSettings : IDropdownSettings;
    placeholder = this.l('Select');

    classImageUploader: FileUploader;

    constructor(
        injector: Injector,
        private _licenseClassesServiceProxy: LicenseClassesServiceProxy,
        private _predefinedDrivingLessonsServiceProxy: PredefinedDrivingLessonsServiceProxy,
        private _predefinedTheoryLessonsServiceProxy: PredefinedTheoryLessonsServiceProxy,
    ) {
        super(injector);

      
    }

    ngOnInit(): void {
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
    }

  

    updateClassImageThumbnail()
    {
        // this._tenantSettingsService.getInvoiceLogo().subscribe((result: any) => {
        //     if(result == null)
        //     {
        //         this.invoiceLogo = null;
        //     }
        //     else
        //     {
        //        let objectURL = 'data:image/jpeg;base64,' + result;
        //         this.invoiceLogo = this.sanitizer.bypassSecurityTrustUrl(objectURL);
        //     }
        // });
    }

    show(licenseClassId?: number): void {

        this.pdlList = [];
        this.ptlList = [];
        this.pdlselectedItems = [];
        this.ptlselectedItems = [];

        this._predefinedDrivingLessonsServiceProxy.getAllForLookup("").subscribe(result => {
console.log(result);
            for (var i = 0; i < result.length; i++) {
                this.pdlList.push(
                    {
                        item_id: result[i].id,
                        item_text: result[i].name
                    });
            }
        });

        this._predefinedTheoryLessonsServiceProxy.getAllForLookup("").subscribe(result => {

            for (var i = 0; i < result.length; i++) {
                this.ptlList.push(
                    {
                        item_id: result[i].id,
                        item_text: result[i].name
                    });
            }
        });

        if (!licenseClassId) {
            this.licenseClass = new CreateOrEditLicenseClassDto();
            this.licenseClass.id = licenseClassId;

            this.active = true;
            this.modal.show();
        } else {
            this._licenseClassesServiceProxy.getLicenseClassForEdit(licenseClassId).subscribe(result => {
                this.licenseClass = result.licenseClass;


               
                        for (var pdl of this.licenseClass.predefinedDrivingLessons) {
                           
                                this.pdlselectedItems.push(
                                    {
                                        item_id: pdl.id,
                                        item_text: pdl.name
                                    }
                                );
                          
                    }
    
                
                        for (var ptl of this.licenseClass.predefinedTheoryLessons) {
                         
                                this.ptlselectedItems.push(
                                    {
                                        item_id: ptl.id,
                                        item_text: ptl.name
                                    }
                                );
                       
                     
                    }
                

                this.active = true;
                this.modal.show();
            });
        }
    }

    save(): void {
            this.saving = true;

            this.licenseClass.predefinedDrivingLessons = [];
            this.licenseClass.predefinedTheoryLessons = [];
    
            for (var pdlSelected of this.pdlselectedItems) {
                var pddl: PredefinedDrivingLessonDto = new PredefinedDrivingLessonDto()
                pddl.id = pdlSelected.item_id;
                this.licenseClass.predefinedDrivingLessons.push(pddl);
            }
    
            for (var ptlSelected of this.ptlselectedItems) {
                var pdtl: PredefinedTheoryLessonDto = new PredefinedTheoryLessonDto()
                pdtl.id = ptlSelected.item_id;
                this.licenseClass.predefinedTheoryLessons.push(pdtl);
            }
			
            this._licenseClassesServiceProxy.createOrEdit(this.licenseClass)
             .pipe(finalize(() => { this.saving = false;}))
             .subscribe(() => {
                this.notify.info(this.l('SavedSuccessfully'));
                this.close();
                this.modalSave.emit(null);
             });
    }







    close(): void {

        this.active = false;
        this.modal.hide();
    }
}
