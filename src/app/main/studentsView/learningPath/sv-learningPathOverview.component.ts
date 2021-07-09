import {  Component, Injector, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { AppComponentBase } from '@shared/common/app-component-base';
import { appModuleAnimation } from '@shared/animations/routerTransition';

import { TabDirective, TabsetComponent } from 'ngx-bootstrap/tabs';
import { TabView } from 'primeng/tabview';
import { LearningUnitDisplayData, SVLearningPathHelperService } from './sv-learningPathHelper.service';
import { ChartModule, UIChart } from 'primeng/chart';


@Component({
    templateUrl: './sv-learningPathOverview.component.html',    
    animations: [appModuleAnimation()],
    encapsulation: ViewEncapsulation.None
})

export class SVLearningPathOverviewComponent extends AppComponentBase implements OnInit {
    
    @ViewChild('levelTabs')
    levelTabs : TabsetComponent;

    @ViewChild('lvl1chart') lvl1chart : UIChart;
    @ViewChild('lvl1chart') lvl2chart : UIChart;
    @ViewChild('lvl1chart') lvl3chart : UIChart;
    @ViewChild('lvl1chart') lvl4chart : UIChart;
    @ViewChild('lvl1chart') lvl5chart : UIChart;
      
    loading : boolean;
    displaySelfStudyGuide : boolean = false;
    completed : boolean = false;
    
    currentTabNumber : number;
    currentLearningUnits : LearningUnitDisplayData[];

    currentProgress : number;
    currentProgressMax : number;

    pieChartData : any;

    lvl1Data : any = []; lvl2Data: any = []; lvl3Data: any; lvl4Data: any; lvl5Data: any;

    options = {             
        legend: {
            display: false
        },
        responsive: false,
        maintainAspectRatio: false 
    };

    progressInPercent() : string {
        return (this.learningPathHelper.pathProgress / (this.learningPathHelper.maxPathProgress / 100)).toFixed(0) + "%";
    }

    constructor(injector: Injector, public learningPathHelper: SVLearningPathHelperService) {
        super(injector);
    }

    ngOnInit(): void {  
                 
        this.learningPathHelper.loadPathProgress();

        this.currentProgress = this.learningPathHelper.pathProgress;
        this.currentProgressMax = this.learningPathHelper.maxPathProgress;
        
        let currUnit = 0; 
        if(this.learningPathHelper.overviewData != null)
        {
            this.currentLearningUnits = this.learningPathHelper.overviewData;

            for (let index = 0; index < this.currentLearningUnits.length; index++) 
            {                           
                if(this.currentLearningUnits[index].isFinished())
                {    
                    currUnit++;           
                    this.nextPage(currUnit);              
                }
                else {
                    currUnit = index;
                    break;                 
                }                    
            }  
            
            this.currentLearningUnits[currUnit].disabled = false;
            this.currentLearningUnits[currUnit].active = true;
            let outstanding = this.currentLearningUnits[currUnit].max - this.currentLearningUnits[currUnit].progress;
            this.changePieChartValues(currUnit, this.currentLearningUnits[currUnit].progress, outstanding);
            this.currentTabNumber = currUnit+1
        }               
    }
      
    onSelect(data: TabDirective) : void {
        var tabNumber = parseInt(data.id);
        if(tabNumber != NaN)
        {
            //console.log("on select raised " + tabNumber);
            if(tabNumber != this.currentTabNumber)
            {                
                let progress = this.currentLearningUnits[tabNumber-1].progress;
                let outstanding = this.currentLearningUnits[tabNumber-1].max - this.currentLearningUnits[tabNumber-1].progress;
                this.changePieChartValues(tabNumber-1, progress, outstanding); 
            }
                                      
            for (let index = 0; index < this.currentLearningUnits.length; index++) {
                if(index != tabNumber-1)
                    this.currentLearningUnits[index].active = false;             
            }
        }         
    }

    showSelfStudyGuide() : void {        
        this.displaySelfStudyGuide = true;
    }

    loadLevelData(targetLevel : number) {      
        switch (targetLevel) {
            case 1:                
                this.learningPathHelper.currentLevel = 1;
            break;
            case 2:              
                this.learningPathHelper.currentLevel = 2;
            break;
            case 3:              
                this.learningPathHelper.currentLevel = 3;
            break;
            case 4:                
                this.learningPathHelper.currentLevel = 4;
            break;
            case 5:                
                this.learningPathHelper.currentLevel = 5;
            break;
        
            default:
                break;          
        }

        this.learningPathHelper.getLearningPathLevelData();
    }

    changePieChartValues(index : number, progress: number, outstanding : number) : void {
        let blue : string = "#36A2EB"; 
        let gray : string = "#ebedf3";
        let green : string= "#1bc5bd";

        let outstandingColor : string = outstanding === 0 ? green : blue

        this.pieChartData = {
            labels: ['Done', 'Outstanding'],
            datasets: [
                {   
                    data: [progress, outstanding],           
                    backgroundColor: [                    
                        outstandingColor,
                        gray
                    ],
                    hoverBackgroundColor: [                 
                        outstandingColor,
                        gray
                    ]
                }]    
        };

        switch (index) {
            case 0:
                this.lvl1Data = this.pieChartData;
                
                break;
            case 1:
                this.lvl2Data = this.pieChartData;              
                break;
            case 2:
                this.lvl3Data = this.pieChartData;
                break;
            case 3:
                this.lvl4Data = this.pieChartData;
                break;
            case 4:
                this.lvl5Data = this.pieChartData;
                break;
        
            default:
                break;
        }    
        this.refreshPieChart(index+1);          
    }

    refreshPieChart(targetLevel : number) : void {
        switch (targetLevel) {
            case 1:
                setTimeout(() => {
                this.lvl1chart.reinit();
                }, 100);
                break;
            case 2:
                setTimeout(() => {
                    this.lvl2chart.reinit();
                    }, 100);
                break;
            case 3:
                setTimeout(() => {
                    this.lvl3chart.reinit();
                    }, 100);
                break;
            case 4:
                setTimeout(() => {
                    this.lvl4chart.reinit();
                    }, 100);
                break;
            case 5:
                setTimeout(() => {
                    this.lvl5chart.reinit();
                    }, 100);
                break;
            default:
                break;
        }
    }
   
    nextPage(currentLevel : number) : void {            
        this.currentTabNumber = currentLevel;        

        if(this.currentTabNumber < this.currentLearningUnits.length)
        { 
            //console.log("next page raised and changed tabs.." + currentLevel);
            //this.currentLearningUnits[index].progress = this.currentLearningUnits[index].max;
            this.changePieChartValues(this.currentTabNumber-1, this.currentLearningUnits[this.currentTabNumber-1].progress, 0);
          
            this.currentLearningUnits[this.currentTabNumber].disabled = false;           
            this.currentLearningUnits[this.currentTabNumber-1].active = false;
          
            this.currentLearningUnits[this.currentTabNumber].active = false;
        
            this.changePieChartValues(this.currentTabNumber, 0, this.currentLearningUnits[this.currentTabNumber].max);
                        
            this.currentTabNumber++;
        }
        else
        {
            console.log("learing path completed!");
            this.completed = true;            
        }     
    }
}


