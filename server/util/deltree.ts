/**
 *  Copyright  (c)  2022 ZipoSoft, Inc.  All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0.
  */

//#!/usr/local/bin/node

import * as fs from "fs";
import * as  pathlib from "path";
import * as process from "process";


type TreeCallback=  (fullpath:string,relpath:string,name:string)=>Promise<boolean>;

interface treeOptions
{
    rootpath: string,
    match : string,
    callbackFile:  (fullpath:string,relpath:string,name:string)=>Promise<boolean>
    callbackDirStart?:  (relpath:string)=>Promise<boolean>
    callbackDirEnd?:  (relpath:string,files:string[])=>Promise<boolean>
}

export async function traverseTree(relpath: string,opt: treeOptions ) : Promise<boolean>
{
    let ls: fs.Dirent[]= fs.readdirSync(opt.rootpath+"/"+relpath,{withFileTypes:true}) ;
    if(!opt.match)
    {
        console.log("Must specify matching string");
        return false;
    }
    let filesFound:string[]=[];
    for(let de of ls )
    {
        if(de.isDirectory())
        {
            let subpath= relpath+de.name+"/";
            let rez=await traverseTree(subpath,opt);
            if(!rez)
                return false;


            continue;
        }
        if(de.name.includes(opt.match))
        {
            if(opt.callbackDirStart)
                if(!filesFound.length)
                {
                    if(!await opt.callbackDirStart(relpath))
                        return false;
                }
            let fullpath=pathlib.join(opt.rootpath,relpath,de.name);
            if(!await opt.callbackFile(fullpath,relpath,de.name))
                return false;
            filesFound.push(de.name);

        }

    }
    if(opt.callbackDirEnd)
        if(filesFound.length)
            await opt.callbackDirEnd(relpath,filesFound);
    return true;
}

export async function treeDel(rootpath: string, match : string): Promise<void>
{
    let opt:treeOptions=
        {
            rootpath:rootpath,
            match:match,
            callbackFile:
                async (fullpath:string,relpath:string,name:string)=>
                {
                    console.log(fullpath);
                    try {
                        await fs.promises.rm(fullpath);

                    }
                    catch (e)
                    {
                        console.log(e);
                        return false;
                    }
                    return true;
                }
        };
    traverseTree("",opt);
}

export async function dryRun(rootpath: string, match : string): Promise<void>
{

    let opt:treeOptions=
        {
            rootpath:rootpath,
            match:match,
            callbackFile:
                async (fullpath:string,relpath:string,name:string)=>
                {
                    return true;
                },
            callbackDirEnd:
                async (relpath:string,filesFound:string[])=>
                {
                    console.log(`Found ${filesFound.length} DIR:`,relpath);
                    process.stdout.write("\t");

                    for(let f of filesFound)
                    {
                        process.stdout.write(f+" ");
                    }
                    process.stdout.write("\n");

                    return true;
                },

        };
    await traverseTree("",opt);
}


if(process.argv.length<3)
{
    console.log("You must specify matching string");
    process.exit(1);
}
if(process.argv.length==3) {
    await dryRun(process.cwd(), process.argv[2]);
}
else
{
    if(process.argv[3]=='del')
        await treeDel(process.cwd(), process.argv[2]);

}
