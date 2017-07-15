
import { Component, Input, Output, AfterViewInit, EventEmitter } from '@angular/core';
declare var XLSX: any;

@Component({
    selector: 'app-xl-file-ctrl',
    template: `<button class="xl-file-ctrl" title="Upload file" ><i class="fa fa-upload"></i> <input type="file" id="filectrl" /></button>`,
    styleUrls: ['./xl-file.component.scss']
})
export class XlFileComponent implements AfterViewInit {

    @Input() label: string = 'Import';

    @Output() xlsContentUpdated = new EventEmitter(false);

    constructor() {

    }

    ngAfterViewInit() {
        const self = this;
        let elm = document.getElementById('filectrl');
        elm.addEventListener('change', (e: any) => {
            var files = e.target.files;
            var i, f;
            for (i = 0; i != files.length; ++i) {
                f = files[i];
                var reader = new FileReader();
                var name = f.name;
                reader.onload = function (e) {
                    var data = e.target['result'];
                    var workbook;
                    workbook = XLSX.read(data, { type: 'binary' });
                    var result = [];
                    workbook.SheetNames.forEach(function (sheetName) {
                        var roa = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
                        if (roa.length > 0) {
                            result.push({ 'sheetname': sheetName, data: roa });
                        }
                    });
                    self.xlsContentUpdated.emit(result);
                    elm['value'] = null;
                    e.target['files'] = null;                
                };
                reader.readAsBinaryString(f);
            }
        }, false);
    }
}
