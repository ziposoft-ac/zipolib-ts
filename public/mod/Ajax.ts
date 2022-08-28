

/**
 *  Copyright  (c)  2022 ZipoSoft.com, Inc.  All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0.  */

export class  AjaxParams
{

    secure_token: string="";
    debug=false;
    requestId: string="none";
    action:string=null;
    params: Object;
}
export class AjaxResponse
{

    fetchResp : Response=null;
    success: boolean = false;
    log : string[]=[];
    time_total_request: number=0;
    error_msg: string="Not Processed";
    data: Object;
    stack: string="";

}
export class  AjaxParamsT<PARAMS  extends Object> extends AjaxParams
{
    constructor(paramT :   (new () => PARAMS)) {
        super();
        this.params=new paramT();
    }
    params: PARAMS;
}
export class AjaxResponseT<DATA extends Object> extends AjaxResponse
{
    constructor(dataT :   (new () => DATA)) {
        super();
        this.data=new dataT();
    }
    data: DATA;
}
function makeParam<PARAMS>(paramT :   (new () => PARAMS))
{
    return new AjaxParamsT<PARAMS>(paramT);
}
function makeResponse<DATA>(dataT :   (new () => DATA))
{
    return new AjaxResponseT<DATA>(dataT);
}
enum ReqLevel
{
    public,
    user,
    admin,
    root,
    debug
}
export class AjaxRequestBase
{
    createObjs=false;

    reqLevel: ReqLevel=ReqLevel.admin;
    clientPostRx() {}
}
export class AjaxRequest<PARAMS,DATA> extends AjaxRequestBase
{
    in:AjaxParamsT<PARAMS>;
    out:AjaxResponseT<DATA>;
}


import * as Util from "/zs_client/Util.js";

export function  Req<PARAMS,DATA>(paramT :   (new () => PARAMS),dataT :   (new () => DATA)  )
{
    //Util.gObjFactory.addClass(dataT);
    let cl= class extends AjaxRequest<PARAMS,DATA>{
        constructor() {
            super();
            this.in=new AjaxParamsT<PARAMS>(paramT);
            this.out=new  AjaxResponseT<DATA>(dataT);
        }
    };

      return cl;
}
export type ReqT<P,D>= (new () => AjaxRequest<P,D>);

