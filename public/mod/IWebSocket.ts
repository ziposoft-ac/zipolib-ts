/**
 *  Copyright  (c)  2022 ZipoSoft, Inc.  All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0.
  */

export interface WsPacket
{
    command : string;


}
export interface PingPong extends WsPacket
{
    count : number;


}

