/**
 *  Copyright  (c)  2022 ZipoSoft, Inc.  All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0.
  */

import {processSR, registerSR} from "../RequestHandler";
import {makeSR, ServerRequestT} from "../ServerRequest";
import * as DV from "/zs_client/zb/DataViewReq"
import {ReqT} from "/zs_client/Ajax";
import * as ZB from "./Database";
import {Router} from "@zs_server/Router";
import * as Fastify from "/node/fastify";
import {ReqRecord} from "/zs_client/zb/DataViewReq";


// Init shared

export function  dataSR<P extends DV.ReqDataParams,D>(req:ReqT<P,D>  )
{
    let cl= class extends DataReq<P ,D>{   constructor() { super(req); }   }
    cl["requestId"]=req.name;
    return cl;
}


export class DataReq<P extends DV.ReqDataParams,D> extends ServerRequestT<P,D>
{
    zb:ZB.ZipoBase=null;
    table: ZB.TableBase=null;

    async preExec()
    {
        let prm=this.params;

        let zb:ZB.ZipoBase =ZB.ZipoBase.openDbs[prm.dbName];

        if(!zb)
            return this.setError("Can't open DB:",prm.dbName);
        zb.open();
        if(prm.tblName)
        {
            this.table=zb.getTable(prm.tblName);
            if(!this.table)
                return this.setError("can't get table:",prm.tblName);
        }
        this.zb=zb;
        return true;
    }
}


registerSR(
    class  extends dataSR(DV.ReqGetDb)
    {   //Get refresh token from home
        async exec()
        {
            this.data.tables=Object.keys(this.zb.tables);

            return true;
        }

        async postExec(): Promise<boolean>
        {
            return true;

        }

    },
    class  extends dataSR(DV.ReqGetRecords)
    {   //Get refresh token from home
        async exec()
        {
            //this.trace();
            this.data.selectRes=this.table.getRowsSliceEx(this.params.select);
            this.data.selectRes.objType=this.table.name;
            return true;
        }

        async postExec(): Promise<boolean>
        {
            return true;

        }

    },
    class  extends dataSR(DV.ReqRecord)
    {
        async delete()
        {
            let res=this.table.deleteRow(this.params.objId,true);
            console.log("delete:",res);
            return true;


        }
        async exec()
        {
            let obj=this.table.getObjById(this.params.objId);
            if(obj)
            {
                this.data.obj=obj;
                this.data.fields=this.table.fields.getAsObject();
                this.data.type=this.table.name;
                this.data.expanded=this.table.objExpand(obj);
                this.data.objId=this.params.objId;


                return true;
            }
            return false;
        }
    },
);

export class DataViewRouter extends Router {

    route(fastify: Fastify.FastifyInstance) {
        fastify.post("*", async (req: Fastify.FastifyRequest, res: Fastify.FastifyReply) => {

            processSR(req, res);
        });
        fastify.get('/:id_db/:id_table/:id_rec',this.record)
        fastify.get('/:id_db/:id_table',this.table)
        fastify.get('/:id_db/',this.db)
        fastify.get('/',this.dblist)

    }
    async dblist(req: Fastify.FastifyRequest, res: Fastify.FastifyReply)
    {
        // @ts-ignore
        return "db list";
    }
    async db(req: Fastify.FastifyRequest, res: Fastify.FastifyReply)
    {
        // @ts-ignore
        let {id_db} = req.params;
        console.log(req.params);
        return "db";
    }
    async table(req: Fastify.FastifyRequest, res: Fastify.FastifyReply)
    {
        // @ts-ignore
        let {id_db, id_table} = req.params;
        console.log(req.params);
        return "";
    }
    async record(req: Fastify.FastifyRequest, res: Fastify.FastifyReply)
    {
        // @ts-ignore
        let {id_db, id_table, id_rec} = req.params;
        console.log(req.params);
        return "";
    }
}



