
/**
 *  Copyright  (c)  2022 ZipoSoft, Inc.  All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0.
  */

export class ZsWebSocket {
    status: string = "closed";
    url: string = "";
    protocols: string[] = [];
    retry: boolean = false;
    socket_di: WebSocket;

    constructor( retry=false) {
        this.retry=retry
    }

    connect(host: string, port: number, protocols: string[]=[]): string {
        if(this.status!="closed")
            return this.status;
        this.url = "ws://" + host + ":" + port;
        this.socket_di = null;
        this.protocols = protocols;
        this.retry = false;

        this.on_connect_retry();
        console.log("trying to connect...");
        this.set_status("trying");

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
    on_status_changed(status:string)
    {

    }
    set_status(status:string)
    {
        this.status = status;
        this.on_status_changed(status);
    }
    connectionCheck() {
        if (this.retry) {
            this.reconnect();
        } else {
            this.set_status("closed");
        }
    }
    send_json(obj)
    {

        this.send_txt(JSON.stringify(obj));

    }
    send_txt(msg) {
        if(this.status!="connected")
            return;
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
        if(this.status=="closed")
            return this.status;
        this.set_status("closed");

        let status_code = 3000;
        let reason_closing = "shutdown";
        this.socket_di.close(status_code, reason_closing);
        this.retry = false;
    }

    reconnect(): string {
        let self = this;

        try {
            this.socket_di = new WebSocket(this.url, this.protocols);
        } catch (exception) {
            console.log('Error' + exception);
            return 'Error' + exception;
        }


        try
        {
            this.socket_di.onerror = function (e) {
                console.log("WS connect error:",e);
            }
            this.socket_di.onopen = function () {

                self.on_connect();
                self.set_status("connected");

                console.log("connected");
            }

            this.socket_di.onmessage = function got_packet(msg) {

                self.on_rx(msg.data);
            }

            this.socket_di.onclose = function (e) {
                self.on_disconnect();
                e.stopPropagation();
                if (self.retry) {
                    self.set_status("trying");

                    setTimeout(function () {
                        self.connectionCheck();
                    }, 100);
                } else {
                    self.set_status("closed");

                }

            }
        } catch (exception)
        {
            console.log('Error' + exception);
            return 'Error' + exception;
        }
        return this.status;
    }
}
