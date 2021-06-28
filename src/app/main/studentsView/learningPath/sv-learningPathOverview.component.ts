import { Component, Injector, OnInit, ViewEncapsulation } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';

export class LearningUnit {
    title: string;
    description: string;
    isFinished: boolean;   
    progress: number;  
    maxProgress; 

    constructor(title : string, description: string, isFinished: boolean, progress : number, maxProgress) {
        this.title = title;
        this.description = description;
        this.isFinished = isFinished;
        this.progress = progress;   
        this.maxProgress = maxProgress;  
    }  
}

@Component({
    templateUrl: './sv-learningPathOverview.component.html',    
    animations: [appModuleAnimation()]
})

export class SVLearningPathOverviewComponent extends AppComponentBase {
    
    learningUnits : LearningUnit[] = [
        new LearningUnit("Vehicle handling", "bla blubb vllt", true, 80, 80),
        new LearningUnit("Handling of traffic situations", "bla blubb usw", false, 10, 290),
        new LearningUnit("Handling of a journey", "bla bla", false, 0, 220),
        new LearningUnit("Handling of driving in difficult weather conditions", "bla bla final", false, 0, 310)
    ];

    constructor(
        injector: Injector,      
    ) {
        super(injector);
    }

    currentUnit : number = -1;

}