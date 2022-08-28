
/**
 *  Copyright  (c)  2022 ZipoSoft, Inc.  All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0.
  */

var Cookies =
    {
        get: (name)=>
        {
            const cookies = Cookies.all();
            return cookies[name] ?? '';
        },
        remove(name:string)
        {
          Cookies.set(name,'',{expires:-1} );
        },
        all: ()=>
        {
            const cookies = document.cookie.split(';')
                .reduce((acc, cookieString) => {
                    const [key, value] = cookieString.split('=').map(s => s.trim());
                    if (key && value) {
                        acc[key] = decodeURIComponent(value);
                    }
                    return acc;
                }, {});
            return  cookies;
        },
        set(name, value, options = {expires:1}) {
            document.cookie = `${name}=${encodeURIComponent(value)}${
                Object.keys(options)
                    .reduce((acc, key) => {
                        return acc + `;${key.replace(/([A-Z])/g, $1 => '-' + $1.toLowerCase())}=${
                            options[key]}`;
                    }, '')
            }`;
        }
    };
export default Cookies;



