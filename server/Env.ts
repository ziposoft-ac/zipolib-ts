/**
 *  Copyright  (c)  2022 ZipoSoft, Inc.  All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0.
  */

import pathlib from "path";


function func(...pathSegments: string[]): string
{
    return "x";
}

export class Env
{
    path(...pathSegments: string[]): string
    {
        pathSegments.unshift(this.root);
        //let path= pathlib.resolve(pathSegments);

        let p= pathlib.resolve.apply(pathlib,pathSegments);
        //let p=func.apply(null,["f"]);
        //console.log(p);
        return p;

    }
    root ="";
    constructor() {

        this.root=global["proj_root"] ?? pathlib.resolve();

    }

}
export var gEnv = new Env();
