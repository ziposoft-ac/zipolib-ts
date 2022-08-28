
/**
 *  Copyright  (c)  2022 ZipoSoft, Inc.  All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0.
  */

export enum AccessLevel {
    Anon,
    User,
    Admin,
    Root,
    Debug
}


export enum Type {
    Menu = 'Menu',
    MenuLink = 'MenuLink',
    MenuBar = 'MenuBar',
    MenuFunc = 'MenuFunc',
    MenuBool = 'MenuBool',
    MenuSelect = 'MenuSelect',
    MenuSelectItem = 'MenuSelectItem',
    MenuBoolCookie = 'MenuBoolCookie',
}
export interface IBase
{
    type? : string;
    id? : string;
    label : string;
    getLabel? : ()=>string;
    key?: string;
    getValue? : ()=> any;
    setValue? : (any)=> void;
    onValueChange? : (any)=> void;
    items?: IBase[];
    access?: AccessLevel;

}

export interface DataStore
{
    set(key:string,val);
    get(key:string) : any;
}

export interface IInput extends IBase {
    inputType?: string;

}
export interface ISelect extends IInput {
    options : Object;

}
export interface IBool extends IInput {

}
export interface ISelectVal extends IBase {

    value : any;
    parent ?: object;//MenuSelect
}
export interface ILink extends IBase {
    link : string;
}
export interface IFunc extends IBase {
    func :  ()=> any;
}
export interface IPageFuncName extends IBase {
    funcName : string;
}
export interface IPageFunc extends IBase {
    func : any;
}
export interface IMenu extends IBase {

    dataSetKey?(key:string,val:any);
    dataGetKey?(key:string):any;
}
export interface IMenuBar extends IMenu {
}

export interface INumberEdit extends IInput {
    decimalPlaces?: number;
}
export interface ITextEdit extends  IInput {
}

