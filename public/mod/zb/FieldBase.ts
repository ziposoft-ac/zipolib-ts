/**
 *  Copyright  (c)  2022 ZipoSoft, Inc.  All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0.
  */

import {IField} from "/zs_client/zb/IField.js";
/*
Base for both Client and server
 */
export abstract class FieldBase
{
    get id() { return this.props.id; }
    props: IField={id:"?",name:"?", showList: true,summary: false };
    constructor(props:Partial<IField> ) {
        this.props=Object.assign(this.props,props);
    }
    getDisplayName() { return this.props.name; }
    getDbType() :string { return null  }
    copyFromDb (obj: object,row:object){
        if(this.id in row)
            obj[this.id]=row[this.id] }
    copyToDb(obj: object,row:object) { row[this.id]=obj[this.id] }
    abstract getDisplayString(obj: object,objEx:object) : string;
    getDisplayElm(obj: object,objEx:object) { return null;  };

    getIndex(obj: object)
    {
        return null;
    }
}