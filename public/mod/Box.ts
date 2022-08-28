/**
 *  Copyright  (c)  2022 ZipoSoft, Inc.  All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0.
  */

import * as $ from "/zs_client/Dom.js";

const animateDelay=300;

export interface IBox
{

}
export class Box
{
    elm : HTMLDivElement;
    elmTitle : HTMLDivElement=null;
    text="";
    expanded=false;
    level=1;
    type: string=null;
    shown=false;
    preview=false;
    parent: BoxList=null;
    constructor(parent:BoxList,type:string,
                text:string,shown=true,expand=false) {

        this.parent=parent;
        if(parent)
        {
            this.level=parent.level+1;
        }

        this.elm = document.createElement("div");
        this.text=text;

        this.elm.onmouseover=(ev)=>{return this.onMouseEnter(ev);}
        this.elm.onmouseout=(ev)=>{this.onMouseLeave(ev);}
        this.elm.onclick=(ev)=>{return this.onClick(ev);}
        this.elm.className="zs_box";
        this.elm.classList.add('lvl'+this.level);

        if(type)
        {
            this.elm.classList.add("zs_box_"+type)
            this.type=type;
        }

        //this.titlewrap=$.create("div","zs_box_header");
        //this.titlewrap.appendChild(this.text);
        if(text)
        {
            this.elmTitle=$.create("div");

            this.elmTitle.textContent=text;
            this.elmTitle.onclick=(ev)=>{return this.onTextClick(ev);}
            this.elm.appendChild(this.elmTitle);
        }



        this.setShow(shown);
        this.setExpand(expand);

    }
    onShow(shown:boolean)  {  }
    lazyLoadImages() {};
    private setShow(shown:boolean)
    {
        this.shown=shown;
        if(shown)
        {
            this.elm.classList.remove('boxhide');
        }
        else
        {
            this.elm.classList.add('boxhide');
        }
        this.onShow(shown);
    }
    private setExpand(expanded:boolean) : boolean //return true if changed
    {
        let change=(this.expanded!==expanded)
        this.expanded=expanded;
        if(expanded)
        {
            this.elm.classList.remove('contract');
            this.elm.classList.add('expand');
        }
        else
        {
            this.elm.classList.add('contract');
            this.elm.classList.remove('expand');
        }
        return change;
    }
    setLeveL(lvl:number)
    {
        this.level=lvl;

    }
    show(shown:boolean)
    {
        this.setShow(shown);
    }
    expand(expanded:boolean) : boolean//return true if changed
    {
        return this.setExpand(expanded);

    }
    toggle()
    {

        this.expand(!this.expanded);

    }
    onTextClick(ev:MouseEvent)
    {
        console.log("onTextClick");
        //ev.stopPropagation();
        //this.toggle();
        return false;
    }
    onClick(ev:MouseEvent)
    {
        console.log("Box click");
        //ev.stopPropagation();
        //this.toggle();
        return false;
    }
    onMouseEnter(ev:MouseEvent)
    {
    }
    onMouseLeave(ev:MouseEvent)
    {

    }

}
export class BoxList extends Box
{
    items: Box[]=[];
    elmWrap : HTMLDivElement;
    statement : BoxStatement=null;
    coverThumb : HTMLImageElement=null;


    constructor(parent:BoxList, type:string,
                text: string,
                htmlStatement:string,
                urlCoverThumb:string,
                shown=true,expanded=false,id:string=null) {
        super(parent,type,text,shown,expanded);


        this.elmWrap=$.create("div","zs_box_list_wrap");
        this.coverThumb=$.create("img","zs_box_cover_img");
        this.coverThumb.src=urlCoverThumb;
        if(htmlStatement)
        {

            this.statement=new BoxStatement(this,htmlStatement);
            this.elm.appendChild(this.statement.elm);

        }
        this.elm.appendChild(this.coverThumb);

        this.elm.classList.add("zs_box_list");
        if(this.elmTitle)
        {
            this.elmTitle.className="zs_box_header";
            this.elmTitle.classList.add('header'+this.level)
        }

        if(id)
            this.elm.id=id;
        this.elm.appendChild(this.elmWrap);

    }
    lazyLoadImages()
    {
        this.items.forEach(
            (box)=> box.lazyLoadImages()
        );
    }
    add(item:Box)
    {
        if(this.expanded)
        {
            item.show(true);
        }
        else
        {
            if(item.type=="cover")
            {
                item.preview=true;
                item.show(true);
            }
            else
                item.show(false);
        }

        this.items.push(item);
        this.elmWrap.appendChild(item.elm);
    }
    expandChildren (expanded:boolean):boolean //return true if ANY changed
    {
        let changed=false;
        this.items.forEach(
            (box,i)=>
            {
                if(box.expand(expanded))
                    changed=true;
            }
        );
        return changed;
    }
    showChildren (expanded:boolean)
    {
        let i_cover=0;
        this.items.forEach(
            (box,i)=>
            {
                if(box.type=="cover")
                {
                    box.preview=!expanded;
                    box.show(true);

                }
                else
                {
                    box.show(expanded);
                }
            }
        );
    }
    expand(expanded:boolean):boolean //return true if changed
    {
        let changed=super.expand(expanded); //change classes
        this.showChildren(expanded);
        return changed;
    }
    onTextClick(ev:MouseEvent)
    {
        ev.stopPropagation();

        if(this.expanded)
        {
            let changed=this.expandChildren(false);
            if(changed)
                return ;
        }

        this.toggle();


        console.log("onTextClick");
        //ev.stopPropagation();
        //this.toggle();
        return false;
    }
    onClick(ev:MouseEvent)
    {
        ev.stopPropagation();

        console.log("BoxList click",this.level,this.text);
        if(this.parent?.onClick(ev)) return true;
        if(this.expanded) return false;

        setTimeout(() => {
            let y = this.elmTitle.getBoundingClientRect().top + window.scrollY;
            let offset=0;
            if(this.parent)
                offset=this.parent.elmTitle.getBoundingClientRect().bottom;

            window.scrollTo({behavior:"smooth",top:y-88})
        },300);

        if(!this.parent)
        {
            this.expandChildren(false);
            return true;


        }
        this.parent.elmWrap.appendChild(this.elm);
        this.toggle();
        return true;
    }
}
export class BoxImage extends Box
{
    img : HTMLImageElement;
    imgUrl:string;
    thumbUrl:string;


    constructor(parent:BoxList,type:string,text: string,url:string,thumbnail:string,

                shown=true) {
        super(parent,type,text);
        this.img=$.create("img");
        this.imgUrl=url;
        this.thumbUrl=url;
        if(shown)
            this.img.src= thumbnail;


        this.img.title=text;
        this.elm.classList.add("zs_box_image");
        this.elm.appendChild(this.img);
        if(this.elmTitle)
        {
            this.elmTitle.className="image_label";
            // re-appending moves the text under the image
            this.elm.appendChild(this.elmTitle);
        }


    }

    lazyLoadImages()
    {
        if(this.img && (this.img.src==""))
            this.img.src=this.thumbUrl;
    }
    onShow(shown:boolean)
    {
        if(shown && this.img && (this.img.src==""))
            this.img.src=this.thumbUrl;
    }

    onClick(ev:MouseEvent)
    {
        ev.stopPropagation();

        console.log("BoxImage click:",this.img.title);

        if(this.parent?.onClick(ev)) return true;

        if(this.preview)
            return false;

        if(this.imgUrl)
        {
            this.img.src=this.imgUrl;
            this.imgUrl=null;
        }
        this.toggle();
        //if(this.expanded)
        {
            setTimeout(() => {
                //this.elm.scr
                const y = this.elm.getBoundingClientRect().top + window.scrollY;
                const offset=this.parent.elmTitle.getBoundingClientRect().bottom;
                window.scrollTo({behavior:"smooth",top:y-offset})
                //this.elm.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
                //this.img.scrollIntoView(true);
            },300);

        }


        return false;
    }

}
export class CoverImage  extends BoxImage
{

    constructor(parent:BoxList,url:string,thumbnail:string,
                shown=true) {
        super(parent,"cover_img",null,url,thumbnail);

    }
    onClick(ev:MouseEvent)
    {
        return this.parent.onClick(ev);

    }

}
export class BoxNews extends Box
{

    constructor(parent:BoxList,html: string,shown=true) {
        super(parent,"news","");
        this.elmTitle.innerHTML=html;
        this.elm.classList.add("zs_box_statement");

    }
    onClick(ev:MouseEvent)
    {
        if(this.preview)
            return false;

        console.log("BoxStatement click");
        ev.stopPropagation();


        return false;
    }

}

export class BoxStatement extends Box
{
    elmSeeMore: HTMLDivElement;
    constructor(parent:BoxList,html: string,shown=true) {
        super(parent,null,"");
        if(this.elmTitle)
        this.elmTitle.innerHTML=html;
        this.elm.classList.add("zs_box_statement");
        this.elmSeeMore=$.create("div","zs_box_readmore");

        this.elmSeeMore.textContent="Read More";
        this.elm.prepend(this.elmSeeMore)
    }
    onClick(ev:MouseEvent)
    {
        ev.stopPropagation();

        console.log("BoxStatement click");

        this.toggle();
        if(this.expanded)
        {
            this.elmSeeMore.textContent="Show Less";
            setTimeout(() => {
                //this.elm.scr
                const y = this.elm.getBoundingClientRect().top + window.scrollY;
                const offset=this.parent.elmTitle.getBoundingClientRect().bottom;
                window.scrollTo({behavior:"smooth",top:y-offset})
                //this.elm.scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});
                //this.img.scrollIntoView(true);
            },300);
        }
        else {
            this.elmSeeMore.textContent="Read More";

        }


        return false;
    }

}

