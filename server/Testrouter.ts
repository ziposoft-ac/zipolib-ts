/**
 *  Copyright  (c)  2022 ZipoSoft, Inc.  All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0.
 *
 */

import * as P from './Page';
import {PageMenu} from './PageMenu';
import * as Menu from "./Menu";
import * as IM from "/zs_client/IMenu";
import * as Fastify from "fastify";
//import Url from 'url-parse'
import * as fs from 'fs'
import {Dirent} from 'fs'
import pathlib from "path";
import {processSR, registerSR} from "@zs_server/RequestHandler";
import Zipo from "./Zipo";
import * as FU from "./FileUtil"
import {Router} from "@zs_server/Router";

class PageMenuDir
{
    subDirs : Record<string, PageMenuDir>={};
    entries : Record<string, string>={};
}

export class TestViewerPage extends PageMenu
{

    constructor(props:P.PageProps) {
        super(props);


        this.title=props.req.url;

    }
    header(): string
    {
        let h=super.header();
        return h;//+`<h1>${this.title}</h1>`;
    }
    footer() : string
    {
        return "";

    }
    tree_root: PageMenuDir=null;
    tree_client: string="";
    async buildmenu() {
        let path_client_pages=Zipo.path("public/pages");
        let path_server_pages=Zipo.path("server/pages");
        this.tree_root=new PageMenuDir();

        let pagedir: IM.IMenu= Menu.Menu( "pagedir","PAGE DIR",IM.AccessLevel.Debug  ,[]);
        let settings= Menu.Menu( "settings","Settings",IM.AccessLevel.Debug,[
            Menu.BoolCookie("Debug","debug"),
        ]);
        await this.pageSearch(path_client_pages,this.tree_root);
        await this.pageSearch(path_server_pages,this.tree_root);
        //console.log(JSON.stringify(this.tree_root,null,2));
        this.menubar.items.push(pagedir,settings);
        this.tree_client=await this.appendDirList(pagedir,
            this.tree_client,this.tree_root,"/test") ;
    }
    async build() {
        await this.buildmenu();
        await super.build();
    }

    main_menu() {
        let h=``;
        h+=this.tree_client;
        return h;

    }

    async pageSearch(path_in : string,node_in:PageMenuDir)
    {
        let ls: Dirent[]=await fs.promises.readdir(path_in,{withFileTypes:true}) ;
        for(let de of ls ) {
            if (de.isDirectory()) {
                let subnode=node_in.subDirs[de.name];
                if(!subnode)
                {
                    subnode=node_in.subDirs[de.name]=new PageMenuDir();
                }

                let path = path_in + "/" + de.name;
                await this.pageSearch(path, subnode);
                continue;
            }
            let parts = de.name.split(".");
            let name = parts[0];
            if(!node_in.entries[name])
            {
                node_in.entries[name]=name;
            }
        }
    }

    async appendDirList(menu:IM.IMenu,h : string,node : PageMenuDir,path_web:string)
    {
        for(let k in node.subDirs)
        {
            let url=path_web+'/'+k;
            h+=`<div>${k}</div><ul>`;
            let submenu=Menu.Menu(k,k,IM.AccessLevel.Debug,[]);

            h=await this.appendDirList(submenu,h,node.subDirs[k],url);
            h+='</ul>';
            menu.items.push(submenu);

        }
        for(let k in node.entries)
        {
            let url=path_web+'/'+k;
            h+=`<li><a href="${url}">${k}</a></li>`;
            let ml= Menu.Link(k,url);
            menu.items.push( ml);

        }
        return h;
    }


    async appendDirList1(menu:IM.IMenu,h : string,path_local : string,path_web:string)
    {
        let ls: Dirent[]=await fs.promises.readdir(path_local,{withFileTypes:true}) ;
        for(let de of ls )
        {

            if(de.isDirectory())
            {

                let url=path_web+'/'+de.name;
                h+=`<div>${de.name}</div><ul>`;
                let submenu=Menu.Menu(de.name,de.name,IM.AccessLevel.Debug,[]);

                h=await this.appendDirList1(submenu,h,pathlib.join(path_local,de.name),url);
                h+='</ul>';
                menu.items.push(submenu);
                continue;
            }
            let parts=de.name.split(".");
            let url=null;
            let name=parts[0];
            if((parts.length==2)&&(parts[1]=="ts"))

            {
                url=path_web+'/'+parts[0];
            }
            /*
            if((parts.length==2)&&(parts[1]=="html"))
            {
                url=path_web+'/'+de.name;
                name=de.name;
            }*/
            if(url)
            {
                h+=`<li><a href="${url}">${name}</a></li>`;
                let ml= Menu.Link(name,url);
                menu.items.push( ml);

            }


        }
        return h;

    }
}
class TestViewerErrorPage extends TestViewerPage
{
    exp : any =null;
    constructor(props:P.PageProps,exception) {
        super(props);

        this.exp=exception;
    }
    main(): string
    {
        let txt="Unkonw Error";
        if("stack" in this.exp)
        {
            txt=this.exp.stack;
        }


        return `<h1>TestViewerErrorPage:</h1><pre>${txt}</pre>`;
    }

}
// Init shared



let serverPageDir=Zipo.path('server/pages');
let clientPageDir=Zipo.path('public/pages');

export class TestRoute extends Router
{

    route(fastify : Fastify.FastifyInstance)
    {
        fastify.get('*',this.handler)
        fastify.post("*", async (req: Fastify.FastifyRequest, res: Fastify.FastifyReply) => {

            processSR(req,res);
        });
        
    }
    constructor() {
        super();


    }
    async handler(req: Fastify.FastifyRequest, res: Fastify.FastifyReply)
    {

        let exception : any=null;
        let pageObj : P.PageServer =null;
        let pageHtml: string=null;
        /*
        console.log(req.body)
        console.log(req.query)
        console.log(req.params)
        console.log(req.headers)
        console.log(req.raw)
        console.log(req.server)
        console.log(req.id)
        console.log(req.ip)
        console.log(req.ips)
        console.log(req.hostname)
        console.log(req.protocol)
        console.log(req.url)
        console.log(req.routerMethod)
        console.log(req.routerPath)

         */
        let module_path=req.params['*'];
        let serverPage=serverPageDir+"/"+module_path+".js";

        let serverPageExists=await FU.fileExists(serverPage);
        let clientPageExists=await FU.fileExists(clientPageDir+"/"+module_path+".js");

        if(serverPageExists)
        {
            await import(serverPage).then((mod)=>{
                let x=mod.default;
                console.log("Server Page Classname ",x);

                pageObj=new x({req});
                if(clientPageExists)
                    pageObj.page_module="/pages/"+module_path;

            }).catch((e)=>{
                console.log("No server module",e.message);
            });
        }

        if(!pageObj)
        {

            try {
                pageObj=new TestViewerPage({req});
                if(clientPageExists)
                {
                    pageObj.page_module="/pages/"+module_path;
                    console.log('default test page with mod:',pageObj.page_module);
                }
                else// PAGE NOT FOUND
                {
                    pageObj.props.main=`<div>${module_path} is not found</div>`+ (<TestViewerPage>pageObj).tree_client;
                    console.log(module_path+" is not found")
                }
            }
            catch (e) {
                console.log("error new TestViewerPage:",e);
                pageObj=new TestViewerErrorPage({req},e);
            }

        }
        try {
            try {
                await pageObj.build();
            }
            catch (e) {
                console.log("exception building:",e);
                pageObj=new TestViewerErrorPage({req},e);
                await pageObj.build();

            }
            pageObj.sendResponse(res);


        }
        catch (e) {
            pageObj=new P.PageException({req},e);
            pageObj.sendResponse(res);

        }
    }




}



