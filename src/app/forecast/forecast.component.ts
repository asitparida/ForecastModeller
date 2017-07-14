import { Component } from '@angular/core';
import {
    SAMPLE,
    GrowthType,
    PeriodType,
    ForecastYear,
    ForecastUnitModel,
    ViewOption,
    MONTHNAMES
} from './forecast.models';
import { ChartsHelper } from './forecast.helper';

function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}

@Component({
    selector: 'app-forecast',
    templateUrl: './forecast.component.html',
    styleUrls: ['./forecast.component.scss']
})
export class ForecastComponent {

    isManual: Boolean = false;
    rows: any[] = SAMPLE;
    startDateStr: string;
    endDateStr: string;
    startValue: number;
    growth: number;
    growthType: GrowthType;
    growthPeriod: PeriodType;

    showSliderMenu: Boolean = false;
    chartOptionsForMonthlyView = null;
    chartOptionsForQuaterlyView = null;
    chartOptionsForYearlyView = null;
    showCharts: Boolean = true;

    viewOptions = [
        { value: ViewOption.RESULTS, label: 'Actuals' },
        { value: ViewOption.INCREMENTS, label: 'Increments' }
    ]

    growthPeriodOptions = [
        { value: PeriodType.MONTHLY, label: 'Monthly' },
        { value: PeriodType.QUARTERLY, label: 'Quarterly' },
        { value: PeriodType.YEARLY, label: 'Yearly' },
    ]

    growthTypeOptions = [
        { value: GrowthType.ABSOLUTE, label: 'Absolute' },
        { value: GrowthType.PERCENT, label: 'Percent' }
    ]

    viewSelected = ViewOption.RESULTS;
    chartViewSelected = PeriodType.MONTHLY;

    VIEW_OPTIONS = ViewOption;
    PERIOD_TYPE_OPTIONS = PeriodType;

    private startDate: Date;
    private endDate: Date;

    private forecastStartDate = new Date('1/15/2016');
    private forecastEndDate = new Date('1/15/2022');

    forecastYears: ForecastYear[] = [];

    constructor() {
        this.forecastYears = [];
        this.startValue = 100;
        this.startDateStr = '2017-08-21';
        this.endDateStr = '2018-10-21';
        this.growth = 10;
        this.growthType = GrowthType.PERCENT;
        this.growthPeriod = PeriodType.MONTHLY;
        this.process();
    }

    init() {
        this.forecastYears = [];
        this.startDate = new Date(this.startDateStr);
        this.endDate = new Date(this.endDateStr);
    }

    processForTimePeriod() {
        let proceed: Boolean = true;
        const start: Date = new Date(this.forecastStartDate);
        const monthModels: ForecastUnitModel[] = [];
        while (proceed) {
            const model = new ForecastUnitModel(start.getMonth(), start.getFullYear());
            monthModels.push(model);
            start.setMonth(start.getMonth() + 1);
            if (start < this.forecastEndDate) {
                proceed = true;
            } else {
                proceed = false;
            }
        }
        const years = monthModels.map((item: ForecastUnitModel) => { return item.YEAR; }).filter(onlyUnique);
        let MONTH_INDEXER: number = 0;
        let QUARTER_INDEXER: number = 0;
        let START_QUARTER_INCREMENT: Boolean = false;
        let YEAR_INDEXER: number = 0;
        let START_YEAR_INCREMENT: Boolean = false;
        years.forEach((year: number) => {
            const fy = new ForecastYear();
            fy.YEAR = year;
            fy.MONTHS = monthModels.filter((item: ForecastUnitModel) => { return item.YEAR === year; });
            fy.MONTHS.sort((a: ForecastUnitModel, b: ForecastUnitModel) => { return a.MONTH - b.MONTH; });
            fy.MONTHS.forEach((month: ForecastUnitModel) => {
                month.ITER_INDEX_MONTH = MONTH_INDEXER;
                month.ITER_INDEX_YEAR = Math.ceil((MONTH_INDEXER + 1) / 12);
                MONTH_INDEXER++;
                if (month.MONTH === this.startDate.getMonth() && month.YEAR === this.startDate.getFullYear()) {
                    START_QUARTER_INCREMENT = true;
                    START_YEAR_INCREMENT = true;
                }
                if (START_QUARTER_INCREMENT) {
                    month.ITER_INDEX_QUARTER = Math.ceil((QUARTER_INDEXER + 1) / 3);
                    QUARTER_INDEXER++;
                }
                if (START_YEAR_INCREMENT) {
                    month.ITER_INDEX_YEAR = Math.ceil((YEAR_INDEXER + 1) / 12);
                    YEAR_INDEXER++;
                }
            });
            this.forecastYears.push(fy);
        });
    }

    calculate() {
        let monthModels: ForecastUnitModel[] = [];
        this.forecastYears.forEach((year: ForecastYear) => {
            monthModels = monthModels.concat(year.MONTHS);
        });
        let lastValue: number = 0;
        const startCursor = monthModels.find((model: ForecastUnitModel) => {
            return model.MONTH === this.startDate.getMonth() && model.YEAR === this.startDate.getFullYear();
        });
        const endCursor = monthModels.find((model: ForecastUnitModel) => {
            return model.MONTH === this.endDate.getMonth() && model.YEAR === this.endDate.getFullYear();
        });
        if (this.growthPeriod === PeriodType.MONTHLY) {
            let cursor = startCursor.ITER_INDEX_MONTH;
            while (cursor < monthModels.length) {
                if (cursor === startCursor.ITER_INDEX_MONTH) {
                    monthModels[cursor].VALUE = this.startValue;
                    lastValue = monthModels[cursor].VALUE;
                } else {
                    if (cursor > startCursor.ITER_INDEX_MONTH && cursor <= endCursor.ITER_INDEX_MONTH) {
                        if (this.growthType === GrowthType.ABSOLUTE) {
                            monthModels[cursor].GROWTH_INCREMENT = this.growth;
                        } else {
                            monthModels[cursor].GROWTH_INCREMENT = ((lastValue * this.growth) / 100);
                        }
                    }
                    monthModels[cursor].GROWTH_INCREMENT = Math.ceil(monthModels[cursor].GROWTH_INCREMENT);
                    monthModels[cursor].VALUE = lastValue + monthModels[cursor].GROWTH_INCREMENT;
                    lastValue = monthModels[cursor].VALUE;
                }
                cursor = cursor + 1;
            }
        } else if (this.growthPeriod === PeriodType.QUARTERLY) {
            let cursor = startCursor.ITER_INDEX_MONTH;
            while (cursor < monthModels.length) {
                const currentModel = monthModels[cursor];
                if (currentModel.ITER_INDEX_QUARTER === startCursor.ITER_INDEX_QUARTER) {
                    monthModels[cursor].VALUE = currentModel.ITER_INDEX_MONTH >= startCursor.ITER_INDEX_MONTH ? this.startValue : monthModels[cursor].VALUE;
                    lastValue = monthModels[cursor].VALUE;
                } else {
                    if (currentModel.ITER_INDEX_QUARTER > startCursor.ITER_INDEX_QUARTER && currentModel.ITER_INDEX_QUARTER <= endCursor.ITER_INDEX_QUARTER) {
                        if (currentModel.ITER_INDEX_MONTH <= endCursor.ITER_INDEX_MONTH) {
                            if (this.growthType === GrowthType.ABSOLUTE) {
                                monthModels[cursor].GROWTH_INCREMENT = this.growth;
                            } else {
                                monthModels[cursor].GROWTH_INCREMENT = ((lastValue * this.growth) / 100);
                            }
                        }
                    }
                    monthModels[cursor].GROWTH_INCREMENT = Math.ceil(monthModels[cursor].GROWTH_INCREMENT);
                    monthModels[cursor].VALUE = lastValue + monthModels[cursor].GROWTH_INCREMENT;
                    if ((monthModels[cursor].ITER_INDEX_MONTH + 1) % 3 === (this.startDate.getMonth() % 3) || currentModel.ITER_INDEX_MONTH === endCursor.ITER_INDEX_MONTH) {
                        lastValue = monthModels[cursor].VALUE;
                    }
                }
                cursor = cursor + 1;
            }
        } else {
            let cursor = startCursor.ITER_INDEX_MONTH;
            while (cursor < monthModels.length) {
                const currentModel = monthModels[cursor];
                if (currentModel.ITER_INDEX_YEAR === startCursor.ITER_INDEX_YEAR) {
                    monthModels[cursor].VALUE = currentModel.ITER_INDEX_YEAR >= startCursor.ITER_INDEX_YEAR ? this.startValue : monthModels[cursor].VALUE;
                    lastValue = monthModels[cursor].VALUE;
                } else {
                    if (currentModel.ITER_INDEX_YEAR > startCursor.ITER_INDEX_YEAR && currentModel.ITER_INDEX_YEAR <= endCursor.ITER_INDEX_YEAR) {
                        if (currentModel.ITER_INDEX_MONTH <= endCursor.ITER_INDEX_MONTH) {
                            if (this.growthType === GrowthType.ABSOLUTE) {
                                monthModels[cursor].GROWTH_INCREMENT = this.growth;
                            } else {
                                monthModels[cursor].GROWTH_INCREMENT = ((lastValue * this.growth) / 100);
                            }
                        }
                    }
                    monthModels[cursor].GROWTH_INCREMENT = Math.ceil(monthModels[cursor].GROWTH_INCREMENT);
                    monthModels[cursor].VALUE = lastValue + monthModels[cursor].GROWTH_INCREMENT;
                    if ((monthModels[cursor].ITER_INDEX_MONTH + 1) % 12 === (this.startDate.getMonth() % 12) || currentModel.ITER_INDEX_MONTH === endCursor.ITER_INDEX_MONTH) {
                        lastValue = monthModels[cursor].VALUE;
                    }
                }
                cursor = cursor + 1;
            }
        }
    }

    processForQuarterData() {
        this.forecastYears.forEach((year: ForecastYear) => {
            [1, 2, 3, 4].forEach((quarter: number, index: number) => {
                const model = new ForecastUnitModel(quarter, year.YEAR);
                model.LABEL = 'Q' + (index + 1);
                model.VALUE = year.MONTHS.filter((monthModel: ForecastUnitModel) => {
                    return monthModel.MONTH >= ((quarter - 1) * 3) && monthModel.MONTH < (quarter * 3);
                }).reduce((previousValue: number, currentValue: ForecastUnitModel): number => {
                    return previousValue + currentValue.VALUE;
                }, 0);
                model.GROWTH_INCREMENT = year.MONTHS.filter((monthModel: ForecastUnitModel) => {
                    return monthModel.MONTH >= ((quarter - 1) * 3) && monthModel.MONTH < (quarter * 3);
                }).reduce((previousValue: number, currentValue: ForecastUnitModel): number => {
                    return previousValue + currentValue.GROWTH_INCREMENT;
                }, 0);
                year.QUARTERS.push(model);
            });
        });
    }

    processForYearlyData() {
        this.forecastYears.forEach((year: ForecastYear) => {
            year.VALUE = year.MONTHS.reduce((previousValue: number, currentValue: ForecastUnitModel): number => {
                return previousValue + currentValue.VALUE;
            }, 0);
            year.GROWTH_INCREMENT = year.MONTHS.reduce((previousValue: number, currentValue: ForecastUnitModel): number => {
                return previousValue + currentValue.GROWTH_INCREMENT;
            }, 0);
        });
    }

    process() {
        this.init();
        this.processForTimePeriod();
        this.calculate();
        this.processForQuarterData();
        this.processForYearlyData();
        this.processForMaps();
    }

    processForMaps() {
        this.chartOptionsForMonthlyView = ChartsHelper.GetDataMapForMonthly(
            this.forecastYears,
            this.startDate,
            this.endDate,
            this.viewSelected,
            this.growthPeriod);
        this.chartOptionsForQuaterlyView = ChartsHelper.GetDataMapForQuaterly(
            this.forecastYears,
            this.startDate,
            this.endDate,
            this.viewSelected,
            this.growthPeriod);
        this.chartOptionsForYearlyView = ChartsHelper.GetDataMapForYearly(
            this.forecastYears,
            this.startDate,
            this.endDate,
            this.viewSelected,
            this.growthPeriod);
    }

    onDataViewChange() {
        this.processForMaps();
    }

    selectView(period: PeriodType) {
        this.chartViewSelected = period;
        this.processForMaps();
    }
}
