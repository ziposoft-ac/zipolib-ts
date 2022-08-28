

/**
 *  Copyright  (c)  2022 ZipoSoft, Inc.  All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0.
  */

import * as IM from "./IMenu.js";
import Cookies from "./js.cookie.js";
import {PageClientMenu, PageClientMenuT} from "./ClientPage.js"
console.log("MenuClient module");

const DEBUG=false;
function DBG(...args: any[]) { if(DEBUG) console.log(...args);}


let touchMode=('ontouchstart' in window);

function getTouchMode() {
    touchMode=(('ontouchstart' in window) ||  (window.innerWidth < 1000));
    return touchMode;
}


console.log("touchMode is ",touchMode);
abstract class MenuBase
{
    label:string;
    id:string;
    parent:Menu;
    value:any=null;
    access=IM.AccessLevel.Anon;
    constructor(
        public props: IM.IBase) {
        if(!props.key)
            props.key="";
        this.id=props.id;
        this.label=props.label;
        if(props.access)
            this.access=props.access;

    }
    dataSetKey(key:string,val:any){}
    dataGetKey(key:string):any { return null; }
    render() : HTMLElement
    {
        return null;
    }
    abstract setText(txt:string);

    updateDisplay()
    {
        if(this.props.getLabel)
        {
            this.props.getLabel();
        }
    }
    onClick(ev:MouseEvent) {
        DBG("MenuBase onClick:"+this.constructor.name)

    }
    onMouseEnter(ev:MouseEvent)  { }
    onMouseLeave(ev:MouseEvent) {  }
    contract() {}
    dataSet(val):void
    {
        if(this.props.setValue)
        {
            this.props.setValue(val);
        }
        if(this.props.key)
        {
            this.parent.dataSetKey(this.props.key,val);

        }
        this.value=val;
        if(this.props.onValueChange)
            this.props.onValueChange(val);

    }
    dataGet() : any{
        if(this.props.getValue)
            return this.props.getValue();
        if(this.props.key)
            return  this.parent.dataGetKey(this.props.key);
        return this.value;
    }
    clientCreateItems( parent : MenuBase,item_list:  IM.IBase[],level:number=0)
    {
        for( let item of item_list )
        {
            let mobj=null;
            if(item.type)
            {
                let cl=registry[item.type];
                if(cl)
                {
                    mobj= new cl(item);
                }
                else
                    console.log("Unknown menu type:",item.type);
            }
            else
            {
                if(item instanceof MenuBase)
                    mobj=item;
            }
            if(mobj)
                parent.addItem(mobj);
            else
                console.log("cannot create menu item:",item);

        }
    }
    addItem(item : MenuBase)
    {
    }
    addItems(...items :MenuBase[])
    {
        for(let item of items)
            this.addItem(item);
    }
}
class MenuItem extends MenuBase
{
    elm : ElmMenuItem;
    constructor(props: IM.IBase) {
        super(props);
        this.elm=new ElmMenuItem(this);
    }
    render() : ElmMenuItem
    {
        return this.elm;
    }
    setText(txt:string)
    {
        this.elm.setText(txt);
    }

}
export class Menu extends MenuBase
{
    protected children : MenuBase[]=[];
    elm : ElmMenu;
    expanded=false;

    constructor(props: IM.IMenu,elm:ElmMenu=null ) {
        super(props);
        this.elm=elm??new ElmMenu(this);
        if(props.items) // props for
            this.clientCreateItems(this,props.items);
        if(props.dataGetKey) this.dataGetKey=props.dataGetKey;
        if(props.dataSetKey) this.dataSetKey=props.dataSetKey;
    }

    updateDisplay()
    {
        super.updateDisplay();
        for(let i of this.children)
        {
            try {
                i.updateDisplay();

            }
            catch (e)
            {
                console.log(e);
            }

        }
    }
    contractOthers()
    {
        let up=(m:Menu) =>{
            if(m.parent)
            {
                for(let i of m.parent.children)
                    if(i!=m) i.contract();
                up(m.parent);
            }
        }
        up(this);
    }
    contract() {
        if(this.expanded)
        {
            this.expanded=false; this.elm.contract();
        }
        for(let i of this.children) i.contract();

    }
    onClick(ev:MouseEvent)
    {
        DBG("ElmMenu onClick:"+this.constructor.name+" "+this.expanded);

        super.onClick(ev);
        if(this.expanded)
        {
            this.contract();
        }
        else
        {
            this.contractOthers();
            this.expanded=true;
            this.elm.expand();
        }
        ev.stopPropagation();
    }
    onMouseEnter(ev:MouseEvent)
    {
        if(!getTouchMode())
        {
            this.elm.expand();
            this.expanded=true;
        }
        DBG("Menu onMouseEnter:"+this.constructor.name)
    }
    onMouseLeave(ev:MouseEvent)
    {
        DBG("Menu onMouseLeave:"+this.constructor.name)
        if(!touchMode)
        {
            this.elm.contract();
            this.expanded=false;
        }
    }
    addItem(item : MenuBase)
    {
        this.children.push(item);
        item.parent=this;
        let child_elm=item.render();
        this.elm.div.appendChild(child_elm);
    }
    clearItems()
    {
        let d=this.elm.div;
        this.children=[];
        while (d.firstChild)  d.removeChild(d.firstChild);
    }
    render() : HTMLElement
    {
        return this.elm;
    }
    setText(txt:string)
    {
        this.elm.setText(txt);
    }
}
export class MenuBar extends Menu
{
    setText(txt:string)
    {
    }
    constructor(props:IM.IMenuBar)
    {
        super(props,<ElmMenu>document.getElementById(props.id));
        this.elm.bind(this);
    }

}
export class MenuSelectItem extends MenuItem
{
    value: any;
    parent: MenuSelect;
    constructor(props: IM.ISelectVal ) {
        super(props);
        this.value=props.value;
        this.parent=<MenuSelect>props.parent;

    }
    onClick(ev:MouseEvent)
    {
        this.parent.callbackSelect(this);
    }
    select(selected : boolean)
    {
        this.elm.setText(this.props.label+(selected ? "✓":" "));
    }
}



export class MenuSelect extends Menu
{
    currentSelection : MenuSelectItem;
    options : object;
    baseName: string;
    props: IM.ISelect;
    selectItems ={};

    updateDisplay()
    {
        let key=this.dataGet();

        if(this.currentSelection)
            this.currentSelection.select(false);
        let item=this.selectItems[key]
        let selectLabel="none";
        if(item)
        {
            item.select(true);
            this.currentSelection=item;
            selectLabel=this.currentSelection.label;
        }


        let label=(this.props.getLabel?
            this.props.getLabel() :
            this.baseName+" : "+selectLabel);

        this.label=label;
        this.elm.name=label;
        this.elm.a.text=label;
    }
    callbackSelect(item:MenuSelectItem)
    {
        this.dataSet(item.value);
        this.updateDisplay();
    }
    constructor(props: IM.ISelect ) {
        super(props);


        this.elm=new ElmMenu(this);
        this.options=props.options;
        this.baseName=this.label;
        for(let key in this.options)
        {
            let item=new MenuSelectItem({label:this.options[key], value:key,parent:this});
            this.addItem(item);
            this.selectItems[key]=item;
        }
    }

}
export class MenuInput extends MenuItem
{
    props : IM.IInput;

    editbox: HTMLInputElement;
    editMode=false;

    updateDisplay()
    {
        let label=(this.props.getLabel?this.props.getLabel(): this.props.label);
        this.elm.setText(label+":");
    }
    constructor(props ) {
        super(props);

        let eb = document.createElement("input");
        eb.autocomplete="on";

        this.editbox=eb;
        this.elm.classList.add("textedit");
        this.elm.appendElm(eb);
        eb.onchange=(event)=>{this.onChange(event) };
    }
    onChange(event)
    {
    }
    onClick(ev: MouseEvent) {
            DBG("MenuInput onClick:"+this.constructor.name)

       ev.stopPropagation();
    }


}
export class MenuTextEdit extends MenuInput
{
    props : IM.ITextEdit;
    constructor(props : IM.ITextEdit) {
        super(props);
        this.editbox.type="label";
    }

    updateDisplay()
    {
        super.updateDisplay();
        this.editbox.value=this.dataGet();
    }
    onChange(event)
    {
        this.dataSet(this.editbox.value);

    }


}
export class MenuNumberEdit extends MenuInput
{
    updateDisplay()
    {
        super.updateDisplay();
        let value=this.dataGet();
        if (typeof value === 'number') {
            value=value.toFixed(this.props.decimalPlaces);
        }
        this.editbox.value=value;
    }

    props : IM.INumberEdit;
    constructor(props : IM.INumberEdit) {
        super(props);
        if(!props.decimalPlaces)
            props.decimalPlaces=0;

        this.editbox.type="number";
    }
    onChange(event)
    {
        let value=parseInt(this.editbox.value);
        this.dataSet(value);

    }
}


export class MenuBool extends MenuItem
{
    props : IM.IBool;
    constructor(props : IM.IBool) {
        super(props);
    }
    state : boolean=false;
    updateDisplay()
    {
        super.updateDisplay();
        let state=this.dataGet();
        this.elm.setText(this.label+(state ? "✓":" "));
    }
    onClick(ev:MouseEvent)
    {
        let state=!this.dataGet();
        this.dataSet(state);
        this.updateDisplay();
        ev.stopPropagation();

    }

}



export class MenuLink extends MenuItem
{
    constructor(props : IM.ILink) {
        super(props);
        this.elm.innerHTML=`<a href="${props.link}">${props.label}</a>`;
    }
}

export class MenuBoolCookie extends MenuBool
{
    dataSet(val)
    {
        if(val)
            Cookies.set(this.props.key,"true");
        else
        {
            Cookies.remove(this.props.key);
        }
    }
    dataGet() : any{
        return Cookies.get(this.props.key)!=undefined ;

    }

}
export class MenuFunc extends MenuItem
{
    func :  ()=> any;
    constructor(props : IM.IFunc) {
        super(props);
        this.func=props.func;

    }
    onClick(ev:MouseEvent)
    {
        this.func();
    }

}

export class MenuPageFunc extends MenuFunc
{
    func :  ()=> any;
    constructor(props : IM.IPageFunc) {
        let page: typeof PageClientMenu=globalThis["page"];

        let func=props.func.bind(page);
        super({...props,...{ func: func}});

    }


}

export class ElmMenuBase extends HTMLElement
{
    menu_obj: MenuBase=null;
    constructor(menu_obj:MenuBase) {
        super();
        if(menu_obj)
            this.bind(menu_obj);

    }
    bind(menu_obj:MenuBase)
    {
        this.menu_obj=menu_obj;
        this.onclick=(ev)=>{this.menu_obj.onClick(ev);}
        this.onmouseenter=(ev)=>{this.menu_obj.onMouseEnter(ev);}
        this.onmouseleave=(ev)=>{this.menu_obj.onMouseLeave(ev);}
    }

}
export class ElmMenuItem extends ElmMenuBase
{
    private a : HTMLAnchorElement;
    private label: HTMLElement;
    constructor(menuItem:MenuItem) {
        super(menuItem);
        let a = document.createElement("a");
        let span = document.createElement("span");

        if(menuItem.props.id)
            a.id=menuItem.props.id;
        a.href="#";
        this.appendChild(a);
        a.appendChild(span);
        this.a=a;
        this.label=span;
        this.setText(menuItem.label)
    }
    appendElm(elm)
    {
        this.a.appendChild(elm);
    }
    setText(txt:string)
    {
        this.label.innerText=txt;
    }
    create(props)
    {

    }
}

export class ElmMenu extends ElmMenuBase
{
    div : HTMLDivElement;
    a : HTMLAnchorElement;
    name :string;
    protected shown:boolean=false;
    constructor(menu: Menu) {
        super(menu);

        this.div = document.createElement("div");
        //this.classList.add("menusub");
        this.a = document.createElement("a");

        this.name=menu.props.label;
        this.classList.add("menushow");
        this.classList.add("menusub");
        this.appendChild(this.a);
        this.appendChild(this.div);
        this.contract();

    }
    setText(txt:string)
    {
        this.name=txt;
    }
    expand()
    {
        DBG("ElmMenu expand:"+this.constructor.name)
        this.classList.remove("menuhide");
        this.classList.add("menushow");
        this.a.textContent = `${this.name} ▼`; //►
        this.div.scrollIntoView({behavior:"smooth",block:"nearest"})
    }
    contract()
    {
        DBG("ElmMenu contract:"+this.constructor.name)
        this.classList.replace("menushow","menuhide");
        this.a.textContent = `${this.name} ►`; //►
    }


    create(props)
    {

    }
}
export class ElmMenuBar extends ElmMenuBase
{

    divMobile : HTMLDivElement;
    div : HTMLDivElement;
    constructor(menu: Menu) {
        super(menu);

        this.divMobile = document.createElement("div");
        this.divMobile.textContent = `☰MENU`; //►

        this.div = document.createElement("div");
        this.divMobile.classList.add("zs_menu_mobile");
        this.classList.add("barhide");
        this.div.classList.add("zs_menu_top");
        this.appendChild(this.divMobile);
        this.appendChild(this.div);

    }
    expand(ev:MouseEvent)
    {
        this.classList.remove("barhide");
        this.classList.add("barshow");
    }
    contract(ev:MouseEvent)
    {
        this.classList.replace("barshow","barhide");
    }

}

export var registry={
    Menu : Menu,
    MenuLink : MenuLink,
    MenuBar : MenuBar,
    MenuFunc : MenuFunc,
    MenuBool : MenuBool,
    MenuBoolCookie: MenuBoolCookie
};

customElements.define('zs-menuitem', ElmMenuItem,);
customElements.define('zs-menu', ElmMenu);
customElements.define('zs-menubar', ElmMenuBar);
