/**
 *  Copyright  (c)  2022 ZipoSoft.com, Inc.  All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0.  */

import * as fs from 'fs'
import * as path from 'path'
import {Dirent} from "fs";
import * as Fastify from "fastify";

import {PageData} from "/zs_client/PageData";
import pretty from "pretty";
import {Logger} from "/zs_client/Logger";

const gFetchversion = Date.now();

export interface PageProps {
    title?: string;
    module?: string;
    req: Fastify.FastifyRequest;
    main?: string;
}

export async function GetPage(props: PageProps): Promise<string> {

    let p = new PageServer(props);
    await p.build();
    return p.fullpage();
}

export class PageServer {
    log: Logger = new Logger();
    debug = false;
    access = 9;
    googleTagId: string = null;
    staticData: PageData = new PageData();
    fetchVersion = gFetchversion;
    private redirectUrl: string = null;

    redirect(url: string) {
        this.redirectUrl = url;
    }

    props: PageProps = {
        req: null

    };
    title: string = "ZipoSoft";
    description: string = null;
    og_image="";
    scripts: string[] = [];
    css: string[] = ["/zs_public/css/common.css"];
    modules: string[] = [];
    imports: object = {};
    page_module: string = "/zs_client/ClientPage";
    page_class: string = "Page";
    enableCache = false;

    constructor(props: PageProps) {
        this.props = props;
        if (props.req) {
            //console.log("cookies:", props.req.cookies);
            //this.debug = props.req.cookies.debug ?? false;
            //console.log("this.debug:", this.debug);
            this.debug = true;
            let ip = <string>this.props.req.headers['x-forwarded-for'] || this.props.req.socket.remoteAddress;
            this.staticData.info.ip = ip;

        }


    }

    async build() {

    }

    head(): string {
        if (!this.description)
            this.description = this.title;
        let ss = '';
        for (let css of this.css) {
            ss += ` <link type="text/css" rel="stylesheet" href="${css}?vers=${this.fetchVersion}"> `;
        }
        //<script data-main="/app/main" src="/lib/require.js"></script>
        return `<html>
        <head><title>${this.title}</title>
            <link rel="icon" href="/img/favicon.ico">
             <meta property='og:image' content="${this.og_image}"/>
             <meta property='og:title' content="${this.title}"/>
            <meta name="description"  content="${this.description}" />

            <meta http-equiv="content-type" content="text/html; charset=UTF-8" />
            <meta name="author" content="ZipoSoft, Inc."/>
            <meta id="viewport" name="viewport" content="width=device-width, initial-scale=1">
        ${ss}
        </head>
        <body>`;
    }

    foot(): string {
        let h = "";

        if (this.enableCache) {
            let files = [...this.scripts, ...this.modules, ...Object.values(this.imports), this.page_module];
            this.scripts.push('/service-worker');
            h += `<script>const PRECACHE = 'precache-v1';const RUNTIME = 'runtime';const PRECACHE_URLS = [`;
            for (let file of files)
                h += `'${file}',`;
            h += `];</script>`;


        }
        let staticDataJson = JSON.stringify(this.staticData);
        //h+="<script>var page_data="+staticDataJson+"</script>";
        for (let script of this.scripts) {
            h += `<script  src="${script}.js?v=${this.fetchVersion}"></script>`;
        }
        for (let mod of this.modules) {
            //h+=`<script type="module" src="${mod}.js?v=${this.fetchVersion}"></script>`;
            //can't add version, because it will cause duplicate loads from import statements
            h += `<script type="module" src="${mod}.js"></script>`;
        }
        for (let name in this.imports) {
            let path = this.imports[name];
            h += `<script type="module" >import * as mod from "${path}.js";window["${name}"]=mod;</script>`;
        }
        //language=HTML
        h += `<script>
                    window.isloaded=false;
                    window.onload=()=>{
                        window.isloaded=true;
                    };
                </script>
            <script type="module" >
                import pageClass from "${this.page_module}.js?vers=${this.fetchVersion}";
                let page=new pageClass(${staticDataJson});
                window["page"]=page;
                if(!window.isloaded)
                {
                    await new Promise(function(resolve) { window.onload = resolve;});
                }
                page.run();
                </script>`;

        if (this.googleTagId) {
            h += `<script async src="https://www.googletagmanager.com/gtag/js?id=${this.googleTagId}"></script>
            <script>window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date()); gtag('config', '${this.googleTagId}');
            </script>`;
        }

        h += "</body></html>";
        return h;
    }

    header(): string {
        return ""
    }

    footer(): string {
        return ""
    }

    main(): string {
        if (this.props.main) {
            return this.props.main;
        }
        return '';
    }

    fullpage(): string {

        let page = this.head()
            + "<header>" + this.header() + "</header>"
            + "<main id='main'>" + this.main() + "</main>"
            + "<footer>" + this.footer() + "</footer>"
            + this.foot();
        if (this.debug)
            page = pretty(page);
        return page;
    }

    sendResponse(response: Fastify.FastifyReply) {
        if (this.redirectUrl) {
            response.redirect(this.redirectUrl);
            console.log("Redirect to: " + this.redirectUrl);
            return;
        }
        let pageHtml = this.fullpage();
        response.type('text/html')
        response.send(pageHtml);

    }

}

export class PageException extends PageServer {
    exp: any = null;

    constructor(props: PageProps, e) {
        super(props);
        this.exp = e;


    }

    main(): string {
        let txt = "Unkonw Error";
        if ("stack" in this.exp) {
            txt = this.exp.stack;
        }


        return `<h1>PageException: </h1><pre>${txt}</pre>`;
    }


}

