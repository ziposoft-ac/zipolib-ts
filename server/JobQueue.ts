/**
 *  Copyright  (c)  2022 ZipoSoft, Inc.  All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0.
  */

export class JobQueue<JobParams>
{
    private jobMap=new Map<string,JobParams>();
    private outstanding_jobs=0;
    private timer=null;
    private queue=[];

    //type RunJobFunc=(id:string,p:JobParams,cb:()=>void )=>void;
    getSize()
    { return this.queue.length }
    parent:Object=null;
    parentCallback : (jobId:string,p:JobParams,cb:()=>void )=>void=null;
    name="queue";
    max_concurrent_jobs=5;
    clockTick=1000;

    constructor(name:string,parent: object,parentCallback:(id:string,p:JobParams,cb:()=>void )=>void) {
        this.name=name;
        this.parent=parent;
        this.parentCallback=parentCallback;
    }
    add(jobId:string,jobParams:JobParams) : number
    {
        if(!this.jobMap.has(jobId))
        {
            this.jobMap.set(jobId,jobParams);
            this.queue.push(jobId);
            this.start_process();
            //console.log("added#",id," total:",this.queue.length);
        }
        else
        {
            //console.log("dup#",id);
        }

        return this.queue.length;
    }
    start_process()
    {
        if(!this.timer)
        {
            if(this.queue.length>0)
                this.timer=setTimeout(this.run.bind(this),this.clockTick)
        }
    }

    run()
    {
        //console.log("START QUE:",this.name);
        while(this.queue.length)
        {
            if(this.outstanding_jobs>=this.max_concurrent_jobs)
            {
                //console.log("QUE:",this.name," fetches:",this.outstanding_fetchs);

                break;

            }
            let id=this.queue.shift();
            this.outstanding_jobs++;

            let jobParams=this.jobMap.get(id);
            this.jobMap.delete(id);

            this.parentCallback.call(this.parent,id,jobParams,()=>
            {
                this.outstanding_jobs--;
                this.start_process();
                console.log(`QUE ${this.name} done#`,id,this.outstanding_jobs,"left");


            });
        }
        this.timer=null;
        //console.log("EXIT QUE:",this.name);

    }


}
