export interface GanttData {
  id: number;
  tasks: Task[];
  dependencies: Dependency[];
  resources: Resource[];
  resourceAssignments: ResourceAssignment[];
}

export interface ERPbasicData {
  id: number;
  taskStatusList: TaskStatusList[];
  taskOperationList: TaskOperationList[];
}
export interface Task {
  projectCode: string;

  title: string;

  taskKey: string;

  color?: string;
  parentTaskKey: string | null;

  start: Date;

  end: Date;

  progress: number;

  taskPlannedStartDate: Date;

  taskPlannedEndDate: Date;

  actualDuration: number;

  plannedDuration: number;

  taskCompany: string;

  taskIsRevision: boolean;

  taskCustomer: string;

  taskStatus: string;

  taskNotes: string;

  routeLevelNumber: number;

  resourceKey: string;

  resourceText: string;
}

export interface Dependency {
  dependencyKey: string;

  predecessorId: number;

  successorId: number;

  type: number;
}

export interface Resource {
  resourceKey: string;

  text: string;

  resourceType: string;
}

export interface ResourceAssignment {
  raKey: string;

  taskKey: string;

  resourceKey: string;
}

export interface TaskStatusList {
  id: number;
  statusName: string;
  statusdisplayColor: string;
  statusGroup: string;
}
export interface TaskOperationList {
  id: number;
  key: string;
  name: string;
  displayColor: string;
  variousInfoRelations: object;
  routeLevelNumber: number;
  routeLevelName: string;
  preRouteKey: string;
}
export interface CustomTaskDetailsForm {
  projectCode: any;
  title: string;
  taskKey: any;
  parentTaskKey: any;
  start: any;
  end: any;
  actualDuration: any;
  progress: any;
  taskPlannedStartDate: any;
  taskPlannedEndDate: any;
  plannedDuration: any;
  taskCompany: any;
  taskIsRevision: any;
  taskCustomer: any;
  taskNotes: any;
  taskStatus: any;
  routeLevelNumber: any;
  resourceKey: any;
  resourceText: any;
}

export interface ReferenceProjectSelectionForm {
  referenceProjectCode: string | null;
}
