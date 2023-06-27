import { Component } from '@angular/core';
import { read, utils, writeFile, writeFileXLSX, writeXLSX, WritingOptions, stream } from 'xlsx';
import {HttpClient} from '@angular/common/http';


@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent {
    movies: any[] = [];

    datosRecibidos : any;

    constructor(private http: HttpClient) {

    }

    handleImport($event: any) {
        const files = $event.target.files;
        if (files.length) {
            const file = files[0];
            const reader = new FileReader();
            reader.onload = (event: any) => {
                const wb = read(event.target.result);
                const sheets = wb.SheetNames;

                if (sheets.length) {
                    const rows = utils.sheet_to_json(wb.Sheets[sheets[0]]);
                    this.movies = rows;
                    // recorremos todas las filas llamamos al servicio de enriquecer
                    /*for(let m of this.movies) {
                        console.log(m.Category);
                        m.Codigo = 'AAAAA';
                        console.log(JSON.stringify(m));
                    }*/
                }
            }
            reader.readAsArrayBuffer(file);
        }
    }


    handleExport() {
        const headings = [[
            'id',
            /*'ID_proyecto',
            'collection',
            'dc_contributor_funder',
            //'Codigo',*/
            'dc_relation_projectID',
            'dc_identifier_uri',
            'dc_relation_nameGl3',
            'dc_relation_nameGl4'
        ]];


        const wb = utils.book_new();
        const ws: any = utils.json_to_sheet([]);
        const wriOpts : WritingOptions = {
            bookType : "csv"
        };


        utils.sheet_add_aoa(ws, headings);
        utils.sheet_add_json(ws, this.movies, { origin: 'A2', skipHeader: true });
        utils.book_append_sheet(wb, ws, 'Report');
        //const csvStr: string = utils.sheet_to_csv(ws);
        console.log(utils.sheet_to_csv(ws, {FS:",",RS:"\n", forceQuotes:true}));        
        const csvStr: string = utils.sheet_to_csv(ws, {FS:",",RS:"\n", forceQuotes:true})


        //writeFile(wb, 'Movie Report.xlsx');
        //writeFile(wb, 'EnriqExportacion.csv', wriOpts);
        // chapu
        const blob = new Blob([csvStr], {type: 'text/csv'});
        const aa = document.createElement('a');
        aa.href = URL.createObjectURL(blob);
        aa.click();
        //var aaa  = stream.to_csv(ws, {FS:",",RS:"\n", forceQuotes:true});
        
        //console.log(utils.sheet_to_csv(ws, {FS:",",RS:"\n", forceQuotes:true}));
    }

    llamarWs() {
        console.log('Llamada Ws');

        for(let m of this.movies) {
            //console.log(m.Collection);
            //m.Codigo = 'ITC-20161162-2';
            console.log(JSON.stringify(m));

            this.getLlamda(m);
        }
    }

    getLlamda(rowSelected:any) {
        if(rowSelected.dc_relation_projectID != undefined && rowSelected.dc_relation_projectID != null &&
            rowSelected.dc_relation_projectID != '') {
                this.http.get('https://buscador.recolecta.fecyt.es/api/rest/proyectos?codigo=' + rowSelected.dc_relation_projectID)
                .subscribe( data => { 
                    this.datosRecibidos = data; 
                    if(this.datosRecibidos != undefined && this.datosRecibidos != null) {
                        if(this.datosRecibidos.length > 0) {
                            console.log('Que devuelve:' + JSON.stringify(this.datosRecibidos));
                            console.log('Que devuelve:' + this.datosRecibidos[0].proyecto);
                            rowSelected.dc_relation_nameGl3 = this.datosRecibidos[0].proyecto;
                        }
                    }
                } );
        
                this.http.get('https://buscador.recolecta.fecyt.es/api/rest/proyectos?codigo=' + rowSelected.dc_relation_projectID + '&glv=4')
                .subscribe( data => { 
                    this.datosRecibidos = data; 
                    if(this.datosRecibidos != undefined && this.datosRecibidos != null) {
                        if(this.datosRecibidos.length > 0) {
                            console.log('Que devuelve:' + JSON.stringify(this.datosRecibidos));
                            console.log('Que devuelve:' + this.datosRecibidos[0].proyecto);
                            rowSelected.dc_relation_nameGl4 = this.datosRecibidos[0].proyecto;
                        }
                    }
                } );
        }
    }
       
}
