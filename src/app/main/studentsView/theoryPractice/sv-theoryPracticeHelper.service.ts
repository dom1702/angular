import { Injectable } from "@angular/core";
import { LicenseClass, TheoryExamQuestion} from "./sv-licenseClassTasksOverview.component";

@Injectable({
    providedIn:"root"
})

export class SVTheoryPracticeHelperService {   
    selectedLicenseClass: LicenseClass;

    quizDuration: number; 
    quizMarkable: boolean;
    quizId: number;

    maxErrorsLicenseClassQuestions: number;
    maxErrorsTrafficSituationQuestions: number;
    maxErrorsRiskIdentifyingQuestions: number;
}