/**
 *  Copyright  (c)  2022 ZipoSoft, Inc.  All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0.
  */

import got, {Response} from "got";
import fs, {NoParamCallback} from "fs";
import * as FU from '../FileUtil'
/**
 * Download and save an image file from a url. Called async
 * @param url - full url to web
 * @param path - full local path NOT ending in slash
 * @param baseFileName - base filename without ext.
 * @param callback - returns the filename with .jpg or .png ext, or error
 */
export async function downloadImg(url:string,path:string,baseFileName:string,overwrite:boolean,callback: (filename,error)=>void)
{
    let response: Response<string>=null;
    let error: any=null;
    try {
        response = await got(url);
        let ext="jpg";
        if(response.statusCode!=200)
        {
            callback(null,new Error("Error downloading image:"+response.statusCode));
            return;
        }
        if(response.body.substr(1,3)=="PNG")
            ext="png";
        let filename=baseFileName+"."+ext;
        let fullpath=path+"/"+filename;
        if((overwrite)||(FU.fileExists(fullpath)))
        {
            fs.writeFile(path + "/" + filename,
                response.rawBody,
                {encoding: "binary"}, (err) => callback(filename, err));
        }

    }
    catch (error) {
        //fs.writeFileSync("error.html",error.response.body);
        if(error["response"])
            console.log("error:", error.response.statusCode, "URL:",url);
        callback(null,error);
    }

}
/**
 * Download and save a file from a url. Called async
 * @param url - full url to web
 * @param fullPath - fullpath and filename
 * @param callback - returns the filename with .jpg or .png ext, or error
 */
export async function downloadFile(url:string,fullPath:string,callback: (error)=>void) : Promise<boolean>
{
    let response: Response<string>=null;
    let error: any=null;
    try {
        response = await got(url,
            {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.106 Safari/537.36'
                },
            }
        );
        if(response.statusCode!=200)
        {
            callback(new Error("Error downloading image:"+response.statusCode));
            return false;
        }
        fs.writeFile(fullPath,
            response.rawBody,
            { encoding:"binary"},(err)=> callback(err)  );
        return true;

    }
    catch (error) {
        //fs.writeFileSync("error.html",error.response.body);
        if(error["response"])
            console.log("error:", error.response.statusCode, "URL:",url);
        callback(error);
    }
    return false;

}
