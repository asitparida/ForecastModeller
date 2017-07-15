export class ForecastModel {
    value: number;
    delta: number;
}

export class Forecast {
    years: any[];
    quarters: any[];
    months: any[];
}

export enum PeriodType {
    MONTHLY,
    QUARTERLY,
    YEARLY
}

export enum GrowthType {
    PERCENT,
    ABSOLUTE
}

export enum ViewOption {
    INCREMENTS,
    RESULTS,
    PERCENT
}

export const MONTHNAMES: any[] = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC"
];
export let SAMPLE = [
    { "YEAR": "2016", "JAN": "100", "FEB": "101", "MAR": "102", "APR": "103", "MAY": "104", "JUN": "105", "JUL": "106", "AUG": "107", "SEP": "108", "OCT": "109", "NOV": "110", "DEC": "111" },
    { "YEAR": "2017", "JAN": "101", "FEB": "102", "MAR": "103", "APR": "104", "MAY": "105", "JUN": "106", "JUL": "107", "AUG": "108", "SEP": "109", "OCT": "110", "NOV": "111", "DEC": "112" },
    { "YEAR": "2018", "JAN": "102", "FEB": "103", "MAR": "104", "APR": "105", "MAY": "106", "JUN": "107", "JUL": "108", "AUG": "109", "SEP": "110", "OCT": "111", "NOV": "112", "DEC": "113" },
    { "YEAR": "2019", "JAN": "103", "FEB": "104", "MAR": "105", "APR": "106", "MAY": "107", "JUN": "108", "JUL": "109", "AUG": "110", "SEP": "111", "OCT": "112", "NOV": "113", "DEC": "114" },
    { "YEAR": "2020", "JAN": "104", "FEB": "105", "MAR": "106", "APR": "107", "MAY": "108", "JUN": "109", "JUL": "110", "AUG": "111", "SEP": "112", "OCT": "113", "NOV": "114", "DEC": "115" },
    { "YEAR": "2021", "JAN": "105", "FEB": "106", "MAR": "107", "APR": "108", "MAY": "109", "JUN": "110", "JUL": "111", "AUG": "112", "SEP": "113", "OCT": "114", "NOV": "115", "DEC": "116" },
    { "YEAR": "2022", "JAN": "106", "FEB": "107", "MAR": "108", "APR": "109", "MAY": "110", "JUN": "111", "JUL": "112", "AUG": "113", "SEP": "114", "OCT": "115", "NOV": "116", "DEC": "117" },
    { "YEAR": "2023", "JAN": "107", "FEB": "108", "MAR": "109", "APR": "110", "MAY": "111", "JUN": "112", "JUL": "113", "AUG": "114", "SEP": "115", "OCT": "116", "NOV": "117", "DEC": "118" },
    { "YEAR": "2024", "JAN": "108", "FEB": "109", "MAR": "110", "APR": "111", "MAY": "112", "JUN": "113", "JUL": "114", "AUG": "115", "SEP": "116", "OCT": "117", "NOV": "118", "DEC": "119" },
    { "YEAR": "2025", "JAN": "109", "FEB": "110", "MAR": "111", "APR": "112", "MAY": "113", "JUN": "114", "JUL": "115", "AUG": "116", "SEP": "117", "OCT": "118", "NOV": "119", "DEC": "120" }
];

export class ForecastUnitModel {
    MONTH: number;
    LABEL: string;
    VALUE: number;
    VALUE_PERCENT: number;
    INCREMENT: number;
    INCREMENT_PERCENT: number;
    YEAR: number;
    ITER_INDEX_MONTH: number;
    ITER_INDEX_QUARTER: number;
    ITER_INDEX_YEAR: number;
    MANUAL_VALUE: number;
    MANUAL_INCREMENT: number;
    MANUAL_INCREMENT_PERCENT: number;
    constructor(index, year?) {
        this.MONTH = index;
        this.LABEL = MONTHNAMES[index];
        this.VALUE = 0;
        this.YEAR = year;
        this.INCREMENT = 0;
        this.VALUE = 0;
        this.MANUAL_INCREMENT = 0;
        this.MANUAL_VALUE = 0;
        this.MANUAL_INCREMENT_PERCENT  = 0;
        this.INCREMENT_PERCENT = 0;
        this.VALUE_PERCENT = 0;
    }
}

export class ForecastYear {
    VALUE: number;
    VALUE_PERCENT: number;
    INCREMENT: number;
    INCREMENT_PERCENT: number;
    YEAR: number;
    MONTHS: ForecastUnitModel[] = [];
    QUARTERS: ForecastUnitModel[] = [];
    MANUAL_INCREMENT: number;
    MANUAL_VALUE: number;
    MANUAL_INCREMENT_PERCENT: number;
    constructor() {
        MONTHNAMES.forEach((MONTH, index) => {
            const model = new ForecastUnitModel(index);
            this.MONTHS.push(model);
        });
        this.MANUAL_INCREMENT = 0;
        this.MANUAL_VALUE = 0;
        this.MANUAL_INCREMENT_PERCENT = 0;
        this.INCREMENT_PERCENT = 0;
        this.VALUE_PERCENT = 0;
        this.VALUE = 0;
        this.INCREMENT = 0;
    }
}

export interface XlsUploadRow {
    YEAR: number;
    JAN: number;
    FEB: number;
    MAR: number;
    APR: number;
    MAY: number;
    JUN: number;
    JUL: number;
    AUG: number;
    SEP: number;
    OCT: number;
    NOV: number;
    DEC: number;
}