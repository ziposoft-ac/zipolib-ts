/**
 *  Copyright  (c)  2022 ZipoSoft, Inc.  All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0.
  */

/*
    CLIENT FIELDS

*/
import {FieldBase} from "/zs_client/zb/FieldBase.js";

import {IField,IFieldSet} from "/zs_client/zb/IField.js";

import * as Time from "/zs_client/Time.js"
import * as $ from "/zs_client/Dom.js";

export interface IDataObjClient
{
    id : number;



}



export class FieldClient extends FieldBase
{
    getDisplayString(obj: object,objEx:object) : string
    {
        return obj[this.id];
    }
    getEditElm(obj: object,objEx:object) : HTMLElement
    {
        return this.getDisplayElm(obj,objEx);
    };
    getDisplayElm(obj: object,objEx:object) : HTMLElement
    {
        let elm=$.create('div');
        elm.innerText=this.getDisplayString(obj,objEx);
        return elm;

    };
}
export type FldCon = new (iF:IField) =>  FieldClient;
export var fldFactory=new Map<string,FldCon>();
export function FF (constructor) {
    //console.log("FEILD TYPE:",constructor.name);
    fldFactory.set(constructor.name,constructor);
    //Util.gObjFactory.addClass(constructor);

}


@FF export class FieldImg extends FieldClient
{
    getDisplayElm(obj: object,objEx:object) : HTMLElement
    {
        let elm=$.create('img');
        elm.src=obj[this.id];
        return elm;

    };
}





@FF export  class FieldJson extends FieldClient
{
    constructor(props:IField ) {    super(props);   }
    getDbType() { return "TEXT"}
    copyFromDb(obj: object,row:object)
    {
        let objVal=null;
        try {
            let json=row[this.id];
            if(json)
                objVal=JSON.parse(json);
        }
        catch (e)
        {
            objVal={error: "json parse error"};

        }
        obj[this.id]=objVal;
    }
    copyToDb(obj: object,row:object)
    {
        row[this.id]=JSON.stringify(obj[this.id]);
    }
    getDisplayString(obj: object,objEx:object) : string
    {
        let val= obj[this.id];
        if(val)
            return "";
        else
            return "JSON";
    }
}
@FF  export class FieldTextFunc extends FieldClient
{
    constructor(props:IField )
    {
        super(props);
    }
    getDbType()
    {
        return null;
    }

    getDisplayString(obj: object) : string
    {
        let funcname=this.id;
        return obj[this.id]();
    }
}
@FF  export class FieldText extends FieldClient
{
    constructor(props:IField ) {    super(props);   }

    getDisplayString(obj: object) : string
    {
        return obj[this.id];
    }
    override getEditElm(obj: object,objEx:object) : HTMLElement
    {
        let elm=$.create('input');
        elm.value=obj[this.id];
        return elm;
    };
}
@FF  export class FieldPolyline extends FieldText
{
    constructor(props:IField ) {
        super(props);   }

    getDisplayString(obj: object) : string
    {
        return "polyline";
    }
}


@FF export class FieldFloat extends FieldClient
{
    getDisplayString(obj: object,objEx:object) : string
    {
        let f : number =<number> obj[this.id];
        return  f.toFixed(2);
    }
}

@FF export class FieldInt extends FieldClient
{
    getDisplayString(obj: object,objEx:object) : string
    {
        return  obj[this.id];
    }
}
@FF export class FieldId extends FieldInt
{

}
@FF  export class FieldIpAddress extends FieldInt
{
    getDisplayString(obj: object,objEx:object) : string
    {
        let n  =<number> obj[this.id];
        let str=(n&0xff000000)+"."+(n&0xff0000)+"."+(n&0xff00)+"."+(n&0xff);
        return str;


    }
}


@FF export class FieldBool extends FieldInt
{
    getDisplayString(obj: object,objEx:object) : string
    {
        return  (obj[this.id]>0?"TRUE":"FALSE");
    }
}
@FF export class FieldDateTime extends FieldInt
{
    getDisplayString(obj: object,objEx:object) : string
    {
        let val=obj[this.id];
        if(!val)
            return "-";
        return  Time.getReadableDateTimeFromMs(obj[this.id]);
    }
}



@FF export class FieldAutoKey extends FieldInt
{
    //getDisplayString(obj: object,objEx:object) { return "";}

}
@FF export class FieldKeyInt extends FieldInt
{
    getDisplayString(obj: object,objEx:object)
    {
        let key=obj[this.id];
            return key;


    }

}
@FF export class FieldKeyText extends FieldText
{

}


