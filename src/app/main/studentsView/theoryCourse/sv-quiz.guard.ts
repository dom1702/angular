import { CanDeactivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from "@angular/router";
import { Injectable, Injector } from "@angular/core";
import { Observable } from "rxjs";
import { AppComponentBase } from "@shared/common/app-component-base";
import { basename } from "path";
import { SVQuizComponent } from "./sv-quiz.component";
import { SVTheoryPracticeQuizComponent } from "../theoryPractice/sv-theoryPracticeQuiz.component";

export interface ICanComponentDeactivate {
    canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
  }
  
@Injectable({
    providedIn: 'root'
})

export class SVQuizGuard implements CanDeactivate<SVQuizComponent> {
    
  constructor() {
      
  }

  canDeactivate(component: SVQuizComponent, 
        route: ActivatedRouteSnapshot, 
        state: RouterStateSnapshot,
        nextState: RouterStateSnapshot) {      
        //console.debug("comp: " + component);
   
    return component.canDeactivate();
}

}