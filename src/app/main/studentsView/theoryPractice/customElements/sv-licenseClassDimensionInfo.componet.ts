import { Component, Injector, OnInit, ViewChild, OnDestroy, Input } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { VehicleDimensions } from '../sv-licenseClassTasksOverview.component';

@Component({
    templateUrl: './sv-licenseClassDimensionInfo.component.html',      
    animations: [appModuleAnimation()], 
    selector: 'dimensionInfo'
})
export class SVLicenseClassDimensionInfoComponent extends AppComponentBase {
      
    @Input()
    dimension: VehicleDimensions;

    @Input()
    classToken: string;
    
    constructor(injector: Injector) {
        super(injector);
      
    }

    getWeightText() : string {
        let text = "";
        if(this.dimension != null)
        {
            if(this.dimension.carWeight && this.dimension.totalWeight)
            {
                text = this.dimension.carWeight + " + " + this.dimension.totalWeight + 
                    " = " + this.dimension.totalWeight + " t";
            }
            else
                text = this.dimension.totalWeight + " t";
        }
        return text;
    }
}