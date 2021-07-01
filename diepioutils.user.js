// ==UserScript==
// @name         Diep.io Utilities
// @version      0.1
// @description  Cheat for Diep.io, can be useful for bots.
// @author       MiguelEX3
// @match        https://diep.io/
// @icon         https://diep.io/favicon.ico
// @grant        unsafeWindow
// @run-at       document-start
// @homepage     https://github.com/MiguelEXE/DiepIOUtilities
// @supportURL   https://github.com/MiguelEXE/DiepIOUtilities/issues
// @downloadURL  https://github.com/MiguelEXE/DiepIOUtilities/raw/master/diepioutils.user.js
// @updateURL    https://github.com/MiguelEXE/DiepIOUtilities/raw/master/diepioutils.user.js
// ==/UserScript==

(function() {
    'use strict';
    const INPUT = {
        leftMouse: 0b000000000001,
        upKey: 0b000000000010,
        leftKey: 0b000000000100,
        downKey: 0b000000001000,
        rightKey: 0b000000010000,
        godMode: 0b000000100000,
        suicide: 0b000001000000,
        rightMouse: 0b000010000000,
        instantUpg: 0b000100000000,
        gamepad: 0b001000000000,
        switchclass: 0b010000000000,
        constantOfTrue: 0b100000000000,
    };
    const MEMORY = {
        u8: undefined,
        u16: undefined,
        u32: undefined,
        i8: undefined,
        i16: undefined,
        i32: undefined,
        f32: undefined       
    };
    
    //supahero1's implementation, go checkout his websocket + memory hook implementation: https://github.com/supahero1/diep.io/tree/master/working-with-diep/dig.userscript.js
    let postRun;
    let trye = 0;
    function hook(a, b, c) {
        Object.defineProperty(a, b, {
            set: c,
            configurable: true,
            enumerable: true
        });
    }
    Object.defineProperty(Object.prototype, "postRun", {
        get: function(){
            return postRun;
        },
        set: function(to){
            postRun = to;
            if(Object.getOwnPropertyNames(this).length == 0 && trye++ == 1){
                hook(this, "asm", function(to) {
                    if(to == null) return;
                    delete this.asm;
                    this.asm = to;
                    MEMORY.u8  = this.HEAPU8;
                    MEMORY.u16 = this.HEAPU16;
                    MEMORY.u32 = this.HEAPU32;
                    MEMORY.i8  = this.HEAP8;
                    MEMORY.i16 = this.HEAP16;
                    MEMORY.i32 = this.HEAP32;
                    MEMORY.f32 = this.HEAPF32;
                });
            }
        },
        configurable: true,
        enumerable: true
    });
    //end memory hook
    unsafeWindow.MEMORY = MEMORY;
    unsafeWindow.websockets = [];
    unsafeWindow.WebSocket = new Proxy(unsafeWindow.WebSocket, {
        construct: function(target, url){
            let socket = new target(url);
            let i = unsafeWindow.websockets.push(socket)-1;
            socket.addEventListener("close", () => delete unsafeWindow.websockets[i]);
            return socket;
        }
    });

    unsafeWindow.document.title += " (utilities loaded)";

    let console = document.createElement("div");
    let logs = document.createElement("div");
    let input = document.createElement("input");

    let notHided = "0.6%";
    let hided = "-28%";

    console.style.border = "#000 solid 1px";
    console.style.position = "fixed";
    console.style.width = "30%";
    console.style.height = "60%";
    console.style.marginTop = "7%";
    console.style.marginLeft = notHided;
    console.style.fontFamily = "Ubuntu";
    console.style.transition = "0.5s ease-in-out";

    logs.style.overflowY = "scroll";
    logs.style.width = "100%";
    logs.style.height = "90%";

    input.style.backgroundColor = "#fff";
    input.style.width = "98.95%";
    input.style.height = "9.3%";
    input.style.border = "none";
    input.placeholder = "Press / to type an command.";


    input.disabled = true;
    let info = document.createElement("div");
    info.style.color = "#0000ff";
    info.innerText = "Welcome to Diep.io Utilities. Press enter to hide/show the console.";
    logs.appendChild(info);

    let isHided = false;
    function toggleConsole(){
        if(isHided){
            console.style.marginLeft = notHided;
            isHided = false;
        }else{
            console.style.marginLeft = hided;
            isHided = true;
        }
    }

    function commandHandler(command=""){
        let cmd = command.split(" ")[0];
        let args = command.split(" ").slice(1);

        unsafeWindow.console.log(cmd);
        unsafeWindow.console.log(args);

        if(cmd == "help"){
            return `help -- shows all command list
            disconnect -- disconnect you from the server
            pathfind -- pathfind a path to user`;
        }else if(cmd == "disconnect"){
            unsafeWindow.input.execute("lb_reconnect");
            return `OK, reconnecting...`;
        }else if(cmd == "pathfind"){
            const player = args.join(" ");
            if(!player) return new Error(`Inform a player name`);
            return new Error(`WIP Command`);
        }else if(cmd == "automode"){
            const toLevel = args[0];
            if(!toLevel) return new Error(`Inform a level to upgrade, PLEASE NOTE: AUTOMODE CANNOT BE STOPPED.`);
            return new Error(`WIP Command`);
        }
        return new Error(`This command is not valid.`);
    }

    function commandRegister(command=""){
        command = command.toLowerCase();
        let commandDiv = document.createElement("div");
        commandDiv.innerHTML = `<span style="color:#dd3000;">> ${command.split(" ")[0]}</span> <span style="color:#00bb00;">${command.split(" ").slice(1).join(" ")}</span>`;

        logs.appendChild(commandDiv);
        
        let returnedValue = commandHandler(command);
        if(returnedValue.constructor == Error) commandDiv.innerHTML+=`<p style="background-color:#ff0000;">< ${returnedValue.message.replace(/\n/g, "<br>")}</p>`;
        else commandDiv.innerHTML+=`<p>< ${returnedValue.replace(/\n/g, "<br>")}</p>`;
        logs.scrollTo(0,logs.scrollHeight);
    }

    let isTyping = false;
    unsafeWindow.addEventListener("keydown", e => {
        if(e.key == "/" && !isTyping){
            e.preventDefault();
            e.stopPropagation();
            input.placeholder = "";
            isTyping = true;
        }else if(e.key == "Enter" && isTyping){
            e.preventDefault();
            e.stopPropagation();
            commandRegister(input.value);
            input.placeholder = "Press / to type an command.";
            input.value = "";
            isTyping = false;
        }else if(e.key == "Backspace"){
            e.preventDefault();
            e.stopPropagation();
            input.value = input.value.split("").slice(0, input.value.split("").length-1).join("");
        }else if(e.key.length > 1 && isTyping){
            e.preventDefault();
            e.stopPropagation();
            return;
        }else if(isTyping){
            e.preventDefault();
            e.stopPropagation();
            input.value+=e.key;
        }
    });

    console.appendChild(logs);
    console.appendChild(input);
    unsafeWindow.addEventListener("load", () => unsafeWindow.document.body.appendChild(console));
})();