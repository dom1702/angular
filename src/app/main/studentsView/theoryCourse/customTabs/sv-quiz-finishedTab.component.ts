import { Component, ViewEncapsulation, Injector, Output, EventEmitter, Input } from "@angular/core";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { AppComponentBase } from "@shared/common/app-component-base";

@Component({
    templateUrl: './sv-quiz-finishedTab.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()],
    selector: 'finishedTab'
})

export class SVQuizFinishedTabComponent extends AppComponentBase {

    @Input()
    currentLesson : string;
 
    @Output() 
    loadQuiz = new EventEmitter();

    constructor(private injector: Injector) {       
        super(injector);
    }

    continueLesson() {
        this.loadQuiz.emit();
    }
}