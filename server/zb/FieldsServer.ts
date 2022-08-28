/**
 *  Copyright  (c)  2022 ZipoSoft, Inc.  All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0.
  */

import {IField} from "/zs_client/zb/IField.js";

import * as Time from "/zs_client/Time.js"
import {FieldBase} from "/zs_client/zb/FieldBase";


export class FieldServer extends FieldBase
{


    getDisplayString(obj: object,objEx:object) : string
    {
        return obj[this.id];
    }


}
export type FldCon = new (iF:IField) =>  FieldServer;
export var fldFactory=new Map<string,FldCon>();
export function FF (constructor) {
    //console.log("FEILD TYPE:",constructor.name);
    fldFactory.set(constructor.name,constructor);
    //Util.gObjFactory.addClass(constructor);

}



@FF export  class FieldJson extends FieldServer
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
    getDisplayString(obj: object) : string
    {
        let val= obj[this.id];
        if(val)
            return "";
        else
            return "JSON";
    }
}
@FF  export class FieldTextFunc extends FieldServer
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
@FF  export class FieldText extends FieldServer
{
    constructor(props:IField ) {    super(props);   }
    getDbType() { return "TEXT"}

    getDisplayString(obj: object) : string
    {
        return obj[this.id];
    }
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

@FF export class FieldImg extends FieldText
{
}


@FF export class FieldFloat extends FieldServer
{
    getDbType() { return `REAL`}
    //setDefault(obj) {   obj[this.name]=0;  }
    getDisplayString(obj: object,objEx:object) : string
    {
        let f : number =<number> obj[this.id];
        return  f.toFixed(2);
    }
}

@FF export class FieldInt extends FieldServer
{
    getDbType() { return `INTEGER`}
    getDisplayString(obj: object,objEx:object) : string
    {
        return  obj[this.id];
    }
}
@FF export class FieldId extends FieldInt
{
    getDbType() { return `INTEGER PRIMARY KEY`}

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
    getDisplayType() { return `DATETIME`}
    getDisplayString(obj: object,objEx:object) : string
    {
        return  Time.getReadableDateTimeFromMs(obj[this.id]);
    }
}



@FF export class FieldAutoKey extends FieldInt
{
    getDbType() { return `INTEGER  KEY AUTOINCREMENT`}
    getDisplayString(obj: object,objEx:object) { return "";}

}
@FF export class FieldKeyInt extends FieldInt
{
    getDbType() { return `INTEGER  KEY`}
    getDisplayString(obj: object,objEx:object) { return "";}

}
@FF export class FieldKeyText extends FieldText
{
    getDbType() { return `TEXT  KEY`}

}


