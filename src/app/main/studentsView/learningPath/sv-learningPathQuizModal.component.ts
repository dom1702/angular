import { Component, EventEmitter, Injector, OnInit, Output, ViewChild } from "@angular/core";
import { AppComponentBase } from "@shared/common/app-component-base";
import { ModalDirective } from "ngx-bootstrap/modal";
import { LearningPathQuestion, LearningPathQuiz, QuestionDisplayType, SVLearningPathHelperService } from "./sv-learningPathHelper.service";

@Component({
    selector: 'learningPathQuizModal',
    templateUrl: './sv-learningPathQuizModal.component.html',
})

export class SVLearningPathQuizModalComponent extends AppComponentBase {

    @ViewChild('quizModal', { static: true }) modal: ModalDirective;

    @Output() modalSave: EventEmitter<any> = new EventEmitter<any>();
    
    level: number;  
    chapterTitle: string;
    quizNumber: number;   
    continueButtonTitle : string = this.l("Continue");

    questionListEnabled : boolean = false;
    helpEnabled : boolean = false;
    answerSelected : boolean = false;

    currentQuiz : LearningPathQuiz;
    currentSelectedQuestion : LearningPathQuestion;
    currentIndex = 0;
    savedQuiz : LearningPathQuiz;

    selectedOptionSingleChoice: number = -1;

    ngSwitch = 0;

    questionListButtonTitle() : string {
        if(!this.questionListEnabled)
            return "Show Question List";
        else
            return "Hide Question List";
    }

    questionDisabled() : boolean {
        if(this.currentQuiz != null)
        {
            if(this.savedQuiz != null)
                return false;
            else
                return this.currentQuiz.isFinished();
        }   
        return true; 
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

    continueDisabled() : boolean {
        if(this.currentQuiz.isFinished())
        {
            if(this.savedQuiz)
                return false;
            else return true;
        }         
        else 
            return !this.answerSelected;
    }
  
    constructor(injector: Injector, public learningPathHelper : SVLearningPathHelperService) {
        super(injector);
    }

    show() : void 
    {
        this.modal.show();
        this.continueButtonTitle = this.l("Continue");

        if(!this.currentQuiz.isFinished())
            this.startQuiz()
        else
            this.showAnswers();
    }

    close(): void 
    {
        if(this.savedQuiz)
            this.loadSavedQuiz();
                    
        this.currentQuiz = null;
        this.currentSelectedQuestion = null;
        this.resetDisplayValues();
            
        this.modal.hide();   
    }

    continue() : void 
    {
        this.resetDisplayValues();
        this.refuseAnswer();

        if(!this.checkQuizCompleted())
        {
            if(!this.currentSelectedQuestion.hasCorrectAnswer())
            {
                this.currentSelectedQuestion.selectedAnswerIndex = -1; 
            }              
            this.setNextAvailableQuestion();
        }
        else        
            this.finishQuiz();                             
    }

    repeat() : void 
    {
        console.log("repeat quiz but don't lose answers");
        let clonedQuestions = this.cloneQuestions(this.currentQuiz.questions);
        let clonedQuiz : LearningPathQuiz = new LearningPathQuiz(this.currentQuiz.title, clonedQuestions, this.currentQuiz.progress);
        this.savedQuiz = clonedQuiz;

        for (let index = 0; index < this.currentQuiz.questions.length; index++) {
            this.currentSelectedQuestion = this.currentQuiz.questions[index];
            this.currentSelectedQuestion.selectedAnswerIndex = -1;
            this.refuseAnswer();          
        }
        this.currentQuiz.progress = 0;

        this.startQuiz();
    }

    startQuiz() : void 
    {
        this.resetDisplayValues();
        this.setNextAvailableQuestion();       
    }

    showAnswers() : void {
        this.answerSelected = true;
        this.questionListEnabled = true;

        this.currentSelectedQuestion = this.currentQuiz.questions[0];
        this.currentIndex = 0;

        this.loadAnswer();
    }

    finishQuiz() : void 
    {       
        let prog = this.currentQuiz.completeQuiz();
        this.learningPathHelper.updatePathProgress(prog);
        this.learningPathHelper.updateDisplayData(this.level-1, prog);
        this.modalSave.emit(prog);
                  
        this.close();
    }

    loadAnswer() : void{
        if(this.currentSelectedQuestion != null)
        {
            switch (this.currentSelectedQuestion.questionType) {
                case QuestionDisplayType.SingleChoice:
                    this.selectedOptionSingleChoice = this.currentSelectedQuestion.answerIndex;
                    break;
                case QuestionDisplayType.BinaryChoicePicture:
                    console.log("Warning: load question for binary choice picture not implemented yet!");
                    break;
                case QuestionDisplayType.DragAndDrop:
                    console.log("Warning: load question for drag and drop not implemented yet!");
                    break;
                case QuestionDisplayType.OrdableList:
                    console.log("Warning: load question for ordable list not implemented yet!");
                    break;
                case QuestionDisplayType.SelectBox:
                    console.log("Warning: load question for select box not implemented yet!");
                    break;
                case QuestionDisplayType.FieldPoint:
                    console.log("Warning: load question for field choice not implemented yet!");
                    break;           
                default:
                    console.log("Warning: Unknown QuestionDisplayType detected");
                    break;
            }
        }
    }

    loadSavedQuiz() : void {
        this.currentQuiz = this.savedQuiz;

        for (let index = 0; index < this.currentQuiz.questions.length; index++) {
            this.currentSelectedQuestion = this.currentQuiz.questions[index];
            this.loadAnswer();
            
        }
        this.savedQuiz = null;
    }
  
    setNextAvailableQuestion() : boolean 
    {
        let found = false;
        for (let index = 0; index < this.currentQuiz.questions.length; index++) {
            if(!this.currentQuiz.questions[index].hasCorrectAnswer()) {           
                this.currentSelectedQuestion = this.currentQuiz.questions[index];
                this.currentIndex = index;
                found = true;
                break;                      
            }       
        }

        if(found === false) // all questions answered? set first one as available
        {
            this.currentSelectedQuestion = this.currentQuiz.questions[0];
            this.currentIndex = 0;
        }

        return found;
    }

    setQuestionSingleChoice(value : number) 
    {
        if(this.currentSelectedQuestion)
        {
            //console.log("set answer to: " + value);
            this.answerSelected = true;
            this.currentSelectedQuestion.selectedAnswerIndex = value;           
        }
    }

    selected(value : any) {
        console.log("selected value: " + value);
        if (this.currentSelectedQuestion) {
            if(this.currentQuiz.isFinished())
            {
                //do nothing
            }
            else {
                this.answerSelected = true;
                switch (this.currentSelectedQuestion.questionType) {
                    case QuestionDisplayType.SingleChoice:
                    let selNr : number = parseInt(value);
                    this.currentSelectedQuestion.selectedAnswerIndex = selNr;
                    break;
                case QuestionDisplayType.BinaryChoicePicture:
                    console.log("Warning: select value for binary choice not implemented yet!");
                    break;
                case QuestionDisplayType.DragAndDrop:
                    console.log("Warning: select value for drag and drop not implemented yet!");
                    break;
                case QuestionDisplayType.OrdableList:
                    console.log("Warning: select value for ordable list not implemented yet!");
                    break;
                case QuestionDisplayType.SelectBox:
                    console.log("Warning: select value for select box not implemented yet!");
                    break;
                case QuestionDisplayType.FieldPoint:
                    console.log("Warning: select value for field choice not implemented yet!");
                    break;           
                default:
                    console.log("Warning: Unknown QuestionDisplayType detected");
                    break;
                }
            }
        }

        if(this.checkQuizCompleted())
            this.continueButtonTitle = this.l("Finish");
    }
   
    showQuestionList() : void {
        this.questionListEnabled = !this.questionListEnabled;
    }

    refuseAnswer() {               
        switch (this.currentSelectedQuestion.questionType) {
            case QuestionDisplayType.SingleChoice:
            this.selectedOptionSingleChoice = -1;
            break;
        case QuestionDisplayType.BinaryChoicePicture:
            console.log("Warning: select value for binary choice not implemented yet!");
            break;
        case QuestionDisplayType.DragAndDrop:
            console.log("Warning: select value for drag and drop not implemented yet!");
            break;
        case QuestionDisplayType.OrdableList:
            console.log("Warning: select value for ordable list not implemented yet!");
            break;
        case QuestionDisplayType.SelectBox:
            console.log("Warning: select value for select box not implemented yet!");
            break;
        case QuestionDisplayType.FieldPoint:
            console.log("Warning: select value for field choice not implemented yet!");
            break;           
        default:
            console.log("Warning: Unknown QuestionDisplayType detected");
            break;
        }
    }

    questionSelected(index : number) {
        if(!this.currentSelectedQuestion.hasCorrectAnswer())        
            this.currentSelectedQuestion.selectedAnswerIndex = -1;
            
        this.refuseAnswer();
        this.currentSelectedQuestion = this.currentQuiz.questions[index];

        if(this.currentSelectedQuestion.hasCorrectAnswer())
        {
            this.loadAnswer();
            this.answerSelected = true;
        }
        else this.answerSelected = false;

        this.questionListEnabled = false;
    }

    showHelp() : void {
        if(this.questionListEnabled)
            this.questionListEnabled = !this.questionListEnabled;

        this.helpEnabled = !this.helpEnabled;
    }

    checkQuizCompleted() : boolean {
        let i : number = 0;
        for (let index = 0; index < this.currentQuiz.questions.length; index++) {
            if(this.currentQuiz.questions[index].hasCorrectAnswer())
                i++;           
        }

        return i === this.currentQuiz.questions.length;
    }

    resetDisplayValues() : void {
        this.helpEnabled = false;
        this.questionListEnabled = false;
        this.answerSelected = false;
    }

    cloneQuestions(target : LearningPathQuestion[]) : LearningPathQuestion[]
    {
        let clone : LearningPathQuestion[] = [];
        for (let index = 0; index < target.length; index++) {
            let clonedQuestion = new LearningPathQuestion(target[index].quest, target[index].answerIndex, target[index].answerOptions, target[index].questionType);
            clonedQuestion.selectedAnswerIndex = target[index].selectedAnswerIndex;
            clone.push(clonedQuestion);
        }
        return clone;
    }
}