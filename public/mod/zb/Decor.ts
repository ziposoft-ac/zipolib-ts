/**
 *  Copyright  (c)  2022 ZipoSoft, Inc.  All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0.
  */

import {IField} from "/zs_client/zb/IField.js";
import {getMeta} from "/zs_client/zb/Meta.js";
import * as F from "/zs_homonym/Fields.js"

// member decorator.
export function Fld<FIELD_T extends F.Field> (classobj: Object,id:string,type: (new (prop) => FIELD_T),opt:Partial<IField>={})
{
    let p=Object.assign({id: id,name:id },opt);
    // @ts-ignore
    let f=getMeta(classobj.constructor).addField(id,new type(p));
}




export type DecFunc= (classType,memberName)=>void;





export function Text(c ,p) { Fld(c,p,F.FieldText) }
export function Int(c,p) { Fld(c,p,F.FieldInt) }
export function KeyText(c,p) { Fld(c,p,F.FieldKeyText) }
export function KeyInt(c,p) { Fld(c,p,F.FieldKeyInt) }
export function AutoKey(c,p) { Fld(c,p,F.FieldAutoKey) }
export function Bool(c,p) { Fld(c,p,F.FieldBool) }
export function DateTime(c,p) { Fld(c,p,F.FieldDateTime) }

export function FT<FIELD_T extends F.Field>(type: (new (prop) => FIELD_T), props:Partial<IField> ) : DecFunc
{

    return (c,p)=> Fld(c,p,type,props);
}
export function Float( props:Partial<IField> ) : DecFunc
{
    return (c,p)=> Fld(c,p,F.FieldFloat,props);
}
export function Image( props:Partial<IField> ) : DecFunc
{
    return (c,p)=> Fld(c,p,F.FieldImg,props);
}
export function TextP( props:Partial<IField> ) : DecFunc
{
    return (c,p)=> Fld(c,p,F.FieldText,props);
}
export function FJson( props:Partial<IField> ) : DecFunc
{
    return (c,p)=> Fld(c,p,F.FieldJson,props);
}
export function ElmFunc( props:Partial<IField> ) : DecFunc
{
    return (c,p)=> Fld(c,p,F.FieldTextFunc,props);
}

export *  from "/zs_homonym/Fields.js"
