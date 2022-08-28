/**
 *  Copyright  (c)  2022 ZipoSoft, Inc.  All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0.
  */

import * as ajax from "../Ajax.js"
import {IField,IFieldSet} from "/zs_client/zb/IField.js";
import {DataObj} from "/zs_homonym/DataObj.js";

export class SelectParams
{
    orderby="id";
    limit=100;
    offset=0;
}

export class SelectResult
{
    objType:string="unknown";
    arr:object[]=[];
    expanded:object[]=[];
    fields: IFieldSet={ set: {}};
}

export class ReqGetDbTypes extends ajax.Req(
    class{}, class
    {
        types:string[]=[];
    }
)
{

}

export class ReqDataParams
{
    dbName="stravacache.db";
    tblName: string=null;
}


export class ReqGetDb extends ajax.Req(
    ReqDataParams,
    class
    {
        files:string[]=[];

        tables:string[]=[];
    }
)
{

}
export class Record
{
    objId:number=-1;
    type: string="unknown";
    obj:DataObj=null;
    expanded:object={};
    fields: IFieldSet={ set: {}};
}

export class ReqRecord extends ajax.Req(
    class extends ReqDataParams
    {
        objId:number=-1;
    },
    Record
)
{
    override createObjs=true;
    override clientPostRx() {
        if(!(this.out.data.obj instanceof DataObj))
        {
            let obj=new DataObj();
            this.out.data.obj=Object.assign(obj,this.out.data.obj);

        }
    }
}

export class ReqGetRecords extends ajax.Req(
    class extends ReqDataParams
    {
        select=new SelectParams();
    },
    class
    {
        selectRes:SelectResult=null;
    }
)
{
    override createObjs=true;

}
