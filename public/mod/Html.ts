/**
 *  Copyright  (c)  2022 ZipoSoft, Inc.  All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0.
  */

export function objArrHtmlTable(arr : Object[]) : string
{
    if(!arr)
        return "<div>NO DATA</div>";

    if(!arr.length)
        return "<div>NO DATA IN TABLE</div>";
    let keys=new Set<string>();

    for(let obj of arr)
        Object.keys(obj).forEach(key=> keys.add(key));






    let h='<thead><tr>';
    for (const key of keys) {
        h+=`<th>${key}</th>`;
    }
    h+='</tr></thead>';
    for(let obj of arr)
    {
        h+="<tr>";
        for (const key of keys) {
            let val=obj[key] ?? "";
            h+=`<td>${val}</td>`;
        }
        h+="</tr>";

    }

    return h;
}
export function getHtmlTable(obj : Object) : string
{
    let h='<table>';
    for (const [key, value] of Object.entries(obj)) {
        h+=`<tr><td>${key}</td><td>${value}</td></tr>`;
    }
    h+='</table>';
    return h;
}
