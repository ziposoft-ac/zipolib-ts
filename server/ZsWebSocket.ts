/**
 *  Copyright  (c)  2022 ZipoSoft, Inc.  All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0.
  */

import WebSocket from "ws";
export enum State
{
    closed="closed",
    connected="connected",
    trying="trying",
    error="error"
}
export class ZsWebSocket {

    state : State=State.closed;
    url: string = "";
    protocols: string[] = [];
    retry: boolean = true;
    socket_di: WebSocket;
    name: string="";
    constructor( retry=false) {
        this.retry=retry
        if(retry)
            this.name="what the fuck?";
    }
    isConnected() { return this.state==State.connected}
    connect(host: string, port: number, protocols: string[]=[]): string {
        if(this.state!=State.closed)
            return "already open";
        this.url = "ws://" + host + ":" + port;
        this.socket_di = null;
        this.protocols = protocols;
        this.retry = true;

        this.on_connect_retry();
        console.log("trying to connect: ", this.url);
        this.set_state(State.trying);

        return this.reconnect();
    }

    on_connect() {
        console.log("on_connect");

    }

    on_disconnect() {
        console.log("on_disconnect");
    }

    on_connect_retry() {
        console.log("on_connect_retry");
    }

    on_rx(msg : string) {
        console.log("rx:" + msg);
    }
    //for updating visual status
    on_state_changed(state:State)
    {

    }
    set_state(state:State)
    {
        this.state = state;
        this.on_state_changed(state);
    }
    connectionCheck() {
        if (this.retry) {
            this.reconnect();
        } else {
            this.set_state(State.closed);
        }
    }
    send_json(obj)
    {

        this.send_txt(JSON.stringify(obj));

    }
    send_txt(msg) {
        if(this.state!=State.connected)
        {
            console.log("bad send. ws not connected");

        }
        try {

            this.socket_di.send(msg);

        } catch (e) {
            console.log(e);

        }
    }
    send_bin(msg) {
        try {


            let blob = new Blob([msg]);
            this.socket_di.send(blob);
        } catch (e) {
            console.log(e);

        }
    }
    disconnect() {
        if(this.state==State.closed)
            return ;
        this.set_state(State.closed);

        let status_code = 3000;
        let reason_closing = "shutdown";
        this.socket_di.close(status_code, reason_closing);
        this.retry = false;
    }

    reconnect(): string {
        let self = this;

        try {
            this.socket_di = new WebSocket(this.url, this.protocols);
        } catch (e) {

            if(e?.error.code=='ECONNREFUSED')
            {
                return 'trying...';
            }
            //console.log('Error:' + e);
            return 'Error' + e;
        }


        try
        {
            this.socket_di.onerror =  (e)=> {
                if(e['error']?.code=='ECONNREFUSED')
                {
                    return 'trying...';
                }
                //console.log("WS connect error:",e);
                //this.retry=false;
            }
            this.socket_di.onopen =  ()=> {
                self.set_state(State.connected);

                self.on_connect();

                console.log("connected");
            }

            this.socket_di.onmessage = function got_packet(msg) {

                self.on_rx(msg.data.toString());
            }

            this.socket_di.onclose =  (e) =>{
                //this is called while trying to connect, and
                //when connection is lost
                if(this.state==State.connected)
                {
                    this.on_disconnect();

                }
                //if(e)              e.stopPropagation();
                if (this.retry) {
                    this.set_state(State.trying);

                    setTimeout( ()=> {
                        this.connectionCheck();
                    }, 250);
                } else {
                    this.set_state(State.closed);
                }

            }
        } catch (exception)
        {
            console.log('Error' + exception);
            return 'Error' + exception;
        }
        return this.state;
    }
}
export default ZsWebSocket

