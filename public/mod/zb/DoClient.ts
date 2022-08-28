/**
 *  Copyright  (c)  2022 ZipoSoft, Inc.  All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0.
  */

import {IField} from "/zs_client/zb/IField.js";
import {FieldSetT} from "/zs_client/zb/Meta.js";
import {Fld,DecFunc} from "/zs_client/zb/Decor.js";
import {FF, FieldInt,FieldClient} from "/zs_client/zb/FieldsClient.js";
import {DataObj} from "/zs_client/zb/Meta.js";


export class FieldSetClient extends FieldSetT<FieldClient>
{

}

export class  DataObjClient extends DataObj
{

}


export interface  IFieldIdx extends IField{
    indexedType:  typeof DataObj;
}
@FF export class FieldIndexInt extends FieldInt
{
    indexedType: typeof DataObj;
    // refTable : string;

    getDisplayString(obj: object,objEx:object)
    {
        let key=obj[this.id];
        if(objEx)
        {
            let d=<DataObj>objEx[this.id];
            if(d instanceof DataObj)
                return d.getSummaryString();


        }
        return key;



    }
    constructor( props : IFieldIdx) {
        super(props);
        this.indexedType=props.indexedType;

    }
}
export function IndexInt( classRef : typeof DataObj ,opt:Partial<IFieldIdx> ={}  ) : DecFunc
{

    return (c,id)=>
    {
        opt.indexedType=classRef;
        Fld(c,id,FieldIndexInt,opt);

        //getMeta(c.constructor).addField(id,new F.FieldIndexInt(p));
    }
}
