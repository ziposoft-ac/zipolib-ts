/**
 *  Copyright  (c)  2022 ZipoSoft, Inc.  All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0.
  */

import zs from "../Zipo"
import * as fs from "fs"
import cheerio from "cheerio"
import got ,{Response} from "got";
import {CookieJar} from "tough-cookie"
import { FileCookieStore} from "tough-cookie-file-store"
import {mkdirSync} from "fs";

const pempath = zs.path("zipolib/server/scrape/cacert.pem");
export interface GotResult
{
    response: Response<string>;
    error: any;
}
export class Scraper
{
    got_opts ;
    cache_dir="";
    count=0;
    constructor(name:string) {
        this.cache_dir=zs.path("cache/scrape/",name);
        mkdirSync(this.cache_dir, { recursive: true });

        const cookiePath = this.cache_dir+"/cookie.json";
        const cookieJar = new CookieJar(new FileCookieStore(cookiePath));
        this.got_opts={
            headers: {
                //'user-agent': `Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/87.0.4280.88 Safari/537.36`
                'User-Agent': 'Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:84.0) Gecko/20100101 Firefox/84.0'
            },
            https: {
                certificateAuthority: fs.readFileSync(pempath)
            },
            cookieJar
        };
    }
    async post(url,postdata:Object=null) {
        try {
            let opts=Object.assign({},this.got_opts);

            if(postdata)
            {
                opts["form"]=postdata;
            }
            const response = await got.post(url, opts);
            this.count++;
            return response;
        }
        catch (error) {
            fs.writeFileSync(this.cache_dir+"/post_error.html",error.response.body);
            console.log("error:",url, error.response.statusCode);
            return error.response;
        }
    }

    async getpage(url)  : Promise<GotResult>
    {
        let response: Response<string>=null;
        let error: any=null;
        try {
            response = await got(url, this.got_opts);
            this.count++;

            //=> '<!doctype html> ...'
        }
        catch (error) {
            //fs.writeFileSync("error.html",error.response.body);
            if(error["response"])
                console.log("error:", error.response.statusCode, "URL:",url);
            console.log(error);
        }
        console.log("scrape count:",this.count);
        return { response, error}
    }
    async getpage_cherrio(url) : Promise<cheerio.Root>
    {
        let body="";
        try {
            const result = await this.getpage(url);
            if(result.response)
                body=result.response.body;
        }
        catch (error) {
            console.log("error", error.response.statusCode,":",url);
            return error.response;
        }
        let $ = cheerio.load(body);
        return $;
    }




}

/*
async function getall()
{
    let aths=cache.tblAthlete.getObjs();
    for(let ath of aths)
    {
        if(ath.profile_cache) {
            if(fs.existsSync(publicPath+ath.profile_cache))
                continue;
        }
        let url=ath.profile;
        let resp=await getone(url);
        if(resp.response)
        {
            let ext="jpg";
            if(resp.response.body.substr(1,3)=="PNG")
                ext="png";

            let relpath="/img/profile/"+ath.id+"."+ext;
            fs.writeFileSync(publicPath+relpath,resp.response.rawBody,{ encoding:"binary"});
            ath.profile_cache=relpath;
            cache.tblAthlete.updateById(ath,true);
        }
        //console.log(resp);
        //break;
    }
}
*/
