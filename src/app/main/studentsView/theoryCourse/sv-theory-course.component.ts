import { Component, ViewEncapsulation, ViewChild, Injector } from "@angular/core";
import { appModuleAnimation } from "@shared/animations/routerTransition";
import { AppComponentBase } from "@shared/common/app-component-base";
import { Message } from "primeng/api";

@Component({
    templateUrl: './sv-theory-course.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: [appModuleAnimation()]
})

export class SVTheoryCourseComponent extends AppComponentBase {

    messages: Message[] = [];
    
    
    constructor(
        injector: Injector       
    ) {
        super(injector);
    }
}