/**
 *  Copyright  (c)  2022 ZipoSoft, Inc.  All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0.
  */

import * as Fastify from "fastify";
import {processSR} from "@zs_server/RequestHandler";

export class Router {

    route(fastify : Fastify.FastifyInstance)
    {

    }

    register(fastify : Fastify.FastifyInstance,path:string         )
    {
        fastify.register((fastify : Fastify.FastifyInstance,
                          opts: Fastify.RegisterOptions,
                          done: (err?:Error)=>void)=>
        {
            this.route(fastify);
            done();
        },{prefix:path});

    }

}