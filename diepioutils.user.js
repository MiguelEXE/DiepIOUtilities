// ==UserScript==
// @name         Diep.io Utilities
// @version      0.3
// @description  Diep.io Utility Mod
// @author       MiguelEX3
// @match        https://diep.io/
// @icon         https://diep.io/favicon.ico
// @grant        unsafeWindow
// @run-at       document-start
// @homepage     https://github.com/MiguelEXE/DiepIOUtilities
// @supportURL   https://github.com/MiguelEXE/DiepIOUtilities/issues
// @downloadURL  https://raw.githubusercontent.com/MiguelEXE/DiepIOUtilities/master/diepioutils.user.js
// @updateURL    https://raw.githubusercontent.com/MiguelEXE/DiepIOUtilities/master/diepioutils.user.js
// @require      https://raw.githubusercontent.com/MiguelEXE/DiepIOUtilities/master/pathfinding-browser.min.js
// ==/UserScript==

(function() {
    'use strict';
    const VERSION = 0.3;
    const SUPPORTED_BUILD = "53e3bff79432137e3221b888ec230307a7540309";
    const CHANGELOG = `Diep.io Utilities v${VERSION}.
    We doesn't use more heap to get the level, just using canvas.
    Added getEdgeCoords function.
    Now Diep.io Utilities can be called in DevTools console!`;
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
        u8: undefined,  //HEAPU8
        u16: undefined, //HEAPU16
        u32: undefined, //HEAPU32
        i8: undefined,  //HEAP8  
        i16: undefined, //HEAP16
        i32: undefined, //HEAP32
        f32: undefined  //HEAPF32
    };
    const CHECK_BUILD = true; // Check if SUPPORTED_BUILD is equal to getCurrentBuild();. Disable this only for testing.

    //-1250 # arena's top y coord (top is negative in coding)
    //-1250 # arena's left x coord (left is negative in coding)
    //1250 # arena's bottom y coord (bottom is positive in coding)
    //1250 # arena's right x coord (right is positive in coding)
    const finder = new PF.AStarFinder();
    
    let canRunUtils = true;    
    let console = document.createElement("div");
    let logs = document.createElement("div");
    let input = document.createElement("input");

    function crash(message, details){
        let error = document.createElement("div");
        error.style.color = "#ff0000";
        error.innerText = `Opps, Diep.io Utilities is not working.
        Exception ${message}.
        Version: ${VERSION}

        Details: ${details}`;
        logs.appendChild(error);
        unsafeWindow.document.querySelector("span[id=\"loading\"]").innerText = "Diep.io Utils Crashed!";
        input.placeholder = "Cant use Diep.io Utilities while crashed";
        canRunUtils = false;
        throw new Error(message);
    }

    const getRunningBuildVersion = () => {
        let runningVersion = "";
        const scripts = unsafeWindow.document.querySelectorAll("script");
        for(const script of scripts){
            const lineBreak = script.innerHTML.split("\n");
            lineBreak.forEach(function(line){
                if(line.includes("wasm.js")){
                    runningVersion = line.replace(/.{1,}(build_)|(\.wasm\.js).{1,}/g, "");
                }
            });
        }
        return runningVersion;
    }

    //thanks ABCxFF for this memory hook
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
                    MEMORY.u8 = this.HEAPU8;
                    MEMORY.u16 = this.HEAPU16;
                    MEMORY.u32 = this.HEAPU32;
                    MEMORY.i8 = this.HEAP8;
                    MEMORY.i16 = this.HEAP16;
                    MEMORY.i32 = this.HEAP32;
                    MEMORY.f32 = this.HEAPF32;

                    if(SUPPORTED_BUILD != getRunningBuildVersion() && CHECK_BUILD){
                        crash("UNSUPPORTED_BUILD", `Supported build: ${SUPPORTED_BUILD}.
                        
                        Running build: ${getRunningBuildVersion()}.`);
                    }
                });
            }
        },
        configurable: true,
        enumerable: true
    });
    unsafeWindow.MEMORY = MEMORY;
    const websockets = [];
    unsafeWindow.WebSocket = new Proxy(unsafeWindow.WebSocket, {
        construct: function(target, url){
            let socket = new target(url);
            let i = websockets.push(socket)-1;
            socket.addEventListener("close", () => delete websockets[i]);
            return socket;
        }
    });
    unsafeWindow.ws = websockets;

    unsafeWindow.document.title += " (utilities loaded)";

    let notHided = "0.6%";
    let hided = "-31%";

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
    input.style.color = "#000";
    input.placeholder = "Press / to type an command.";
    input.disabled = true;

    let info = document.createElement("div");
    info.style.color = "#0000ff";
    info.innerText = `Welcome to Diep.io Utilities v${VERSION}.`;
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

    //thanks ABCxFF and Excigma for getting this
    const getEdgeCoords = () => {
        const POINTER = 25682;
        return [MEMORY.f32[POINTER-1], MEMORY.f32[POINTER], MEMORY.f32[POINTER+1], MEMORY.f32[POINTER+2]];
    }
    
    const DiepIOUtils = {
        SUPPORTED_BUILD,
        latestPlayerLvl: 0,
        getRunningBuildVersion,
        toggleConsole,
        getEdgeCoords,
        searchValue: function(value, type){
            let values = [];
            type = type ? type : "i32";
            for(let i=0;i<MEMORY[type].length;i++)if(MEMORY[type][i]==value)values.push(i);
            return values;
        },
        testValues: async function(array, value, valueToTest, filter, type){
            const _wait = (ms) => new Promise(function(r){setTimeout(r, ms)});
            type = type ? type : "i32";
            for(let i=0;i<array.length;i++){
                unsafeWindow.console.debug(`Testing ${array[i]} in ${type}`);
                MEMORY[type][array[i]] = valueToTest;
                await _wait(50);
                if(filter(valueToTest, value)) {
                    MEMORY[type][array[i]] = value;
                    return [array[i], type];
                }
                MEMORY[type][array[i]] = value;
            }
            return [];
        },
        deepSearchValues: function(value, filter, type){
            let values = [];
            type = type ? type : "i32";
            for(let i=0;i<MEMORY[type].length;i++){
                let value2 = MEMORY[type][i];
                unsafeWindow.console.log(value, i, value2);
                if(filter(i, value)) values.push([i, value2]);
            }
            return values;
        }
    }
    unsafeWindow.DiepIOUtils = DiepIOUtils;

    let latestLvl = 0;
    CanvasRenderingContext2D.prototype.fillText = new Proxy(CanvasRenderingContext2D.prototype.fillText, {
        apply: function(target, thisArgs, args){
            if(args[0].includes("Lvl")){
                latestLvl = Number(args[0].split(" ")[1]);
                DiepIOUtils.latestPlayerLvl = Number(args[0].split(" ")[1]);
            };
            target.apply(thisArgs, args);
        }
    });

    function commandHandler(command=""){
        let cmd = command.split(" ")[0];
        let args = command.split(" ").slice(1);

        if(cmd == "help"){
            return `help -- shows command list
            disconnect -- disconnect you from the server
            pathfind -- pathfinds a path to an user
            automode -- enters in automode and starts to kill all resources until get on the specified level. NOTE: AUTOMODE CANNOT BE STOPPED
            hide -- hide this console, you can show the console by pressing /
            info -- get some information about diep.io
            show -- show the diep.io default console
            changelog -- show the changelog to the current version`;
        }else if(cmd == "disconnect"){
            unsafeWindow.input.execute("lb_reconnect");
            return "OK, reconnecting...";
        }else if(cmd == "pathfind"){
            const player = args.join(" ");
            if(!player) return new Error("Inform a player name");
            return new Error("WIP Command");
        }else if(cmd == "automode"){
            const toLevel = args[0];
            if(!toLevel) return new Error("Inform a level to upgrade, NOTE: AUTOMODE CANNOT BE STOPPED.");
            if(Number.isNaN(toLevel)) return new Error("Invalid level.");
            if(Number(toLevel) > 45) return new Error("Your specified level is greather than 45.");
            if(latestLvl > Number(toLevel)) return new Error("Your specified level is minor than your current level.");
            return new Error("WIP Command");
        }else if(cmd == "hide"){
            toggleConsole();
            return "Hiding!";
        }else if(cmd == "info"){
            return `Running version ${VERSION}
            Supported build: ${SUPPORTED_BUILD}
            Running build: ${getRunningBuildVersion()}
            
            Player level: ${latestLvl}`;
        }else if(cmd == "show"){
            unsafeWindow.input.execute("con_toggle");
            toggleConsole();
            return "Showing Diep.io Console...";
        }else if(cmd == "changelog"){
            return CHANGELOG;
        }
        return new Error("This command is not valid.");
    }
    
    function commandRegister(command=""){
        if(!command) return;
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
        if(!canRunUtils) return;
        if(e.key == "/" && !isTyping){
            e.preventDefault();
            e.stopPropagation();
            if(isHided) toggleConsole();
            input.placeholder = "";
            isTyping = true;
        }else if(e.key == "Enter" && isTyping){
            e.preventDefault();
            e.stopPropagation();
            commandRegister(input.value);
            input.placeholder = "Press / to type an command.";
            input.value = "";
            isTyping = false;
        }else if(e.key == "Backspace" && isTyping){
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