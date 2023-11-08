import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { DxCheckBoxModule, DxSelectBoxModule, DxDateBoxModule, DxPopupModule, DxNumberBoxModule, DxFormModule, DxTextAreaModule, DxSwitchModule, DxScrollViewModule, DxTagBoxModule, DxAccordionModule, DxTabPanelModule } from 'devextreme-angular';
import { DxGanttModule } from 'devextreme-angular/ui/gantt';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ProjelerGanttComponent } from './Proje-Takip-Rapor/projeler-gantt/projeler-gantt.component';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [AppComponent, ProjelerGanttComponent],
  imports: [
    ReactiveFormsModule,
    BrowserModule,
    AppRoutingModule,
    DxGanttModule,
    DxCheckBoxModule,
    DxSelectBoxModule,
    DxDateBoxModule,
    DxPopupModule,
    DxNumberBoxModule,
    DxFormModule,
    DxTextAreaModule,
    DxSwitchModule,
    DxScrollViewModule,
    HttpClientModule,
    DxTagBoxModule,
    DxAccordionModule,
    DxTabPanelModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
