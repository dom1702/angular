import { Component, ViewEncapsulation, Injector, Input, Output, EventEmitter, OnInit, AfterContentInit, DoCheck, OnDestroy } from "@angular/core";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { AppComponentBase } from "@shared/common/app-component-base";
import {Message} from 'primeng//api';


@Component({
    templateUrl: './sv-question.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()],
    selector: 'question'
})

export class SVQuestionComponent extends AppComponentBase {

    @Output()
    valueSelected : EventEmitter<any> = new EventEmitter<any>();
    
    @Input()
    quest : string;

    @Input()
    nr: number;
  
    @Input()
    pictureUrl? : string;

    @Input()
    answerOptions : string[];

    @Input()
    correctAnswer : number;

    messages: Message[] = [];
    _selected : number;
    answerAttempts: number = 0;
    solved : boolean = false;
    selectedValue: number = -1;
 
    get selected(): number {
        return this._selected;
    }
    set selected(value: number)  {
        
        if(this.correctAnswer != value)
        {           
            this.showMessage("error", this.l("OT_Wrong1"), this.l("OT_Wrong2"));
        }
        else {
            this.showMessage("success", this.l("OT_Right"));
        }
        
        this.answerAttempts++;
        this._selected = value;
        this.valueSelected.emit({
           answer: value,
           att: this.answerAttempts,
           qNr : this.nr
        });
    }
           
    constructor(injector: Injector) 
    {
        super(injector);
    }

    onClick(answer : number) : void {
        this.selected = answer;
    }

    getAnswerResult() : string {
       if(this.answerOptions != null) 
       {      
            return this.answerOptions[this.correctAnswer].toString();
       }
       return "No answer options found!";
    }

    showMessage(_severity: string, _summary: string, _details?: string) {
       this.messages = [];
       this.messages.push({severity: _severity, summary: _summary, detail: _details})
    }

    reset() {
        this.messages = [];
        this.selectedValue = -1;
        this.answerAttempts = 0;
    }

}