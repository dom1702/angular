import { Injectable } from "@angular/core";

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
    answerOptions : any[];
    answerIndex : number;
    questionType :  QuestionDisplayType;
    points: number;

    selectedAnswerIndex : number = -1;

    hasCorrectAnswer() : boolean {
        return this.selectedAnswerIndex === this.answerIndex;
    }

    constructor(quest : string, answerIndex : number, answerOptions : any[], questionDisplayType : QuestionDisplayType) {
        this.quest = quest;
        this.answerIndex = answerIndex;
        this.questionType = questionDisplayType;
        this.answerOptions = answerOptions;
        this.points = 10;
    }

    showDisplayTypeInfo() : string {        
        return "Each display type should contain some hints for users to explain clearly what to do (maybe pictures too)..."          
    }

    toggleAnswer(value : boolean) {
        if(value == true)
            this.selectedAnswerIndex = this.answerIndex;
        else 
            this.selectedAnswerIndex = -1;
    }
}

export class LearningPathQuiz {
    title : string;
    questions : LearningPathQuestion[];
    max : number;

    constructor(title : string, questions : LearningPathQuestion[]) {
        this.title = title;
        this.questions = questions;   
        this.max = 0;
        
        for (let index = 0; index < questions.length; index++) {
            this.max += questions[index].points;           
        }
    }   

    toggleAnswers(showAnswers : boolean) {
        for (let index = 0; index < this.questions.length; index++) {
            if(showAnswers)
                this.questions[index].selectedAnswerIndex = this.questions[index].answerIndex; 
            else 
                this.questions[index].selectedAnswerIndex = -1;         
        }
    }

    
}

export class LearningUnitDisplayData { 
    level : number;
    subTitle : string;  
    progress: number;  
    max: number; 
       
    chaptersProgress : ChapterDisplayData[] = [];

    disabled: boolean;
    active: boolean;

    isFinished() : boolean {
        return this.progress === this.max;
    }

    constructor(level: number, subtitle : string, progress : number, maxProgress: number) {  
        this.level = level;
        this. subTitle = subtitle;  
        this.progress = progress;   
        this.max = maxProgress;  

        this.disabled = this.progress == this.max ? false : true;
        this.active = false;
    }  
}

export class ChapterDisplayData {
    title : string;
    isFinished : boolean = false;
    quizzeStates : QuizDisplayData[] = [];
}

export class QuizDisplayData {
    title : string;
    state : boolean;

    completeQuiz() : boolean {
        this.state = true;
        return true;
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

    getDisplayData() : ChapterDisplayData {
        let d = new ChapterDisplayData();
        d.isFinished = this.isFinished;
        d.title = this.title;
        
        let quizzeData : QuizDisplayData[] = [];
        if(this.quizze != null)
        {
            for (let index = 0; index < this.quizze.length; index++) {
                let quizData = new QuizDisplayData();
                quizData.state = false;
                quizData.title = this.quizze[index].title;
                quizzeData.push(quizData);               
            }
            d.quizzeStates = quizzeData;
        }
        return d;
    }

    getChapterMaxProgress() : number {
        let max : number = 0;
        if(this.quizze != null)
        {
            for (let index = 0; index < this.quizze.length; index++) {
                max += this.quizze[index].max;               
            }
        }
        return max;
    }
}

export class LearningUnit {
    level : number;
    title : string
    chapters : LearningUnitChapter[];
    max : number = 0;

    constructor(title: string, level : number, chapters : LearningUnitChapter[]) {
        this.title = title;
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
    }
  

    getDisplayData() : LearningUnitDisplayData {
        let d = new LearningUnitDisplayData(this.level, "Level " + this.level.toString(), 0, 0);
        d.disabled = true;
        d.active = false;
        let max : number = 0;

        if(this.chapters != null)
        {
            for (let index = 0; index < this.chapters.length; index++) {
                let chapterProgress : number = this.chapters[index].getChapterMaxProgress();
                let chapterData = this.chapters[index].getDisplayData();
                d.chaptersProgress.push(chapterData);
                max += chapterProgress;
            }           
        }
        d.max = max;
        return d;
    }
}

@Injectable({
    providedIn:"root"
})

export class SVLearningPathHelperService {     
    dummyQuest1 : LearningPathQuestion = new LearningPathQuestion("are you an optimist", 0, ["no", "sometimes, yes"], 0);
    dummyQuest2 : LearningPathQuestion = new LearningPathQuestion("do you love black metal", 1, ["yes", "HELL YES"], 0);
    dummyQuest3 : LearningPathQuestion = new LearningPathQuestion("1+(-2)=?", 0, ["0", "-1"], 0);

    dummyQuiz1 : LearningPathQuiz = new LearningPathQuiz("dummy1", [this.dummyQuest1, this.dummyQuest2]);
    dummyQuiz2 : LearningPathQuiz = new LearningPathQuiz("dummy2", [this.dummyQuest2, this.dummyQuest1, this.dummyQuest2, this.dummyQuest1]);
    dummyQuiz3 : LearningPathQuiz = new LearningPathQuiz("dummy3", [this.dummyQuest3, this.dummyQuest1, this.dummyQuest2, this.dummyQuest3]);

    dummyQuiz4 : LearningPathQuiz = new LearningPathQuiz("dummy4", [this.dummyQuest1, this.dummyQuest2]);
    dummyQuiz5 : LearningPathQuiz = new LearningPathQuiz("dummy5", [this.dummyQuest2, this.dummyQuest1, this.dummyQuest2, this.dummyQuest1]);
    dummyQuiz6 : LearningPathQuiz = new LearningPathQuiz("dummy6", [this.dummyQuest3, this.dummyQuest1, this.dummyQuest2, this.dummyQuest3]);
    dummyQuiz7 : LearningPathQuiz = new LearningPathQuiz("dummy7", [this.dummyQuest1, this.dummyQuest2]);
    dummyQuiz8 : LearningPathQuiz = new LearningPathQuiz("dummy8", [this.dummyQuest2, this.dummyQuest1, this.dummyQuest2, this.dummyQuest1]);
    dummyQuiz9 : LearningPathQuiz = new LearningPathQuiz("dummy9", [this.dummyQuest3, this.dummyQuest1, this.dummyQuest2, this.dummyQuest3]);
    dummyQuiz10 : LearningPathQuiz = new LearningPathQuiz("dummy10", [this.dummyQuest1, this.dummyQuest2]);
    dummyQuiz11 : LearningPathQuiz = new LearningPathQuiz("dummy11", [this.dummyQuest2, this.dummyQuest1, this.dummyQuest2, this.dummyQuest1]);
    dummyQuiz12 : LearningPathQuiz = new LearningPathQuiz("dummy12", [this.dummyQuest3, this.dummyQuest1, this.dummyQuest2, this.dummyQuest3]);
    dummyQuiz13 : LearningPathQuiz = new LearningPathQuiz("dummy13", [this.dummyQuest1, this.dummyQuest2]);
    dummyQuiz14 : LearningPathQuiz = new LearningPathQuiz("dummy14", [this.dummyQuest2, this.dummyQuest1, this.dummyQuest2, this.dummyQuest1]);
    dummyQuiz15 : LearningPathQuiz = new LearningPathQuiz("dummy15", [this.dummyQuest3, this.dummyQuest1, this.dummyQuest2, this.dummyQuest3]);
  
    dummyQuiz16 : LearningPathQuiz = new LearningPathQuiz("dummy16", [this.dummyQuest2, this.dummyQuest2, this.dummyQuest2, this.dummyQuest3]);
    dummyQuiz17 : LearningPathQuiz = new LearningPathQuiz("dummy17", [this.dummyQuest1, this.dummyQuest2, this.dummyQuest3, this.dummyQuest3]);
    dummyQuiz18 : LearningPathQuiz = new LearningPathQuiz("dummy18", [this.dummyQuest3, this.dummyQuest1, this.dummyQuest2, this.dummyQuest3]);
    dummyQuiz19 : LearningPathQuiz = new LearningPathQuiz("dummy19", [this.dummyQuest1, this.dummyQuest1, this.dummyQuest2, this.dummyQuest1]);
    dummyQuiz20 : LearningPathQuiz = new LearningPathQuiz("dummy20", [this.dummyQuest3, this.dummyQuest3, this.dummyQuest2, this.dummyQuest1]);

    dummyQuiz21 : LearningPathQuiz = new LearningPathQuiz("dummy21", [this.dummyQuest2, this.dummyQuest2, this.dummyQuest2, this.dummyQuest3]);
    dummyQuiz22 : LearningPathQuiz = new LearningPathQuiz("dummy22", [this.dummyQuest1, this.dummyQuest2, this.dummyQuest3, this.dummyQuest3]);
    dummyQuiz23 : LearningPathQuiz = new LearningPathQuiz("dummy23", [this.dummyQuest3, this.dummyQuest1, this.dummyQuest2, this.dummyQuest3]);
    dummyQuiz24 : LearningPathQuiz = new LearningPathQuiz("dummy24", [this.dummyQuest1, this.dummyQuest1, this.dummyQuest2, this.dummyQuest1]);
    dummyQuiz25 : LearningPathQuiz = new LearningPathQuiz("dummy25", [this.dummyQuest3, this.dummyQuest3, this.dummyQuest2, this.dummyQuest1]);
    dummyQuiz26 : LearningPathQuiz = new LearningPathQuiz("dummy26", [this.dummyQuest2, this.dummyQuest2, this.dummyQuest2, this.dummyQuest3]);
    dummyQuiz27 : LearningPathQuiz = new LearningPathQuiz("dummy27", [this.dummyQuest1, this.dummyQuest2, this.dummyQuest3, this.dummyQuest3]);
    dummyQuiz28 : LearningPathQuiz = new LearningPathQuiz("dummy28", [this.dummyQuest3, this.dummyQuest1, this.dummyQuest2, this.dummyQuest3]);
    dummyQuiz29 : LearningPathQuiz = new LearningPathQuiz("dummy29", [this.dummyQuest1, this.dummyQuest1, this.dummyQuest2, this.dummyQuest1]);
    dummyQuiz30 : LearningPathQuiz = new LearningPathQuiz("dummy30", [this.dummyQuest3, this.dummyQuest3, this.dummyQuest2, this.dummyQuest1]);
    dummyQuiz31 : LearningPathQuiz = new LearningPathQuiz("dummy31", [this.dummyQuest1, this.dummyQuest1, this.dummyQuest2, this.dummyQuest1]);
    dummyQuiz32 : LearningPathQuiz = new LearningPathQuiz("dummy32", [this.dummyQuest3, this.dummyQuest3, this.dummyQuest2, this.dummyQuest1]);

    dummyChapterQuizze1_1 : LearningPathQuiz[] = [this.dummyQuiz1, this.dummyQuiz2, this.dummyQuiz3, this.dummyQuiz4];
    dummyChapterQuizze1_2 : LearningPathQuiz[] = [this.dummyQuiz5, this.dummyQuiz6, this.dummyQuiz7, this.dummyQuiz8, this.dummyQuiz9];
    dummyChapterQuizze1_3 : LearningPathQuiz[] = [this.dummyQuiz11, this.dummyQuiz15, this.dummyQuiz12, this.dummyQuiz14, this.dummyQuiz13]

    dummyChapterQuizze2_1 : LearningPathQuiz[] = [this.dummyQuiz21, this.dummyQuiz22];
    dummyChapterQuizze2_2 : LearningPathQuiz[] = [this.dummyQuiz23, this.dummyQuiz24];
    dummyChapterQuizze2_3 : LearningPathQuiz[] = [this.dummyQuiz25, this.dummyQuiz26];
    dummyChapterQuizze2_4 : LearningPathQuiz[] = [this.dummyQuiz27, this.dummyQuiz28];
    dummyChapterQuizze2_5 : LearningPathQuiz[] = [this.dummyQuiz29, this.dummyQuiz30];
    dummyChapterQuizze2_6 : LearningPathQuiz[] = [this.dummyQuiz31, this.dummyQuiz32];

    dummyChapterQuizze3_1 : LearningPathQuiz[] = [this.dummyQuiz16];
    
    dummyChapterQuizze4_1 : LearningPathQuiz[] = [this.dummyQuiz17];
    dummyChapterQuizze4_2 : LearningPathQuiz[] = [this.dummyQuiz18];
    dummyChapterQuizze4_3 : LearningPathQuiz[] = [this.dummyQuiz19];

    dummyChapterQuizze5_1 : LearningPathQuiz[] = [this.dummyQuiz20];
  
    lvl1chapter1 : LearningUnitChapter = new LearningUnitChapter("Car and handling of it", this.dummyChapterQuizze1_1);
    lvl1chapter2 : LearningUnitChapter = new LearningUnitChapter("Behavior of a car and its equipment", this.dummyChapterQuizze1_2);
    lvl1chapter3 : LearningUnitChapter = new LearningUnitChapter("Taking care of the car", this.dummyChapterQuizze1_3);
    lvl1 : LearningUnit = new LearningUnit("Vehicle handling", 1, [this.lvl1chapter1, this.lvl1chapter2, this.lvl1chapter3]);
   
    lvl2chapter1 : LearningUnitChapter = new LearningUnitChapter("Traffic environment and regulation of traffic", this.dummyChapterQuizze2_1);
    lvl2chapter2 : LearningUnitChapter = new LearningUnitChapter("Interaction in traffic", this.dummyChapterQuizze2_2);
    lvl2chapter3 : LearningUnitChapter = new LearningUnitChapter("Basic skills of a responsible driver", this.dummyChapterQuizze2_3);
    lvl2chapter4 : LearningUnitChapter = new LearningUnitChapter("Merging the traffic and driving in traffic", this.dummyChapterQuizze2_4);
    lvl2chapter5 : LearningUnitChapter = new LearningUnitChapter("Driving in intersections - driving lines", this.dummyChapterQuizze2_5);
    lvl2chapter6 : LearningUnitChapter = new LearningUnitChapter("Driving in intersections - priority rules", this.dummyChapterQuizze2_6);
    lvl2 : LearningUnit = new LearningUnit("Traffic situations", 2, [this.lvl2chapter1, this.lvl2chapter2, this.lvl2chapter3, this.lvl2chapter4, this.lvl2chapter5, this.lvl2chapter6]);

    lvl3chapter1 : LearningUnitChapter = new LearningUnitChapter("Handling luggage space", this.dummyChapterQuizze3_1);
    lvl3 : LearningUnit = new LearningUnit("Context of a trip", 3, [this.lvl3chapter1]);

    lvl4chapter1 : LearningUnitChapter = new LearningUnitChapter("Driving snow", this.dummyChapterQuizze4_1);
    lvl4chapter2 : LearningUnitChapter = new LearningUnitChapter("Driving rain", this.dummyChapterQuizze4_2);
    lvl4chapter3 : LearningUnitChapter = new LearningUnitChapter("Driving wind", this.dummyChapterQuizze4_3);
    lvl4 : LearningUnit = new LearningUnit("Driving in difficult situations", 4, [this.lvl4chapter1, this.lvl4chapter2, this.lvl4chapter3]);
    
    lvl5chapter1 : LearningUnitChapter = new LearningUnitChapter("Key of driving, real magic", this.dummyChapterQuizze5_1);
    lvl5 : LearningUnit = new LearningUnit("Managing your own space", 5, [this.lvl5chapter1]);

    overviewData : LearningUnitDisplayData[] = [
        this.lvl1.getDisplayData(),
        this.lvl2.getDisplayData(),
        this.lvl3.getDisplayData(),
        this.lvl4.getDisplayData(),
        this.lvl5.getDisplayData()
    ];

    currentLevel : number;
    currentUnit : LearningUnit;
    currentDetailView : LearningUnitDisplayData;

    pathProgress : number = 0;
    maxPathProgress : number = 0;
  
    getTargetQuiz(selectedLevel : number, selectedChapterNr : number, selectedQuizNr : number, title : string) : LearningPathQuiz
    {
        let q : LearningPathQuiz;
        switch (selectedLevel) {
            case 1:
                q = this.lvl1.chapters[selectedChapterNr].quizze[selectedQuizNr];
                break;
            case 2:
                q = this.lvl2.chapters[selectedChapterNr].quizze[selectedQuizNr];
                break;
            case 3:
                q = this.lvl3.chapters[selectedChapterNr].quizze[selectedQuizNr];
                break;
            case 4:
                q = this.lvl4.chapters[selectedChapterNr].quizze[selectedQuizNr];
                break;
            case 5:
                q = this.lvl5.chapters[selectedChapterNr].quizze[selectedQuizNr];
                break;       
            default:
                break;
        }
        return q;
    }

    updatePathProgress(progressPoints : number) : void {
        if(this.pathProgress < this.maxPathProgress)
            this.pathProgress += progressPoints;
        else
            console.log("Warning: Max pathProgress already reached");
    }

    updateDisplayData(title: string, level : number, chapter : number, quizNr : number, progress : number) {   
        switch (level) {
            case 1:
                this.overviewData[0].progress += progress;               
                this.overviewData[0].chaptersProgress[chapter].quizzeStates[quizNr].state = true;             
                //this.lvl1.progress += progress;
                break;
            case 2:
                this.overviewData[1].progress += progress;
                this.overviewData[1].chaptersProgress[chapter].quizzeStates[quizNr].state = true;
                //this.lvl2.progress += progress;
                break;
            case 3:
                this.overviewData[2].progress += progress;
                this.overviewData[2].chaptersProgress[chapter].quizzeStates[quizNr].state = true;
                //this.lvl3.progress += progress;
                break;
            case 4:
                this.overviewData[3].progress += progress;
                this.overviewData[3].chaptersProgress[chapter].quizzeStates[quizNr].state = true;
                //this.lvl4.progress += progress;
                break;
            case 5:
                this.overviewData[4].progress += progress;
                this.overviewData[4].chaptersProgress[chapter].quizzeStates[quizNr].state = true;
                //this.lvl5.progress += progress;
                break;
        
            default:
                break;
        }
        
        this.currentDetailView.chaptersProgress[chapter].quizzeStates[quizNr].state = true;
        this.setUserChapterProgressAsync(level, progress, title);
        this.setUserQuizResultAsync(title, true);                      
    }
  
    loadLearningPath() 
    {         
        if(this.maxPathProgress <= 0)
        {  
            this.maxPathProgress = 0;
            this.maxPathProgress += this.lvl1.max;
            this.maxPathProgress += this.lvl2.max;
            this.maxPathProgress += this.lvl3.max;
            this.maxPathProgress += this.lvl4.max;
            this.maxPathProgress += this.lvl5.max;
        }
    
        if(this.overviewData == null)
        {
            this.getUserUnlockedLevelsAsync();
        }
    }

    finishLevel() : void {
        switch (this.currentLevel) {
            case 1:
                this.overviewData[0].progress = this.lvl1.max;
                break;
            case 2:
                this.overviewData[1].progress = this.lvl2.max;
                break;
            case 3:
                this.overviewData[2].progress = this.lvl3.max;
                break;
            case 4:
                this.overviewData[3].progress = this.lvl4.max;
                break;
            case 5:
                this.overviewData[4].progress = this.lvl5.max;
                break;               
            default:
                break;
        }
    }

    parseToLearningPathQuestion(quest : string, answerIndex : number, answerOptions : any[], questionDisplayType : number) : LearningPathQuestion 
    {
        let q : LearningPathQuestion = new LearningPathQuestion(quest, answerIndex, answerOptions, questionDisplayType);
        return q;
    }

    parseToLearningPathQuiz(title : string, questions : LearningPathQuestion[]) : LearningPathQuiz 
    {
        let quiz : LearningPathQuiz = new LearningPathQuiz(title, questions);
        return quiz;
    }  
    
    getLevelDisplayData(targetLevel : number) : LearningUnitDisplayData 
    {
        switch (targetLevel) {
            case 1:
                return this.lvl1.getDisplayData();
            case 2:
                return this.lvl2.getDisplayData();
            case 3:
                return this.lvl3.getDisplayData();
            case 4:
                return this.lvl4.getDisplayData();
            case 5:
                return this.lvl5.getDisplayData();                     
            default:
                break;
        }
    }

    getUserDetailViewAsync(targetLevel : number) : LearningUnitDisplayData
    {
        let input : any = { // temporary
            user : "?",
            currentLevel : targetLevel
        };

        let response : any = { // example response
            level : 2,
            chapters : [
                {                   
                    isFinished : true,
                    quizStates : [true, true]
                },
                {                  
                    isFinished : true,
                    quizStates : [true, true]
                },
                {
                    isFinished : false,
                    quizStates : [false, false]
                },
                {
                    isFinished : false,
                    quizStates : [true, false]
                },
                {
                    isFinished : false,
                    quizStates : [false, false]
                },
                {
                    isFinished : false,
                    quizStates : [false, false]
                }
            ]
        }
        
        let level = this.getLevelDisplayData(targetLevel); //this.getLevelDisplayData(response.level);
        if(response.chapters.length === level.chaptersProgress.length) { // assign quizStates from response
            for (let i = 0; i < response.chapters.length; i++) {           
                if(response.chapters[i].quizStates.length !== level.chaptersProgress[i].quizzeStates.length)
                {
                    console.log("Warning! Wrong Chapter found on creating DetailView " + level.chaptersProgress[i].title); 
                    break;
                }
                else {
                    for (let j = 0; j < level.chaptersProgress[i].quizzeStates.length; j++)                 
                        level.chaptersProgress[i].quizzeStates[j].state = response.chapters[i].quizStates[j];                                       
                }
            }                     
        }
        else
            console.log("Warning! number of chapters are wrong " + response);  
        
        this.currentDetailView = level;
        return level;
    }

    getUserUnlockedLevelsAsync() 
    {
        this.overviewData = [];
        this.pathProgress = 0;

        let input : any = { // temporary
            user : "?"
        };

        // let response;
        /*this.learningPathService.getUnlockedLevels(input).subscribe(
            (response)                      
         ); */

        let response : any = { // example response
            unlockedLevels : [
                {
                    level: 1,
                    progress: this.lvl1.max,
                    disabled: false
                },
                {
                    level: 2,
                    progress: 80,
                    disabled: false
                },
                {
                    level: 3,
                    progress: 0,
                    disabled: true
                },
                {
                    level: 4,
                    progress: 0,
                    disabled: true
                },
                {
                    level: 5,
                    progress: 0,
                    disabled: true
                }
            ]
        }

        let activeLevel : LearningUnitDisplayData;
        for (let index = 0; index < response.unlockedLevels.length; index++) 
        {                     
            this.pathProgress += response.unlockedLevels[index].progress;
            let level = response.unlockedLevels[index].level;
            let currData = this.getLevelDisplayData(level);

            currData.disabled = response.unlockedLevels[index].disabled;
            currData.progress = response.unlockedLevels[index].progress;

            if(!currData.disabled)
                activeLevel = currData;
           
            this.overviewData.push(currData); 
        }

        activeLevel.active = true;
    }

    setUserQuizResultAsync(quizTitle : string, state : boolean)  : void
    {
        let input: any = {
            title : quizTitle,
            state : state
        };
        
        //this.learningPathService.finishLearningPathQuiz(input);                  
    }

    setUserChapterProgressAsync(targetLevel : number, progress : number, quizTitle : string) : void {
        let input: any = {
            level : targetLevel,
            quizTitle : quizTitle
        };
        
        //this.learningPathService.updateUserLearningUnitProgress(input);
    }
}