
export interface IScheduler {
    vehiclesResources : any[];
    instructorsResources: any[];
    simulatorsResources: any[];
    openDrivingLessonModal();
    openTheoryLessonModal();
    openEventModal();
    openSimulatorLessonModal();
    openExamModal();
}