/**
 *  Copyright  (c)  2022 ZipoSoft, Inc.  All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0.
  */

import {IField, IFieldSet} from "/zs_client/zb/IField.js";
import * as F from "/zs_homonym/Fields.js";
import * as Util from "/zs_client/Util.js";


export type FldConT<T extends F.Field> = new (iF:IField) => T;

export class FieldSetT<FT extends F.Field>
{
    map =new Map<string, FT>();
    constructor(o:IFieldSet=null) {
        if(o)
            for(let i in o.set ) {
                let iF=o.set[i];
                let fldCon=<FldConT<FT>>F.fldFactory.get(iF.type);
                if(!fldCon)
                {
                    console.log("Bad field type:",iF.type);
                    continue;
                }
                let fld=new (fldCon)(iF);
                this.map.set(i,fld);
            }

    }
    mergeSet(other:FieldSetT<FT>)
    {
        other.map.forEach((f,k)=>this.set(k,f));

    }
    set(id:string,fld: FT)
    {
        this.map.set(id,fld);
    }
    [Symbol.iterator]() { return this.map.values(); }
    getAsObject() : IFieldSet
    {
        let obj:IFieldSet={ set:{} };
        this.map.forEach((f,k)=>{
            obj.set[k]=f.props;
            //obj.set[k]["__type__"]=f.constructor.name;
            f.props.type=f.constructor.name;
        });
        return obj;
    }
    getJson() : string
    {
        return JSON.stringify(this.getAsObject());
    }
}
export type DOC = new () =>  DataObj;

export class FieldSet extends FieldSetT<F.Field>
{

}
export class DataObjMeta
{
    con :  DOC
    name="?";
    constructor(con : DOC) {
        this.con=con;
        this.name=con.name;
        Util.gObjFactory.addClass(con);

        //dataFactory.addClass(con);
        //console.log("do: ",this.name);
    }
    protected fsUnique : FieldSet = new  FieldSet();
    protected fsAll : FieldSet = null;
    get fields() :  FieldSet
    {
        if(!this.fsAll)
        {
            this.fsAll= new  FieldSet();
            this.createFieldSet(this.fsAll);
        }
        return this.fsAll;
    }

    addField(name:string,fld:F.Field) : F.Field
    {
        this.fsUnique.set(name,fld);
        return fld;
    }
    createFieldSet(set: FieldSet){


        if(this.con.name!="DataObj")
        {
            // @ts-ignore
            let base=this.con.__proto__;

            let m=getMeta(base);
            if(m)
                m.createFieldSet(set);
        }
        set.mergeSet(this.fsUnique);

    }
}
export function getMeta(con: DOC) :DataObjMeta
{
    const metaKey="__meta_"+con.name;
    let m= con[metaKey];
    if(!m)
    {
        m=con[metaKey]=new DataObjMeta(con);
        m.addField('id',new F.FieldId({id: 'id',name:'id' }));
    }
    return m;
}


export type DoConT<T extends DataObj> = new () => T;

export class  DataObj
{
    id: number; //dont specify ID, allow autokey
    getId():number
    {
        return this.id;
    }
    get fields() : FieldSet
    {
        return this.meta.fields;
    }
    constructor() {
    }
    get meta() :DataObjMeta
    {
        // @ts-ignore
        return getMeta(this.constructor);
    }
    copyToDbRow() : Object  {
        let row= {};
        for(let f of this.meta.fields)
            f.copyToDb(this,row);

        return row;
    }
    copyFromDbRow(row : Object)   {
        for(let f of this.meta.fields)
        {
            f.copyFromDb(this,row);
        }

        return this;
    }
    merge(obj : Object=null) {
        if(obj)
        {
            for(let key in obj)
            {
                if((key in this)||(key=='id'))
                {
                    this[key]=obj[key];
                }
            }
        }
    }

    getSummaryString(flds:FieldSet=this.meta.fields) : string
    {
        let h="";
        for (let f of flds) {
            if(f.props.summary)
            {
                if(h) h+=" ";
                h+=f.getDisplayString(this,null);
            }


        }
        return h;
    }
    consoleDump()
    {

        for(let f of this.meta.fields)
        {
            console.log(`${f.id}: ${f.getDisplayString(this,null)}`);
        }
    }
    getHtmlTable() : string
    {
        let h='<table>';
        for (const [key, value] of Object.entries(this)) {
            h+=`<tr><td>${key}</td><td>${value}</td></tr>`;
        }
        h+='</table>';
        return h;
    }
    dumpFields()
    {
        console.log(this.meta.fields);

    }
}