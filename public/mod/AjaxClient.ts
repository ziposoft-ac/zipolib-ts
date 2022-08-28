/**
 *  Copyright  (c)  2022 ZipoSoft, Inc.  All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0.
  */

import * as Util from "/zs_client/Util.js";

import { AjaxParamsT, AjaxRequest,  AjaxResponseT, ReqT} from "/zs_client/Ajax.js";
/*
if (typeof window === 'undefined')
{
    var fetch = await import('node-fetch');
}


 */

export class ClientRequestT<PARAMS,DATA>
{
    abortController = new AbortController();

    path:string="/";
    req: AjaxRequest<PARAMS,DATA>;
    requestId: string="none";
    get in() { return this.req.in;}
    get out() { return this.req.out;}
    constructor(public reqT: ReqT<PARAMS,DATA>,
                path="/") {
        this.req=new reqT();
        this.path=reqT["path"];
        this.requestId=reqT.name;
        this.path=path;
    }

    async exec(params:Partial<PARAMS>=null,debug=false,fetchFunc=null) : Promise<AjaxResponseT<DATA>>
    {
        if(params)
            Object.assign(this.in.params,params);

        return await this.fetchPost(debug,fetchFunc);
    }
    async action(act:string,params:Partial<PARAMS>=null) : Promise<AjaxResponseT<DATA>>
    {
        this.in.action=act;
        if(params)
            Object.assign(this.in.params,params);

        return await this.fetchPost();
    }
    async run(req:Partial<AjaxParamsT<PARAMS>>,params:Partial<PARAMS>=null) : Promise<AjaxResponseT<DATA>>
    {
        Object.assign(this.in,req);
        if(params)
            Object.assign(this.in.params,params);

        return await this.fetchPost();
    }
    onResponse(resp : AjaxResponseT<DATA>) {}
    onData(data : DATA) {}
    onError(error_msg:string)
    {
        console.log("Request Failed:",error_msg);
        if(this.out.stack)
        {
            console.dir(this.out.stack);
        }

    }
    dumpLog()
    {
        for(let line of this.out.log)
        {
            console.log("SERVER:",line);
        }
    }
    abort()
    {
        console.log("Aborting request:",this.requestId);
        this.abortController.abort();
    }
    async fetchPost(debug=false,fetchFunc=null) : Promise<AjaxResponseT<DATA>>
    {
        let res : Response=null;
        if(!fetchFunc)
            fetchFunc=globalThis.fetch;

        this.in.requestId=this.requestId;
        try
        {
            res = await fetchFunc(this.path,{
                signal:this.abortController.signal,
                method: 'post',
                body:  JSON.stringify(this.in),
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            });

        }catch (ex)
        {
            if(res)
            {
                console.dir(res.headers);
                console.log(res.status);
                console.log(res.statusText);
                this.out.error_msg=res.statusText;
                this.onError(res.statusText);
            }
            else
            {
                console.dir(ex);

            }
            //throw();
        }
        if(res)
        {
            if (!res.ok)
            {
                console.dir(res.headers);
                console.log(res.status);
                this.out.error_msg=res.statusText;
                this.onError(res.statusText);
            }
            if(res.ok)
            {
                if(this.req.createObjs)
                {
                    let recv= await res.text();
                    if(debug)
                        console.log(recv);
                    // @ts-ignore
                    this.req.out=Util.gObjFactory.load(recv);
                }
                else
                {
                    try
                    {

                        let recv= await res.json();
                        Object.assign(this.out,recv);
                    }
                    catch (e) {
                        console.log("cant parse JSON ajax data:",res.body)
                    }



                }
                let defData=this.out.data;

                this.dumpLog();
                console.log("REQ",this.requestId+":"+this.in.action,"took:"+this.out.time_total_request);
                if(this.out.success)
                {
                    this.req.clientPostRx();
                    this.onData(this.out.data);
                }
                else
                {
                    this.out.data=defData;//preserve default data

                    this.onError(this.out.error_msg);
                }

            }
        }

        return <AjaxResponseT<DATA>>this.out;
    }
}


export function  clientReq<PARAMS,DATA>(ajaxReqT: (new () => AjaxRequest<PARAMS,DATA>),path="/"  )
{
    return class extends ClientRequestT<PARAMS,DATA>{
        constructor() {    super(ajaxReqT,path);    }
    }
}
export function  newClientReq<PARAMS,DATA>(ajaxReqT: (new () => AjaxRequest<PARAMS,DATA>),path="/"  )
{
    let temp= class extends ClientRequestT<PARAMS,DATA>{
        constructor() {    super(ajaxReqT,path);    }
    }
    return new temp();
}
