
/**
 *  Copyright  (c)  2022 ZipoSoft, Inc.  All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0.
  */

import * as Time from "./Time.js"
import {Data} from "ws";
class RowContext
{
    show_child=false;
}

export class ZDataTable
{
    table_id : string;
    rowContext: Map<any, RowContext> =null;
    numRows=0;

    options_dt : DataTables.Settings={
        dom: 't',
        pageLength: -1,
        autoWidth:false,
        lengthMenu: [[25, 50, 75, -1], [25, 50, 75, "All"]],
        columns: [            ],
        data : null

        //order: [[0,"desc"]],

    };
    options_zt ={
        enableRowChild: false,
        rowChildClickClose: true,
        dataUniqueId: ""
    };
    dt : DataTables.Api = null;

    create(table_id,options_dt : DataTables.Settings={ },options_zt= { }) {
        this.table_id = '#' + table_id;
        let self= this;

        for(let key in options_dt)
            this.options_dt[key]=options_dt[key];
        for(let key in options_zt)
            this.options_zt[key]=options_zt[key];
        if(this.options_zt.enableRowChild)
        {
            this.options_dt.createdRow=function ( row, data, index ) {

                return self.rowCreateCallback(row,data,index);
            }
        }
        this.rowContext= new Map();



        this.createTable();
    }

    createRowChild(rowData)
    {
        if (!rowData)     return;
        let json=JSON.stringify(rowData);
        let h=`<div>${json}</div>`;
        return h;
    }
    add(data:object,max=0)
    {
        this.dt.row.add(data);
        this.numRows++;


        if(max)
        {
            let num_rows=this.dt.rows( ).count()

            if(this.numRows>max)
            {
                this.dt.row(0).remove();
                this.numRows--;
            }

        }

        this.dt.draw(false);
    }
    refreshData(data: object[])
    {
        this.dt.clear();

        this.dt.rows.add(data);
        this.dt.draw(false);


    }
    rowCreateCallback(row, data,dataIndex)
    {
        let context =this.rowContext.get(data[this.options_zt.dataUniqueId]);
        if (context)
            if (context.show_child) {
                let jrow = this.dt.row(row);
                jrow.child(this.createRowChild(data)).show();
            }
    }
    onClickRow(rowdata)
    {

    }
    rowClickCallback(row_elm)
    {
        let row=this.dt.row(row_elm)
        let data = row.data();
        this.onClickRow(data);
        if(this.options_zt.enableRowChild)
        {
            if (!data) {
                // click on the expanded element
                if(!this.options_zt.rowChildClickClose)
                    return;
                let parent = $(row_elm).prev();
                row = this.dt.row(parent[0]);
                data = row.data();
            }
            let key=data[this.options_zt.dataUniqueId];

            let context = this.rowContext.get(key);
            if (!context) {
                context =new RowContext();
                this.rowContext.set(key, context);
            }
            if (row.child.isShown()) {
                // This row is already open - close it
                row.child.hide();
                context.show_child = false;
            } else {
                // Open this row
                row.child(this.createRowChild(row.data())).show();
                context.show_child = true;
            }
        }

    }
    createTable() {
        if (this.dt) return;
        let self= this;
        this.dt = $(this.table_id).DataTable(self.options_dt );
        $(`${this.table_id} > tbody`).on('click', '>tr', function () {
            self.rowClickCallback(this);
        });
        this.dt.draw();
    }
    render_time_ms(data, type, row) {

        if (type == "sort") {
            if (data)
                return data;
            else
                return  Number.MAX_SAFE_INTEGER;
        }

        if (!data)
            return "";
        return Time.formatTimestamp_ms(data , false, false);
    }

}
