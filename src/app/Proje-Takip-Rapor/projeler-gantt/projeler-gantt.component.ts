import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import {
  DxFormComponent,
  DxGanttComponent,
  DxSchedulerComponent,
  DxTagBoxComponent,
  DxToolbarComponent,
  DxTreeListComponent,
} from 'devextreme-angular';
import {
  Task,
  Dependency,
  Resource,
  ResourceAssignment,
  TaskStatusList,
  TaskOperationList,
  CustomTaskDetailsForm,
  ReferenceProjectSelectionForm,
} from './model/gantt-data';
import TagBox from 'devextreme/ui/tag_box';
import { GanttDataService } from './services/gantt-data.service';

import { exportGantt as exportGanttToPdf } from 'devextreme/pdf_exporter';
import 'jspdf-autotable';
import jsPDF from 'jspdf';
import { Observable } from 'rxjs';
import dxTreeList from 'devextreme/ui/tree_list';
import * as moment from 'moment';
import DataSource from 'devextreme/data/data_source';
import ArrayStore from 'devextreme/data/array_store';
import dxContextMenu from 'devextreme/ui/context_menu';
import dxButton from 'devextreme/ui/button';
import dxTagBox from 'devextreme/ui/tag_box';

import { v4 as uuidv4 } from 'uuid';
import Form from 'devextreme/ui/form';
import { Column } from 'jspdf-autotable';
@Component({
  selector: 'app-projeler-gantt',
  templateUrl: './projeler-gantt.component.html',
  styleUrls: ['./projeler-gantt.component.css'],
})
export class ProjelerGanttComponent implements OnInit {
  // Default Gantt DataSources
  tasks!: Task[];
  dependencies!: Dependency[];
  resources!: Resource[];
  resourceAssignments!: ResourceAssignment[];
  taskStatusList!: TaskStatusList[];
  taskOperationList!: TaskOperationList[];
  dataSourceFromtaskOperationList!: DataSource;
  dataSourceFromtaskStatusList!: DataSource;
  dataSourceFromresources!: DataSource;
  companies = ['Roboplas', 'Roboter', 'Roboplas NA'];
  customers = [
    'Henüz Belirlenmedi',
    '"Erp"de Yok',
    'TURAN',
    'Customer-1',
    'Customer-2',
    'Customer-3',
    'Customer-4',
    'Customer-5',
    'Customer-6',
    'Customer-7',
    'Customer-8',
    'Customer-9',
    'Customer-10',
  ];
  ganttSelectedTaskRowKey!: string;

  // column settings
  // B.D: At present, the DevExtreme Gantt does not support the ability to save new column width values modified by a user. Bu sebeple sütun genişiklikleri için localstorage kullanarak kişiselleştirme yapamıyoruz https://supportcenter.devexpress.com/ticket/details/t1069973/dxgantt-column-width
  columnList = [
    {
      id: 18,
      dataField: 'projectCode',
      caption: 'Proje Kodu',
      isVisible: true,
      format: null,
      dataType: 'string',
      width: 100,
      isFixed: true,
      isDefaultVisible: true,
    },
    {
      id: 2,
      dataField: 'title',
      caption: 'Proje/Görev/Operasyon',
      isVisible: true,
      format: null,
      dataType: 'string',
      width: 150,
      isFixed: true,
      isDefaultVisible: true,
    },
    {
      id: 0,
      dataField: 'taskKey',
      caption: 'Task Key',
      isVisible: false,
      format: null,
      dataType: 'string',
      width: null,
      isFixed: false,
      isDefaultVisible: true,
    },
    {
      id: 1,
      dataField: 'parentTaskKey',
      caption: 'Parent Task Key',
      isVisible: false,
      format: 'shortDate',
      dataType: 'string',
      width: null,
      isFixed: false,
      isDefaultVisible: true,
    },
    {
      id: 3,
      dataField: 'taskPlannedStartDate',
      caption: 'Planlanmış Başlangıç',
      isVisible: true,
      format: 'shortDate',
      dataType: 'date',
      width: null,
      isFixed: false,
      isDefaultVisible: true,
    },
    {
      id: 4,
      dataField: 'taskPlannedEndDate',
      caption: 'Planlanmış Bitiş',
      isVisible: true,
      format: 'shortDate',
      dataType: 'date',
      width: null,
      isFixed: false,
      isDefaultVisible: true,
    },

    {
      id: 5,
      dataField: 'plannedDuration',
      caption: 'Planlanan Süre',
      isVisible: true,
      format: null,
      dataType: 'number',
      width: null,
      isFixed: false,
      isDefaultVisible: true,
    },
    {
      id: 6,
      dataField: 'start',
      caption: 'Güncel Başlangıç',
      isVisible: true,
      format: 'shortDate',
      dataType: 'date',
      width: null,
      isFixed: false,
      isDefaultVisible: true,
    },
    {
      id: 7,
      dataField: 'end',
      caption: 'Güncel Bitiş',
      isVisible: true,
      format: 'shortDate',
      dataType: 'date',
      width: null,
      isFixed: false,
      isDefaultVisible: true,
    },
    {
      id: 8,
      dataField: 'actualDuration',
      caption: 'Güncel Süre',
      isVisible: true,
      format: null,
      dataType: 'number',
      width: null,
      isFixed: false,
      isDefaultVisible: true,
    },
    {
      id: 9,
      dataField: 'progress',
      caption: 'Tamamlanma %',
      isVisible: false,
      format: null,
      dataType: 'number',
      width: null,
      isFixed: false,
      isDefaultVisible: true,
    },
    {
      id: 10,
      dataField: 'taskCompany',
      caption: 'Firma',
      isVisible: false,
      format: null,
      dataType: 'string',
      width: null,
      isFixed: false,
      isDefaultVisible: true,
    },
    {
      id: 11,
      dataField: 'taskCustomer',
      caption: 'Müşteri',
      isVisible: false,
      format: null,
      dataType: 'string',
      width: null,
      isFixed: false,
      isDefaultVisible: true,
    },
    {
      id: 12,
      dataField: 'taskStatus',
      caption: 'Durum',
      isVisible: false,
      format: null,
      dataType: 'string',
      width: null,
      isFixed: false,
      isDefaultVisible: true,
    },
    {
      id: 13,
      dataField: 'taskNotes',
      caption: 'Notlar',
      isVisible: false,
      format: null,
      dataType: 'string',
      width: null,
      isFixed: false,
      isDefaultVisible: true,
    },
    {
      id: 14,
      dataField: 'taskIsRevision',
      caption: 'Revizyon?',
      isVisible: false,
      format: null,
      dataType: 'boolean',
      width: null,
      isFixed: false,
      isDefaultVisible: true,
    },
    {
      id: 15,
      dataField: 'resourceKey',
      caption: 'Kaynak Key',
      isVisible: false,
      format: null,
      dataType: 'number',
      width: null,
      isFixed: false,
      isDefaultVisible: true,
    },
    {
      id: 16,
      dataField: 'resourceText',
      caption: 'Kaynak Ismi',
      isVisible: false,
      format: null,
      dataType: 'string',
      width: null,
      isFixed: false,
      isDefaultVisible: true,
    },
    {
      id: 17,
      dataField: 'routeLevelNumber',
      caption: 'Rota Seviyesi',
      isVisible: false,
      format: null,
      dataType: 'number',
      width: null,
      isFixed: false,
      isDefaultVisible: true,
    },
  ];
  tagBoxcolumnListDataSource!: DataSource;
  tagBoxTagListValue: any[] = [];

  // gantt properties
  scaleType!: string;

  //custom gantt settings
  titlePosition!: string;
  showResources!: any;
  showDependencies!: any;
  taskContentChoice!: string;
  areTasksColorful!: boolean;
  isGanttEditable!: boolean;
  isPresentationMode!: boolean;
  startDateRange!: any;
  endDateRange!: any;
  treeListWidth!: any;

  // custom toolbar settings
  resetTreeListColumnViewsButtonOptions!: object;
  refreshGanttButtonOptions!: object;
  saveDataButtonOptions!: object;
  exportButtonOptions!: object;

  // export options/filters definitions
  formats: string[] = ['A0', 'A1', 'A2', 'A3', 'A4', 'Auto'];
  exportModes: string[] = ['All', 'Chart', 'Tree List'];
  dateRanges: string[] = ['All', 'Visible', 'Custom'];
  formatBoxValue!: string;
  exportModeBoxValue!: string;
  dateRangeBoxValue!: string;
  landscapeCheckBoxValue!: any;
  startTaskIndex!: number;
  endTaskIndex!: number;
  customStartDate!: any;
  customEndDate!: any;
  customRangeDisabled!: boolean;

  // sorting
  sortingMode!: 'single' | 'multiple' | 'none';
  showSortIndexes!: boolean;

  // Task Details Form/Popup
  customTaskDetailsForm!: CustomTaskDetailsForm;
  oldCustomTaskDetailsForm!: CustomTaskDetailsForm;
  ganntFormSubmitButtonOptions = {
    text: 'Görev Detaylarını Kaydet',
    useSubmitBehavior: true,
    type: 'default',
  };
  isTaskDetailsFormPopupVisible = false;

  // Reference Project, Form/Popup
  referenceProjectSelectionFormData!: ReferenceProjectSelectionForm;
  referenceProjectSubmitButtonOptions = {
    text: 'Onayla',
    useSubmitBehavior: true,
    type: 'default',
  };
  isReferencedProjectPopupVisible = false;

  // Tree List Columns
  fixedColumnsList: any[] = [];

  // Obs
  ganttData$!: Observable<any>;
  ERPbasicData$!: Observable<any>;
  dataLoading$!: Observable<any>;
  pageDisplayDelayed$!: Observable<any>;
  constructor(
    private ganttDataService: GanttDataService,
    private ref: ChangeDetectorRef
  ) {}

  // instances
  @ViewChild(DxGanttComponent)
  gantt!: DxGanttComponent;
  @ViewChild('customTaskDetailsDOM') customTaskDetailsDOM!: DxFormComponent;
  @ViewChild('referenceProjectSelectionFormDOM')
  referenceProjectSelectionFormDOM!: DxFormComponent;
  @ViewChild(DxTreeListComponent)
  treeList!: DxTreeListComponent;
  @ViewChild(DxSchedulerComponent)
  scheduler!: DxSchedulerComponent;
  @ViewChild(DxTagBoxComponent)
  treeListColumnTagBox!: DxTagBoxComponent;
  @ViewChild('ganttToolBarDOM') ganttToolBarDOM!: DxToolbarComponent;

  // DevExtreme LifeCycle
  onGanttContentReady_RenderCounts: number = 0;

  ngOnInit(): void {
    // TreeList Fixed Columns
    this.fixedColumnsList = this.columnList.filter(
      (column) => column.isFixed === true
    );

    // obs & data
    this.ganttDataService.getData();
    this.ganttData$ = this.ganttDataService.ganttData$;
    this.ERPbasicData$ = this.ganttDataService.ERPbasicData$;
    this.dataLoading$ = this.ganttDataService.dataLoading$;
    this.pageDisplayDelayed$ = this.ganttDataService.pageDisplayDelayed$;

    // dataSources
    this.ERPbasicData$.subscribe((data) => {
      if (data) {
        this.taskStatusList = data[0]?.taskStatusList;
        this.taskOperationList = data[0]?.taskOperationList;
        this.dataSourceFromtaskOperationList = new DataSource({
          store: new ArrayStore({
            data: data[0].taskOperationList,
            key: 'id',
          }),
          group: 'routeLevelName',
        });
        this.dataSourceFromtaskStatusList = new DataSource({
          store: new ArrayStore({
            data: data[0].taskStatusList,
            key: 'id',
          }),
          group: 'statusGroup',
        });
      }
    });
    this.ganttData$.subscribe((data) => {
      if (data) {
        this.tasks = data[0]?.tasks;
        this.dependencies = data[0]?.dependencies;
        this.resources = data[0]?.resources;
        this.resourceAssignments = data[0]?.resourceAssignments;

        this.dataSourceFromresources = new DataSource({
          store: new ArrayStore({
            data: data[0].resources,
            key: 'resourceKey',
          }),
          // B.D resrouceType ??????
          group: 'resourceType',
        });

        // Export Options
        // this.startDate = data.tasks[0]?.start;
        // this.endDate = data.tasks[0]?.end;
      }
    });
    // Column TagBox Dropdown List
    this.tagBoxcolumnListDataSource = new DataSource({
      store: new ArrayStore({
        data: this.columnList.filter(
          (column) =>
            // B.D: Sabit Sütunların Değiştirilmesine İzin Vermiyoruz
            column.isFixed === false
        ),
        key: 'id',
      }),
    });

    // gantt properties
    this.scaleType = 'months';

    //custom gantt settings
    this.titlePosition = 'outside';
    this.showResources = true;
    this.showDependencies = true;
    this.taskContentChoice = 'Görünüm-2';
    this.areTasksColorful = true;
    this.isGanttEditable = false;
    this.isPresentationMode = true;
    this.startDateRange = new Date(2020, 0);
    this.endDateRange = new Date(2022, 0);
    this.treeListWidth = 1000;

    // gantt form
    this.customTaskDetailsForm = {
      taskKey: null,
      parentTaskKey: null,
      projectCode: null,
      title: '',
      start: null,
      end: null,
      actualDuration: null,
      progress: null,
      taskPlannedStartDate: null,
      taskPlannedEndDate: null,
      plannedDuration: null,
      taskIsRevision: false,
      taskCompany: null,
      taskCustomer: null,
      taskStatus: null,
      taskNotes: null,
      resourceKey: null,
      // B.D: resourcetext gerek yok gibi, sil
      resourceText: null,
      routeLevelNumber: null,
    };

    // reference project form
    this.referenceProjectSelectionFormData = {
      referenceProjectCode: null,
    };

    // export options/filters
    this.formatBoxValue = 'A3';
    this.landscapeCheckBoxValue = true;
    this.exportModeBoxValue = this.exportModes[0];
    this.dateRangeBoxValue = this.dateRanges[1];
    this.startTaskIndex = 0;
    this.endTaskIndex = 3;
    this.customRangeDisabled = true;
    this.exportButtonOptions = {
      hint: 'Export to PDF',
      icon: 'exportpdf',
      stylingMode: 'text',
      onClick: () => this.exportButtonClick(),
    };

    // sorting
    this.sortingMode = 'multiple';
    this.showSortIndexes = true;

    // toolbar
    this.resetTreeListColumnViewsButtonOptions = {
      hint: 'Iş Listesi Sütun Görünümleri Ilk Hallerine Döner',
      icon: 'alignjustify',
      stylingMode: 'text',
      text: 'Sütun Görünümünü Sıfırla',
      onClick: () => this.resetTreeListColumnViewsButtonClick(),
    };

    this.refreshGanttButtonOptions = {
      text: 'Gantt Yenile',
      hint: "Gantt'ın Otomatik Güncellenmemesi Durumunda Manuel Güncellemeyi Sağlar",
      icon: 'refresh',
      stylingMode: 'text',
      onClick: () => {
        this.gantt.instance.refresh();
      },
    };
    this.saveDataButtonOptions = {
      text: 'Tüm Verileri Kaydet',
      icon: 'save',
      stylingMode: 'text',
      onClick: () => {
        this.saveGantt();
      },
    };

    // TreeList Columns TagBox
    this.tagBoxTagListValue = this.columnList
      .filter(
        (column) =>
          // B.D: Sabit Sütunların Değiştirilmesine İzin Vermiyoruz
          column.isFixed === false
      )
      .filter((column: any) => column.isVisible == true)
      .map((column: any) => column.id);

    // Subscript to the loadingDelayer
  }

  addReferenceProjectSubTasks() {
    let findTask = this.tasks.find(
      (task) => task.taskKey === this.ganttSelectedTaskRowKey
    );
    // Check if the task is not subtask
    if (findTask?.parentTaskKey === null) {
      this.isReferencedProjectPopupVisible = true;
    } else {
      alert(
        'Alt görevleri toplu olarak ekleyebilmek için bir ana görev seçmelisiniz!'
      );
    }
  }
  onCustomCommandClick(e: any) {
    if (e.name === 'addReferenceProjectSubTasks') {
      this.addReferenceProjectSubTasks();
    }
  }
  onGanttTaskSelectionChanged(e: any) {
    // B.D: Silinecek Gerek yok
    this.ganttSelectedTaskRowKey = e.selectedRowKey;
  }
  onContextMenuPreparing(e: any) {
    e.items[0].text = 'Ekle';
    e.items[0].items[0].text = 'Yeni Iş';
    e.items[0].items[1].text = 'Yeni Alt Iş';
    e.items[1].text = 'Iş Düzenle/Incele';
    e.items[2].text = 'Iş Sil';
    e.items[3].text = 'Bağımlılık Sil';
    e.items[4] = {
      beginGroup: true,
      name: 'addReferenceProjectSubTasks',
      text: 'Referans Projeye Göre Alt Görevleri Ekle',
      icon: 'hierarchy',
      disabled: true,
    };
    if (this.isGanttEditable) {
      e.items[4].disabled = false;
    } else {
      e.items[4].disabled = true;
    }
  }

  // Export Options/Filters
  exportButtonClick() {
    const gantt = this.gantt?.instance;
    const format = this.formatBoxValue.toLowerCase();
    const isLandscape = this.landscapeCheckBoxValue;
    const exportMode = this.getExportMode();
    const dataRangeMode = this.dateRangeBoxValue.toLowerCase();
    let dataRange;
    if (dataRangeMode === 'custom') {
      dataRange = {
        startIndex: this.startTaskIndex,
        endIndex: this.endTaskIndex - 1,
        startDate: this.customStartDate,
        endDate: this.customEndDate,
      };
    }
    // B.D: GanttComponent "all" durumunda start ve end viewlerin alınmasını kendi hallediyor ama bu özellik deprecated olmuş dolayısıyla ne olur ne olmaz diye bu şekilde yazdım.
    if (dataRangeMode === 'all') {
      dataRange = {
        startDate: this.startDateRange,
        endDate: this.endDateRange,
      };
    }

    // B.D: GanttComponent "visible" durumunda start ve end viewlerin alınmasını kendi hallediyor bu özellik deprecated olmuş ama görünen ganttview'ın start ve end değerlerini almak için bir yöntem bulamadım henüz.
    // if(dataRangeMode === 'visible') {}

    exportGanttToPdf({
      component: gantt,
      createDocumentMethod: (args?: any) => new jsPDF(args),
      format,
      landscape: isLandscape,
      exportMode,
      dateRange: dataRange,
    }).then((doc) => doc.save('gantt.pdf'));
  }

  getExportMode() {
    if (this.exportModeBoxValue === 'Tree List') {
      return 'treeList';
    }
    if (this.exportModeBoxValue === 'All') {
      return 'all';
    }
    if (this.exportModeBoxValue === 'Chart') {
      return 'chart';
    }
    return 'all';
  }
  // B.D: burası ne?
  onDateRangeBoxSelectionChanged(e: any) {
    this.customRangeDisabled = e.value !== 'Custom';
    this.ref.detectChanges();
  }

  // toolbar
  resetTreeListColumnViewsButtonClick() {
    let gantt: any = this.gantt?.instance;
    let treeList = gantt['_treeList'] as dxTreeList;
    treeList.clearFilter();
    treeList.clearSorting();
    treeList.option('allowColumnReordering', true);
    this.gantt?.instance.repaint();
  }
  saveGantt() {
    if (confirm('Tüm Veriler Kaydedilsin Mi?')) {
      if (
        this.tasks.every((task) => Object.hasOwn(task, 'projectCode')) === false
      ) {
        alert(
          "Gantt'ta Bilgileri Eksik Görevler Bulunmaktadır. Lütfen Eksik Bilgileri Doldurunuz!"
        );
      } else {
        this.ganttDataService.updateGanttData({
          tasks: this.tasks,
          dependencies: this.dependencies,
          resources: this.resources,
          resourceAssignments: this.resourceAssignments,
        });
        alert('Gantt Verileri Başarıyla Kaydedildi!');
      }
    }
  }

  // Forms/Popups
  dateDaysDiffCalculator(start: string, end: string) {
    // To calculate the time difference of two dates
    let Difference_In_Time =
      new Date(end).getTime() - new Date(start).getTime();

    // To calculate the no. of days between two dates
    let Difference_In_Days = Difference_In_Time / (1000 * 3600 * 24);

    return Math.round(Difference_In_Days);
  }
  onTaskEditDialogHiding(e: any) {}
  onTaskEditDialogHidden(e: any) {
    this.customTaskDetailsDOM?.instance.resetValues();
  }
  onTaskEditDialogShowing(e: any) {
    e.cancel = true;
    let findCurrentTaskObj = this.tasks.find((task) => task.taskKey === e.key);
    // New Task Form
    // B.D: REFACTOR: Object.hasOwn ile değiştir
    if (!findCurrentTaskObj?.hasOwnProperty('taskPlannedStartDate')) {
      // initial form values to be shown
      this.customTaskDetailsForm = {
        ...this.customTaskDetailsForm,
        ...findCurrentTaskObj,
        taskPlannedStartDate: new Date(e.values.start),
        taskPlannedEndDate: new Date(e.values.end),
        plannedDuration: this.dateDaysDiffCalculator(
          e.values.start,
          e.values.end
        ),
        actualDuration: this.dateDaysDiffCalculator(
          e.values.start,
          e.values.end
        ),
        title: '',
      };
      let test1 = 'test1';
    }
    // Update Task Form
    else {
      // form sync with data
      let selectedRowData = findCurrentTaskObj;
      this.customTaskDetailsForm = {
        ...this.customTaskDetailsForm,
        ...selectedRowData,
        resourceKey: this.resources.find(
          (resource) =>
            resource.resourceKey ==
            this.resourceAssignments.find((ra) => ra.taskKey == e.key)
              ?.resourceKey
        )?.resourceKey,
        resourceText: this.resources.find(
          (resource) =>
            resource.resourceKey ==
            this.resourceAssignments.find((ra) => ra.taskKey == e.key)
              ?.resourceKey
        )?.text,
      };
      let test6 = 'test';
    }

    this.oldCustomTaskDetailsForm = { ...this.customTaskDetailsForm };

    let ganntFormSubmitButton = this.customTaskDetailsDOM?.instance.getButton(
      'ganntFormSubmitButton'
    ) as dxButton;
    if (this.isGanttEditable) {
      ganntFormSubmitButton.option('disabled', false);
    } else {
      ganntFormSubmitButton.option('disabled', true);
    }

    this.isTaskDetailsFormPopupVisible = true;
    let test2 = 'test';
  }
  onGanttContentReady(e: any) {
    let gantt: any = this.gantt?.instance;
    let tree = gantt['_treeList'] as dxTreeList;
    this.ganttToolBarDOM.items;
    this.ganttTreeListPainter();
    this.ganttEditModeHandler();

    tree.option('columnResizingMode', 'widget');
    tree.option('allowColumnReordering', true);
    for (const fixedColumn of this.columnList) {
      if (fixedColumn.isFixed === true) {
        tree.columnOption(fixedColumn.dataField, 'allowReordering', false);
      }
    }
    // B.D: Resmi olarak timeout kullanılması öneriliyor çünkü eğer kullanılmazsa, arka plandaki başka methodlarda da timeout olduğu için çakışma oluyormuş.
    // TODO: sunum modu için üzerinden geçilmeli, devextreme lifecycle'ları çakışıyor.
    // if (this.onGanttContentReady_RenderCounts > 0) {
    //   setTimeout(() => {
    //     this.gantt?.instance.collapseAll();
    //     // this.gantt.instance.scrollToDate(new Date());
    //     // tarih vermek istesek örnek:
    //     this.gantt?.instance.scrollToDate(new Date('october 10, 2020'));
    //   }, 3000);
    // }
    this.onGanttContentReady_RenderCounts++;
  }

  // Gantt Tree List Painter
  ganttTreeListPainter() {
    if (this.areTasksColorful) {
      this.treeColor();
    } else {
      this.treeColorClear();
    }
    this.repaintTreeList();
  }
  treeColor() {
    let gant: any = this.gantt?.instance;
    let tree = gant['_treeList'] as dxTreeList;
    tree.on('rowPrepared', (e: any) => {
      if (e.rowType === 'data') {
        let task = e.data as Task;
        for (const cell of e.cells) {
          // Title Color
          if (cell.column.dataField === 'title' && task.parentTaskKey) {
            cell.cellElement.style.backgroundColor =
              this.taskOperationList.find((taskOperation) => {
                return taskOperation.name === task.title;
              })?.displayColor;

            if (task.title.toLocaleLowerCase().includes('yükleme')) {
              cell.cellElement.style.color = 'white';
            }
          } else if (cell.column.dataField === 'title' && !task.parentTaskKey) {
            cell.cellElement.style.backgroundColor = this.taskStatusList.find(
              (taskStatus) => {
                return taskStatus.statusName === task.taskStatus;
              }
            )?.statusdisplayColor;
            // Project Code & Task Status Color
          } else if (
            cell.column.dataField === 'projectCode' &&
            task.parentTaskKey
          ) {
            e.rowElement.cells[0].style.backgroundColor =
              this.taskStatusList.find((taskStatus) => {
                return taskStatus.statusName === task.taskStatus;
              })?.statusdisplayColor;
          } else if (
            cell.column.dataField === 'projectCode' &&
            !task.parentTaskKey
          ) {
            e.rowElement.cells[0].style.backgroundColor =
              this.taskStatusList.find((taskStatus) => {
                return taskStatus.statusName === task.taskStatus;
              })?.statusdisplayColor;
          }
        }
      }

      // melih
      // if (e.rowType == 'data') {
      //   e.rowElement.cells[0].style['background-color'] = 'red';
      //   e.rowElement.cells[0].style['color'] = 'white';
      // }
    });
  }
  treeColorClear() {
    let gant: any = this.gantt?.instance;
    let tree = gant['_treeList'] as dxTreeList;
    tree.on('rowPrepared', (e: any) => {
      if (e.rowType === 'data') {
        let task = e.data as Task;
        for (const cell of e.cells) {
          // Title Color
          if (cell.column.dataField === 'title' && task.parentTaskKey) {
            cell.cellElement.style.backgroundColor =
              e.rowElement.cells[
                e.rowElement.cells.length - 1
              ].style.backgroundColor;

            if (task.title.toLocaleLowerCase().includes('yükleme')) {
              cell.cellElement.style.color = '#333';
            }
          } else if (cell.column.dataField === 'title' && !task.parentTaskKey) {
            cell.cellElement.style.backgroundColor =
              e.rowElement.cells[
                e.rowElement.cells.length - 1
              ].style.backgroundColor;
            // Project Code & Task Status Color
          } else if (
            cell.column.dataField === 'projectCode' &&
            task.parentTaskKey
          ) {
            e.rowElement.cells[0].style.backgroundColor =
              e.rowElement.cells[
                e.rowElement.cells.length - 1
              ].style.backgroundColor;
          } else if (
            cell.column.dataField === 'projectCode' &&
            !task.parentTaskKey
          ) {
            e.rowElement.cells[0].style.backgroundColor =
              e.rowElement.cells[
                e.rowElement.cells.length - 1
              ].style.backgroundColor;
          }
        }
      }

      // melih
      // if (e.rowType == 'data') {
      //   e.rowElement.cells[0].style['background-color'] = 'red';
      //   e.rowElement.cells[0].style['color'] = 'white';
      // }
    });
    this.repaintTreeList();
  }

  // Gantt Edit Mode Handler
  ganttEditModeHandler() {
    if (this.isGanttEditable) {
      this.gantt?.instance.option('editing.enabled', true);
    } else {
      this.gantt?.instance.option('editing.enabled', false);
    }
  }
  ganttPresentationModeHandler() {
    let gantt: any = this.gantt?.instance; // viewchild kullanabilir misin
    // B.D: $$ lı yerler Private api yani dökumante edilmemiş çözüm olduğu için güncellemelerde değişiklik olabilir. Bu yüzden kullanılmaması öneriliyor, başka çözüm olmadığı için mecburen kullandık.
    if (this.isPresentationMode) {
      gantt.option('taskListWidth', 0);
      gantt._splitter._setSplitterPositionLeft({ splitterPositionLeft: 0 }); // $$ private api
      // gantt._splitter._containerWidth = 0;
      // gantt._splitter._leftPanelPercentageWidth = 0;
      this.gantt?.instance.repaint();
    } else {
      gantt.option('taskListWidth', 1000);
      gantt._splitter._setSplitterPositionLeft({ splitterPositionLeft: 1000 }); // $$ private api
      this.gantt?.instance.repaint();
    }
  }
  onSubmitButtonContentReady(e: any) {}
  // repaint & refresh
  repaintTreeList() {
    let gantt: any = this.gantt?.instance;
    let tree = gantt['_treeList'] as dxTreeList;
    tree.repaint();
  }
  refreshTreeList() {
    let gantt: any = this.gantt?.instance;
    let tree = gantt['_treeList'] as dxTreeList;
    tree.refresh();
  }
  onGanttTaskUpdating(e: any) {}
  onGanttTaskUpdated(e: any) {}
  onGanttScaleCellPrepared(e: any) {}
  onGanttOptionChanged(e: any) {}

  // Task Details Form
  onGanttTaskFormFieldDataChanged(e: any) {
    if (e.dataField === 'start') {
      this.customTaskDetailsForm.actualDuration = this.dateDaysDiffCalculator(
        e.value,
        this.customTaskDetailsForm.end
      );
    }
    if (e.dataField === 'end') {
      this.customTaskDetailsForm.actualDuration = this.dateDaysDiffCalculator(
        this.customTaskDetailsForm.start,
        e.value
      );
    }
    if (e.dataField === 'taskPlannedStartDate') {
      this.customTaskDetailsForm.plannedDuration = this.dateDaysDiffCalculator(
        e.value,
        this.customTaskDetailsForm.taskPlannedEndDate
      );
    }
    if (e.dataField === 'taskPlannedEndDate') {
      this.customTaskDetailsForm.plannedDuration = this.dateDaysDiffCalculator(
        this.customTaskDetailsForm.taskPlannedStartDate,
        e.value
      );
    }
  }
  onGanttTaskSubmitForm(e: any) {
    e.preventDefault();
    if (confirm('Proje/Görev/Operasyon Kaydet!') === true) {
      this.customTaskDetailsForm.resourceText = this.resources.find(
        (resource) =>
          resource.resourceKey == this.customTaskDetailsForm.resourceKey
      )?.text;
      const {
        resourceKey,
        resourceText,
        start,
        end,
        taskPlannedStartDate,
        taskPlannedEndDate,
        ...everythingExceptresourceInfo
      } = this.customTaskDetailsForm;
      this.gantt?.instance.updateTask(this.customTaskDetailsForm.taskKey, {
        ...everythingExceptresourceInfo,
        start: new Date(start),
        end: new Date(end),
        taskPlannedStartDate: new Date(taskPlannedStartDate),
        taskPlannedEndDate: new Date(taskPlannedEndDate),
        resourceKey: resourceKey,
        resourceText: resourceText,
        // B.D: parentId: 0, eklenebilir eğer parent property yok ise... bunu en son ekle, problem çıkmazsa
      });
      let resourceAssignmentIndex = this.resourceAssignments.findIndex(
        (ra) => ra.taskKey === this.customTaskDetailsForm.taskKey
      );
      if (resourceAssignmentIndex === -1) {
        this.resourceAssignments.push({
          raKey: String(this.resourceAssignments.length),
          taskKey: this.customTaskDetailsForm.taskKey,
          resourceKey: resourceKey,
        });
      } else {
        this.resourceAssignments[resourceAssignmentIndex].resourceKey =
          resourceKey;
      }
      // "refresh", ganttview güncellemesi için gerekli, treelist için şu an gerekli gözükmüyor.
      // this.gantt.instance.refresh();
      this.isTaskDetailsFormPopupVisible = false;
    } else {
      this.customTaskDetailsForm = this.oldCustomTaskDetailsForm;
    }
    let test5 = 'test';
  }
  // Reference Project Form / Popup
  onReferenceProjectFieldDataChanged(e: any) {}
  onReferenceProjectPopUpHiding(e: any) {}
  onReferenceProjectPopUpHidden(e: any) {
    this.referenceProjectSelectionFormDOM?.instance.resetValues();
  }
  onSubmitReferenceProjectSelection(e: any) {
    e.preventDefault();
    let checkReferenceProject = this.tasks.some(
      (task) =>
        task.projectCode ===
        this.referenceProjectSelectionFormData.referenceProjectCode
    );
    let findRootTask = this.tasks.find(
      (task) => task.taskKey === this.ganttSelectedTaskRowKey
    );
    if (checkReferenceProject === false) {
      alert('Bu Proje Koduna Ait Bir Proje Yok!');
    }
    // Check If User Assigned a Project Code
    else if (findRootTask?.projectCode) {
      let newSubTasksData: any = [];
      let subTasksCount = 0;
      // B.D: Referans Projenin SubTaskları Getirilir
      for (let index = 0; index < this.tasks.length; index++) {
        if (
          this.tasks[index].projectCode ===
          this.referenceProjectSelectionFormData.referenceProjectCode
        ) {
          // B.D: Tüm Task Datayı taramasın diye performans amaçlı, maximum olabilecek rota sayısı kadar döndürüyor
          if (subTasksCount < this.taskOperationList.length) {
            newSubTasksData.push({
              ...this.tasks[index],
            });
            subTasksCount++;
          } else {
            break;
          }
        }
      }
      // Set New taskKeys & parentTaskKeys
      let rootTaskKey = this.ganttSelectedTaskRowKey;
      let newKey;
      for (let i = 0; i < newSubTasksData.length; i++) {
        i === 0 ? (newKey = rootTaskKey) : (newKey = uuidv4());
        for (let j = 0; j < newSubTasksData.length; j++) {
          if (newSubTasksData[i].taskKey === newSubTasksData[j].parentTaskKey) {
            newSubTasksData[j].parentTaskKey = newKey;
          }
        }
        newSubTasksData[i].taskKey = newKey;
      }
      // B.D: Kök Task Atıldı çünkü zaten this.tasks içinde var
      let rootSubTask = newSubTasksData.shift();

      let result = 'test';

      for (const newSubTask of newSubTasksData) {
        this.tasks.push({
          ...newSubTask,
          projectCode: findRootTask?.projectCode,
          taskCompany: findRootTask?.taskCompany,
          taskCustomer: findRootTask?.taskCustomer,
        });
      }
      let result2 = 'test';
      this.isReferencedProjectPopupVisible = false;
      this.gantt?.instance.refresh();
      let result3 = 'test';
    } else {
      alert('Lütfen Yeni Proje için Proje Kodu Veriniz!');
    }
  }
  // scale display formatter
  onScaleCellPrepared(e: any) {
    if (e.scaleType === 'weeks') {
      e.scaleElement.innerText = 'CW' + moment(e.startDate).format('w');
    }
  }
  // Custom Task Content Template
  actualTaskProgressWidthDefiner(item: any) {
    let progressWidth = `${parseFloat(item.taskData.progress) * 100 + '%'}`;
    return progressWidth;
  }

  customProgressFormat(value: number) {
    return value * 100 + '%';
  }
  plannedTaskWidthDefiner(item: any) {
    let taskRange = item.taskData.end - item.taskData.start;
    let tickSize = item.taskSize.width / taskRange;
    let reFormattedTaskPlannedStartDate = new Date(
      item.taskData.taskPlannedStartDate
    );
    let reFormattedTaskPlannedEndDate = new Date(
      item.taskData.taskPlannedEndDate
    );
    let plannedTaskOffset =
      reFormattedTaskPlannedStartDate.getTime() - item.taskData.start.getTime();
    let plannedTaskRange =
      reFormattedTaskPlannedEndDate.getTime() -
      reFormattedTaskPlannedStartDate.getTime();

    let plannedTaskWidth = Math.round(plannedTaskRange * tickSize);
    let plannedTaskLeftPosition = Math.round(plannedTaskOffset * tickSize);
    return {
      'width.px': plannedTaskWidth,
      'left.px': plannedTaskLeftPosition,
    };
  }
  // TreeList Rows
  onGanttTaskInserting(e: any) {
    // Aşağıdaki Propertyler DxGanttComponent yani DevExtreme Tarafından otomatik geliyor, gerisini ganttTask Formunu kaydederken "this.tasks"a custom ekliyoruz.
    /*  key
        parentId
        title
        progress
        start
        end
        color
     */
    e.values = {
      ...e.values,
      title: 'Yeni Proje/Görev/Operasyon',
    };
  }
  onGanttTaskInserted(e: any) {
    e.cancel;
    let taskIndex = this.tasks.findIndex((task) => task.taskKey === e.key);

    // B.D: DevExtreme kendi ekliyor, gerek olmadığı için siliyorum
    delete this.tasks[taskIndex].color;

    if (!this.tasks[taskIndex].hasOwnProperty('parentTaskKey')) {
      // bu akışı bozabilir, kontrol et
      this.tasks[taskIndex]['parentTaskKey'] = null;
    }
  }
  // TreeList Columns
  // onOpened
  onColumnListTagboxValueChanged(e: any) {
    // B.D: 1.0 TreeList Sütunlarını tagbox seçimine göre sıralayarak göstermek için...

    // 1.1 Sütunların Seçime Göre Sıralanması
    const newTagBoxValue = e.value;
    let oldColumnsList = this.columnList;
    let newColumnsList: any[] = [];

    for (let index = 0; index < newTagBoxValue.length; index++) {
      let column = oldColumnsList.find(
        (column) => column.id === newTagBoxValue[index]
      );
      newColumnsList.push(column);
    }
    let fixedColumnsList = this.columnList.filter(
      (column) => column.isFixed === true
    );
    newColumnsList = [
      ...fixedColumnsList,
      ...newColumnsList,
      ...oldColumnsList.filter(
        (oldColumn) =>
          !newColumnsList.some((newColumn) => oldColumn.id === newColumn.id) &&
          !fixedColumnsList.some(
            (fixedColumn) => oldColumn.id === fixedColumn.id
          )
      ),
    ];

    this.columnList = [...newColumnsList];

    let result2 = 'test';

    // 1.2 Sabit olarak görünecek projectCode ve title sütunları dışında, görünmesi için seçilen sütunlar

    this.columnList.forEach((column, index) => {
      if (!this.fixedColumnsList.includes(column)) {
        if (newTagBoxValue.includes(column.id)) {
          this.columnList[index].isVisible = true;
        } else {
          this.columnList[index].isVisible = false;
        }
      }
    });
    // B.D: 1.3 Görünecek tagbox "tag" listesini belirleme
    this.tagBoxTagListValue.length = 0;
    this.columnList.forEach((column) => {
      if (!this.fixedColumnsList.includes(column)) {
        if (column.isVisible === true) {
          this.tagBoxTagListValue.push(column.id);
        }
      }
    });
    // B.D: 1.4 Sıralanmış Sütunlara göre Taglerde Tekrar Sıralanır
    this.tagBoxcolumnListDataSource = new DataSource({
      store: new ArrayStore({
        data: this.columnList.filter(
          (column) =>
            // B.D: Sabit Sütunların Değiştirilmesine İzin Vermiyoruz
            column.isFixed === false
        ),
        key: 'id',
      }),
    });
  }
  onColumnListTagBoxItemClick(e: any) {}
  onColumListTagBoxMultiTagPreparing(args: any) {
    if (args.text.includes('more')) {
      let formattedText = args.text.replace('more', 'Daha');
      args.text = formattedText;
    }
  }

  repaint() {
    this.gantt?.instance.repaint();
    // this.treeColor();
  }

  // B.D: Buna gerek yok gibi, zaten kalıcı olarak çalışmıyor.
  ngAfterViewInit() {
    // setTimeout(() => {
    //   // instances
    //   // let gantt: any = this.gantt.instance;
    //   // let ganttTreeList = gantt['_treeList'] as dxTreeList;
    //   // this.treeColor();
    // }, 1000);
    // B.D: dxGantt Component'inin Angular'dan bağımsız Devextreme'e özel lifecycle'ı var, settimeout kullanarak bunun tamamlanmasını bekliyoruz.
    // sunum modu iptal edilecek
    // setTimeout(() => {
    //   this.ganttPresentationModeHandler();
    // }, 6000);
  }

  //tree list

  // ccc() {
  //   let rows = document.getElementsByClassName('dx-row');
  //   if (rows.length > 0) {
  //     for (let i = 0; i < rows.length; i++) {
  //       let row = rows[i];
  //       if (row.innerHTML.includes('Tasarımda22')) {
  //         console.log(row);
  //         row.setAttribute('style', 'background-color: red;');
  //       }
  //     }
  //   }
  // }

  // tree.option('onSelectionChanged', () => {
  //   this.ccc();
  // });
  // tree.on('contentReady', () => {
  //   this.ccc();
  // });
  // cellTemplate: function(element, info) {
  //              element.append("<div>" + info.text + "</div>")
  //                     .css("color", "blue");
  // tree._templateManager.addDefaultTemplates({
  //   cellTemplate: function (element: any, info: any) {
  //     element.append('<div>' + info.text + '</div>').css('color', 'blue');
  //   },
  // });

  //treelist
  // onContentReady(e: any) {
  //   let taskListRows =
  //     e.element.children[1].children[0].children[0].children[0].children[5]
  //       .children[0].children[0].children[0].children[0].children[0].children[1]
  //       .children;
  //   let tds;
  //   let td;
  //   for (let index = 0; index < taskListRows.length; index++) {
  //     tds = taskListRows[index];
  //     for (let index = 0; index < tds.children.length; index++) {
  //       td = tds.children[index];
  //       if (td.innerText == 'a') {
  //         td.style.backgroundColor = 'blue';
  //         break;
  //       }
  //     }
  //   }
  // }

  // class } end
}
