import { Component, Injector, OnInit, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { ICanComponentDeactivate } from '../theoryCourse/sv-quiz.guard';
import { Observable, Subject } from 'rxjs';
import * as moment from 'moment';
import { TheoryExamQuestion, QuizSession, EvaluatedQuiz } from './sv-licenseClassTasksOverview.component';
import { MessageService, SelectItem } from 'primeng/api';
import { SVTheoryPracticeHelperService } from './sv-theoryPracticeHelper.service';
import { TheoryExamsServiceProxy, QuestionDto, QuestionSeriesDto, GetNextTheoryExamQuestionSeriesInput, FinishTheoryExamQuestionSeriesInput, TESingleChoiceDto, TESingleChoiceResultDto, FinishTopicQuestionSeriesInput } from '@shared/service-proxies/service-proxies';
import { Router } from '@angular/router';
import { DateTime } from 'luxon';

@Component({
    templateUrl: './sv-theoryPracticeQuiz.component.html',
    animations: [appModuleAnimation()],
    styleUrls:['./sv-theoryPracticeQuiz.component.css'],
    providers: [MessageService, TheoryExamsServiceProxy]
})

export class SVTheoryPracticeQuizComponent extends AppComponentBase implements OnInit, ICanComponentDeactivate {   
    @ViewChild("pic01") picButton01 : ElementRef;
    @ViewChild("pic02") picButton02 : ElementRef;
    @ViewChild("pic03") picButton03 : ElementRef;

   // currentResults : EvaluatedQuiz = null;
  
    questionPageButtons: any[] = [];
    
    navigateAwaySelection: Subject<boolean> = new Subject<boolean>();

    quizFinished: boolean = false;
    progressBarType: string = "success";

    timerMinutes: number;
    timerSeconds: number;
    timerProgress: number;
    timerMax: number;
    
    selectOptions: SelectItem[] = [
        {label: 'YES', value: {binary: 0, url:'https://upload.wikimedia.org/wikipedia/commons/thumb/5/50/Yes_Check_Circle.svg/1024px-Yes_Check_Circle.svg.png'}},
        {label: 'NO', value: {binary: 1, url:'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c4/No_icon_red.svg/582px-No_icon_red.svg.png'}},
    ];
    selectedOption: number = -1;

    currentQuizSession: QuizSession;
    markedQuestionPages : number[] = [];
    selectMarkedQuestions: boolean;

    _showDirectionalLinks: boolean = false;
    get showDirectionalLinks() {
        return this._showDirectionalLinks;
    }
    set showDirectionalLinks(value: boolean) {
        this._showDirectionalLinks = value;
    }

    get questionContentIndex() : number {
        let x = this.currentQuizSession.selectedQuestion-1;
        if(x < 0)
        {
            console.log("Warning: TheoryPracticeQuiz question index is below 0!")
            return 0;
        }
        else if(x >= this.currentQuizSession.quiz.length)
        {
            console.log("Warning: TheoryPracticeQuiz question index is higher then content! ")
            return this.currentQuizSession.quiz.length - 1;
        }
        return x;
    }

    get parsedAnswer() : string {
        if(this.currentQuizSession.quiz[this.questionContentIndex].selectedAnswer > -1)
        {
            let answer = this.currentQuizSession.quiz[this.questionContentIndex].selectedAnswer;
            if(this.currentQuizSession.quiz[this.questionContentIndex].displayType == 2)
            {    
                return answer == 0 ? this.l("Yes") : this.l("No");
            }
            else if(this.currentQuizSession.quiz[this.questionContentIndex].displayType == 1) {
                let answer = this.currentQuizSession.quiz[this.questionContentIndex].selectedAnswer; 
                let p = (this.l("Sign") +" ");
                switch (answer) {
                    case 0:
                        return p += '1';
                    case 1:
                        return p += '2';
                    case 2:
                        return p += '3';            
                    default:
                        return "None";
                }
            }
            else if(this.currentQuizSession.quiz[this.questionContentIndex].displayType == 0) {
                let quest = this.currentQuizSession.quiz[this.questionContentIndex];
                for (let index = 0; index < quest.answerOptions.length; index++) {
                    if(index == quest.selectedAnswer)
                        return quest.answerOptions[index];
                }
            }        
        }
        return "None";
    }

    get quizMainTitle() : string{
        if(this.currentQuizSession != null && !this.currentQuizSession.isMarkable)
        { 
            return this.l("HeaderTEP2")
        }
        else
        {
            return this.l("HeaderTEP1");
        }
    }

    get quizSubtitle() : string {
        if(this.currentQuizSession)
        {
            if(!this.quizFinished)
            {
                let currQuestion = this.currentQuizSession.getCurrentQuestion();
                switch (currQuestion.contentType) {
                    case 0:
                        return this.l("TSQuestion");              
                    case 1:
                        return this.l("LCQuestion");              
                    case 2:
                        return this.l("RIQuestion");                          
                    default:
                        break;
                }
            }
            else {
                return this.l("Results");
            } 
        }
        else return "No Quiz";
    }

    constructor(injector: Injector, 
        private messageService: MessageService,
        public theoryPracticeHelperService: SVTheoryPracticeHelperService,
        private theoryExamService: TheoryExamsServiceProxy,
        private router: Router) {        
        super(injector);
    }

    canDeactivate(): Observable<boolean> | Promise<boolean> | boolean {
        //console.log("check can Deactivate");
        if(!this.quizFinished && this.currentQuizSession != null)
        {
            this.message.confirm(this.l("DiscardTEP1"), '', (isConfirmed) => {
                if (isConfirmed) {
                    console.log("navigated away from TheoryPracticeQuiz");                   
                    this.navigateAwaySelection.next(isConfirmed);                       
                }
                else {                                    
                    console.log("navigation: return to TheoryPracticeQuiz");
                }
            });
            return this.navigateAwaySelection;
        }
        else 
        {
            return true;
        }
    }

    ngOnInit(): void {      
        let quizId = this.theoryPracticeHelperService.quizId;
        if(quizId !== 101)
        {
            this.getQuestionSeriesAsync(quizId);
        }
        else {
            this.getTheoryExamQuestionSeriesAsync();
        }
    }

    getQuestionSeriesAsync(id : number) {
        let res;      
        this.theoryExamService.getQuestionSeries(id).subscribe(
           (result) => this.generateQuiz(result)                      
        );     
    }

    getTheoryExamQuestionSeriesAsync() {
        let input: GetNextTheoryExamQuestionSeriesInput = new GetNextTheoryExamQuestionSeriesInput();
        input.licenseClass = this.theoryPracticeHelperService.selectedLicenseClass.token;
        this.theoryExamService.startNextTheoryExamQuestionSeries(input).subscribe(
            (result) => {this.generateQuiz(result);}
        );
    }

    setTheoryExamQuestionSeriesResultAsync(results : EvaluatedQuiz) {
        let input : FinishTheoryExamQuestionSeriesInput = new FinishTheoryExamQuestionSeriesInput();
        input.wrongAnsweredSingleChoiceQuestions = [];
        input.licenseClass = this.currentQuizSession.classInformations.token;
        input.correctlyAnsweredClassQuestions = results.correctLicenceClassQuestions;
        input.correctlyAnsweredRiskIdentifyingQuestions = results.correctRiskQuestions;
        input.correctlyAnsweredTrafficSituationsQuestions = results.correctSituationQuestions;
        input.startTime = this.currentQuizSession.startTime;
        input.correctlyAnsweredQuestionIds = [];
        
        for (let index = 0; index < results.correctQuestions.length; index++) {
            input.correctlyAnsweredQuestionIds.push(results.correctQuestions[index].questionId);        
        }

        for (let index = 0; index < results.incorrectQuestions.length; index++) {
            input.wrongAnsweredSingleChoiceQuestions.push(this.convertToQuestionResultDto(results.incorrectQuestions[index]));          
        }

        this.theoryExamService.finishTheoryExamQuestionSeries(input).subscribe();     
    }

    setTheoryPracticeSeriesResultAsync()
    {        
        let input : FinishTopicQuestionSeriesInput = new FinishTopicQuestionSeriesInput();
        input.questionSeriesId = this.theoryPracticeHelperService.quizId;
        this.theoryExamService.finisTopicQuestionSeries(input).subscribe();     
    }

    generateQuiz(questionSeries: QuestionSeriesDto) {
        
        this.currentQuizSession = new QuizSession();
        this.currentQuizSession.predefindedQuizId = questionSeries.name;
        
        let quiz : TheoryExamQuestion[] = [];
        for (let index = 0; index < questionSeries.questions.length; index++) {           
            quiz.push(this.convertToTheoryExamQuestion(questionSeries.questions[index]));
        }
 
        this.currentQuizSession.quiz = quiz;

        for (let index = 0; index < this.currentQuizSession.quiz.length; index++) {
            this.questionPageButtons.push({class: 'disabledPageButton', disabled: true});          
        }
        this.changeButtonStyle(0, "selectedPageButton"); 

        this.startQuiz();
    }

    onFinishQuiz() { 
        let message = this.l("DiscardTEP2");
        let title = this.currentQuizSession.isMarkable ?  this.l("DiscardTEP3") :
            this.l("DiscardTEP4");
        this.message.confirm(message, title,
            (isConfirmed) => {
            if (isConfirmed) { 
                this.finishQuiz();                                
            }  
            else {
                this.correctQuiz();    
            }               
        });                           
    }

    startQuiz() {
        if(this.currentQuizSession != null) 
        {      
            this.currentQuizSession.duration = this.theoryPracticeHelperService.quizDuration;
            this.currentQuizSession.isMarkable = this.theoryPracticeHelperService.quizMarkable;
            this.currentQuizSession.classInformations = this.theoryPracticeHelperService.selectedLicenseClass;
            
            if(this.currentQuizSession.isMarkable)
            {
                this.currentQuizSession.maxErrorsLicenceClassQuestions = this.theoryPracticeHelperService.maxErrorsLicenseClassQuestions;
                this.currentQuizSession.maxErrorsRiskQuestions = this.theoryPracticeHelperService.maxErrorsRiskIdentifyingQuestions;
                this.currentQuizSession.maxErrorsSituationQuestions = this.theoryPracticeHelperService.maxErrorsTrafficSituationQuestions;
            }

            this.currentQuizSession.selectedQuestion = 1;
            this.currentQuizSession.startTime = DateTime.local();
            this.startTimer(this.currentQuizSession.duration); 
        }  
        else {
            console.log("Warning: No selected QuizId found! --> Navigating back back");
            this.router.navigateByUrl("/app/main/studentsView/theoryPractice");
        }      
    }

    finishQuiz() {
        this.evaluateQuiz();
        if(this.currentQuizSession.isMarkable) // is exam --> send data to server      
            this.setTheoryExamQuestionSeriesResultAsync(this.currentQuizSession.results);
        else
            this.setTheoryPracticeSeriesResultAsync();
              
        this.toggleQuizNavigation(false);
        this.quizFinished = true;
    }  

    correctQuiz() {      
        this.currentQuizSession.isMarkable = false; 
        this.toggleQuizNavigation(true);
    }

    evaluateQuiz() {   
        let errorsLicenceClass = 0; let errorsRisk = 0; let errorsSituation = 0;
        let correctLicenceClass = 0; let correctRisk = 0; let correctSituation = 0;
        let evaluation: EvaluatedQuiz = new EvaluatedQuiz();
        
        for (let index = 0; index < this.currentQuizSession.quiz.length; index++) {
            let q = this.currentQuizSession.quiz[index];
            if(q.selectedAnswer != q.correctAnswer ) {
                evaluation.incorrectQuestions.push(q);

                if(this.theoryPracticeHelperService.quizMarkable)
                {
                    switch (q.contentType) {
                        case 0:
                            errorsLicenceClass++;
                            break;
                        case 1:
                            errorsSituation++;
                            break;
                        case 2: 
                            errorsRisk++;  
                            break;                         
                        default:
                            break;
                    }                  
                }
            }
            else {
                if(this.theoryPracticeHelperService.quizMarkable)
                {
                    evaluation.correctQuestions.push(q);
                    switch (q.contentType) {
                        case 0:
                            correctLicenceClass++;
                            break;
                        case 1:
                            correctSituation++;
                            break;
                        case 2: 
                        correctRisk++;  
                            break;                         
                        default:
                            break;
                    }                  
                }
            }            
        }
            
        evaluation.correctAnswersTotal = (this.currentQuizSession.quiz.length - evaluation.incorrectQuestions.length);
        evaluation.questionsTotal = this.currentQuizSession.quiz.length;
        
        if(this.theoryPracticeHelperService.quizMarkable)
        {
            evaluation.errorsLicenceClassQuestions = errorsLicenceClass;
            evaluation.totalLicenceClassQuestions = this.currentQuizSession.numberOfLicenceClassQuestions();
            evaluation.correctLicenceClassQuestions = correctLicenceClass;

            evaluation.errorsRiskQuestions = errorsRisk;
            evaluation.totalRiskQuestions = this.currentQuizSession.numberOfRiskIdentifyingQuestions();
            evaluation.correctRiskQuestions = correctRisk;

            evaluation.errorsSituationQuestions = errorsSituation;
            evaluation.totalSituationQuestions = this.currentQuizSession.numberOfSituationQuestions();
            evaluation.correctSituationQuestions = correctSituation;

            evaluation.quizPassed = evaluation.errorsLicenceClassQuestions <= this.currentQuizSession.maxErrorsLicenceClassQuestions &&
                evaluation.errorsSituationQuestions <= this.currentQuizSession.maxErrorsSituationQuestions &&
                evaluation.errorsLicenceClassQuestions <= this.currentQuizSession.maxErrorsLicenceClassQuestions ?
                true : false;
        } 
        
        this.currentQuizSession.results = evaluation;
    }

    onPageClicked(index: number) {
        if(this.currentQuizSession != null )
        {        
            this.currentQuizSession.selectedQuestion = index+1;
            this.changeAllButtonStyles(true, "defaultPageButton");
            this.loadSelectedAnswer();
        }
    }

    onNextPageClicked() {
        if(this.currentQuizSession != null &&  this.currentQuizSession.selectedQuestion < this.questionPageButtons.length)
        {
            this.currentQuizSession.selectedQuestion += 1;
            this.changeAllButtonStyles(true, "defaultPageButton");
            this.loadSelectedAnswer();
        }
    }

    onPreviousPageClicked() {
        if(this.currentQuizSession != null &&  this.currentQuizSession.selectedQuestion > 1) {
            this.currentQuizSession.selectedQuestion -= 1;
            this.changeAllButtonStyles(true, "defaultPageButton");
            this.loadSelectedAnswer();
        }
    }

    loadSelectedAnswer() {       
        this.selectedOption = this.currentQuizSession.quiz[this.questionContentIndex].selectedAnswer;    
        //console.log("buttons: " + this.picButton01 + " ," + this.picButton02 + " ," + this.picButton03 );
        if(this.picButton01 != null)
        {
            if(this.selectedOption == 0)   
                this.picButton01.nativeElement.focus(); 
            else if(this.selectedOption == 1)   
                this.picButton02.nativeElement.focus(); 
            else if(this.selectedOption == 2)   
                this.picButton03.nativeElement.focus(); 
        }  
    }

    markQuestion() {
        this.markedQuestionPages.push(this.currentQuizSession.selectedQuestion);
        this.changeButtonStyle(this.currentQuizSession.selectedQuestion, "markedPageButton");  
        this.nextPage(true)
    }

    nextPage(markCurrentPage: boolean): void { 
        if(!this.selectMarkedQuestions)
        {
            this.checkTrafficSituationNotification();
            let x = this.currentQuizSession.selectedQuestion + 1;
            if(x > this.currentQuizSession.quiz.length) // end reached
            {
                if(this.currentQuizSession.isMarkable && this.markedQuestionPages.length > 0)
                {
                    this.selectMarkedQuestions = true;
                    this.changeButtonStyle(this.currentQuizSession.selectedQuestion, "disabledPageButton");
                    this.nextMarkedPage();               
                }
                else {
                    this.onFinishQuiz();
                    this.changeButtonStyle(this.currentQuizSession.selectedQuestion, "selectedPageButton");
                }
            }
            else{
                this.currentQuizSession.selectedQuestion = x; 
                if(!markCurrentPage)                
                    this.changeButtonStyle(this.currentQuizSession.selectedQuestion-1, "disabledPageButton");               
                this.changeButtonStyle(this.currentQuizSession.selectedQuestion, "selectedPageButton");
            }  
        } 
        else
        {           
            if(this.markedQuestionPages.length > 0)
            {
                console.log("show next marked question");
                if(!markCurrentPage)
                    this.changeButtonStyle(this.markedQuestionPages[0], "disabledPageButton");
                this.markedQuestionPages.splice(0, 1);               
            }
            this.nextMarkedPage(); 
        }
        this.selectedOption = -1;
    }

    nextMarkedPage() {
        if(this.markedQuestionPages.length < 1)
        {
            this.selectMarkedQuestions = false;
            console.log("end of marked questions reached: end quiz?");
            this.changeButtonStyle(this.currentQuizSession.selectedQuestion, "selectedPageButton");
            this.onFinishQuiz();
        }
        else {
            this.currentQuizSession.selectedQuestion = this.markedQuestionPages[0]; 
            this.changeButtonStyle(this.markedQuestionPages[0], "selectedPageButton");         
        }
        
    }

    setQuestionAnswerRadioButton(value : number) {
        if(this.currentQuizSession)
        {
            //console.log("set answer to: " + value);
            this.currentQuizSession.quiz[this.questionContentIndex].selectedAnswer = value;           
        }
    }

    setQuestionAnswerSelectButton(event: any) {
        if(this.currentQuizSession)
        {
            //console.log("set answer to: " + event.value + " " + event.value.value.binary + "selected option: " + this.selectedOption);
            this.currentQuizSession.quiz[this.questionContentIndex].selectedAnswer = event.value.value.binary;                         
        }
    }

    setQuestionAnswerPictureButton(value : number) {
        if(this.currentQuizSession)
        {
            //console.log("(pic) set answer to: " + value);
            this.currentQuizSession.quiz[this.questionContentIndex].selectedAnswer = value;           
        }
    }

    convertToQuestionResultDto(target : TheoryExamQuestion) : TESingleChoiceResultDto {
        let temp : TESingleChoiceResultDto = new TESingleChoiceResultDto();
        temp.answer = target.selectedAnswer;
        temp.questionId = target.questionId;
        return temp;
    }

    convertToTheoryExamQuestion(target : QuestionDto) : TheoryExamQuestion {
        let temp : TheoryExamQuestion = new TheoryExamQuestion();

        switch (target.type) {
            case 0: // TrafficSituation
                temp.displayType = 2;
                temp.contentType = 1;               
                temp.pictureUrl = target.singleChoiceAnswer.imageUrl;   
                temp.hint = this.l(target.hintAfterWrongAnswer);   
                temp.answerOptions.push(this.l(target.singleChoiceAnswer.answer1));
                temp.answerOptions.push(this.l(target.singleChoiceAnswer.answer2));                  
            break;
            case 1: // ClassRelated
                temp.displayType = 0;
                temp.contentType = 0;  
                temp.answerOptions.push(this.l(target.singleChoiceAnswer.answer1));
                temp.answerOptions.push(this.l(target.singleChoiceAnswer.answer2));
                temp.answerOptions.push(this.l(target.singleChoiceAnswer.answer3));                  
            break;
            case 2: // RiskIdentifying
                temp.displayType = 0;
                temp.contentType = 2;                   
                temp.pictureUrl = target.singleChoiceAnswer.imageUrl;  
                temp.answerOptions.push(this.l(target.singleChoiceAnswer.answer1));
                temp.answerOptions.push(this.l(target.singleChoiceAnswer.answer2));
                temp.answerOptions.push(this.l(target.singleChoiceAnswer.answer3));              
            break;
            case 3: // Other --> PictureQuestion
                temp.displayType = 1;
                temp.contentType = 0;
                temp.answerOptions.push(target.singleChoiceAnswer.answer1);
                temp.answerOptions.push(target.singleChoiceAnswer.answer2);
                temp.answerOptions.push(target.singleChoiceAnswer.answer3);
            break;                      
            default:
                console.log("Display Question: Question type not found " + target.type);
                break;     
        }
        
        temp.correctAnswer = target.singleChoiceAnswer.correctAnswer; 
        temp.questionId = target.id;   
        temp.quest = this.l(target.questionString);                 
        
        return temp;
    }

    getMarkedQuestionsToString() : string {
        let s = "";
        for (let index = 0; index < this.markedQuestionPages.length; index++) {
            s += this.markedQuestionPages[index].toString(); 
            if(index != this.markedQuestionPages.length-1)
                s += ", "                  
        }
        return s;
    }

    startTimer(timeInMinutes : number) {        
        this.timerProgress = this.timerMax = (timeInMinutes * 60);
        this.timerMinutes = timeInMinutes; 
        this.timerSeconds = 60;
        let intervalId = setInterval(() => {
          let currMod : number = this.timerProgress % 60;
          this.checkProgressBarColor(this.timerProgress, this.timerMax);
          if(currMod === 0)
            {
              this.timerMinutes--;
              this.timerSeconds = 60;
            }
            this.timerProgress = this.timerProgress-1; 
            this.timerSeconds = this.timerSeconds-1;          
            
            if(this.timerProgress === 0)
            { 
              clearInterval(intervalId);
              this.finishQuiz();
            }          
        }, 1000);
        //console.log("start timer... " + intervalId);
    }

    checkProgressBarColor(progressOfTime: number, timerMax: number) {
        if(progressOfTime < (timerMax*0.4) && progressOfTime > (timerMax*0.15))
        {
            this.progressBarType = "warning";
        }
        else if(progressOfTime < (timerMax*0.15))
        {
            this.progressBarType = "danger";
        }
    }

    toggleQuizNavigation(enable : boolean) {
        if(enable)
        {           
            this.showDirectionalLinks = true;      
            this.changeAllButtonStyles(true, "defaultPageButton");
            
        }
        else {           
            this.showDirectionalLinks = false;       
            this.changeAllButtonStyles(true, "disabledPageButton");  
        }
    }

    changeButtonStyle(targetIndex: number, styleClass: string) {
        targetIndex = targetIndex-1 < 0 ? 0 : targetIndex-1 ; // convert to index
        let disabled = styleClass === "defaultPageButton" ?
            null : 'disabled';
        
        if(targetIndex > this.questionPageButtons.length-1)       
            console.log("Quiz: Warning! Something went wrong changing question buttons style");
        
        this.questionPageButtons[targetIndex].class = styleClass;
        this.questionPageButtons[targetIndex].disabled = disabled;
    }

    changeAllButtonStyles(exceptSelected: boolean, style: string)
    {
        for (let index = 0; index <= this.questionPageButtons.length; index++) {
            if(exceptSelected && index == this.currentQuizSession.selectedQuestion)
                this.changeButtonStyle(index, "selectedPageButton");
            else 
                this.changeButtonStyle(index, style);
        }
    }

    addSingleToast(title: string, description: string) {
        this.messageService.add({key:'trafficSituationToast', severity:'info', summary: title, detail: description});
    }

    clearToast() {
        this.messageService.clear();
    }

    checkTrafficSituationNotification() {
        let currentQuestion = this.currentQuizSession.getCurrentQuestion();
        let nextQuestion = this.currentQuizSession.getNextQuestion();
       
        if(nextQuestion != null)
        {
            if(currentQuestion.contentType != nextQuestion.contentType)
            {
                if(nextQuestion.contentType == 1)
                    this.addSingleToast(this.l("TrafficSituationToast1"),  this.l("TrafficSituationToast4") + " " + nextQuestion.quest);
            }
            else {
                if(currentQuestion.quest != nextQuestion.quest && nextQuestion.contentType == 1)
                    this.addSingleToast(this.l("TrafficSituationToast2"), this.l("TrafficSituationToast2") + " " + nextQuestion.quest);
            }               
        }
    }
}
