/**
 *  Copyright  (c)  2022 ZipoSoft, Inc.  All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0.
  */

import * as IM from "/zs_client/IMenu";
import {AccessLevel, ISelect} from "/zs_client/IMenu";

export function FilterAccess(item:IM.IBase,lvl : IM.AccessLevel)
{
    if(!item.items)
        return;
    let newlist=[];
    for(let c of item.items)
    {
        if(c && (c.access<=lvl)) {
            FilterAccess(c,lvl);
            newlist.push(c)
        }
    }
    item.items=newlist;

}


export function Menu(id :string,label: string,access: IM.AccessLevel, items :  IM.IBase[]) : IM.IMenu
{
    return {type:IM.Type.Menu,id,label,items,access};
}


export function Link(text: string,link:string,access: IM.AccessLevel=IM.AccessLevel.Admin) : IM.ILink
{
    return {type:IM.Type.MenuLink,id:null,label:text,link:link,access:access};
}
export function BoolCookie(label: string,cookeName:string) : IM.IBool
{
    return {type:IM.Type.MenuBoolCookie,id:null,
        label:label, key:cookeName};
}
