import { Component, ViewEncapsulation, Input, Injector, OnInit, Output, EventEmitter, AfterViewInit, OnDestroy} from "@angular/core";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import * as moment from 'moment';
import {Message, MessageService} from 'primeng//api';
import { AppComponentBase } from "@shared/common/app-component-base";
import { OnlineTheoryOpeningHoursDto, OnlineTheoryServiceProxy, PrepareOnlineTheoryLessonDto } from "@shared/service-proxies/service-proxies";
import { outputs } from "@syncfusion/ej2-angular-inputs/src/textbox/textbox.component";

@Component({
    templateUrl: './sv-quiz-closedTab.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()],
    selector: 'closedTab',
    providers:[MessageService]
})

export class SVQuizClosedTabComponent extends AppComponentBase implements OnInit {
   
    closedMessage : Message[] = [];
    abortedMessage : Message[] = [];
    requirementMessage : Message[] = [];
    videoTestButtonName : string = "Show video";
    showVideoTest : boolean = false;
    closingTime : moment.Moment;
    openingTime : moment.Moment;

    _aborted : boolean;
    checked : boolean = false;
    testVideoUrl : string = "https://player.vimeo.com/video/692568";

    upcomingOpeningHours: OnlineTheoryOpeningHoursDto[];
    _todayOpeningHours : PrepareOnlineTheoryLessonDto;

    @Output() 
    quizMayStart = new EventEmitter();

    @Output()
    studentPhoneNumber: number = 0;

    @Input() 
    quizParts : number;

    @Input()
    openingDays : moment.Moment[];

    @Input()
    get aborted() : boolean {
        return this._aborted;
    };
    set aborted(value : boolean) {
        if(value != this._aborted)
        {
            this._aborted = value;             
            this.quizMayStart.emit([this._aborted, this.studentPhoneNumber.toString(), this.closingTime, this.openingTime]);
        }
    }

    get todayOpeningHours() : PrepareOnlineTheoryLessonDto {
        return this._todayOpeningHours;
    }
    set todayOpeningHours(value : PrepareOnlineTheoryLessonDto) {
        if(value != null)
        {
            let temp = [value.day2OpeningHours, 
                value.day3OpeningHours, 
                value.day4OpeningHours, 
                value.day5OpeningHours, 
                value.day6OpeningHours, 
                value.day7OpeningHours];
            this.upcomingOpeningHours = temp;
            this.studentPhoneNumber = Number.parseInt(value.studentPhoneDefault);
            this._todayOpeningHours = value;

            for (let index = 0; index < this.upcomingOpeningHours.length; index++) {
                this.upcomingOpeningHours[index].closing = this.upcomingOpeningHours[index].closing.slice(0,5);
                this.upcomingOpeningHours[index].opening = this.upcomingOpeningHours[index].opening.slice(0,5);
            }

            this.closingTime = moment().locale(moment.defaultFormat);
            let closingHour = Number.parseInt(this.todayOpeningHours.currentDayOpeningHours.closing.substring(0,2));
            let closingMinute = Number.parseInt(this.todayOpeningHours.currentDayOpeningHours.closing.substring(3,5));
            this.closingTime.set('hour', closingHour);     
            this.closingTime.set('minute' , closingMinute);
            this.closingTime.set('second' , 0);

            this.openingTime = moment().locale(moment.defaultFormat);
            let openingHour = Number.parseInt(this.todayOpeningHours.currentDayOpeningHours.opening.substring(0,2));
            let openingMinute = Number.parseInt(this.todayOpeningHours.currentDayOpeningHours.opening.substring(3,5));
            this.openingTime.set('hour', openingHour);     
            this.openingTime.set('minute' , openingMinute);
            this.openingTime.set('second' , 0);
            //console.debug("parsed closing time: " + this.closingTime.format());
                
            this.showOpeningHourMessages();
        }
    }

    get studentPhoneNumberParsed() : string {
        return this.studentPhoneNumber.toString();
    }   
        
    constructor(private injector: Injector, private messageService : MessageService, private _onlineTheoryService : OnlineTheoryServiceProxy) {       
        super(injector);             
    }

    toggleVideoTestBlock() : void {
        this.showVideoTest = !this.showVideoTest;
        if(this.showVideoTest == false)        
            this.videoTestButtonName = "Show video";      
        else
            this.videoTestButtonName = "Hide video";
    }

    ngOnInit(): void {
        this.prepareLessonStart();         
    }

    show(intention: string, message : string, msg : Message[], detail? : string) {
        msg.push({severity: intention, summary: message, detail: detail != null ? detail : ""});
    }

    showOpeningHourMessages() {
        if(this.todayOpeningHours.closed)
            {
                this.show("error", "The lesson room is closed.", this.closedMessage);
            }
            else this.show("info", "The Drima control room is open today from " +  this.todayOpeningHours.currentDayOpeningHours.opening.slice(0,5) + 
                " to " +  this.todayOpeningHours.currentDayOpeningHours.closing.slice(0,5) + ".", this.closedMessage);      
    
            this.show("info", "eLesson requirements", this.requirementMessage, "The control room has to be able to contact you when needed. Check the number below and change it if needed. Check that the WhatsApp application is installed and running in the number below. The device, you are using for this eLesson, supports the media in it and the video format");   
    }

    showToastError(sum: string, det? : string) {
        this.messageService.clear("toast");
        this.messageService.add({key: "toast", severity:'error', summary: sum, detail: det != null ? det : ""});
    }

    clearValidationError() {
        this.messageService.clear('toast')
    }

    startLesson() {                  
        if(!this.todayOpeningHours.mayStart)
        {     
            this.showToastError("lesson room closes soon!", "try again tomorrow.")      
        }
        else{
            this.aborted = false;
        }
    }

    prepareLessonStart()
    {
        this._onlineTheoryService.prepareLessonStart().subscribe((result) => {            
            this.todayOpeningHours = result;                 
            //console.log(this.todayOpeningHours);
        });
    }

    getNextDayName(dayCount : number) : string{
        dayCount+=1;
        if(dayCount < 0 || dayCount > 7)
            moment().format('dddd');
        else
        {
           return moment().add('day', dayCount).format('dddd')
        }
    }
}