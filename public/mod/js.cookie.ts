/**
 *  Copyright  (c)  2022 ZipoSoft, Inc.  All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0.
  */

/*! js-cookie v3.0.0-rc.1 | MIT */

interface CookieAttributes {
  /**
   * Define when the cookie will be removed. Value can be a Number
   * which will be interpreted as days from time of creation or a
   * Date instance. If omitted, the cookie becomes a session cookie.
   */
  expires?: number | Date;

  /**
   * Define the path where the cookie is available. Defaults to '/'
   */
  path?: string;

  /**
   * Define the domain where the cookie is available. Defaults to
   * the domain of the page where the cookie was created.
   */
  domain?: string;

  /**
   * A Boolean indicating if the cookie transmission requires a
   * secure protocol (https). Defaults to false.
   */
  secure?: boolean;

  /**
   * Asserts that a cookie must not be sent with cross-origin requests,
   * providing some protection against cross-site request forgery
   * attacks (CSRF)
   */
  sameSite?: 'strict' | 'Strict' | 'lax' | 'Lax' | 'none' | 'None';

  /**
   * An attribute which will be serialized, conformably to RFC 6265
   * section 5.2.
   */
  [property: string]: any;
}


function assign (target,...any) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];
    for (var key in source) {
      target[key] = source[key];
    }
  }
  return target
}

var defaultConverter = {
  read: function (value) {
    return value.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent)
  },
  write: function (value) {
    return encodeURIComponent(value).replace(
      /%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g,
      decodeURIComponent
    )
  }
};

function init (converter, defaultAttributes:CookieAttributes ) {
  function set (key, value, attributes) {
    if (typeof document === 'undefined') {
      return
    }

    attributes = assign({}, defaultAttributes, attributes);

    if (typeof attributes.expires === 'number') {
      attributes.expires = new Date(Date.now() + attributes.expires * 864e5);
    }
    if (attributes.expires) {
      attributes.expires = attributes.expires.toUTCString();
    }

    key = encodeURIComponent(key)
      .replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent)
      .replace(/[()]/g, escape);

    value = converter.write(value, key);

    var stringifiedAttributes = '';
    for (var attributeName in attributes) {
      if (!attributes[attributeName]) {
        continue
      }

      stringifiedAttributes += '; ' + attributeName;

      if (attributes[attributeName] === true) {
        continue
      }

      // Considers RFC 6265 section 5.2:
      // ...
      // 3.  If the remaining unparsed-attributes contains a %x3B (";")
      //     character:
      // Consume the characters of the unparsed-attributes up to,
      // not including, the first %x3B (";") character.
      // ...
      stringifiedAttributes += '=' + attributes[attributeName].split(';')[0];
    }

    return (document.cookie = key + '=' + value + stringifiedAttributes)
  }

  function get (key) {
    if (typeof document === 'undefined' || (arguments.length && !key)) {
      return
    }

    // To prevent the for loop in the first place assign an empty array
    // in case there are no cookies at all.
    var cookies = document.cookie ? document.cookie.split('; ') : [];
    var jar = {};
    for (var i = 0; i < cookies.length; i++) {
      var parts = cookies[i].split('=');
      var value = parts.slice(1).join('=');

      if (value[0] === '"') {
        value = value.slice(1, -1);
      }

      try {
        var foundKey = defaultConverter.read(parts[0]);
        jar[foundKey] = converter.read(value, foundKey);

        if (key === foundKey) {
          break
        }
      } catch (e) {}
    }

    return key ? jar[key] : jar
  }

  return Object.create(
    {
      set: set,
      get: get,
      remove: function (key, attributes) {
        set(
          key,
          '',
          assign({}, attributes, {
            expires: -1
          })
        );
      },
      withAttributes: function (attributes) {
        return init(this.converter, assign({}, this.attributes, attributes))
      },
      withConverter: function (converter) {
        return init(assign({}, this.converter, converter), this.attributes)
      }
    },
    {
      attributes: { value: Object.freeze(defaultAttributes) },
      converter: { value: Object.freeze(converter) }
    }
  )
}


declare namespace Cookies {


  interface CookiesStatic<T extends object = object> {
    /**
     * Allows default cookie attributes to be accessed, changed, or reset
     */
    defaults: CookieAttributes;

    /**
     * Create a cookie
     */
    set(name: string, value: string | T, options?: CookieAttributes): string | undefined;

    /**
     * Read cookie
     */
    get(name: string): string | undefined;

    /**
     * Read all available cookies
     */
    get(): {[key: string]: string};

    /**
     * Returns the parsed representation of the string
     * stored in the cookie according to JSON.parse
     */
    getJSON(name: string): any;

    /**
     * Returns the parsed representation of
     * all cookies according to JSON.parse
     */
    getJSON(): {[key: string]: any};

    /**
     * Delete cookie
     */
    remove(name: string, options?: CookieAttributes): void;

    /**
     * If there is any danger of a conflict with the namespace Cookies,
     * the noConflict method will allow you to define a new namespace
     * and preserve the original one. This is especially useful when
     * running the script on third party sites e.g. as part of a widget
     * or SDK. Note: The noConflict method is not necessary when using
     * AMD or CommonJS, thus it is not exposed in those environments.
     */
    noConflict?(): CookiesStatic<T>;

    /**
     * Create a new instance of the api that overrides the default
     * decoding implementation. All methods that rely in a proper
     * decoding to work, such as Cookies.remove() and Cookies.get(),
     * will run the converter first for each cookie. The returned
     * string will be used as the cookie value.
     */
    withConverter<TConv extends object>(converter: CookieReadConverter | { write?: CookieWriteConverter<TConv>; read?: CookieReadConverter; }): CookiesStatic<TConv>;
  }

  type CookieWriteConverter<T extends object> = (value: string | T, name: string) => string;
  type CookieReadConverter = (value: string, name: string) => string;
}
declare const Cookies: Cookies.CookiesStatic;
var api : Cookies.CookiesStatic= init(defaultConverter, { path: '/', expires: 99999, sameSite: "strict" });



export default api ;
