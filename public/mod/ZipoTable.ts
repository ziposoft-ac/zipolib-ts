
/**
 *  Copyright  (c)  2022 ZipoSoft, Inc.  All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0.
  */

export interface Col
{
    name: string;
}
export interface Config
{
    id:string;
    columns: Record<string, Col>;
}
export class ZipoTable
{
    ht : HTMLTableElement;
    header:HTMLTableRowElement;
    body:HTMLTableSectionElement;
    foot:HTMLTableSectionElement;
    columns: Record<string, Col>={};

    constructor(public conf:Partial<Config>) {
        this.init(conf);
    }
    init( conf:Partial<Config>)
    {
        if(conf.id)
            this.ht=<HTMLTableElement>document.getElementById(conf.id);
        else
            this.ht=document.createElement('table');
        this.ht.classList.add('ZipoTable');
        this.header=this.ht.createTHead().insertRow();
        this.body=this.ht.createTBody();
        this.foot=this.ht.createTFoot();
        if(conf.columns)
        {
            this.columns=conf.columns;
            for(let id in conf.columns)
            {
                let col=conf.columns[id];
                let th=document.createElement('th');
                this.header.appendChild(th).innerText=col.name;

            }

        }
    }
    addRow(arr: (string|number)[])
    {
        let row=this.body.insertRow();

        for (const s of arr)  {
            let cell=row.insertCell();
            cell.innerText=s.toString();

        }
    }

}
