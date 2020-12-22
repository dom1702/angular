import { appModuleAnimation } from "@shared/animations/routerTransition";
import { AppComponentBase } from "@shared/common/app-component-base";
import { OnInit, ViewEncapsulation, Component, Injector, Input, ViewChild } from "@angular/core";
import { TabPanel} from 'primeng/tabview';

@Component({
    templateUrl: './sv-frequently-asked-questions.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class SVFrequentlyAskedQuestionsComponent extends AppComponentBase implements OnInit {
       
    @ViewChild('tabView') tabView: TabPanel;
      
    foundDescription : string = "";    
    queryQuestion : string = "";

    inputQuestion : string;
    asked : boolean = false;

    public sampleData = [
        {
            id: 0,
            title: 'Booking',
            description: 'Book a driving lesson through the menu point BookDrivingLesson. A desired date will be given to your school. You can see blocked dates for several vehicles as well.',          
            tags: ['subscribe', 'plan', 'arrange'],
        },
        {
            id: 1,
            title: 'Chat',
            description: 'Use the Chat function to contact your added friends or even teachers. You find the function on the outer top right of the app...',          
            tags: ['chat', 'conversation', 'talk'],
        },
        {
            id: 2,
            title: 'Course',
            description: 'In the Course Center you are able to exam a subset of theory lessons',          
            tags: ['exam', 'course', 'theory', 'lesson'],
        },
    ];
   
    constructor(injector: Injector) {
        super(injector);
    }

    ngOnInit(): void {
        this.asked = false;
    }

    getAnswer() : void {
        this.asked = true;
        if(this.inputQuestion != "") {
            this.queryQuestion = "Your Question: " + this.inputQuestion;

            for (let index = 0; index < this.sampleData.length; index++) {
                if(this.inputQuestion  ==  this.sampleData[index].title)
                {
                    this.foundDescription = this.sampleData[index].description; 
                    console.debug("found some answer");
                    return;
                }     
            }
    
            this.foundDescription = "No result found";  
        }      
     }



}