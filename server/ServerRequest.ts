/**
 *  Copyright  (c)  2022 ZipoSoft, Inc.  All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0.
  */

import {AjaxParams, AjaxParamsT, AjaxRequest, AjaxResponse,AjaxRequestBase, AjaxResponseT, ReqT} from "/zs_client/Ajax";
import {Logger, LoggerArray} from "/zs_client/Logger";


export class ServerRequest
{
    requestId: string="none";
    in:AjaxParams;
    out:AjaxResponse;
    req: AjaxRequestBase;

    logger=new LoggerArray();

    log(...args: any[]) {
        this.logger.log(...args);
    };
    trace()
    {
        this.logger.traceLine(0);
    }
    setError(...args) : boolean
    {
        this.logger.log(...args);
        this.logger.traceLine(0);
        this.out.error_msg=args.join();
        this.out.success=false;
        return false;

    }
    readInput(input)
    {
        Object.assign(this.in,input);

    }
    async preExec() : Promise<boolean>
    {
        return true;
    }
    async exec(): Promise<boolean>
    {
        return true;

    }
    async postExec(success:boolean): Promise<boolean>
    {
        return true;

    }
    preSend()
    {
        this.out.log=this.logger.lines;
    }
    postSend()
    {
    }
}

export class ServerRequestT<P,D> extends ServerRequest
{
    get params() : P { return this.in.params }
    get data() : D { return this.out.data }
    override in:AjaxParamsT<P>;
    override out:AjaxResponseT<D>;
    //reqT :  ReqT<P,D>;
    override req: AjaxRequest<P,D>;
    constructor(ajaxReqT: ReqT<P,D> ) {
        super( );
        this.requestId=ajaxReqT.name;
        //this.in=ajaxReqT["pT"]();
        //this.out=ajaxReqT["dT"]();
        let req=new ajaxReqT();
        this.in=req.in;
        this.out=req.out;
        this.req=req;
        //this.reqT=ajaxReqT;
    }
}

var SR_Registry : Record<string, typeof ServerRequest>={};


export function  makeSR<P,D>(ajaxReqT:ReqT<P,D>  )
{
    let cl= class extends ServerRequestT<P,D>{
        constructor() {
            super(ajaxReqT);
        }
    }
    cl["requestId"]=ajaxReqT.name;
    return cl;
}

