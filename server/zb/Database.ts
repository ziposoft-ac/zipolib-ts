/**
 *  Copyright  (c)  2022 ZipoSoft, Inc.  All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0.
  */

import  SQL from 'better-sqlite3';
import {SelectParams, SelectResult} from "/zs_client/zb/DataViewReq.js";
import {DataObj} from "/zs_homonym/DataObj";

import path from "path";
import * as FD from "/zs_client/zb/Decor"
import {FieldSet,getMeta,DataObjMeta,DoConT} from "/zs_client/zb/Meta"
import * as fs from 'fs'


export class SqlSelect
{
    stm : SQL.Statement = null;
    exec(zb: ZipoBase, getsql : ()=> string ,...args: any[])
    {
        let all=[];
        if(!this.stm)
        {

            let sql=getsql();
            try
            {
                this.stm = zb.sdb.prepare(sql);
                //console.log("preparing statement");
            }
            catch(e)
            {
                console.log(sql);
                console.log(e);
                throw e;
            }
        }
        try
        {
            all = this.stm.all(...args)
        }
        catch(e)
        {
            console.log(e);
        }

        return all;
    }
}
class SqlTrans
{
    stm : SQL.Statement = null;
    trans =null;
    sql : string;
    exec(commit: boolean,row:  object,zb: ZipoBase, getsql : ()=> string ) :  SQL.RunResult
    {
        if(!row)
        {
            throw new Error("SqlTrans row is null");
        }
        let result: SQL.RunResult={changes:0, lastInsertRowid:0};

        if(!this.trans)
        {
            let sql=getsql();
            this.sql=sql;
            try
            {
                this.stm = zb.sdb.prepare(sql);
                this.trans=zb.sdb.transaction((row) => {
                    let result=this.stm.run(row);
                   // console.log("SqlTrans run:",result);
                    return result;
                });
            }
            catch(e)
            {
                console.log("SqlTrans PREPARE failed");

                console.log(sql);
                console.log(e);
                throw(e);
            }
        }
        try
        {
            if(commit)
                result=this.trans(row);
            else
                result=this.stm.run(row);

        }
        catch(e)
        {
            console.log("SqlTrans EXEC failed");
            console.log("row in: ",row);
            console.log("SQL: ",this.sql);


            console.log(e);
            throw(e);
        }
        return result;
    }
}
interface sqlColMeta
{
    cid: number;
    type: string;
    dflt_value: any;
    name: string;
}
export abstract class TableBase
{
    zb : ZipoBase;
    meta : DataObjMeta;
    cols : object;
    name : string;
    abstract newObj():DataObj;
    abstract  getObjById(id:number) :  DataObj;

    get fields() :  FieldSet
    {
        return this.meta.fields
    }
    updateStructure()
    {
        let colsMeta: sqlColMeta[]=this.zb.sdb.pragma(`table_info(${this.name})`);
        let existingCols=new Map<string,sqlColMeta>();
        for(let col of colsMeta)
            existingCols.set(col.name,col);
        for(let fld of this.fields)
        {
            if(fld.getDbType()==null)
                continue;

            let exists=existingCols.get(fld.id);

            if(!exists)
            {
                console.log("COL ",fld.id," does not exist in table:",this.name);
                let res=this.execSql(`ALTER TABLE ${this.name}  ADD COLUMN ${fld.id} ${fld.getDbType()}`);


            }
        }


    }

   // abstract createFieldSet():  F.FieldSet;

   // stm_create : SQL.Statement = null;
    stm_get_all : SQL.Statement = null;
    select_slice  =new SqlSelect();
    select_by_id  =new SqlSelect();
    select_by_rowid  =null;
    private select_arr : Record<string, SqlSelect >={};

    protected trans_arr : Record<string, SqlTrans >={};
    protected getTrans(name:string)
    {
        if(!(name in this.trans_arr))
            this.trans_arr[name]=new SqlTrans();
        return this.trans_arr[name];
    }

    protected getSelect(name) : SqlSelect
    {
        if(!(name in this.select_arr))
            this.select_arr[name]=new SqlSelect();
        return this.select_arr[name];
    }

    runSelect(sql:string) : any
    {

        try
        {
            let statment= this.zb.sdb.prepare(sql);
            return statment.all();
        }
        catch(e)
        {
            console.log(sql);
            console.log(e);
        }
    }

    execSql(sql:string) : any
    {

        try
        {
            let statment= this.zb.sdb.prepare(sql);
            const transaction = this.zb.sdb.transaction(() => {
                return statment.run();
            });
            return transaction();
        }
        catch(e)
        {
            console.log(sql);
            console.log(e);
        }
    }
    create()
    {

        let cols= "";
        for(const f of this.fields)
        {

            let dt=f.getDbType();
            if(dt==null) continue;
            if(cols)
                cols+=',';
            cols+=f.id+" "+dt;
        }
        if(!cols)
        {
            console.log(`Table  ${this.name}  has no columns`);
            return;
        }
        this.execSql(`CREATE TABLE IF NOT EXISTS ${this.name} (${cols})`);
    };

    trans_delete  =new SqlTrans();
    deleteRow(id:number,commit=true)
    {
        return this.trans_delete.exec(commit, {id:id},this.zb,()=>{
            let sql=`DELETE FROM ${this.name} WHERE id = @id`;
            return sql;
        });
    };



    getRowByTxtId(id:string)
    {
        let rows= this.select_by_id.exec(this.zb,()=>{

            let sql=`SELECT * FROM  ${this.name} WHERE id = ?`;
            return sql;
        },id);
        if(rows.length)
        {
            return rows[0];

        }
        return null;
    }
    getRowById(id:number)
    {
        let rows= this.select_by_id.exec(this.zb,()=>{
            let sql=`SELECT * FROM  ${this.name} WHERE id = ?`;
            return sql;
        },id);
        if(rows.length)
        {
            return rows[0];

        }
        return null;
    }
    getRowsByCond(cond : object) : any[]
    {
        let name="";
        for(let key in cond)
        {
            name+=key;
        }
        return this.getRowsByQueryName(name,cond);
    }
    getRowsByQueryName(name,cond : object) : any[]
    {
        // This creates a new select obj for every call
        let select  =this.getSelect(name);
        let rows= select.exec(this.zb,()=>{
            let wh= "";
            for(const key in cond)
            {
                if(wh)
                    wh+=' AND ';
                wh+=`${key}= :${key} `;
            }
            let sql=`SELECT * FROM  ${this.name} WHERE ${wh} `;
            return sql;
        },cond);
        return rows;
    }
    /*
    getSummaryOfObject(o:DataObj ) : string
    {
        let flds=this.meta.fields;
        let h="";
        for (let f of flds) {
            if(h) h+=" ";
            h+=f.getDisplayString(o,(type, id) =>
            {
                let tbl=this.zb.getTable(type.name);
                let obj=tbl.getObjById(id);
                return tbl.getSummaryOfObject(obj);
            });

        }
        return h;
    }

     */
    rowsToObjs(rows ) : DataObj[]
    {
        let arr:DataObj[] =[];
        for(let row of rows)
        {
            let obj = this.newObj();
            obj.copyFromDbRow(row);
            arr.push(obj);
        }
        return arr;
    }

    getRows()
    {

        this.stm_get_all =  this.stm_get_all || this.zb.sdb.prepare(`SELECT * FROM  ${this.name}`);
        const all = this.stm_get_all.all();
        return all;
    };
    iterateRows(callback : (row:any[])=>boolean)
    {

        this.stm_get_all =  this.stm_get_all || this.zb.sdb.prepare(`SELECT * FROM  ${this.name}`);
        for(const row of this.stm_get_all.iterate())
        {
            if(callback(row))
                break;
        }
    };
    getRowsSlice(params:SelectParams) : DataObj[]
    {

        let sql=`SELECT * FROM  ${this.name} ORDER BY ${params.orderby} LIMIT  ${params.limit} OFFSET  ${params.offset}`;
        let rows=this.runSelect(sql);
        return this.rowsToObjs(rows);

        /*
        let rows= this.select_by_id.exec(this.zb,()=>{
            let sql=`SELECT * FROM  ${this.name} ORDER BY :orderby LIMIT :limit OFFSET :offset`;
            return sql;
        },params);
        return this.rowsToObjs(rows);

         */
    }
    objExpand(obj:DataObj) : object
    {
        let flds=this.meta.fields;
        let ex:object=null;
        for(let f of flds)
        {
            let idx=f.getIndex(obj);
            if(idx)
            {
                let tbl=this.zb.getTable(idx.indexedType.name);
                if(tbl)
                {
                    let obj=tbl.getObjById(idx.id);
                    ex??={};
                    ex[f.id]=obj;
                }
            }
        }
        return ex;
    }
    getRowsSliceEx(params:SelectParams) : SelectResult
    {

        let sr=new SelectResult();
        let rows=this.getRowsSlice(params);
        let flds=this.meta.fields;

        for(let i=0;i<rows.length;i++)
        {
            let obj=rows[i];
            let ex=this.objExpand(obj);
            if(ex)
                sr.expanded[i]=ex;

        }
        sr.fields=flds.getAsObject();
        sr.arr=rows;
        return sr;
    }
}

type funcPointer = (...args : any[]) => any;

export class Table<T extends DataObj> extends TableBase
{


    ctor: DoConT<T>;
    classRef: typeof DataObj;
    constructor(classRef : typeof DataObj)
    {
        super();

        //this.ctor=tConstructor;
        // @ts-ignore
        this.ctor=classRef.prototype.constructor;
        // @ts-ignore
        this.meta=getMeta(this.ctor);

        this.classRef=classRef;
        this.name=classRef.name;

        //this.db=db;
    }


    addNew(objIn : Partial<T>) : T
    {
        let o=this.newObjT();
        o.merge(objIn);
        try {
            let r=this.insert(o);
            if(r.changes)
            {
                let row=this.getRowById(<number>r.lastInsertRowid);
                Object.assign(o,row);
            }
        }
        catch (e)
        {
            console.log(e);
            return null;
        }
        return o;
    }
    newObj():DataObj
    {
        return new (this.ctor)();
    }
    newObjT():T
    {
        let obj : T = new (this.ctor)();
        return obj;
    }
    dumpCols()
    {
        //console.log(this.ctor.cols);
    }
    getRowsSliceT(params:SelectParams) : T[] { return  <T[]>this.getRowsSlice(params); }


    setObjBy(keys : Array<string>, obj_in : T)
    {
        let cond={};
        let name="";
        for(const key of keys)
        {
            cond[key]=obj_in[key];
            name+=key;
        }
        let existing : T = this.getObjByQueryName(name,cond);
        if(existing)
        {
            let id=existing.id;//IMPORTANT!! SAVE ROW ID
            Object.assign(existing,obj_in);
            existing.id=id;
            this.updateById(existing,true);


        }
        else
        {
            this.insert(obj_in,true);
        }
    }
    /*
    transaction(funcPointer,...args : any[])
    {
        let trans=this.zb.sdb.transaction( funcPointer);
        trans(args);
    }*/
    setObjsById(objs: T[]) {
        let trans=this.zb.sdb.transaction((objs) => {
            for(let obj of objs)
            {
                let existing = this.getObjById(obj.id);
                if (existing) {
                    Object.assign(existing, obj);
                    this.updateById(obj,false);
                }
                else {
                    this.insert(obj,false);
                }
            }
        });
        trans(objs);
    }
    setObjById(obj_in,commit:boolean=true) {

        let existing = this.getObjById(obj_in.id);
        if (existing) {
            Object.assign(existing, obj_in);
            this.updateById(obj_in,commit);
        }
        else {
            this.insert(obj_in,commit);
        }
    }
    getFirstObjByCond(cond : Partial<T>) : T
    {
        let arr=this.getObjsByCond(cond);
        if(!arr.length)
            return null;
        if(arr.length>1)
        {
            console.log("warning: multiple rows found, returning first")
        }
        return arr[0];
    }

    getExpanded(objs: T[]): object[]
    {
        let indexed=[];
        for(let o of objs)
        {
            for(let f of this.fields)
            {
                //if(f.getDbType())
            }

        }
        return indexed;
    }


    getObjsByCond(cond : Partial<T>) : T[]
    {
        // This creates a new select obj for every call
        return this.rowsToObjs(this.getRowsByCond(cond));
    }
    getObjByQueryName(queryName,cond : object) : T
    {

        let arr=this.getObjsByQueryName(queryName,cond);
        if(!arr.length)
            return null;
        if(arr.length>1)
        {
            // TODO throw error?
            return null;

        }
        return arr[0];
    }

    getObjById(id:number) : T
    {
        let row= this.getRowById(id);
        if(row)
        {
            let obj:T = this.newObjT();
            return obj.copyFromDbRow(row);

        }
        return null;
    }
    getObjsByQueryName(queryName : string,cond : object) : T[]
    {
        // This creates a new select obj for every call
        return this.rowsToObjs(this.getRowsByQueryName(queryName,cond));
    }



    replaceById(obj : T,commit:boolean=true)
    {
        let row=obj.copyToDbRow();

        return this.getTrans('replace_id').exec(commit,row,this.zb,()=>{
            let cols="";
            let vals="";
            for(const f of this.fields)
            {
                if(!f.getDbType()) continue;
                if(cols)
                {
                    cols+=',';
                    vals+=',';
                }
                cols+=f.id;
                vals+='@'+f.id;
            }
            let sql=`REPLACE INTO ${this.name} ( ${cols})  VALUES (${vals})`;
            return sql;
        });
    };
    trans_insert  =new SqlTrans();
    insert(obj : T,commit:boolean=true)
    {
        let row=obj.copyToDbRow();

        return this.trans_insert.exec(commit,row,this.zb,()=>{
            let cols="";
            let vals="";
            for(const f of this.fields)
            {
                if(!f.getDbType()) continue;
                if(cols)
                {
                    cols+=',';
                    vals+=',';
                }
                cols+=f.id;
                vals+='@'+f.id;
            }
            let sql=`INSERT INTO ${this.name} ( ${cols})  VALUES (${vals})`;
            return sql;
        });
    };
    updateById(obj : T,commit:boolean=true)
    {

        return this.updateBy(obj,"id",commit);
    };
    updateBy(obj : T,key_id: string,commit:boolean)
    {
        //TODO - this is bad. The obj:T must be a class instance, cant be a partial
        let trans=this.getTrans('update_by'+key_id);
        let row=obj.copyToDbRow();

        return trans.exec(commit,row,this.zb,()=>{
            let st="";
            for(const f of this.fields)
            {
                if(!f.getDbType()) continue;
                if(st) st+=',';
                st+=`${f.id} = @${f.id}`;
            }
            let sql=`UPDATE ${this.name} SET ${st} WHERE ${key_id} = @${key_id}`;
            return sql;
        })
    };


    rowsToObjs(rows ) : T[]
    {
        let arr:T[] =[];
        for(let row of rows)
        {
            let obj:T = this.newObjT();
            obj.copyFromDbRow(row);
            arr.push(obj);
        }
        return arr;
    }
    getObjs() : T[]
    {
        let rows=this.getRows();
        return this.rowsToObjs(rows);
    }
    getObjsInterpet() : T[]
    {
        let rows=this.getRows();
        let arr:T[] =[];
        for(let row of rows)
        {
            let obj:T = this.newObjT();
            obj.copyFromDbRow(row);
            arr.push(obj);
        }
        return arr;
    }
    iterateObjs(callback : (obj:T)=>boolean) : T
    {
        let obj:T=null;
        this.iterateRows((row)=>{
            obj = this.newObjT();
            obj.copyFromDbRow(row);

            return callback(obj);
        });
        return obj;
    };




}
export class IdxString extends DataObj {
    constructor(val:string=null) {
        super();
        this.txt=val;

    }
    @FD.Text txt: string = "";
}
export class TableIdxString<T extends IdxString> extends Table<T>
{
    constructor(classRef : typeof IdxString) {
        super(classRef);
    }
    getOrAddStr(val:string)
    {
        if(!val)
            val="";
        let o=this.getFirstObjByCond(<Partial<T>> {txt:val});
        if(!o)
        {
            o=this.addNew(<Partial<T>> {txt:val});
        }
        return o;
    }
}
export class ZipoBase
{
    static openDbs : Record<string, ZipoBase>={};

    sdb : SQL.Database=null;
    fullpath: string;
    name: string;
    tables: {
        [name: string]: TableBase;
    } = {};
    constructor(pathdir:string, name:string ) {
        this.name=name;
        this.fullpath=path.join(pathdir,name);
        ZipoBase.openDbs[name]=this;

    }
    updateStructure()
    {
        this.open();
        for(const key in this.tables)
        {
            this.tables[key].updateStructure();
        }
    }
    addTable<T extends TableBase>(t : T,name:string=null) : T
    {
        if(!name)
            name=t.name;
        this.tables[name]=t;
        t.zb=this;
        return t;
    }


    makeTableStrIdx<T extends IdxString>(classRef: (new () => T) ): TableIdxString<T >
    {
        return this.addTable(new TableIdxString<T>(classRef));
    }
    makeTable<T extends DataObj>(classRef: (new () => T) ): Table<T >
    {
        return this.addTable(new Table<T>(classRef));
        /*
        let name=classRef.name;
        let t=new DvTable<T>(classRef);
        this.tables[name]=t;
        t.zb=this;
        return t;

         */
    }
    getTable(key : string) : TableBase
    {
        if(key in this.tables)
        {
            return this.tables[key];
        }
        return null;

    }
    create()
    {
        for(const key in this.tables)
        {
            this.tables[key].create();
        }
    }


    open(options={})
    {
        if(this.sdb)
            return;

        this.sdb=new SQL(this.fullpath);
        this.create();

    }
    close()    {
        //this.sdb.close();
        //this.sdb=null;
    }
    delete_file()
    {

    }
    getTableList()
    {
        let list=[];
        for(let t in this.tables)
        {
            list.push(t);
        }
        return list;
    }

    deleteAndReopen()
    {
        this.sdb=null;
        fs.unlinkSync(this.fullpath);
        this.open();

    }
}


export function runtest() {


    var db = new SQL("database.db", {});

    /*
    const table = db.prepare('CREATE TABLE IF NOT EXISTS cats (name, age)');
    const createtable = db.transaction(() => {
        table.run();
    });
    createtable();

    const insert = db.prepare('INSERT INTO cats (name, age) VALUES (@name, @age)');

    const insertMany = db.transaction((cats) => {
        for (const cat of cats) insert.run(cat);
    });

    insertMany([
        {name: 'Joey', age: 2},
        {name: 'Sally', age: 4},
        {name: 'Junior', age: 1},
    ]);

     */
    const insert = db.prepare('REPLACE INTO cats (name, age) VALUES (@name, @age)');
    insert.run()

    const stmt = db.prepare('SELECT * FROM cats');
    const cats = stmt.all();
    console.log(cats);


}
