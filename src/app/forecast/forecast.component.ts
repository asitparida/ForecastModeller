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
import {
    ChartsHelper,
    BrowserDetect
} from './forecast.helper';

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

    manualStartValue: number;
    manualGrowthType: GrowthType;
    manualGrowth: number;
    manualApplyAcross: string = 'all';
    manualCurrentRowYear: number;
    manualYearsAvailable: { label: string, value: number }[]
    manualYearOptionSelected: number;

    showSliderMenu: Boolean = false;
    chartOptionsForMonthlyView = null;
    chartOptionsForQuaterlyView = null;
    chartOptionsForYearlyView = null;
    showCharts: Boolean = false;

    viewOptions = [
        {
            value: ViewOption.RESULTS,
            label: 'Actuals'
        }, {
            value: ViewOption.INCREMENTS,
            label: 'Increments'
        }, {
            value: ViewOption.PERCENT,
            label: 'Percent'
        }
    ];
    editViewOptions = this.viewOptions;
    growthPeriodOptions = [
        {
            value: PeriodType.MONTHLY,
            label: 'Monthly'
        }, {
            value: PeriodType.QUARTERLY,
            label: 'Quarterly'
        }, {
            value: PeriodType.YEARLY,
            label: 'Yearly'
        }
    ];
    growthTypeOptions = [
        {
            value: GrowthType.ABSOLUTE,
            label: 'Absolute'
        }, {
            value: GrowthType.PERCENT,
            label: 'Percent'
        }
    ];

    viewSelected = ViewOption.RESULTS;
    chartViewSelected = PeriodType.MONTHLY;
    editViewSelected = ViewOption.RESULTS;

    VIEW_OPTIONS = ViewOption;
    PERIOD_TYPE_OPTIONS = PeriodType;
    GROWTH_TYPE_OPTIONS = GrowthType;

    isSafariBrowser: Boolean = false;

    private startDate: Date;
    private endDate: Date;

    private forecastStartDate = new Date('1/15/2016');
    private forecastEndDate = new Date('1/15/2022');

    forecastYears: ForecastYear[] = [];

    constructor() {
        this.isSafariBrowser = BrowserDetect.isSafari();
        this.forecastYears = [];
        this.startValue = 100;
        this.startDateStr = '2016-01-15';
        this.endDateStr = '2021-12-15';
        this.growth = 10;
        this.growthType = GrowthType.PERCENT;
        this.growthPeriod = PeriodType.MONTHLY;
        this.manualGrowth = 0;
        this.manualGrowthType = GrowthType.ABSOLUTE;
        this.manualStartValue = 0;
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
        const years = monthModels.map((item: ForecastUnitModel) => {
            return item.YEAR;
        }).filter(onlyUnique);
        let MONTH_INDEXER: number = 0;
        let QUARTER_INDEXER: number = 0;
        let START_QUARTER_INCREMENT: Boolean = false;
        let YEAR_INDEXER: number = 0;
        let START_YEAR_INCREMENT: Boolean = false;
        years.forEach((year: number) => {
            const fy = new ForecastYear();
            fy.YEAR = year;
            fy.MONTHS = monthModels.filter((item: ForecastUnitModel) => {
                return item.YEAR === year;
            });
            fy
                .MONTHS
                .sort((a: ForecastUnitModel, b: ForecastUnitModel) => {
                    return a.MONTH - b.MONTH;
                });
            fy
                .MONTHS
                .forEach((month: ForecastUnitModel) => {
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
            this
                .forecastYears
                .push(fy);
        });
    }

    calculate() {
        let monthModels: ForecastUnitModel[] = [];
        this
            .forecastYears
            .forEach((year: ForecastYear) => {
                monthModels = monthModels.concat(year.MONTHS);
            });
        let lastValue: number = 0;
        const startCursor = monthModels.find((model: ForecastUnitModel) => {
            return model.MONTH === this
                .startDate
                .getMonth() && model.YEAR === this
                    .startDate
                    .getFullYear();
        });
        const endCursor = monthModels.find((model: ForecastUnitModel) => {
            return model.MONTH === this
                .endDate
                .getMonth() && model.YEAR === this
                    .endDate
                    .getFullYear();
        });
        if (this.growthPeriod === PeriodType.MONTHLY) {
            let cursor = startCursor.ITER_INDEX_MONTH;
            let lastIncrement = 0;
            while (cursor < monthModels.length) {
                if (cursor === startCursor.ITER_INDEX_MONTH) {
                    monthModels[cursor].VALUE = this.startValue;
                    lastValue = monthModels[cursor].VALUE;
                } else {
                    if (cursor > startCursor.ITER_INDEX_MONTH && cursor <= endCursor.ITER_INDEX_MONTH) {
                        if (this.growthType === GrowthType.ABSOLUTE) {
                            monthModels[cursor].INCREMENT = this.growth;
                        } else {
                            monthModels[cursor].INCREMENT = ((lastValue * this.growth) / 100);
                        }
                        // monthModels[cursor].INCREMENT_PERCENT = this.growth;
                    }
                    monthModels[cursor].VALUE = lastValue + monthModels[cursor].INCREMENT;
                    monthModels[cursor].INCREMENT_PERCENT = lastValue === 0 ? 0 : ((monthModels[cursor].VALUE / lastValue) - 1) * 100;
                    monthModels[cursor].VALUE = this.roundValue(monthModels[cursor].VALUE);
                    monthModels[cursor].INCREMENT = this.roundValue(monthModels[cursor].INCREMENT);
                    monthModels[cursor].INCREMENT_PERCENT = this.roundValue(monthModels[cursor].INCREMENT_PERCENT);
                    lastValue = monthModels[cursor].VALUE;
                    lastIncrement = monthModels[cursor].INCREMENT;
                }
                cursor = cursor + 1;
            }
        } else if (this.growthPeriod === PeriodType.QUARTERLY) {
            let cursor = startCursor.ITER_INDEX_MONTH;
            while (cursor < monthModels.length) {
                const currentModel = monthModels[cursor];
                if (currentModel.ITER_INDEX_QUARTER === startCursor.ITER_INDEX_QUARTER) {
                    monthModels[cursor].VALUE = currentModel.ITER_INDEX_MONTH >= startCursor.ITER_INDEX_MONTH
                        ? this.startValue
                        : monthModels[cursor].VALUE;
                    lastValue = monthModels[cursor].VALUE;
                } else {
                    if (currentModel.ITER_INDEX_QUARTER > startCursor.ITER_INDEX_QUARTER && currentModel.ITER_INDEX_QUARTER <= endCursor.ITER_INDEX_QUARTER) {
                        if (currentModel.ITER_INDEX_MONTH <= endCursor.ITER_INDEX_MONTH) {
                            if ((monthModels[cursor].ITER_INDEX_MONTH) % 3 === (this.startDate.getMonth() % 3)) {
                                if (this.growthType === GrowthType.ABSOLUTE) {
                                    monthModels[cursor].INCREMENT = this.growth;
                                } else {
                                    monthModels[cursor].INCREMENT = ((lastValue * this.growth) / 100);
                                }
                            }
                        }
                    }
                    monthModels[cursor].VALUE = lastValue + monthModels[cursor].INCREMENT;
                    monthModels[cursor].INCREMENT_PERCENT = ((monthModels[cursor].VALUE - lastValue) / lastValue) * 100;
                    monthModels[cursor].VALUE = this.roundValue(monthModels[cursor].VALUE);
                    monthModels[cursor].INCREMENT = this.roundValue(monthModels[cursor].INCREMENT);
                    monthModels[cursor].INCREMENT_PERCENT = this.roundValue(monthModels[cursor].INCREMENT_PERCENT);
                    lastValue = monthModels[cursor].VALUE;
                }
                cursor = cursor + 1;
            }
        } else {
            let cursor = startCursor.ITER_INDEX_MONTH;
            while (cursor < monthModels.length) {
                const currentModel = monthModels[cursor];
                if (currentModel.ITER_INDEX_YEAR === startCursor.ITER_INDEX_YEAR) {
                    monthModels[cursor].VALUE = currentModel.ITER_INDEX_YEAR >= startCursor.ITER_INDEX_YEAR
                        ? this.startValue
                        : monthModels[cursor].VALUE;
                    lastValue = monthModels[cursor].VALUE;
                } else {
                    if (currentModel.ITER_INDEX_YEAR > startCursor.ITER_INDEX_YEAR && currentModel.ITER_INDEX_YEAR <= endCursor.ITER_INDEX_YEAR) {
                        if (currentModel.ITER_INDEX_MONTH <= endCursor.ITER_INDEX_MONTH) {
                            if ((monthModels[cursor].ITER_INDEX_MONTH) % 12 === (this.startDate.getMonth() % 12)) {
                                if (this.growthType === GrowthType.ABSOLUTE) {
                                    monthModels[cursor].INCREMENT = this.growth;
                                } else {
                                    monthModels[cursor].INCREMENT = ((lastValue * this.growth) / 100);
                                }
                            }
                        }
                    }
                    monthModels[cursor].VALUE = lastValue + monthModels[cursor].INCREMENT;
                    monthModels[cursor].INCREMENT_PERCENT = ((monthModels[cursor].VALUE - lastValue) / lastValue) * 100;
                    monthModels[cursor].INCREMENT_PERCENT = this.roundValue(monthModels[cursor].INCREMENT_PERCENT);
                    monthModels[cursor].VALUE = this.roundValue(monthModels[cursor].VALUE);
                    monthModels[cursor].INCREMENT = this.roundValue(monthModels[cursor].INCREMENT);
                    lastValue = monthModels[cursor].VALUE;
                }
                cursor = cursor + 1;
            }
        }
    }

    processForQuarterData() {
        let lastValue = 0;
        this
            .forecastYears
            .forEach((year: ForecastYear) => {
                year.QUARTERS = [];
                [1, 2, 3, 4].forEach((quarter: number, index: number) => {
                    const model = new ForecastUnitModel(quarter, year.YEAR);
                    model.LABEL = 'Q' + (index + 1);
                    let quarterMultiplier = 3;
                    model.VALUE = year
                        .MONTHS
                        .filter((monthModel: ForecastUnitModel) => {
                            return monthModel.MONTH >= ((quarter - 1) * 3) && monthModel.MONTH < (quarter * 3);
                        })
                        .reduce((previousValue: number, currentValue: ForecastUnitModel): number => {
                            return previousValue + currentValue.VALUE;
                        }, 0);
                    // model.INCREMENT = year
                    //     .MONTHS
                    //     .filter((monthModel: ForecastUnitModel) => {
                    //         return monthModel.MONTH >= ((quarter - 1) * 3) && monthModel.MONTH < (quarter * 3);
                    //     })
                    //     .reduce((previousValue: number, currentValue: ForecastUnitModel): number => {
                    //         return previousValue + currentValue.INCREMENT;
                    //     }, 0);
                    model.INCREMENT = model.VALUE - lastValue;
                    // model.INCREMENT = model.INCREMENT * 3;
                    model.INCREMENT_PERCENT = year
                        .MONTHS
                        .filter((monthModel: ForecastUnitModel) => {
                            return monthModel.MONTH >= ((quarter - 1) * 3) && monthModel.MONTH < (quarter * 3);
                        })
                        .reduce((previousValue: number, currentValue: ForecastUnitModel): number => {
                            return previousValue * (1 + (currentValue.INCREMENT_PERCENT / 100));
                        }, 1);
                    model.INCREMENT_PERCENT = (model.INCREMENT_PERCENT - 1) * 100;
                    model.INCREMENT_PERCENT = this.roundValue(model.INCREMENT_PERCENT);
                    model.INCREMENT = this.roundValue(model.INCREMENT);
                    model.VALUE = this.roundValue(model.VALUE);
                    lastValue = model.VALUE;
                    year
                        .QUARTERS
                        .push(model);
                });
            });
    }

    processForYearlyData() {
        let lastValue = 0;
        this
            .forecastYears
            .forEach((year: ForecastYear) => {
                year.VALUE = year
                    .MONTHS
                    .reduce((previousValue: number, currentValue: ForecastUnitModel): number => {
                        return previousValue + currentValue.VALUE;
                    }, 0);
                // year.INCREMENT = year
                //     .MONTHS
                //     .reduce((previousValue: number, currentValue: ForecastUnitModel): number => {
                //         return previousValue + currentValue.INCREMENT;
                //     }, 0);
                year.INCREMENT = year.VALUE - lastValue;
                year.INCREMENT_PERCENT = year
                    .MONTHS
                    .reduce((previousValue: number, currentValue: ForecastUnitModel): number => {
                        return previousValue * (1 + (currentValue.INCREMENT_PERCENT / 100));
                    }, 1);
                year.INCREMENT_PERCENT = (year.INCREMENT_PERCENT - 1) * 100;
                year.INCREMENT_PERCENT = this.roundValue(year.INCREMENT_PERCENT);
                year.INCREMENT = this.roundValue(year.INCREMENT);
                year.VALUE = this.roundValue(year.VALUE);
                lastValue = year.VALUE;
            });
        this.forecastYears.forEach((year: ForecastYear) => {
            year.MANUAL_INCREMENT = year.INCREMENT;
            year.MANUAL_INCREMENT_PERCENT = year.INCREMENT_PERCENT;
            year.MANUAL_VALUE = year.VALUE;
            year.MONTHS.forEach((model: ForecastUnitModel) => {
                model.MANUAL_INCREMENT = model.INCREMENT;
                model.MANUAL_INCREMENT_PERCENT = model.INCREMENT_PERCENT;
                model.MANUAL_VALUE = model.VALUE;
            });
            year.QUARTERS.forEach((model: ForecastUnitModel) => {
                model.MANUAL_INCREMENT = model.INCREMENT;
                model.MANUAL_INCREMENT_PERCENT = model.INCREMENT_PERCENT;
                model.MANUAL_VALUE = model.VALUE;
            });
            this.manualStartValue = this.startValue;
        });
    }

    onXlsFileContentUpdate($event) {
        const rows: any[] = $event[0].data;
        if (rows) {
            let lastValue = rows[0]['JAN'];
            if (this.editViewSelected === ViewOption.RESULTS) {
                this.manualStartValue = lastValue;
            }
            this
                .forecastYears
                .forEach((year: ForecastYear) => {
                    const row = rows.find((item: any) => {
                        return parseInt(item.YEAR) === year.YEAR;
                    });
                    if (row) {
                        year
                            .MONTHS
                            .forEach((model: ForecastUnitModel) => {
                                if (this.editViewSelected === ViewOption.RESULTS) {
                                    model.MANUAL_VALUE = parseFloat(row[MONTHNAMES[model.MONTH]]);
                                } else if (this.editViewSelected === ViewOption.INCREMENTS) {
                                    model.MANUAL_INCREMENT = parseFloat(row[MONTHNAMES[model.MONTH]]);
                                } else if (this.editViewSelected === ViewOption.PERCENT) {
                                    model.MANUAL_INCREMENT_PERCENT = parseFloat(row[MONTHNAMES[model.MONTH]]);
                                }
                            });
                    }
                });
        }
    }

    saveManualData() {
        if (this.chartViewSelected === PeriodType.MONTHLY) {
            let lastValue = this.manualStartValue;
            this
                .forecastYears
                .forEach((year: ForecastYear, yearIndex: number) => {
                    year
                        .MONTHS
                        .forEach((model: ForecastUnitModel, monthIndex: number) => {
                            if (this.editViewSelected === ViewOption.RESULTS) {
                                model.MANUAL_INCREMENT = model.MANUAL_VALUE - lastValue;
                                model.MANUAL_INCREMENT_PERCENT = (model.MANUAL_INCREMENT / lastValue) * 100;
                            } else if (this.editViewSelected === ViewOption.INCREMENTS) {
                                model.MANUAL_VALUE = lastValue + model.MANUAL_INCREMENT;
                                model.MANUAL_INCREMENT_PERCENT = ((model.MANUAL_VALUE - lastValue) / lastValue) * 100;
                            } else if (this.editViewSelected === ViewOption.PERCENT) {
                                model.MANUAL_INCREMENT = (lastValue * model.MANUAL_INCREMENT_PERCENT) * 0.01;
                                model.MANUAL_VALUE = lastValue + model.MANUAL_INCREMENT;
                            }
                            model.MANUAL_INCREMENT = this.roundValue(model.MANUAL_INCREMENT);
                            model.MANUAL_INCREMENT_PERCENT = this.roundValue(model.MANUAL_INCREMENT_PERCENT);
                            model.MANUAL_VALUE = this.roundValue(model.MANUAL_VALUE);
                            model.INCREMENT_PERCENT = model.MANUAL_INCREMENT_PERCENT;
                            model.INCREMENT = model.MANUAL_INCREMENT;
                            model.VALUE = model.MANUAL_VALUE;
                            lastValue = model.MANUAL_VALUE;
                        });
                });
        } else if (this.chartViewSelected === PeriodType.QUARTERLY) {
            // if (this.editViewSelected === ViewOption.RESULTS) {
            //     this.manualStartValue = this.forecastYears[0].QUARTERS[0].MANUAL_VALUE / 3;
            // }
            let lastValue = this.manualStartValue;
            this
                .forecastYears
                .forEach((year: ForecastYear, yearIndex: number) => {
                    year.QUARTERS
                        .forEach((model: ForecastUnitModel, monthIndex: number) => {
                            if (this.editViewSelected === ViewOption.RESULTS) {
                                model.MANUAL_VALUE = this.roundValue(model.MANUAL_VALUE);
                                model.VALUE = model.MANUAL_VALUE;
                            } 
                            // else if (this.editViewSelected === ViewOption.INCREMENTS) {
                            //     model.MANUAL_INCREMENT = this.roundValue(model.MANUAL_INCREMENT);
                            //     model.INCREMENT = model.MANUAL_INCREMENT;
                            // }
                        });
                    year
                        .MONTHS
                        .forEach((model: ForecastUnitModel, monthIndex: number) => {
                            const corresponidngQuarter = year.QUARTERS[Math.floor(monthIndex / 3)];
                            if (this.editViewSelected === ViewOption.RESULTS) {
                                model.MANUAL_VALUE = corresponidngQuarter.MANUAL_VALUE / 3;
                                model.MANUAL_INCREMENT = model.MANUAL_VALUE - lastValue;
                                model.MANUAL_INCREMENT_PERCENT = lastValue === 0 ? 0 : (model.MANUAL_INCREMENT / lastValue) * 100;
                            } 
                            // else if (this.editViewSelected === ViewOption.INCREMENTS) {
                            //     model.MANUAL_INCREMENT = corresponidngQuarter.MANUAL_INCREMENT / 9;
                            //     model.MANUAL_VALUE = lastValue + model.MANUAL_INCREMENT;
                            //     model.MANUAL_INCREMENT_PERCENT = lastValue === 0 ? 0 : (model.MANUAL_INCREMENT / lastValue) * 100;
                            // }
                            model.MANUAL_INCREMENT = this.roundValue(model.MANUAL_INCREMENT);
                            model.MANUAL_INCREMENT_PERCENT = this.roundValue(model.MANUAL_INCREMENT_PERCENT);
                            model.MANUAL_VALUE = this.roundValue(model.MANUAL_VALUE);
                            model.INCREMENT_PERCENT = model.MANUAL_INCREMENT_PERCENT;
                            model.INCREMENT = model.MANUAL_INCREMENT;
                            model.VALUE = model.MANUAL_VALUE;
                            lastValue = model.MANUAL_VALUE;
                        });
                });
        } else {
            if (this.editViewSelected === ViewOption.RESULTS) {
                this.manualStartValue = this.forecastYears[0].MANUAL_VALUE / 12;
            }
            let lastValue = this.manualStartValue;
            this
                .forecastYears
                .forEach((year: ForecastYear, yearIndex: number) => {
                    year.MANUAL_VALUE = this.roundValue(year.MANUAL_VALUE);
                    year.VALUE = year.MANUAL_VALUE;
                    year.QUARTERS
                        .forEach((model: ForecastUnitModel, monthIndex: number) => {
                            if (this.editViewSelected === ViewOption.RESULTS) {
                                model.MANUAL_VALUE = year.MANUAL_VALUE / 4;
                                model.MANUAL_VALUE = this.roundValue(model.MANUAL_VALUE);
                                model.VALUE = model.MANUAL_VALUE;
                            }
                            // else if (this.editViewSelected === ViewOption.INCREMENTS) {
                            //     model.MANUAL_INCREMENT = year.MANUAL_INCREMENT / 4;
                            //     model.MANUAL_INCREMENT = this.roundValue(model.MANUAL_INCREMENT);
                            //     model.INCREMENT = model.MANUAL_INCREMENT;
                            // }
                        });
                    year
                        .MONTHS
                        .forEach((model: ForecastUnitModel, monthIndex: number) => {
                            const corresponidngQuarter = year.QUARTERS[Math.floor(monthIndex / 3)];
                            if (this.editViewSelected === ViewOption.RESULTS) {
                                model.MANUAL_VALUE = corresponidngQuarter.MANUAL_VALUE / 3;
                                model.MANUAL_INCREMENT = model.MANUAL_VALUE - lastValue;
                                model.MANUAL_INCREMENT_PERCENT = lastValue === 0 ? 0 : (model.MANUAL_INCREMENT / lastValue) * 100;
                            }
                            // else if (this.editViewSelected === ViewOption.INCREMENTS) {
                            //     model.MANUAL_INCREMENT = corresponidngQuarter.MANUAL_INCREMENT / 3;
                            //     model.MANUAL_VALUE = lastValue + model.MANUAL_INCREMENT;
                            //     model.MANUAL_INCREMENT_PERCENT = lastValue === 0 ? 0 : (model.MANUAL_INCREMENT / lastValue) * 100;
                            // }
                            model.MANUAL_INCREMENT = this.roundValue(model.MANUAL_INCREMENT);
                            model.MANUAL_INCREMENT_PERCENT = this.roundValue(model.MANUAL_INCREMENT_PERCENT);
                            model.MANUAL_VALUE = this.roundValue(model.MANUAL_VALUE);
                            model.INCREMENT_PERCENT = model.MANUAL_INCREMENT_PERCENT;
                            model.INCREMENT = model.MANUAL_INCREMENT;
                            model.VALUE = model.MANUAL_VALUE;
                            lastValue = model.MANUAL_VALUE;
                        });
                });
        }
        this.viewSelected = this.editViewSelected;
        this.processForQuarterData();
        this.processForYearlyData();
        this.processForMaps();
    }

    process() {
        this.init();
        this.processForTimePeriod();
        this.calculate();
        this.processForQuarterData();
        this.processForYearlyData();
        this.processForMaps();
        this.showSliderMenu = false;
    }

    processForMaps() {
        this.chartOptionsForMonthlyView = ChartsHelper.GetDataMapForMonthly(this.forecastYears, this.startDate, this.endDate, this.viewSelected, this.growthPeriod);
        this.chartOptionsForQuaterlyView = ChartsHelper.GetDataMapForQuaterly(this.forecastYears, this.startDate, this.endDate, this.viewSelected, this.growthPeriod);
        this.chartOptionsForYearlyView = ChartsHelper.GetDataMapForYearly(this.forecastYears, this.startDate, this.endDate, this.viewSelected, this.growthPeriod);
    }

    onDataViewChange() {
        this.processForMaps();
    }

    onDataTypeViewChange() {
        console.log(this);
    }

    selectView(period: PeriodType) {
        this.chartViewSelected = period;
        this.editViewOptions = this.viewOptions;
        if (this.isManual === true) {
            if (this.chartViewSelected === PeriodType.QUARTERLY || this.chartViewSelected === PeriodType.YEARLY) {
                this.editViewOptions = this.viewOptions.filter((option: any) => {
                    return option.value === ViewOption.RESULTS;
                });
                if (this.editViewSelected === ViewOption.PERCENT || this.editViewSelected === ViewOption.INCREMENTS) {
                    this.editViewSelected = ViewOption.RESULTS;
                }
            }
        }
        this.processForMaps();
    }

    onManualModeChange() {
        if (this.chartViewSelected === PeriodType.QUARTERLY || this.chartViewSelected === PeriodType.YEARLY) {
            this.editViewOptions = this.viewOptions.filter((option: any) => {
                return option.value === ViewOption.RESULTS;
            });
        }
        this.growthPeriod = PeriodType.MONTHLY;
    }

    applyManualProps() {
        if (this.manualGrowthType === GrowthType.ABSOLUTE) {
            this.editViewSelected = ViewOption.INCREMENTS;
        } else if (this.manualGrowthType === GrowthType.PERCENT) {
            this.editViewSelected = ViewOption.PERCENT;
        }
        this
            .forecastYears
            .forEach((year: ForecastYear) => {
                year
                    .MONTHS
                    .forEach((model: ForecastUnitModel) => {
                        if (this.manualYearOptionSelected === 0 || (this.manualYearOptionSelected === year.YEAR)) {
                            if (this.manualGrowthType === GrowthType.ABSOLUTE) {
                                model.MANUAL_INCREMENT = this.manualGrowth;
                            } else if (this.manualGrowthType === GrowthType.PERCENT) {
                                model.MANUAL_INCREMENT_PERCENT = this.manualGrowth;
                            }
                        }
                    });
            });
        this.showSliderMenu = false;
    }

    openEditSliderMenu() {
        this.manualYearsAvailable = this.forecastYears.map((year: ForecastYear) => {
            return { label: year.YEAR.toString(), value: year.YEAR };
        });
        this.manualYearsAvailable.push({ label: 'All Years', value: 0 });
        this.showSliderMenu = true;
    }

    roundValue(num: number) {
        num = parseFloat(num.toFixed(2));
        return num;
    }
}
