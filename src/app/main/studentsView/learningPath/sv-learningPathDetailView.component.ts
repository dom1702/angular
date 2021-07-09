import { AfterViewInit, Component, Injector, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';
import { LearningUnit, SVLearningPathHelperService } from './sv-learningPathHelper.service';
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

    currentLevelData : LearningUnit;

    constructor(injector: Injector, 
        private messageService: MessageService, 
        private router: Router,
        public learningPathHelper : SVLearningPathHelperService) {
        super(injector);
    }

    ngOnInit(): void 
    {
        this.currentLevelData = this.learningPathHelper.getLearningPathLevelData();  
        if(this.currentLevelData)  
        {
            this.title = "Level " + this.currentLevelData.level.toString(); 
            this.subtitle = this.currentLevelData.title;
        }
        else
            this.router.navigateByUrl("/app/main/studentsView/learningPath");
    }

    onQuizFinished(event? : any) : void {
        //console.log("on quiz finished raised " + event);
        this.levelFinished();     
    }

    onConfirm() : void {
        this.learningPathHelper.currentLevel++;
        this.currentLevelData = this.learningPathHelper.getLearningPathLevelData(); 
        this.messageService.clear('levelFinishedToast');
    }

    onReject() : void {
        this.messageService.clear('levelFinishedToast');
        this.router.navigateByUrl("/app/main/studentsView/learningPath");
    }

    showQuiz(selectedLevel : number, selectedChapterNr : number, selectedQuizNr : number, title : string) : void 
    {
        //console.log("target level: " + selectedLevel + "|  targetCHapter: " + selectedChapterNr + "|  targetQuiz: " + selectedQuizNr);  
        this.learningPathQuizModal.quizNumber = selectedQuizNr+1;
        this.learningPathQuizModal.chapterTitle = title;
        this.learningPathQuizModal.level = selectedLevel

        this.learningPathQuizModal.currentQuiz =  this.currentLevelData.chapters[selectedChapterNr].getTargetQuiz(selectedQuizNr);   
        this.learningPathQuizModal.show();
    }

    targetChapterFinished(targetChapter : number) : boolean 
    {
        let nrOfQuizzeFinished = 0;
        if(this.currentLevelData != null)
        {
            for (let index = 0; index < this.currentLevelData.chapters[targetChapter].quizze.length; index++) {
                if(this.currentLevelData.chapters[targetChapter].quizze[index].isFinished())
                    nrOfQuizzeFinished++;               
            }

            if(nrOfQuizzeFinished === this.currentLevelData.chapters[targetChapter].quizze.length)
                return true;
            else 
                return false;
        }
        return false;
    }

    levelFinished() : void 
    {
        let numberOfCompletedChapters = 0;
        for (let index = 0; index < this.currentLevelData.chapters.length; index++) {
            if(this.targetChapterFinished(index))          
                numberOfCompletedChapters++;                       
        }

        if(numberOfCompletedChapters === this.currentLevelData.chapters.length)
        {            
            this.currentLevelData.progress = this.currentLevelData.max;
            this.learningPathHelper.finishLevel(this.currentLevelData.level);
            this.addSingleToast(this.currentLevelData.level);
        }
    }

    addSingleToast(currentLevel : number) : void 
    {
        let details : string = "You finished level " + currentLevel.toString() + ". Continue with next level";
        this.messageService.add({key:'levelFinishedToast', sticky:true, severity:'success', summary: "Congratulations!", detail: details});
    }

}