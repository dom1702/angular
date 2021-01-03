import { Component, ViewChild, Injector, OnInit, ViewEncapsulation, AfterViewInit, Output, OnChanges, Sanitizer, SecurityContext, Pipe, PipeTransform, ViewChildren, QueryList, OnDestroy, Input } from "@angular/core";
import { AppComponentBase } from "@shared/common/app-component-base";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { TabsetComponent, TabDirective } from 'ngx-bootstrap/tabs';
import { Observable, Subject } from "rxjs";
import { UserLoginInfoDto, OnlineTheoryServiceProxy, PrepareOnlineTheoryLessonDto, OnlineTheoryOpeningHoursDto, StartNextOnlineTheoryLessonInput, CourseDto, OnlineTheoryLessonDto, OTSingleChoiceDto, FinishOnlineTheoryLessonInput } from "@shared/service-proxies/service-proxies";
import * as moment from 'moment';
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { Message } from "primeng/api";
import { Router} from "@angular/router";
import { ICanComponentDeactivate } from "./sv-quiz.guard";
import { SVQuestionComponent } from "./sv-question.component";

import { List } from "lodash";

import { StudentViewHelper } from "../studentViewHelper.component";

class QuizContent {
    id : number;
    title: string;
    mandatoryTime: number; //in minutes
    videoId? : string;
    questions? : Question[];
    completed: boolean = false;
}

class Question {
    quest : string;
    nr: number;
    pictureUrl? : string;
    answerOptions : string[];
    correctAnswer : number;
    selectedAnswer : number;
    answerAttempts: number;
}

class Quiz {
    quizTitle: string;
    pages: number;
    sheets: QuizContent[];    
}

class QuizSession {
    user : UserLoginInfoDto;
    quiz : Quiz;
    duration: number;
    progress: number;
    startTime: moment.Moment;
    endTime: moment.Moment;
    predefindedQuizId : string;
}

@Component({
    templateUrl: './sv-quiz.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()],
    styleUrls: ['./sv-quiz.component.css'],
    selector: 'quiz'
})

export class SVQuizComponent extends AppComponentBase implements OnInit, OnDestroy, ICanComponentDeactivate {
     
    get nextOnlineLesson() : OnlineTheoryLessonDto {
        return this._nextOnlineLesson;
    }
    set nextOnlineLesson(value : OnlineTheoryLessonDto) {
        if(value != null)
        {
            this._nextOnlineLesson = value;
            this.createQuiz();
            this.enableQuizPart(0);
        }
    }

    _nextOnlineLesson: OnlineTheoryLessonDto;
                
    @ViewChild('quizTabs')
    quizTabs : TabsetComponent;

    @ViewChildren('questions')
    questions : QueryList<SVQuestionComponent>;

    todayOpeningHours : PrepareOnlineTheoryLessonDto;
    closingTime : moment.Moment;
    openingTime: moment.Moment; 
    navigateAwaySelection: Subject<boolean> = new Subject<boolean>();

    tabsData : any[] = []; // read data from dummyData into a struct that can be red by the template
    messages: Message[] = [];

    currentSession : QuizSession = null;
    currentTimer : number = Number.MAX_VALUE;

    quizAborted : boolean;
    quizFinished : boolean = false;
    
    get isClosed(): boolean {
        let x = moment().isBetween(this.openingTime, this.closingTime);
        return !x;      
    }

    get sheetNumber() : number {
        if(this.currentSession != null)
            return this.currentSession.quiz.sheets.length;
        else
            return 0;
    }

    constructor(injector: Injector,          
        private router : Router, 
        private _onlineTheoryService : OnlineTheoryServiceProxy,
        private _helper : StudentViewHelper) 
    {
        super(injector);
    }

    ngOnInit(): void {     
        this.quizAborted = true; 
        this.quizFinished = false;        
        /*this.closingTime = moment().locale(moment.defaultFormat);
        this.openingTime = moment().locale(moment.defaultFormat);
        this.closingTime.set("hour", 13);*/      
    }

    ngOnDestroy() : void {
        this.resetQuizData();
    }

    onSelect(data : TabDirective) : void {       
        var tabNumber = parseInt(data.id);
        if(tabNumber != NaN)
        {
            if(tabNumber < this.currentSession.progress)
            {                                                             
                this.previousTabSelected(tabNumber);          
            }
        }       
    }

    onQuizStart(value : any) {       
        this.quizAborted = value[0];  
        this.closingTime = value[2];
        this.openingTime = value[3] 
        
        if(this.quizAborted == false) 
        {
            var input : StartNextOnlineTheoryLessonInput= new StartNextOnlineTheoryLessonInput();
            input.courseId = this._helper.selectedCourse.course.id;
            input.studentPhoneNumber = value[1];           
            this.startNextOnlineTheoryLesson(input);
        }
    }

    onContinueLesson() {       
        this.resetQuizData();      
    }

    startTabSelected() {
        if(!this.quizAborted)
        {
            this.message.confirm('Confirm', "eLesson has to be started again if you cancel it, are you sure?",
            (isConfirmed) => {
                if (isConfirmed) {                               
                    this.enableQuizPart(this.currentSession.progress);  
                }                 
            });
        }   
    }

    previousTabSelected(tabNumber: number) {
        if(this.quizFinished) {
            this.enableQuizPart(tabNumber);  
        }
        else {
        this.message.confirm('Do you really want to skip back?', "Solved questions wont be saved.",
            (isConfirmed) => {
                if (isConfirmed) {                                    
                    this.enableQuizPart(tabNumber);  
                } 
                else {                    
                    this.quizTabs.tabs[this.currentSession.progress+1].active = true; 
                }                  
            });
        }
    }

    cancelTabSelected() {
        if(!this.quizAborted || this.isClosed)
        {
            this.message.confirm('Do you really want to end?', "Progress will be lost.",
            (isConfirmed) => {
                if (isConfirmed) {  
                    this.finishQuiz(true);         
                    this.resetQuizData();                    
                }                 
            });
        }
        else { //homeTab selected          
            this.router.navigateByUrl("/app/main/studentsView/theoryLessons");
        }             
    }

    onValueSelected(questionParam : any) : void{         
        //console.log("hit answer: " + questionParam.qNr + " answer: " + questionParam.answer);    
        this.currentSession.quiz.sheets[this.currentSession.progress].
            questions[questionParam.qNr].selectedAnswer = questionParam.answer;
        this.currentSession.quiz.sheets[this.currentSession.progress].
            questions[questionParam.qNr].answerAttempts = questionParam.att; 
    }

    canDeactivate(): Observable<boolean> | boolean {            
        if(this.isClosed || this.quizAborted || this.quizFinished)
        {
            return true;
        }
        else {
            this.message.confirm('Discard answers from this sheet?',
            '',
                (isConfirmed) => {
                    if (isConfirmed) {
                        this.finishQuiz(true);
                        this.resetQuizData(); 
                        this.navigateAwaySelection.next(isConfirmed);                       
                    }
                    else {
                        //this.homeTab.active = false;
                        this.quizTabs.tabs[this.currentSession.progress+1].active = true;                    
                    }
                });
            return this.navigateAwaySelection;
        }
    }

    startNextOnlineTheoryLesson(input: StartNextOnlineTheoryLessonInput)
    {    
        this._onlineTheoryService.startNextOnlineTheoryLesson(input).subscribe((result) => {
            console.log(result);
            this.nextOnlineLesson = result;
        });
    }

    finishOnlineTheoryLesson(input : FinishOnlineTheoryLessonInput)
    {        
        this._onlineTheoryService.finishOnlineTheoryLesson(input).subscribe(() => {          
        });
    }

    createQuiz() : void {
        let newSession : QuizSession =  {
            user: this.appSession.user,
            quiz : null,
            duration : 0,
            startTime: moment().locale(moment.defaultFormat),
            endTime: null,
            progress: 0,
            predefindedQuizId : null
        };

        this.currentSession = newSession;

        let temp : QuizContent[] = [];       
        for(let i = 0; i < this.nextOnlineLesson.sections.length; i++)
        {
            let content : QuizContent = new QuizContent();                   
            content.completed = false;
            content.id = i;
            content.mandatoryTime = this.nextOnlineLesson.sections[i].mandatoryTimeInMinutes;
            content.title = this.nextOnlineLesson.sections[i].name;

            let isVideoContent = this.nextOnlineLesson.sections[i].content.length == 1 && this.nextOnlineLesson.sections[i].content[0].videoOnly != null 
            if(isVideoContent) // create video content
            {               
                content.videoId = this.nextOnlineLesson.sections[i].content[0].videoOnly.videoUrl;              
            }
            else { //create questions content        
                let tempQuestions : Question[] = []
                //console.log("number of received questions: " + this.nextOnlineLesson.sections[i].content.length);
                for (let j = 0; j < this.nextOnlineLesson.sections[i].content.length; j++) {
                    let tempQuest = this.convertToQuestion(this.nextOnlineLesson.sections[i].content[j].singleChoice); 
                    tempQuest.nr = j;
                    tempQuestions.push(tempQuest);
                }
                content.questions = tempQuestions;
            }
            temp.push(content);                      
        }

        let q : Quiz = {
            quizTitle : this.nextOnlineLesson.predefinedTheoryLessonIdString, 
            pages : this.nextOnlineLesson.sections.length,
            sheets : temp
        };

        this.currentSession.quiz = q;
        this.currentSession.predefindedQuizId = this.nextOnlineLesson.predefinedTheoryLessonIdString;

        for (let index = 0; index < this.currentSession.quiz.sheets.length; index++) {
            this.addTabData(" " + (index + 1) + " ", 
                index == 0 ? false : true,
                index == 0 ? true : false,
                this.currentSession.quiz.sheets[index].id.toString(),
                this.currentSession.quiz.sheets[index].title, 
                this.currentSession.quiz.sheets[index].mandatoryTime,
                this.currentSession.quiz.sheets[index].questions,
                this.currentSession.quiz.sheets[index].videoId
            );         
        }     
    }
   
    resetQuizData() : void {
        if(this.currentSession != null)  
        {           
            for (let index = 0; index < this.currentSession.quiz.sheets.length; index++) {
                this.deleteQuizData(index);           
            }
            this.currentSession = null;
            
            for (let index = 1; index < this.tabsData.length; index++) {                      
                this.tabsData[index].disabled = true;
                this.changeTabState(index, "closedTab", false);                            
            }
                        
            this.tabsData[0].active = true;
            this.changeTabState(0, "selected", false);           
        }

        this.tabsData = [];
        this.messages = [];
        this.quizAborted = true;
        this.quizFinished = false;
    }

    finishQuiz(quizCanceld: boolean) {
        this.currentSession.endTime = moment().locale(moment.defaultFormat);
        let x = moment.duration(this.currentSession.endTime.diff(this.currentSession.startTime)); 
        this.currentSession.duration = x.get("seconds");
        
        let input : FinishOnlineTheoryLessonInput = new FinishOnlineTheoryLessonInput();
        input.predefinedTheoryLessonIdString = this.currentSession.predefindedQuizId;
        input.canceled = quizCanceld;
        this.finishOnlineTheoryLesson(input);
        //this.debugSavedQuizData();
    }

    updateQuizProgress() : void {
        if(this.currentSession.quiz.sheets[this.currentSession.progress].questions != null && 
            !this.sheetCompleted(this.currentSession.quiz.sheets[this.currentSession.progress]))
        {
            //console.log("sheet not completed yet " + this.currentTimer.toString());
            this.showMessage("Sheet not completed yet.", 'You need to answer all questions correctly!');
        }
        /*else if(this.currentTimer > 0)
        {
           // console.log("timer is not 0 yet " + this.currentTimer.toString());
            this.showMessage("Minimum time not reached yet!", 'You need to wait for another ' + 
                this.getTimeInMinutes(this.currentTimer) + "!");
        }*/
        else {
           // console.log("enable next sheet " + this.currentTimer.toString());
            this.enableQuizPart(this.currentSession.progress+1);
        }    
    }
     
    sheetCompleted(sheet: QuizContent) : boolean {
        if(sheet.questions != null)
        {
            for (let index = 0; index < sheet.questions.length; index++) {
                if(sheet.questions[index].selectedAnswer != sheet.questions[index].correctAnswer)
                    return false;
            }
            return true;
        }
        return false;      
    }

    enableQuizPart(numberOfTab : number) {       
        //console.log("quiz newProgress " + numberOfTab + " | currProgress: " + this.currentSession.progress + "   tD.length: " + this.tabsData.length) ;
        let progress = numberOfTab;

        if(progress > this.currentSession.progress)
        {
            if(progress > 0)
            {
                this.changeTabState(this.currentSession.progress, "finishedTab", true);
                this.currentSession.quiz.sheets[this.currentSession.progress].completed = true;
                this.tabsData[this.currentSession.progress].active = false;              
            }  

            if(progress > this.tabsData.length-1) // end reached
            {                                           
                this.tabsData[this.currentSession.progress].active = true; 
                this.quizFinished = true;
                this.finishQuiz(false);
                return;
            }                                              
        }
        else if(progress < this.currentSession.progress){
            for (let index = this.currentSession.progress; index >= progress; index--) {
                this.deleteQuizData(index);                
                this.currentSession.quiz.sheets[index].completed = false;
                this.tabsData[index].disabled = true;
                this.changeTabState(index, "closedTab", false);  
                this.questions.forEach(element => {
                    element.reset();
                });               
            }            
        }
        
        this.tabsData[progress].disabled = false;
        this.tabsData[progress].active = true;   
        this.changeTabState(progress, "selectedTab", false)  
        this.startTimer(this.currentSession.quiz.sheets[progress].mandatoryTime);               
        this.currentSession.progress = progress;      
        this.messages = [];             
    }

    addTabData(tabHeading: string, isDisabled : boolean, isActive, identifier: string, 
        contentTitle : string, mandTime: number,  tabContent : any[], videoUrl?: string): void {
      
        this.tabsData.push({
            heading : tabHeading, 
            disabled : isDisabled,
            active : isActive,
            id: identifier,
            title: contentTitle,
            mandatoryTime: mandTime,
            content : tabContent,
            video: videoUrl,
            stylingClass: "closedTab",
            finished: false
        });           
    }

    changeTabState(targetTab: number, styling: string, isFinished: boolean) {
        if(targetTab >= 0 && targetTab < this.tabsData.length)
        {
            this.tabsData[targetTab].stylingClass = styling;
            this.tabsData[targetTab].finished = isFinished;
        }      
    }

    getTimeInMinutes(seconds : number) : string {
        let n : number = (seconds/60);
        n = Math.round(n);
        if(n == 0)
            n = 1;

        return n.toFixed(0).toString() + (n > 1 ? " minutes" : " minute");
    }

    startTimer(timerValue : number) {        
        this.currentTimer = timerValue * 60; //(timerValue * 60);
        let intervalId = setInterval(() => {
            this.currentTimer =  (timerValue * 60);
            if(this.currentTimer === 0) clearInterval(intervalId)           
        }, 1000)
        //console.log("start timer... " + intervalId);
    }

    showMessage(_summary: string, _details?: string) {
        this.messages = [];
        this.messages.push({severity: 'error', summary: _summary, detail: _details })
    }
   
    convertToQuestion(question : OTSingleChoiceDto) : Question {
        let temp : Question = new Question();
        temp.answerAttempts = 0;
        temp.correctAnswer = question.correctAnswer-1;
        temp.pictureUrl = question.imageURL != null ? question.imageURL : null;
        temp.quest = question.question;
        let answersLength = this.getNumberOfAnswers(question);
        let answers : string[] = [];
        for (let index = 0; index < answersLength; index++) {
            let tempAnswer : string = "";
            if(index == 0)
                tempAnswer = question.answer1;
            if(index == 1)
                tempAnswer = question.answer2;
            if(index == 2)
            {
                if(question.answer3 == "")
                    continue;
                else
                tempAnswer = question.answer3;
            }
            if(index == 3 )
            {
                if(question.answer4 == "")
                    continue;
                else
                tempAnswer = question.answer4;
            }           
            answers.push(tempAnswer);            
        }
        temp.answerOptions = answers;
        return temp;
    }

    getNumberOfAnswers(question : OTSingleChoiceDto) {
        if(question.answer2 == null)
            return 1;
        else if(question.answer3 == null)
            return 2;
        else if(question.answer4 == null)
            return 3;
        else return 4;
    }

    deleteQuizData(tabNumber: number) {
        if(this.currentSession.quiz.sheets[tabNumber].questions != null && 
            this.currentSession.quiz.sheets[tabNumber].questions.length > 0)
        {
            for (let index = 0; index < this.currentSession.quiz.sheets[tabNumber].questions.length; index++) {
                if(this.currentSession.quiz.sheets[tabNumber].questions[index].answerAttempts != null)
                    this.currentSession.quiz.sheets[tabNumber].questions[index].answerAttempts = 0;
                if(this.currentSession.quiz.sheets[tabNumber].questions[index].selectedAnswer != null)
                    this.currentSession.quiz.sheets[tabNumber].questions[index].selectedAnswer = -1;
            }
        }
    }

    debugSavedQuizData() {
        console.log("Debug saved work: " + this.currentSession.quiz.quizTitle);
        console.log("duration: " + this.currentSession.duration);
        //console.log("start time: " + this.currentSession.startTime.format("HH.mm.ss") + "   endTime: " + this.currentSession.endTime.format("HH.mm.ss") );
        console.log("sheets: ");
        for (let index = 0; index < this.currentSession.quiz.sheets.length; index++) {
            console.log(" sheet nr: " + index +"  completed: " + this.currentSession.quiz.sheets[index].completed);

            if(this.currentSession.quiz.sheets[index].questions != null)
            {
                console.log("questions");
                for (let j = 0; j < this.currentSession.quiz.sheets[index].questions.length; j++) {
                    console.log("question: " + this.currentSession.quiz.sheets[index].questions[j].quest);
                    console.log("correct answer: " + this.currentSession.quiz.sheets[index].questions[j].correctAnswer);
                    console.log("answer: " + this.currentSession.quiz.sheets[index].questions[j].selectedAnswer);
                    console.log("attempts: " + this.currentSession.quiz.sheets[index].questions[j].answerAttempts);
                }              
            }
            else {
                console.log("video");
                console.log("name: " + this.currentSession.quiz.sheets[index].title);
            }
        }
    }

}