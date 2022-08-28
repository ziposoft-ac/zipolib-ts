/**
 *  Copyright  (c)  2022 ZipoSoft, Inc.  All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0.
  */

import * as IM from "./IMenu.js";

import {MenuBar, MenuLink} from "./MenuClient.js";
import {PageData, PageDataMenu} from "./PageData.js"
import * as D from "./Dom.js";
import Cookies from "./Cookies.js";
import {tag} from "./Dom.js";

export class LocalStorage
{
    name: string;
    constructor(name) {
        this.name=name;
        this.load();
    }
    load()
    {
        let str=localStorage.getItem(this.name);
        let obj=JSON.parse(str);
        Object.assign(this,obj);
    }
    save()
    {
        let str=JSON.stringify(this);
        localStorage.setItem(this.name,str);

    }
}
class StorageData
{
    accessLevel=IM.AccessLevel.Anon;
    accessKey="public"
}

export class PageClientT<STATIC_DATA extends PageData> {

    staticData: STATIC_DATA;
    elm_main: HTMLElement;
    elm_header: HTMLElement;
    cookies = Cookies;
    storage =new StorageData();
    storageName = "Page";
    get accessLevel() { return this.storage.accessLevel; }

    storageLoad(objDest: Object = null) {
        if (!objDest)
            objDest = this.storage;
        let str = localStorage.getItem(this.storageName);
        let obj = JSON.parse(str);
        objDest = Object.assign(objDest, obj);
    }
    storageSave(objSource: Object = null) {
        if (!objSource)
            objSource = this.storage;
        let str = JSON.stringify(objSource);
        localStorage.setItem(this.storageName, str);
        console.log("stor save");
    }
    constructor(staticData) {

        this.staticData=staticData;
        //Object.assign(this.staticData, staticData);
        window["page"] = this;
        this.storageName = window.location.pathname;
        this.elm_header = D.tag('header');
        this.elm_main = D.tag('main');
        //console.log("client page constructor");

    }

    async run() {
        console.log("run PageClientT");
        this.storageLoad();
    }

}


// @ts-ignore
export function PageClient<STATIC_DATA extends PageData >(  StaticDataT:(new () => STATIC_DATA) = PageData,
) {
    return class extends PageClientT<STATIC_DATA>{
    }
}


export class PageClientMenuT<STATIC_DATA extends PageDataMenu = PageDataMenu> extends PageClientT<STATIC_DATA>
{
        menubar : MenuBar;
        constructor(staticData: Partial<STATIC_DATA>) {
            console.log("PageClientMenu constructor");
            super(staticData);
            this.menubar =new MenuBar(this.staticData.menubar);

        }
        setHeader() {
            let h = D.tag('header').clientHeight;
            document.documentElement.style.setProperty('--header-height', h.toString());
            console.log("header height:", h)
    
        }
        async run() {
            super.run();
            console.log("run PageClientMenuT");
            this.menubar.updateDisplay();
            window.onresize = () => this.setHeader();
            screen.orientation.onchange = () => {
                console.log("orientation");
                this.setHeader();
            }
            this.setHeader();
        }
    }


// @ts-ignore
export function PageClientMenu<STATIC_DATA extends PageDataMenu>(   StaticDataT: (new ()=>STATIC_DATA)   = PageDataMenu) {
    return class extends PageClientMenuT<STATIC_DATA>
    {
    }
}


export default  PageClientMenu()
