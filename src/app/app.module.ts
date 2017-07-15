import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { ChartModule } from 'angular2-highcharts';
import { HighchartsStatic } from 'angular2-highcharts/dist/HighchartsService';
import { UiSwitchModule } from '../../node_modules/angular2-ui-switch/src/index';
import { AppComponent } from './app.component';
import { ForecastComponent } from './forecast/forecast.component';
import { CurrencyDelimitedWithCommaPipe } from './currency-delimited.pipe';
import { ChartsInitializer } from './forecast/forecast.helper';
import { XlFileComponent } from './xl-file/xl-file.component';

declare var require: any;

export function HighChartsFactory() {
  return require('highcharts')
};

ChartsInitializer.Initialize(HighChartsFactory());

@NgModule({
  declarations: [
    AppComponent,
    ForecastComponent,
    CurrencyDelimitedWithCommaPipe,
    XlFileComponent
  ],
  imports: [
    UiSwitchModule,
    BrowserModule,
    FormsModule,
    HttpModule,
    ChartModule
  ],
  providers: [
    {
      provide: HighchartsStatic,
      useFactory: HighChartsFactory
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
