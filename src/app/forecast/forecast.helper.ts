import {
    SAMPLE,
    GrowthType,
    PeriodType,
    ForecastYear,
    ForecastUnitModel,
    ViewOption,
    MONTHNAMES
} from './forecast.models';
import { CurrencyDelimitedWithCommaPipe } from '../currency-delimited.pipe';

export module ChartsHelper {
    const currencyDelimitedWithCommaPipe: CurrencyDelimitedWithCommaPipe = new CurrencyDelimitedWithCommaPipe();
    export function GetDataMapForMonthly(
        ForecastYears: ForecastYear[],
        StartDate: Date,
        EndDate: Date,
        ViewSelected: ViewOption,
        Period: PeriodType) {

        const TimePeriod = 'Month';
        const title = `Estimated ${ViewSelected === ViewOption.INCREMENTS ? 'Increments' : ViewSelected === ViewOption.RESULTS ? 'Actuals' : ' Increment in Percent'} ${TimePeriod} On ${TimePeriod}`;
        let models: ForecastUnitModel[] = [];
        ForecastYears.forEach((year: ForecastYear) => {
            models = models.concat(year.MONTHS);
        });
        const series = [{
            data: models.map((model: ForecastUnitModel) => {
                return ViewSelected === ViewOption.RESULTS ? model.VALUE :
                    ViewSelected === ViewOption.INCREMENTS ? model.INCREMENT : model.INCREMENT_PERCENT;
            }),
            name: title
        }];
        const xAxis = {
            categories: models.map((model: ForecastUnitModel) => {
                return MONTHNAMES[model.MONTH] + ' ' + (model.YEAR % 100);
            })
        };
        const yAxis = {
            title: {
                text: `${ViewSelected === ViewOption.INCREMENTS ? 'Increments ($)' : ViewSelected === ViewOption.RESULTS ? 'Actuals ($)' : 'Increment in Percent (%)'}`
            }
        };
        const plotOptions = {
            line: {
                dataLabels: {
                    enabled: true,
                    formatter: function () {
                        if (ViewSelected === ViewOption.INCREMENTS || ViewSelected === ViewOption.RESULTS) {
                            return currencyDelimitedWithCommaPipe.transform(this.y, []);
                        }
                        return this.y;
                    }
                },
                enableMouseTracking: false
            }
        };
        return {
            series: series,
            xAxis: xAxis,
            yAxis: yAxis,
            plotOptions: plotOptions,
            title: title
        };
    }
    function GetFilteredModels(
        ForecastYears: ForecastYear[],
        StartDate: Date,
        EndDate: Date,
        Period: PeriodType): ForecastUnitModel[] {

        let models: ForecastUnitModel[] = [];
        ForecastYears.forEach((year: ForecastYear) => {
            models = models.concat(year.MONTHS);
        });
        const startCursor = models.find((model: ForecastUnitModel) => {
            return model.MONTH === StartDate.getMonth() && model.YEAR === StartDate.getFullYear();
        });
        const endCursor = models.find((model: ForecastUnitModel) => {
            return model.MONTH === EndDate.getMonth() && model.YEAR === EndDate.getFullYear();
        });
        models = models.filter((model: ForecastUnitModel) => {
            if (Period === PeriodType.MONTHLY) {
                return model.ITER_INDEX_MONTH >= startCursor.ITER_INDEX_MONTH && model.ITER_INDEX_MONTH <= endCursor.ITER_INDEX_MONTH;
            } else if (Period === PeriodType.QUARTERLY) {
                return model.ITER_INDEX_MONTH >= startCursor.ITER_INDEX_MONTH
                    && model.ITER_INDEX_MONTH <= endCursor.ITER_INDEX_MONTH
                    && model.ITER_INDEX_QUARTER >= startCursor.ITER_INDEX_QUARTER
                    && model.ITER_INDEX_QUARTER <= endCursor.ITER_INDEX_QUARTER;
            } else if (Period === PeriodType.YEARLY) {
                return model.ITER_INDEX_MONTH >= startCursor.ITER_INDEX_MONTH
                    && model.ITER_INDEX_MONTH <= endCursor.ITER_INDEX_MONTH
                    && model.ITER_INDEX_YEAR >= startCursor.ITER_INDEX_YEAR
                    && model.ITER_INDEX_YEAR <= endCursor.ITER_INDEX_YEAR;
            } else {
                return false;
            }
        });
        return models;
    }
    export function GetDataMapForQuaterly(
        ForecastYears: ForecastYear[],
        StartDate: Date,
        EndDate: Date,
        ViewSelected: ViewOption,
        Period: PeriodType) {

        const TimePeriod = 'Quarter';
        const title = `Estimated ${ViewSelected === ViewOption.INCREMENTS ? 'Increments' : ViewSelected === ViewOption.RESULTS ? 'Actuals' : ' Increment in Percent'} ${TimePeriod} On ${TimePeriod}`;
        let models: ForecastUnitModel[] = [];
        ForecastYears.forEach((year: ForecastYear) => {
            models = models.concat(year.QUARTERS);
        });
        const series = [{
            data: models.map((model: ForecastUnitModel) => {
                return ViewSelected === ViewOption.RESULTS ? model.VALUE :
                    ViewSelected === ViewOption.INCREMENTS ? model.INCREMENT : model.INCREMENT_PERCENT;
            }),
            name: title
        }];
        const xAxis = {
            categories: models.map((model: ForecastUnitModel) => {
                return model.YEAR + ' ' + model.LABEL;
            })
        };
        const yAxis = {
            title: {
                text: `${ViewSelected === ViewOption.INCREMENTS ? 'Increments ($)' : ViewSelected === ViewOption.RESULTS ? 'Actuals ($)' : 'Increment in Percent (%)'}`
            }
        };
        const pipeRef = this.currencyDelimitedWithCommaPipe;
        const plotOptions = {
            line: {
                dataLabels: {
                    enabled: true,
                    formatter: function () {
                        if (ViewSelected === ViewOption.INCREMENTS || ViewSelected === ViewOption.RESULTS) {
                            return currencyDelimitedWithCommaPipe.transform(this.y, []);
                        }
                        return this.y;
                    }
                },
                enableMouseTracking: false
            }
        };
        return {
            series: series,
            xAxis: xAxis,
            yAxis: yAxis,
            plotOptions: plotOptions,
            title: title
        }
    }
    export function GetDataMapForYearly(
        ForecastYears: ForecastYear[],
        StartDate: Date,
        EndDate: Date,
        ViewSelected: ViewOption,
        Period: PeriodType) {

        const TimePeriod = 'Year';
        const title = `Estimated ${ViewSelected === ViewOption.INCREMENTS ? 'Increments' : ViewSelected === ViewOption.RESULTS ? 'Actuals' : ' Increment in Percent'} ${TimePeriod} On ${TimePeriod}`;
        const series = [{
            data: ForecastYears.map((model: ForecastYear) => {
                return ViewSelected === ViewOption.RESULTS ? model.VALUE :
                    ViewSelected === ViewOption.INCREMENTS ? model.INCREMENT : model.INCREMENT_PERCENT;
            }),
            name: title
        }];
        const xAxis = {
            categories: ForecastYears.map((model: ForecastYear) => {
                return model.YEAR;
            })
        };
        const yAxis = {
            title: {
                text: `${ViewSelected === ViewOption.INCREMENTS ? 'Increments ($)' : ViewSelected === ViewOption.RESULTS ? 'Actuals ($)' : 'Increment in Percent (%)'}`
            }
        };
        const plotOptions = {
            line: {
                dataLabels: {
                    enabled: true,
                    formatter: function () {
                        if (ViewSelected === ViewOption.INCREMENTS || ViewSelected === ViewOption.RESULTS) {
                            return currencyDelimitedWithCommaPipe.transform(this.y, []);
                        }
                        return this.y;
                    }
                },
                enableMouseTracking: false
            }
        };
        return {
            series: series,
            xAxis: xAxis,
            yAxis: yAxis,
            plotOptions: plotOptions,
            title: title
        }
    }
}

export module ChartsInitializer {
    export function Initialize(Highcharts: any) {
        Highcharts.createElement('link', {
            href: 'https://fonts.googleapis.com/css?family=Dosis:400,600',
            rel: 'stylesheet',
            type: 'text/css'
        }, null, document.getElementsByTagName('head')[0]);

        Highcharts.theme = {
            colors: ['#106CC8', '#f7a35c', '#90ee7e', '#7798BF', '#aaeeee', '#ff0066', '#eeaaee',
                '#55BF3B', '#DF5353', '#7798BF', '#aaeeee'],
            chart: {
                backgroundColor: null,
                style: {
                    fontFamily: 'Dosis, sans-serif'
                }
            },
            title: {
                style: {
                    fontSize: '16px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                }
            },
            tooltip: {
                borderWidth: 0,
                backgroundColor: 'rgba(219,219,216,0.8)',
                shadow: false
            },
            legend: {
                itemStyle: {
                    fontWeight: 'bold',
                    fontSize: '13px'
                }
            },
            xAxis: {
                gridLineWidth: 1,
                labels: {
                    style: {
                        fontSize: '12px'
                    }
                }
            },
            yAxis: {
                minorTickInterval: 'auto',
                title: {
                    style: {
                        textTransform: 'uppercase'
                    }
                },
                labels: {
                    style: {
                        fontSize: '12px'
                    }
                }
            },
            plotOptions: {
                candlestick: {
                    lineColor: '#404048'
                }
            },


            // General
            background2: '#F0F0EA'

        };

        // Apply the theme
        Highcharts.setOptions(Highcharts.theme);
    }
}

export const BrowserDetect = {
    init: function () {
        this.browser = this.searchString(this.dataBrowser) || "Other";
        this.version = this.searchVersion(navigator.userAgent) || this.searchVersion(navigator.appVersion) || "Unknown";
    },
    searchString: function (data) {
        for (let i = 0; i < data.length; i++) {
            const dataString = data[i].string;
            this.versionSearchString = data[i].subString;

            if (dataString.indexOf(data[i].subString) !== -1) {
                return data[i].identity;
            }
        }
    },
    searchVersion: function (dataString) {
        const index = dataString.indexOf(this.versionSearchString);
        if (index === -1) {
            return;
        }

        const rv = dataString.indexOf("rv:");
        if (this.versionSearchString === "Trident" && rv !== -1) {
            return parseFloat(dataString.substring(rv + 3));
        } else {
            return parseFloat(dataString.substring(index + this.versionSearchString.length + 1));
        }
    },
    isSafari: function() : Boolean {
        this.init();
        if (this.browser === 'Safari') {
            return true;
        }
        return false;
    },
    dataBrowser: [
        { string: navigator.userAgent, subString: "Edge", identity: "MS Edge" },
        { string: navigator.userAgent, subString: "MSIE", identity: "Explorer" },
        { string: navigator.userAgent, subString: "Trident", identity: "Explorer" },
        { string: navigator.userAgent, subString: "Firefox", identity: "Firefox" },
        { string: navigator.userAgent, subString: "Opera", identity: "Opera" },
        { string: navigator.userAgent, subString: "OPR", identity: "Opera" },

        { string: navigator.userAgent, subString: "Chrome", identity: "Chrome" },
        { string: navigator.userAgent, subString: "Safari", identity: "Safari" }
    ]
}
