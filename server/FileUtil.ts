/**
 *  Copyright  (c)  2022 ZipoSoft, Inc.  All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0.
  */

import fs from 'fs';
import CsvParse from "csv-parse";
import * as  pathlib from "path";
import * as Util from "/zs_client/Util.js"

export async function jsonFileWrite(filename:string,obj:object,pretty=false) : Promise<boolean>
{
    try {
        await fs.promises.writeFile(filename, JSON.stringify(obj,null,(pretty?2:0)));
    }
    catch (e) {
        console.log("jsonFileWrite FAILED:",filename,e);
        return false;
    }
    return true;
}
export async function jsonFileRead<T>(filename:string,objToMerge:T=null) : Promise<T>
{
    let obj:T=null;
    try {
        let buff=await fs.promises.readFile(filename);
        if(buff)
            obj=JSON.parse(buff.toString());
    }
    catch (e) {
        //console.log("jsonFileRead FAILED:",filename,e);
        return null;
    }
    if(objToMerge)
    {
        Util.mergeObj(obj,objToMerge);
        return objToMerge;
    }
    return obj;
}
export async function loadCsvFile(fullpath:string,rowCallback: (data:string[])=>void) : Promise<boolean>
{



    let run=(resolveFunc: (boolean)=>void,reject)=>
    {

        let stream=fs.createReadStream(fullpath).on("error", (err)=>{
            console.log("loadCsvFile",err.message);
            resolveFunc(false);
        })
            .pipe(CsvParse({delimiter: ','}))
            .on('data', (csvrow)=> {
                rowCallback(csvrow);
            })
            .on('end',()=> {
                resolveFunc(true);
            }).on('error',(err:Error)=>{
                console.log("loadCsvFile",err.message);
                resolveFunc(false);

            }
    )
    };
    return  new Promise(run);
}
export async function loadCsvFileAll(fullpath:string) : Promise<string[][]>
{
    let data:string[][]=[];
    try {
        await loadCsvFile(fullpath, (row) => {
            data.push(row)
        });
    }
    catch (e) {
        console.log("error loading CSV file:",e.error)
    }


    return data;
}
export async function fileExists(filename) :Promise< fs.Stats>
{
    let stats=null;
    let error=null;
    stats= await fs.promises.stat(filename).catch(
        (err)=>{
            if(err['code']&&(err.code=='ENOENT'))
            {

            }
            else
            {
                error=err;
            }
            return null;
        }
    );
    return stats;
}
export async function getFileStat(filename) :Promise< { stats: fs.Stats, error: Object}>
{
    let stats=null;
    let error=null;
    stats= await fs.promises.stat(filename).catch(
        (err)=>{
            if(err['code']&&(err.code=='ENOENT'))
            {

            }
            else
            {
                error=err;
            }
        }
    );
    return {stats,error};
}

interface treeOptions
{
    rootpath: string,
    match : string,
    callback: (fullpath:string,relpath:string,name:string)=>boolean
}

export function traverseTree(relpath: string,opt: treeOptions ) : void
{
    let ls: fs.Dirent[]= fs.readdirSync(opt.rootpath+"/"+relpath,{withFileTypes:true}) ;
    for(let de of ls )
    {
        if(de.isDirectory())
        {
            let subpath= relpath+de.name+"/";
            traverseTree(subpath,opt);
            continue;
        }
        if(de.name.includes(opt.match))
        {
            let fullpath=pathlib.join(opt.rootpath,relpath,de.name);
            opt.callback(fullpath,relpath,de.name);
        }
    }
}

export function treeDel(rootpath: string, match : string)
{
    let opt:treeOptions=
        {
            rootpath:rootpath,
            match:match,
            callback:
                (fullpath:string,relpath:string,name:string)=>
                {
                    console.log(fullpath);
                    fs.rmSync(fullpath);
                    return true;
                }
        };
    traverseTree("",opt);
}


