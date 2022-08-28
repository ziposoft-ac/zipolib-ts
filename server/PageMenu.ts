/**
 *  Copyright  (c)  2022 ZipoSoft, Inc.  All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0.
 *
 */

import * as IM from "/zs_client/IMenu";
import {PageDataMenu,PageData}  from "/zs_client/PageData";

import {Dirent} from "fs";
import fs from "fs";
import path from "path";
import {PageProps, PageServer} from "./Page";


export class PageMenu extends PageServer
{
    staticData : PageDataMenu;//recast staticData
    constructor(props: PageProps) {
        super(props);
        this.modules = ["/zs_client/MenuClient"];

        this.staticData.menubar=this.menubar;
        //props.req.cookies['']
        this.page_module="/zs_client/ClientPage";

        this.css.push("/zs_public/css/Menu.css");
    }
    menubar : IM.IMenuBar={type:IM.Type.MenuBar, id: "topmenu",label:"menu",items:[]};
    header() : string { return "<zs-menubar id=\"topmenu\"></zs-menubar>"; }
}
export class PageDirectory extends PageServer
{
    appendDirList(h : string,path_local : string,path_web:string)
    {
        let ls: Dirent[]=fs.readdirSync(path_local,{withFileTypes:true}) ;
        for(let de of ls )
        {

            if(de.isDirectory())
            {
                let url=path_web+'/'+de.name;
                h+=`<div>${de.name}</div><ul>`;
                h=this.appendDirList(h,path.join(path_local,de.name),url);
                h+='</ul>';
                continue;
            }
            if(de.name.indexOf('.html')>0)
            {
                let url=path_web+'/'+de.name;

                h+=`<li><a href="${url}">${de.name}</a></li>`;

            }


        }
        return h;

    }
    main(): string
    {
        let h="";
        h=this.appendDirList(h,path.join(process.cwd(),"public/test"),"/test") ;

        return h;
    }

}
