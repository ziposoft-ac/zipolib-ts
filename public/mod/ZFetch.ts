/**
 *  Copyright  (c)  2022 ZipoSoft, Inc.  All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0.
  */

var fetch=fetch;
if (typeof(fetch) === 'undefined') {
    let nodefetch=await import('node-fetch');
    fetch=nodefetch.default;
}
export interface FetchResult<T> {
    data: T;
    response: Response;
    success: boolean;
    error_msg: string;
    stack: string;
}
enum format{
    json,
    text,
    binary
}
export interface FetchOptions {
    method?: string;
    bigInt?: boolean;
    format?:format;
}

export async function zfetch<T>(path: string,
                                params ?: Record<any, any>,
                                options?: Partial<FetchOptions>): Promise<FetchResult<T>> {

    let res: Response;
    let opt: FetchOptions =
        {
            method: "GET",
            bigInt: false,
            format:format.json
        }
    let ret: FetchResult<T> = {
        data: null,
        response: null,
        success: false,
        error_msg: "no response",
        stack: ""
    };
    if (opt)
        opt = {...opt, ...options};

    try {
        let init = {method: opt.method, body: undefined, headers: undefined};
        if ((opt.method == "POST") || (opt.method == "PUT")) {
            init = {
                method: opt.method,
                body: JSON.stringify(params),
                headers: {
                    'Content-Type': 'application/json'
                    // 'Content-Type': 'application/x-www-form-urlencoded',
                }
            };
        } else {
            let url = new URL(path);
            if (params)
                url.search = new URLSearchParams(params).toString();
            path = url.toString();
        }

        res = await fetch(path, init);
        if (res.ok) {
            if (res.status == 200)
                ret.data = await res.json();
            ret.success = true;
        }

    } catch (ex) {
        if ("stack" in ex) {
            ret.stack = ex["stack"];
        }
        if ("message" in ex) {
            ret.error_msg = ex.message;
        }
    }
    if (res) {
        ret.response = res;
        console.log("fetch:", res.status, res.statusText, res.url);

        if (!res.ok) {
            console.log("fetch:", res.status, res.statusText, res.url);
            ret.error_msg = res.statusText;
        }


    }

    return ret;
}
export default zfetch;
