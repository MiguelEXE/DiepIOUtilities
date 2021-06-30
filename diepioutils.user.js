// ==UserScript==
// @name         Diep.io Utilities
// @version      0.1
// @description  Cheat for Diep.io, can be useful for bots.
// @author       MiguelEX3
// @match        https://diep.io/
// @icon         https://diep.io/favicon.ico
// @grant        unsafeWindow
// @grant        GM_getValue
// @grant        GM_setValue
// @run-at       document-start
// @homepage     https://github.com/MiguelEXE/DiepIOUtilities
// @supportURL   https://github.com/MiguelEXE/DiepIOUtilities/issues
// @downloadURL  https://github.com/MiguelEXE/DiepIOUtilities/raw/master/diepioutils.user.js
// @updateURL    https://github.com/MiguelEXE/DiepIOUtilities/raw/master/diepioutils.user.js
// ==/UserScript==

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
const COLORS = [
    'BASE_GRAY',
    'BARREL_GRAY',
    'BODY_BLUE',
    'TEAM_BLUE',
    'TEAM_RED',
    'TEAM_PURPLE',
    'TEAM_GREEN',
    'SHINY_GREEN',
    'SQUARE_YELLOW',
    'TRIANGLE_RED',
    'PENTAGON_PURPLE',
    'CRASHER_PINK',
    'CLOSER_YELLOW',
    'SCOREBOARD_GREEN',
    'MAZEWALL_GRAY',
    'FFA_RED',
    'NECRO_ORANGE',
    'FALLEN_GRAY',
    'GLITCH',
];


(function() {
    'use strict';
    let websockets = [];
    unsafeWindow.WebSocket = new Proxy(unsafeWindow.WebSocket, {
        construct: function(target, url){
            let socket = new target(url);
            let i = websockets.push(websockets)-1;
            socket.addEventListener("close", () => delete websockets[i]);
            return socket;
        }
    });

    unsafeWindow.document.title += " (utilities loaded)";

    let settings = GM_getValue("setttings");
    if(!settings) {
        settings = {
            showPlayersInMap: false,
            simpleAimBot: false,
            advancedAimBot: false
        }
        GM_setValue("settings", settings);
    }

    let console = document.createElement("div");
    let logs = document.createElement("div");
    let input = document.createElement("div");

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
    input.style.width = "100%";
    input.style.height = "10%";
    input.innerText = "Press / to type an command.";

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

    function pathfind(x,y){
        
    }

    function commandHandler(command=""){
        let cmd = command.split(" ").pop();
        let args = command.split(" ").slice(1);

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
        commandDiv.innerHTML = `<p style="color:#ff4500;">> ${command.split(" ").pop()}</p><p style="color:#00ff00;">${command.split(" ").slice(1).join(" ")}</p>`;

        logs.appendChild(commandDiv);
        
        let returnedValue = commandHandler(command);
        if(returnedValue.constructor == Error) commandDiv.innerHTML+=`<p style="background-color:#ff0000;">< ${returnedValue.message.replace(/\n/g, "<br>")}</p>`;
        else commandDiv.innerHTML+=`<p>< ${returnedValue.replace(/\n/g, "<br>")}</p>`;
        logs.scrollTo(0,logs.scrollHeight);
    }

    let isTyping = false;
    unsafeWindow.addEventListener("keydown", e => {
        if(e.keyCode == 13){
            unsafeWindow.console.log(isTyping);
            if(!isTyping){
                toggleConsole();
            }
        }
    });
    unsafeWindow.addEventListener("keydown", e => {
        if(isHided) return;
        if((e.keyCode == 191)&&!isTyping){
            e.preventDefault();
            e.stopPropagation();
            input.innerText = "";
            isTyping = true;
        }else if((e.keyCode == 13)&&isTyping){
            e.preventDefault();
            e.stopPropagation();
            commandRegister(input.innerText);
            input.innerText = "Press / to type an command.";
            isTyping = false;
        }else if((e.keyCode == 8)&&isTyping){
            e.preventDefault();
            e.stopPropagation();
            let remove = input.innerText.split("");
            remove[remove.length-1]="";
            input.innerText=remove.join("");
        }else if((e.keyCode == 32)&&isTyping){
            e.preventDefault();
            e.stopPropagation();
            input.innerText+=" ";
        }else if(isTyping){
            e.preventDefault();
            e.stopPropagation();
            input.innerText+=String.fromCharCode(e.keyCode).toLowerCase();
        }
    });

    console.appendChild(logs);
    console.appendChild(input);
    unsafeWindow.addEventListener("load", () => unsafeWindow.document.body.appendChild(console));
})();