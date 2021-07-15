import { Component, Injector, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { LearningPathQuestion, LearningUnitDisplayData, SVLearningPathHelperService } from './sv-learningPathHelper.service';
import { SVLearningPathQuizModalComponent } from './sv-learningPathQuizModal.component';
import { MessageService } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
    templateUrl: './sv-learningPathDetailView.component.html',    
    animations: [appModuleAnimation()],
    encapsulation: ViewEncapsulation.None,
    providers: [MessageService]
})

export class SVLearningPathDetailViewComponent extends AppComponentBase implements OnInit{

    @ViewChild('learningPathQuizModal', { static: true }) learningPathQuizModal: SVLearningPathQuizModalComponent;
    
    title : string;
    subtitle : string;
    currentLevelData : LearningUnitDisplayData;

    constructor(injector: Injector, 
        private messageService: MessageService, 
        private router: Router,
        public learningPathHelper : SVLearningPathHelperService) {
        super(injector);
    }

    ngOnInit(): void 
    {
        this.currentLevelData = this.learningPathHelper.currentDetailView; 
        
        if(this.currentLevelData)          
            this.setDetailViewTitle();      
        else
            this.router.navigateByUrl("/app/main/studentsView/learningPath");
    }

    onQuizFinished(event? : any) : void 
    {
        //console.log("on quiz finished raised " + event);
        this.levelFinished();     
    }

    onConfirm() : void 
    {
        this.learningPathHelper.currentLevel++;
        this.currentLevelData = this.learningPathHelper.getUserDetailViewAsync(this.learningPathHelper.currentLevel);
        this.setDetailViewTitle();
        this.messageService.clear('levelFinishedToast');
    }

    onReject() : void {
        this.messageService.clear('levelFinishedToast');
        this.router.navigateByUrl("/app/main/studentsView/learningPath");
    }

    showQuiz(selectedLevel : number, selectedChapterNr : number, selectedQuizNr : number, title : string) : void 
    {
        //console.log("target level: " + selectedLevel + "|  targetCHapter: " + selectedChapterNr + "|  targetQuiz: " + selectedQuizNr);  
        this.learningPathQuizModal.quizNumber = selectedQuizNr;
        this.learningPathQuizModal.chapterTitle = title;
        this.learningPathQuizModal.chapterNumber = selectedChapterNr;
        this.learningPathQuizModal.level = selectedLevel;

        let toParse = this.learningPathHelper.getTargetQuiz(selectedLevel, selectedChapterNr, selectedQuizNr, title);
        let questions : LearningPathQuestion[] = [];
        for (let index = 0; index < toParse.questions.length; index++) {
            let currQ = toParse.questions[index];
            let q = this.learningPathHelper.parseToLearningPathQuestion(currQ.quest, currQ.answerIndex, currQ.answerOptions, currQ.questionType);
            questions.push(q);
        }
        let quiz = this.learningPathHelper.parseToLearningPathQuiz(toParse.title, questions);
      
        this.learningPathQuizModal.currentQuiz = quiz;

        this.learningPathQuizModal.setQuizDisplayData(this.currentLevelData.chaptersProgress[selectedChapterNr].quizzeStates[selectedQuizNr].state);

        this.learningPathQuizModal.show();
    }

    targetChapterFinished(targetChapter : number) : boolean 
    {      
        let nrOfQuizzeFinished = 0;
        if(this.currentLevelData != null)
        {
            for (let index = 0; index < this.currentLevelData.chaptersProgress[targetChapter].quizzeStates.length; index++) {
                if(this.currentLevelData.chaptersProgress[targetChapter].quizzeStates[index].state)
                    nrOfQuizzeFinished++;               
            }

            if(nrOfQuizzeFinished === this.currentLevelData.chaptersProgress[targetChapter].quizzeStates.length)
                return true;
            else 
                return false;
        }
        return false;
    }
 
    setDetailViewTitle() : void 
    {
        this.title = "Level " + this.currentLevelData.level
        this.subtitle = this.currentLevelData.subTitle;
    }

    levelFinished() : void 
    {
        let numberOfCompletedChapters = 0;
        for (let index = 0; index < this.currentLevelData.chaptersProgress.length; index++) {
            if(this.targetChapterFinished(index))          
                numberOfCompletedChapters++;                       
        }

        if(numberOfCompletedChapters === this.currentLevelData.chaptersProgress.length)
        {            
            this.currentLevelData.progress = this.currentLevelData.max;
            this.learningPathHelper.finishLevel();
            this.addSingleToast(this.learningPathHelper.currentLevel);
        }
    }

    addSingleToast(currentLevel : number) : void 
    {
        let details : string = "You finished level " + currentLevel.toString() + ". Continue with next level";
        this.messageService.add({key:'levelFinishedToast', sticky:true, severity:'success', summary: "Congratulations!", detail: details});
    }
}