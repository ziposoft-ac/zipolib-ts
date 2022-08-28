/**
 *  Copyright  (c)  2022 ZipoSoft, Inc.  All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0.
  */

import * as $ from "/zs_client/Dom.js";
import * as M from "/zs_client/zb/Meta.js";
import * as D from "/zs_homonym/DataObj.js";
import {SelectResult} from "/zs_client/zb/DataViewReq";
function addChildEventListener(base, eventName, selector, handler) {
    base.addEventListener(eventName, function(event) {
        var closest = event.target.closest(selector);
        if (closest && base.contains(closest)) {
            // passes the event to the handler and sets `this`
            // in the handler as the closest parent matching the
            // selector from the target element of the event
            handler(closest, event);
        }
    });
}
export class DvTable {
    htable: HTMLTableElement;

    sel:SelectResult;

    callbackRowClick(type:string,id:string)
    {


    }
    callbackIndexClick(type:string,id:string)
    {


    }
    constructor(id:string=null) {
        if(id)
            this.htable=<HTMLTableElement>document.getElementById(id);
        else
            this.htable=$.create('table','dvTable',id);
        this.htable.addEventListener('click', (event)=> {
            let target:Element =<Element> event.target;
            let row=target.closest('tr');
            let cell=target.closest('td');
            if(row)
            {
                let id=row.dataset['id'];
                console.log(row.dataset['id']);
                this.callbackRowClick(this.sel.objType,id);

            }
        });

    }
    addRow(arr: (string|number)[])
    {
        let row=this.htable.insertRow();

        for (const s of arr)  {
            let cell=row.insertCell();
            cell.innerText=s.toString();

        }
    }
    show(sel:SelectResult  )
    {
        let flds=new M.FieldSet(sel.fields);
        this.sel=sel;


        let h='<thead><tr >';
        for (const f of flds) {
            if(f.props.showList)
            {
                h+=`<th>${f.getDisplayName()}</th>`;
            }
        }
        h+='</tr></thead><tbody>';
        for(let i=0;i<sel.arr.length;i++)
        {
            let obj=sel.arr[i];
            let id=obj['id']??"";
            h+=`<tr data-id="${id}">`;
            for (const f of flds)  {
                if(f.props.showList)
                {
                    let ex= sel.expanded[i];
                    let val=f.getDisplayString(obj,ex);
                    h+=`<td>${val}</td>`;
                }
            }
            h+="</tr>";

        }
        h+='</tbody></table>';

        this.htable.innerHTML=h;
    }

    showType(classRef:typeof D.DataObj ,arr: object[]  )
    {
        // @ts-ignore
        let ctor=classRef.prototype.constructor;
        // @ts-ignore
        this.show(getMeta(ctor));
    }
    displaydata(data: object[])
    {
        let h='';
        for(let row of data)
        {
            h+='<tr>';
            for(let d in row)
            {
                let val=row[d];
                h+=`<td>${val}</td>`;
            }
            h+='</tr>';
        }
        this.htable.innerHTML=h;

    }
}
