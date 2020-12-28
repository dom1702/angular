import { Component, Injector, OnInit, ViewChild, OnDestroy, AfterViewInit } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import * as moment from 'moment';
import { TheoryExamsServiceProxy, GetTopicsForViewDto, GetTheoryExamPreparationForViewDto } from '@shared/service-proxies/service-proxies';
import { Router } from '@angular/router';
import { SVTheoryPracticeHelperService } from './sv-theoryPracticeHelper.service';
import { DateTime } from 'luxon';

export enum QuestionDisplayType {
    SingleChoice,
    PictureChoice,
    BinaryChoice
}

export enum QuestionContentType {
    LicenseClass,
    TrafficSituation,
    RiskIdentify
}

export class LicenseClass {
    name: string;
    token: string;
    vehicleDimensions?: VehicleDimensions;   
    includePictureTasks: boolean;  
    pictureUrl: string;
    
}

export class EvaluatedQuiz {
    incorrectQuestions: TheoryExamQuestion[] = [];
    correctQuestions: TheoryExamQuestion[] = [];
    correctAnswersTotal: number;
    questionsTotal: number;

    errorsLicenceClassQuestions?: number;
    errorsSituationQuestions?: number;
    errorsRiskQuestions?: number;

    correctLicenceClassQuestions?: number;
    correctSituationQuestions?: number;
    correctRiskQuestions?: number;

    totalLicenceClassQuestions?: number;
    totalSituationQuestions?: number;
    totalRiskQuestions?: number;

    quizPassed? : boolean;
}

export class VehicleDimensions {
    maxLength : number;
    totalWeight;
    transportWeight : number;
    carWeight : number;
    width: number;
    height : number;

    constructor(length : number, height?: number, trWeight?: number, cWeight? : number, totalWeight?: number, width? : number) {
        this.maxLength = length;
        this.transportWeight = trWeight;
        this.carWeight = cWeight;
        this.width = width;
        this.height = height;
        
        if(totalWeight)
            this.totalWeight = totalWeight;
        else 
            this.totalWeight = this.transportWeight + this.carWeight;
    }  
}

export class TheoryExamQuestion {
    quest : string = "";
    pictureUrl? : string;
    answerOptions : string[] = [];
    correctAnswer : number = -1;
    selectedAnswer? : number = -1;
    answerAttempts?: number = 0;
    hint?: string;
    isMarked?: boolean = false; 

    displayType: QuestionDisplayType; 
    contentType: QuestionContentType;
    questionId : number;
}

export class QuizSession {
    //user : UserLoginInfoDto;
    quiz : TheoryExamQuestion[];
    selectedQuestion: number;
    duration: number; // in minutes
    startTime: DateTime;
    endTime: DateTime;
    predefindedQuizId : string;
    isMarkable: boolean;
    classInformations : LicenseClass;
    results: EvaluatedQuiz;

    maxErrorsLicenceClassQuestions?: number;
    maxErrorsSituationQuestions?: number;
    maxErrorsRiskQuestions?: number;

    constructor() {       
        this.selectedQuestion = 1;
    }

    hasAnswer(quizIndex: number) : boolean {
        if(this.quiz.length > 0)
        {
            return this.quiz[quizIndex].selectedAnswer > -1;
        }
        return false;
    }

    numberOfLicenceClassQuestions() : number {
        let n = 0;
        if(this.quiz != null)
        {
            for (let index = 0; index < this.quiz.length; index++) {
                if(this.quiz[index].contentType == 0)
                n++;               
            }
        }
        return n;
    }

    numberOfSituationQuestions() : number {
        let n = 0;
        if(this.quiz != null)
        {
            for (let index = 0; index < this.quiz.length; index++) {
                if(this.quiz[index].contentType == 1)
                n++;               
            }
        }
        return n;
    }

    numberOfRiskIdentifyingQuestions() : number{
        let n = 0;
        if(this.quiz != null)
        {
            for (let index = 0; index < this.quiz.length; index++) {
                if(this.quiz[index].contentType == 2)
                n++;               
            }
        }
        return n;
    }

    getNextQuestion() : TheoryExamQuestion {
        let index = this.selectedQuestion;
        if(index < 0 || index > this.quiz.length)
            return null;
        else
            return this.quiz[index];
    }

    getCurrentQuestion() : TheoryExamQuestion {
        let index = this.selectedQuestion-1;
        if(index < 0 || index > this.quiz.length)
            return null;
        else
            return this.quiz[index];
    }
}

@Component({
    templateUrl: './sv-licenseClassTasksOverview.component.html',
    styleUrls: ['./sv-licenseClassTasksOverview.component.css'],
    animations: [appModuleAnimation()],
    providers:[TheoryExamsServiceProxy]
})

export class SVLicenseClassTasksOverview extends AppComponentBase implements OnInit {

    currentLicenseClass : LicenseClass;

    driveStraightSeries: any[] = [];
    turnRightSeries: any[] = [];
    turnLeftSeries: any[] = [];
    giveWayStraightSeries: any[] = [];
    giveWayRightSeries: any[] = [];
    giveWayLeftSeries: any[] = [];
    passingSeries: any[] = [];
    changeLaneSeries: any[] = [];
    stopSeries: any[] = [];
    parkedSeries: any[] = [];

    classQuestionSeries : any[] = [];
    trafficSignQuestionSeries : any[] = [];

    classQuestionCount: number;
    trafficSituationQuestionCount: number;
    riskIdentifyingQuestionCount: number;
    errorsClassCount: number;
    errorsTrafficSituationCount: number;
    errorsRiskIdentifyingCount: number;
    duration: number = 30;
    nextTheoryExamId : number;

    exam = "Theory Exam";
    previewReceived : boolean;
    
    constructor(injector: Injector, 
        private theoryPracticeHelper: SVTheoryPracticeHelperService, 
        private theoryExamService: TheoryExamsServiceProxy,
        private router : Router) {
        super(injector);
    }

    ngOnInit(): void {     
        this.currentLicenseClass = this.theoryPracticeHelper.selectedLicenseClass;
        
        if(this.currentLicenseClass)
        {
            this.getLicenseClassTaskTopicsAsync();
            this.getTheoryExamPreviewAsync();
        }
        else
        {
            console.log("Warning: No selected license class found, navigate back and select again");
            this.router.navigateByUrl("/app/main/studentsView/theoryPractice");
        }
    }

    startSelectedQuiz(id: number) : void { 
        //console.log("current selected id: " + id);      
        this.theoryPracticeHelper.quizId = id;
        this.theoryPracticeHelper.quizMarkable = false;
        this.theoryPracticeHelper.quizDuration = this.duration;
        this.theoryPracticeHelper.selectedLicenseClass = this.currentLicenseClass;
        this.router.navigateByUrl("/app/main/studentsView/theoryPractice/quiz");
    }

    startNextTrafficSituationQuiz() : void {
       this.theoryPracticeHelper
    }

    startTheoryExamSimulation() {
        this.theoryPracticeHelper.quizMarkable = true;  
        this.theoryPracticeHelper.quizDuration = this.duration;
        this.theoryPracticeHelper.selectedLicenseClass = this.currentLicenseClass;
        this.theoryPracticeHelper.maxErrorsLicenseClassQuestions = this.errorsClassCount;  
        this.theoryPracticeHelper.maxErrorsRiskIdentifyingQuestions = this.errorsRiskIdentifyingCount;
        this.theoryPracticeHelper.maxErrorsTrafficSituationQuestions = this.errorsTrafficSituationCount;
        this.theoryPracticeHelper.quizId = 101;
        this.router.navigateByUrl("/app/main/studentsView/theoryPractice/quiz");
    }

    getLicenseClassTaskTopicsAsync() {
        this.theoryExamService.getTopicsForView(this.currentLicenseClass.token).subscribe(            
            (result) => {
                console.log(result);
                this.generateTaskTopics(result);
            }
        );
    }

    getTheoryExamPreviewAsync() {
        //console.log("get exam preview");
        this.theoryExamService.getTheoryExamPreparationForView(this.currentLicenseClass.token).subscribe(
            (result) => {
                if(result != null)
                {                      
                        this.previewReceived = true;
                        this.trafficSituationQuestionCount = result.trafficSituationsQuestionCount;
                        this.classQuestionCount = result.classQuestionCount;
                        this.riskIdentifyingQuestionCount = result.riskIdentifyingQuestionCount;

                        this.duration = result.maxTimeInMinutes;
                        this.errorsClassCount = result.classQuestionMaxIncorrectCount;
                        this.errorsRiskIdentifyingCount = result.riskIdentifyingQuestionMaxIncorrectCount;
                        this.errorsTrafficSituationCount = result.trafficSituationsQuestionMaxIncorrectCount; 
                }         
            });
    }

    generateTaskTopics(result : GetTopicsForViewDto) {
        for (let index = 0; index < result.topics.length; index++) {           
            if(result.topics[index].name === "Traffic Situations") 
            {
                for (let j = 0; j < result.topics[index].questionSeries.length; j++) {  
                    let temp = {
                        groupId: result.topics[index].questionSeries[j].groupId,
                        groupName: result.topics[index].questionSeries[j].groupName,
                        topic: result.topics[index].questionSeries[j].name,
                        id: result.topics[index].questionSeries[j].id,
                        finishedOnce: result.topics[index].questionSeries[j].finishedOnce
                    }
                    switch (result.topics[index].questionSeries[j].groupId) {
                        
                        case 1:
                            this.driveStraightSeries.push(temp);
                        break;
                        case 2:
                            this.turnRightSeries.push(temp);
                        break;
                        case 3:
                            this.turnLeftSeries.push(temp);
                        break;
                        case 4:
                            this.giveWayStraightSeries.push(temp);                       
                        break;
                        case 5:
                            this.giveWayRightSeries.push(temp);
                        break;
                        case 6:
                            this.giveWayLeftSeries.push(temp);
                        break;
                        case 7:
                            this.passingSeries.push(temp);
                        break;
                        case 8:
                            this.changeLaneSeries.push(temp);
                        break;
                        case 9:
                            this.stopSeries.push(temp);
                        break;
                        case 10:
                            this.parkedSeries.push(temp);
                        break;
                    
                        default:
                            break;
                    }                                                      
                }
            }
            else if(result.topics[index].name === "Class Questions")
            {
                for (let j = 0; j < result.topics[index].questionSeries.length; j++) {                                                  
                    this.classQuestionSeries.push({
                        groupId: result.topics[index].questionSeries[j].groupId,
                        groupName: result.topics[index].questionSeries[j].groupName,
                        topic: result.topics[index].questionSeries[j].name,
                        id: result.topics[index].questionSeries[j].id,
                        finishedOnce: result.topics[index].questionSeries[j].finishedOnce
                    });
                }
            }
            else if(result.topics[index].name === "Traffic Signs")
            {
                for (let j = 0; j < result.topics[index].questionSeries.length; j++) {                                                  
                    this.trafficSignQuestionSeries.push({
                        groupId: result.topics[index].questionSeries[j].groupId,
                        groupName: result.topics[index].questionSeries[j].groupName,
                        topic: result.topics[index].questionSeries[j].name,
                        id: result.topics[index].questionSeries[j].id,
                        finishedOnce: result.topics[index].questionSeries[j].finishedOnce
                    });
                }
            }
            else {
                console.log("Generate Task Topics: Found Topic: " + result.topics[index].name + " not supported");
            }                  
        }
    }
}