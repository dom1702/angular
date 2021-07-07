import { Injectable } from "@angular/core";
import { ThemeMenuSettingsDto } from "@shared/service-proxies/service-proxies";

export enum QuestionDisplayType {
    SingleChoice,   
    BinaryChoicePicture,
    FieldPoint,
    DragAndDrop,
    SelectBox,
    OrdableList
}

export class LearningPathQuestion {
    quest : string;
    answerOptions : string[];
    answerIndex : number;
    questionType :  QuestionDisplayType;
    points: number;

    selectedAnswerIndex : number = -1;

    isFinished() : boolean {
        return this.selectedAnswerIndex === this.answerIndex;
    }

    constructor(quest : string, answerIndex : number, answerOptions : string[]) {
        this.quest = quest;
        this.answerIndex = answerIndex;
        this.questionType = 0;
        this.answerOptions = answerOptions;
        this.points = 10;
    }
}

export class LearningPathQuiz {
    title : string;
    questions : LearningPathQuestion[];
    progress : number;
    max : number;
    
    isFinished() : boolean {
        return this.progress === this.max;
    }
    
    constructor(title : string, questions : LearningPathQuestion[], progress : number) {
        this.title = title;
        this.questions = questions;    
        this.progress = progress;  
        this.max = 0;
        
        for (let index = 0; index < questions.length; index++) {
            this.max += questions[index].points;           
        }
    }   
    
    completeQuiz() : number {
        this.progress = this.max;
        return this.progress
    }
}

export class LearningUnitDisplayData {   
    progress: number;  
    max: number; 

    disabled: boolean;
    active: boolean;

    isFinished() : boolean {
        return this.progress === this.max;
    }

    constructor(progress : number, maxProgress: number) {    
        this.progress = progress;   
        this.max = maxProgress;  

        this.disabled = this.progress == this.max ? false : true;
        this.active = false;
    }  
}

export class LearningUnitChapter {
    title: string;
    quizze : LearningPathQuiz[];

    isFinished : boolean = false;

    constructor(title : string, quizze : LearningPathQuiz[]) {
        this.title = title;
        
        this.quizze = [];
        for (let index = 0; index < quizze.length; index++) {
            this.quizze.push(quizze[index]);        
        }
    }

    getTargetQuiz(index : number) : LearningPathQuiz {
        if(this.quizze != null)
        {
            if(index >= 0 && index < this.quizze.length)
                return this.quizze[index];
        }
    }
}

export class LearningUnit {
    level : number;
    chapters : LearningUnitChapter[];
    max : number = 0;
    progress : number = 0;

    constructor(level : number, chapters : LearningUnitChapter[]) {
        this.level = level;
        this.chapters = chapters;

        if(this.chapters != null) // set maxProgress
        {
            for (let i = 0; i < this.chapters.length; i++) {
                if(this.chapters[i].quizze != null)
                {
                    for (let j = 0; j < this.chapters[i].quizze.length; j++) {
                        if(this.chapters[i].quizze[j] != null)
                            this.max += this.chapters[i].quizze[j].max;              
                    }  
                }                   
            }
        }

        if(this.chapters != null) // set currentProgress
        {
            for (let i = 0; i < this.chapters.length; i++) {
                if(this.chapters[i].quizze != null)
                {
                    for (let j = 0; j < this.chapters[i].quizze.length; j++) {
                        if(this.chapters[i].quizze[j] != null)                   
                            this.progress += this.chapters[i].quizze[j].progress;              
                    }  
                }                   
            }
        }
    }

    isFinished() : boolean {
        if(this.max > 1)
            return this.progress === this.max;
        else
        {
            console.log("warning: parsed LearningUnit have maxProgress of " + this.max);
            return false;
        }
    }
}

@Injectable({
    providedIn:"root"
})

export class SVLearningPathHelperService {     
    dummyQuest1 : LearningPathQuestion = new LearningPathQuestion("are you an optimist", 0, ["no", "sometimes, yes"]);
    dummyQuest2 : LearningPathQuestion = new LearningPathQuestion("do you love black metal", 1, ["yes", "HELL YES"]);
    dummyQuest3 : LearningPathQuestion = new LearningPathQuestion("1+(-2)=?", 0, ["0", "-1"]);

    dummyQuiz1 : LearningPathQuiz = new LearningPathQuiz("dummy1", [this.dummyQuest1, this.dummyQuest2], 0);
    dummyQuiz2 : LearningPathQuiz = new LearningPathQuiz("dummy2", [this.dummyQuest2, this.dummyQuest1, this.dummyQuest2, this.dummyQuest1], 0);
    dummyQuiz3 : LearningPathQuiz = new LearningPathQuiz("dummy3", [this.dummyQuest3, this.dummyQuest1, this.dummyQuest2, this.dummyQuest3], 0);

    dummyQuiz4 : LearningPathQuiz = new LearningPathQuiz("dummy4", [this.dummyQuest1, this.dummyQuest2], 0);
    dummyQuiz5 : LearningPathQuiz = new LearningPathQuiz("dummy5", [this.dummyQuest2, this.dummyQuest1, this.dummyQuest2, this.dummyQuest1], 0);
    dummyQuiz6 : LearningPathQuiz = new LearningPathQuiz("dummy6", [this.dummyQuest3, this.dummyQuest1, this.dummyQuest2, this.dummyQuest3], 0);
    dummyQuiz7 : LearningPathQuiz = new LearningPathQuiz("dummy7", [this.dummyQuest1, this.dummyQuest2], 0);
    dummyQuiz8 : LearningPathQuiz = new LearningPathQuiz("dummy8", [this.dummyQuest2, this.dummyQuest1, this.dummyQuest2, this.dummyQuest1], 0);
    dummyQuiz9 : LearningPathQuiz = new LearningPathQuiz("dummy9", [this.dummyQuest3, this.dummyQuest1, this.dummyQuest2, this.dummyQuest3], 0);
    dummyQuiz10 : LearningPathQuiz = new LearningPathQuiz("dummy10", [this.dummyQuest1, this.dummyQuest2], 0);
    dummyQuiz11 : LearningPathQuiz = new LearningPathQuiz("dummy11", [this.dummyQuest2, this.dummyQuest1, this.dummyQuest2, this.dummyQuest1], 0);
    dummyQuiz12 : LearningPathQuiz = new LearningPathQuiz("dummy12", [this.dummyQuest3, this.dummyQuest1, this.dummyQuest2, this.dummyQuest3], 0);
    dummyQuiz13 : LearningPathQuiz = new LearningPathQuiz("dummy13", [this.dummyQuest1, this.dummyQuest2], 0);
    dummyQuiz14 : LearningPathQuiz = new LearningPathQuiz("dummy14", [this.dummyQuest2, this.dummyQuest1, this.dummyQuest2, this.dummyQuest1], 0);
    dummyQuiz15 : LearningPathQuiz = new LearningPathQuiz("dummy15", [this.dummyQuest3, this.dummyQuest1, this.dummyQuest2, this.dummyQuest3], 0);

    dummyChapterQuizze1_1 : LearningPathQuiz[] = [this.dummyQuiz1, this.dummyQuiz2, this.dummyQuiz3, this.dummyQuiz4];
    dummyChapterQuizze1_2 : LearningPathQuiz[] = [this.dummyQuiz5, this.dummyQuiz6, this.dummyQuiz7, this.dummyQuiz8, this.dummyQuiz9];
    dummyChapterQuizze1_3 : LearningPathQuiz[] = [this.dummyQuiz11, this.dummyQuiz15, this.dummyQuiz12, this.dummyQuiz14, this.dummyQuiz13]

    dummyChapterQuizze2_1 : LearningPathQuiz[] = [this.dummyQuiz1, this.dummyQuiz2, this.dummyQuiz1, this.dummyQuiz2];
    dummyChapterQuizze2_2 : LearningPathQuiz[] = [this.dummyQuiz1, this.dummyQuiz2, this.dummyQuiz1, this.dummyQuiz2, this.dummyQuiz1, this.dummyQuiz2, this.dummyQuiz1, this.dummyQuiz2];
    dummyChapterQuizze2_3 : LearningPathQuiz[] = [this.dummyQuiz1, this.dummyQuiz2, this.dummyQuiz3, this.dummyQuiz2, this.dummyQuiz1, this.dummyQuiz3, this.dummyQuiz1, this.dummyQuiz2];
    dummyChapterQuizze2_4 : LearningPathQuiz[] = [this.dummyQuiz1, this.dummyQuiz2, this.dummyQuiz1, this.dummyQuiz2];
    dummyChapterQuizze2_5 : LearningPathQuiz[] = [this.dummyQuiz1, this.dummyQuiz2, this.dummyQuiz1, this.dummyQuiz2, this.dummyQuiz1, this.dummyQuiz2, this.dummyQuiz1, this.dummyQuiz2];
    dummyChapterQuizze2_6 : LearningPathQuiz[] = [this.dummyQuiz1, this.dummyQuiz2, this.dummyQuiz3, this.dummyQuiz2, this.dummyQuiz1, this.dummyQuiz3, this.dummyQuiz1, this.dummyQuiz2];

    dummyChapterQuizze3_1 : LearningPathQuiz[] = [this.dummyQuiz1, this.dummyQuiz2, this.dummyQuiz1, this.dummyQuiz2];
    
    dummyChapterQuizze4_1 : LearningPathQuiz[] = [this.dummyQuiz1, this.dummyQuiz2, this.dummyQuiz1, this.dummyQuiz2, this.dummyQuiz1, this.dummyQuiz2, this.dummyQuiz1, this.dummyQuiz2];
    dummyChapterQuizze4_2 : LearningPathQuiz[] = [this.dummyQuiz1, this.dummyQuiz2, this.dummyQuiz1, this.dummyQuiz2, this.dummyQuiz1, this.dummyQuiz2, this.dummyQuiz1, this.dummyQuiz2];
    dummyChapterQuizze4_3 : LearningPathQuiz[] = [this.dummyQuiz1, this.dummyQuiz2, this.dummyQuiz3, this.dummyQuiz2, this.dummyQuiz1, this.dummyQuiz3, this.dummyQuiz1, this.dummyQuiz2];

    dummyChapterQuizze5_1 : LearningPathQuiz[] = [this.dummyQuiz1, this.dummyQuiz2, this.dummyQuiz1, this.dummyQuiz2];
  
    lvl1chapter1 : LearningUnitChapter = new LearningUnitChapter("Car and handling of it", this.dummyChapterQuizze1_1);
    lvl1chapter2 : LearningUnitChapter = new LearningUnitChapter("Behavior of a car and its equipment", this.dummyChapterQuizze1_2);
    lvl1chapter3 : LearningUnitChapter = new LearningUnitChapter("Taking care of the car", this.dummyChapterQuizze1_3);
    lvl1 : LearningUnit = new LearningUnit(1, [this.lvl1chapter1, this.lvl1chapter2, this.lvl1chapter3]);
   
    lvl2chapter1 : LearningUnitChapter = new LearningUnitChapter("Trafficenvironment and regulation of traffic", this.dummyChapterQuizze2_1);
    lvl2chapter2 : LearningUnitChapter = new LearningUnitChapter("Interaction in traffic", this.dummyChapterQuizze2_2);
    lvl2chapter3 : LearningUnitChapter = new LearningUnitChapter("Basic skills of a responsible driver", this.dummyChapterQuizze2_3);
    lvl2chapter4 : LearningUnitChapter = new LearningUnitChapter("Merging the traffic and driving in traffic", this.dummyChapterQuizze2_4);
    lvl2chapter5 : LearningUnitChapter = new LearningUnitChapter("Driving in intersections - driving lines", this.dummyChapterQuizze2_5);
    lvl2chapter6 : LearningUnitChapter = new LearningUnitChapter("Driving in intersections - priority rules", this.dummyChapterQuizze2_6);
    lvl2 : LearningUnit = new LearningUnit(2, [this.lvl2chapter1, this.lvl2chapter2, this.lvl2chapter3, this.lvl2chapter4, this.lvl2chapter5, this.lvl2chapter6]);

    lvl3chapter1 : LearningUnitChapter = new LearningUnitChapter("Handling luggage space", this.dummyChapterQuizze3_1);
    lvl3 : LearningUnit = new LearningUnit(3, [this.lvl3chapter1]);

    lvl4chapter1 : LearningUnitChapter = new LearningUnitChapter("Driving snow", this.dummyChapterQuizze4_1);
    lvl4chapter2 : LearningUnitChapter = new LearningUnitChapter("Driving rain", this.dummyChapterQuizze4_2);
    lvl4chapter3 : LearningUnitChapter = new LearningUnitChapter("Driving wind", this.dummyChapterQuizze4_3);
    lvl4 : LearningUnit = new LearningUnit(4, [this.lvl4chapter1, this.lvl4chapter2, this.lvl4chapter3]);
    
    lvl5chapter1 : LearningUnitChapter = new LearningUnitChapter("Key of driving, real magic", this.dummyChapterQuizze5_1);
    lvl5 : LearningUnit = new LearningUnit(5, [this.lvl5chapter1]);

    overviewData : LearningUnitDisplayData[] = [
        new LearningUnitDisplayData(this.lvl1.progress, this.lvl1.max),
        new LearningUnitDisplayData(this.lvl2.progress, this.lvl2.max),
        new LearningUnitDisplayData(this.lvl3.progress, this.lvl3.max),
        new LearningUnitDisplayData(this.lvl4.progress, this.lvl4.max),
        new LearningUnitDisplayData(this.lvl5.progress, this.lvl5.max)
    ];

    currentDetailViewTitle: string;
    currentDetailViewSubtitle : string;
    currentLevel : number;
    currentUnit : LearningUnit;

    pathProgress : number = 0;
    maxPathProgress : number = 0;

    getLearningPathLevelData() : LearningUnit {
        switch (this.currentLevel) {
            case 1:
                return this.lvl1;
            case 2:
                return this.lvl2;
            case 3:
                return this.lvl3;
            case 4:
                return this.lvl4;
            case 5:
                return this.lvl5;        
            default:
                console.log("Warning: target learning unity not found in LearningPathService");
                break;
        }      
    } 

    updatePathProgress(progressPoints : number) : void {
        if(this.pathProgress < this.maxPathProgress)
            this.pathProgress += progressPoints;
        else
            console.log("Warning: Max pathProgress already reached");
    }

    updateDisplayData(level : number, progress : number) {   
        switch (level) {
            case 0:
                this.overviewData[0].progress += progress;
                this.lvl1.progress += progress;
                break;
            case 1:
                this.overviewData[1].progress += progress;
                this.lvl2.progress += progress;
                break;
            case 2:
                this.overviewData[2].progress += progress;
                this.lvl3.progress += progress;
                break;
            case 3:
                this.overviewData[3].progress += progress;
                this.lvl4.progress += progress;
                break;
            case 4:
                this.overviewData[4].progress += progress;
                this.lvl5.progress += progress;
                break;
        
            default:
                break;
        }                      
    }
  
    loadPathProgress() {
        this.maxPathProgress = 0;
        this.maxPathProgress += this.lvl1.max;
        this.maxPathProgress += this.lvl2.max;
        this.maxPathProgress += this.lvl3.max;
        this.maxPathProgress += this.lvl4.max;
        this.maxPathProgress += this.lvl5.max;

        this.pathProgress = 0;
        this.pathProgress += this.lvl1.progress;
        this.pathProgress += this.lvl2.progress;
        this.pathProgress += this.lvl3.progress;
        this.pathProgress += this.lvl4.progress;
        this.pathProgress += this.lvl5.progress;
    }

    finishLevel(level : number) : void {
        switch (level) {
            case 1:
                this.lvl1.progress = this.lvl1.max;
                break;
            case 2:
                this.lvl2.progress = this.lvl2.max;
                break;
            case 3:
                this.lvl3.progress = this.lvl3.max;
                break;
            case 4:
                this.lvl4.progress = this.lvl4.max;
                break;
            case 5:
                this.lvl5.progress = this.lvl5.max;
                break;               
            default:
                break;
        }
    }



  
    
}