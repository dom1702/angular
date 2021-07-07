import { Component, EventEmitter, Injector, OnInit, Output, ViewChild } from "@angular/core";
import { AppComponentBase } from "@shared/common/app-component-base";
import { ModalDirective } from "ngx-bootstrap/modal";
import { LearningPathQuiz, SVLearningPathHelperService } from "./sv-learningPathHelper.service";

@Component({
    selector: 'learningPathQuizModal',
    templateUrl: './sv-learningPathQuizModal.component.html',
})

export class SVLearningPathQuizModalComponent extends AppComponentBase implements OnInit {

    @ViewChild('quizModal', { static: true }) modal: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();
    
    level: number;  
    chapterTitle: string;
    quizNumber: number;   
    active : boolean;

    questionListEnabled : boolean = false;

    currentSelectedQuiz : LearningPathQuiz;

    questionListButtonTitle() : string {
        if(!this.questionListEnabled)
            return "Show Question List";
        else
            return "Hide Question List";
    }

    getLevelTitle() : string {
        switch (this.level) {             
            case 1:               
                return "Level 1";  
            case 2:               
                return "Level 2";  
            case 3:               
                return "Level 3";  
            case 4:               
                return "Level 4";  
            case 5:               
                return "Level 5";         
            default:
                return "Unknown Level";
        }
    };

    constructor(injector: Injector, public learningPathHelper : SVLearningPathHelperService) {
        super(injector);
    }
    
    ngOnInit(): void {
    }

    show() : void {
        this.modal.show();
    }

    close(): void {
        this.active = false;
        this.modal.hide();

        this.currentSelectedQuiz = null;
        this.questionListEnabled = false;
    }

    submit() : void {
        console.log("show next question");
    }

    finishQuiz() : void {
        if(!this.currentSelectedQuiz.isFinished())
        {
            let prog = this.currentSelectedQuiz.completeQuiz();
            this.learningPathHelper.updatePathProgress(prog);
            this.learningPathHelper.updateDisplayData(this.level-1, prog);
            this.modalSave.emit(prog);
        }       
      
        this.close();
    }

    showQuestionList() : void {
        this.questionListEnabled = !this.questionListEnabled;
        console.log("show list of questions");
    }
}