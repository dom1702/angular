import { appModuleAnimation } from "@shared/animations/routerTransition";
import { Component, Injector, Input, OnInit, Output, EventEmitter } from "@angular/core";
import { AppComponentBase } from "@shared/common/app-component-base";
import { Message } from "primeng/api";
import { TheoryExamQuestion, QuestionDisplayType, EvaluatedQuiz } from "./sv-licenseClassTasksOverview.component";

@Component({
    templateUrl: './sv-theoryPracticeResults.component.html',
    animations: [appModuleAnimation()],
    styleUrls: ['./sv-theoryPracticeResults.component.css'],
    selector: 'results'
})

export class SVTheoryPracticeResultsComponent extends AppComponentBase implements OnInit {
    
    overallResult : Message[] = [];

    @Input()
    showCategoryErrors : boolean;
    
    @Input() 
    evaluatedQuiz: EvaluatedQuiz;

    @Input() 
    maxErrorsLicenceClass: number;

    @Input() 
    maxErrorsSituation: number;

    @Input() 
    maxErrorsRisk: number;

    ngSwitch: QuestionDisplayType = 1;

    constructor(injector: Injector) {        
        super(injector);      
    }

    ngOnInit(): void {
        if(this.evaluatedQuiz != null)
        {
            if(this.evaluatedQuiz.quizPassed)
                this.show("success", this.l("SuccessTEP"));
            else
                this.show("error", this.l("FailedTEP"));
        }
    }

    onQuizEvaluated(event: EvaluatedQuiz) {
        console.log("event raised");
    }

    show(targetSeverity: string, targetSummary: string, targetDetail?: string) {
        this.overallResult.push({severity:targetSeverity, summary:targetSummary, detail:targetDetail});
    }

    hide() {
        this.overallResult = [];
    }
}
