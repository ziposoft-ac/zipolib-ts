
/**
 *  Copyright  (c)  2022 ZipoSoft, Inc.  All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0.
  */

import * as IM from "./IMenu.js";


export interface Pwa
{
    precache: string; //=  "precache-v1";
    runtime: string; //= "runtime";
    precache_urls: string[]; //=[];
}

export class PageData
{
    info={
        ip:""
    }

}


export class PageDataMenu extends PageData
{
    menubar : IM.IMenuBar= {type:IM.Type.MenuBar, id: "topmenu",label:"menu",items:[]};

}
export class PageDataApp extends PageData
{

}

