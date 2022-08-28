
/**
 *  Copyright  (c)  2022 ZipoSoft, Inc.  All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0.
  */

export interface  IField {
    type ? : string;
    showList : boolean;
    summary : boolean;
    id : string;
    name : string;
}
export interface  IFieldSet {
    set : Record<string,IField>;
}

