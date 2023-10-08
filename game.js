window.onload = function () {
  'use strict';let zzfx,zzfxV,zzfxX
  // ZzFXMicro - Zuper Zmall Zound Zynth - v1.2.0 by Frank Force ~ 880 bytes
  zzfxV=0.3    // volume
  zzfx=     // play sound
  (p=1,k=.05,b=220,e=0,r=0,t=.1,q=0,D=1,u=0,y=0,v=0,z=0,l=0,E=0,A=0,F=0,c=0,w=1,m=
  0,B=0,M=Math,R=44100,d=2*M.PI,G=u*=500*d/R/R,C=b*=(1-k+2*k*M.random(k=[]))*d/R,g
  =0,H=0,a=0,n=1,I=0,J=0,f=0,x,h)=>{e=R*e+9;m*=R;r*=R;t*=R;c*=R;y*=500*d/R**3;A*=d
  /R;v*=d/R;z*=R;l=R*l|0;for(h=e+m+r+t+c|0;a<h;k[a++]=f)++J%(100*F|0)||(f=q?1<q?2<
  q?3<q?M.sin((g%d)**3):M.max(M.min(M.tan(g),1),-1):1-(2*g/d%2+2)%2:1-4*M.abs(M.
  round(g/d)-g/d):M.sin(g),f=(l?1-B+B*M.sin(d*a/l):1)*(0<f?1:-1)*M.abs(f)**D*zzfxV
  *p*(a<e?a/e:a<e+m?1-(a-e)/m*(1-w):a<e+m+r?w:a<h-c?(h-a-c)/t*w:0),f=c?f/2+(c>a?0:
  (a<h-c?1:(h-a)/c)*k[a-c|0]/2):f),x=(b+=u+=y)*M.cos(A*H++),g+=x-x*E*(1-1E9*(M.sin
  (a)+1)%2),n&&++n>z&&(b+=v,C+=v,n=0),!l||++I%l||(b=C,u=G,n||=1);p=zzfxX.
  createBuffer(1,h,R);p.getChannelData(0).set(k);b=zzfxX.createBufferSource();b.
  buffer=p;b.connect(zzfxX.destination);b.start();return b};zzfxX=new AudioContext;

  const optionsScreen = document.querySelector(".options-screen");
  const boardContainer = document.querySelector(".board-container");
  const startGameBtn = document.querySelector('.startGameBtn');
  const boardDesign = document.querySelector(".board-design");
  const instructions = document.querySelector(".instructions");
  const sound = document.querySelector(".sound");
  const cross = document.querySelector(".cross");
  const volbars = document.querySelector(".volbars");
  const playerTurnPiece = document.querySelector(".player-turn");
  const game = document.querySelector(".game");
  const boardTop = document.querySelector(".board-top");
  const bpi = document.querySelector(".bpi");
  const wpi = document.querySelector(".wpi");
  cross.style.display = 'none';
  let gs = {
    yhp: [], // yellow highlight pieces
    ghp: [], // green highlight pieces
    nbp: 12, // number of black pieces
    nwp: 12  // number of white pieces
  }; // game state

  let exploredStates = {};

  document.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      if (boardContainer.hidden == true) {
        startGameBtn.click();
      }
    }
  });

  document.querySelector(".reset").addEventListener("click", () => {window.location.reload()});

  sound.addEventListener("click", (e) => {
    zzfxV=zzfxV==0?0.3:0;
    volbars.style.display = volbars.style.display==='none'? '': 'none';
    cross.style.display = cross.style.display==='none'? '': 'none';
    zzfx(2.08,.05,495,.01,.01,0,0,.93,-20,0,323,.08,.03,0,-279,.6,.02,1,.01,0); 
  })

  bpi.innerHTML = getPieceSVG("#000");
  bpi.children[0].style.backgroundColor = "white";
  bpi.children[0].style.borderRadius = "50%";
  wpi.innerHTML = getPieceSVG("#fff");
  wpi.children[0].style.backgroundColor = "black";
  wpi.children[0].style.borderRadius = "50%";

  playerTurnPiece.innerHTML = getPieceSVG("#fff");

  // Function to gather game settings and return them as a JSON object
  function setGameSettings() {
    const playerModeOptions = document.querySelectorAll('input[name="playerMode"]');
    const playerColorOptions = document.querySelectorAll('input[name="playerColor"]');

    let selectedPlayerMode = 'single';
    let selectedPlayerColor = 'white';
    let enableChallenges = false;

    // Find the selected player mode
    playerModeOptions.forEach(option => {
      if (option.checked) {
        selectedPlayerMode = option.value;
      }
    });

    // Find the selected player color
    playerColorOptions.forEach(option => {
      if (option.checked) {
        selectedPlayerColor = option.value;
      }
    });

    gs.pm = selectedPlayerMode;
    gs.pc = selectedPlayerColor;
  }


  function startGame() {
    optionsScreen.hidden = true;
    boardContainer.hidden = false;

    setGameSettings();
    generateTable(table);
    generateBoardDesign();
    highlightMovablePieces();

    boardDesign.style.height = table.offsetHeight;
    boardDesign.style.width = table.offsetWidth;
    boardTop.style.width = table.offsetWidth+"px";

    if (gs.pm == "single" && gs.pc == "black"){
      aiPlay();
    }

  }


  // Event listeners
  startGameBtn.addEventListener('click', startGame);

  // You can add event listeners and functionality for the "Start Game" button here

  let table = document.querySelector("#table");
  const svg = document.querySelector(".board-design");

  function Create2DArray(rows, columns) {
    var x = new Array(rows);
    for (let i = 0; i < rows; i++) {
      x[i] = new Array(columns);
    }
    return x;
  }

  let rc = 5;//rc--> rowAndColumn
  let td = Create2DArray(rc, rc);
  let pt = "w"; // player turn w or b
  const strokeWidth = "2";
  let pic = 0 // piece counter for setting diagonal move


  function Piece(pc, i, j, t, cc, cmd) {
    this.pc = pc; //piece cell
    this.i = i;
    this.j = j;
    this.t = t; // contains type(color) - b,w,e,lg
    this.cc = cc; // center coordinates
    this.cmd = cmd; // can move diagonally
    this.pk = []; // possible kills
    this.empxy = []; // empty xy
    this.yh = false; // yellow highlight
    this.kp = []; //kill pieces
    this.nei = []; //neighbours
    this.drawp = function () {
      let txt = `${this.i},${this.j}`
      // txt = '';
      if (this.t == "b") {
        //console.log("black");
        this.pc.innerHTML = `<div class="black-piec">${txt}</div>`
      } else if (this.t == "w") {
        //console.log("white")
        this.pc.innerHTML = `<div class="white-piec">${txt}</div>`
      } else if (this.t == "lg") {
        this.pc.innerHTML = `<div class="lg-piece">${txt}</div>`
      } else {
        //c("empty");
        this.pc.innerHTML = `${txt}`;
      }
    }

    this.getn = function (type) {
      //get neighbours of the required type
      let n = this.getpn(), nei = [];
      for (let it = 0; it < n.length; it++) {
        let nx = this.i + n[it][0],
          ny = this.j + n[it][1];
        if (nx > 4 || nx < 0 || ny > 4 || ny < 0) continue;
        //c(td[nx][ny].t)
        if (td[nx][ny].t == type) {
          nei = nei.concat([[nx, ny, n[it][0], n[it][1]]]);
        }
      }
      //c("nei ",type,nei)
      return nei;
    }

    this.getkillpieces = function () {
      let n = [], kp = [];//kill pieces
      if (pt == "w") {
        n = this.getn("b");
      } else {
        n = this.getn("w");
      }
      //c("i,j,n",this.i,this.j,n);
      for (let it = 0; it < n.length; it++) {
        // check for neighbors neighbor for kill
        let nn = [n[it][2] + n[it][2], n[it][3] + n[it][3]];
        let nnx = this.i + nn[0], nny = this.j + nn[1]
        //c("nnx,nny",nnx,nny);
        if (nnx > 4 || nnx < 0 || nny > 4 || nny < 0) continue;
        if (td[nnx][nny].t == "e" || td[nnx][nny].t == "lg") {
          kp = kp.concat([[nnx, nny, n[it][0], n[it][1]]]);
          //this.pk = this.pk.concat([[nx,ny,nnx,nny]]);
        }
      }
      return kp;
    }

    this.getpn = function () {
      //get possible neighbours
      let n = [[-1, 0], [0, 1], [1, 0], [0, -1]];
      if (this.cmd) {
        n = n.concat([[-1, -1], [-1, 1], [1, 1], [1, -1]])
      }
      return n;
    }

    this.handlec = function (pp) {
      let kp = this.getkillpieces();
      gs.ghp = kp;
      // previous piece
      if (this.t == "lg") {
        let kill = false;
        this.updatep(pp.t);
        pp.updatep("e");
        const dfx = this.i - pp.i, dfy = this.j - pp.j;//diff x & y
        if (Math.abs(dfx) == 2 || Math.abs(dfy) == 2) {
          // explosion 35
          // zzfx(2.76,.05,452,.02,.28,.43,4,.71,.2,.8,0,0,.03,1.3,0,.2,.04,.33,.03,.14);
          // zzfx(1.01,.05,1798,0,.12,.01,4,2.76,0,0,0,0,0,.1,0,.1,0,.58,.15,0);
          zzfx(1,.05,817,.04,.1,.35,3,.7,.7,.9,0,0,0,1.4,25,.3,0,.43,.06,.33);
          let x = pp.i + (dfx / 2), y = pp.j + (dfy / 2);
          td[x][y].updatep("e");
          if (pt == "w") {
            gs.nbp--;
          } else {
            gs.nwp--;
          }
          pp.hp(pp.getkillpieces(), "e");
          kill = true;
          //this.addClass("green-border");
          //this.y=true;
        }
        if (!kill){
          // Jump sound 119
          zzfx(1.03,.05,476,0,.01,.06,1,1.49,-5.9,-3.2,0,0,0,0,0,0,0,.59,.01,0);
        }
        pp.hp(pp.getn("lg"), "e");
        let ct = true; // change turn
        if (kill) {
          let nkp = this.getkillpieces();
          //c("came kp", kp)
          this.hp(nkp, "lg");
          this.addClass("green-border");
          //c("gs.yhp", gs.yhp);
          for (let a = 0; a < gs.yhp.length; a++) {
            const x = gs.yhp[a][0], y = gs.yhp[a][1];
            if (x != pp.i && y != pp.j) {
              td[x][y].removeClass("yellow-border");
              td[x][y].yh = false;
            }
          }
          gs.yhp = [];
          //this.yh = true;
          ct = nkp.length === 0;
        }
        return ct;
      }
      pp.resetPiece();
      //c("kp",kp)
      if (kp.length > 0) {
        //kill pieces exist, bring lg pieces at that pos
        //pp.hp(pp.getkillpieces(),"e");
        this.hp(kp, "lg");
      } else {
        let en = this.getn("e");
        //pp.hp(pp.getn("lg"),"e");
        this.hp(en, "lg");
        gs.ghp = en;
      }
      if (pp.t == this.t) {
        pp.removeClass("green-border");
        pp.addClass("yellow-border");
        pp.yh = true;
      }
      this.removeClass("yellow-border");
      this.yh = false;
      this.addClass("green-border");
     //c("added gb", pp.t, this.t)
      return false;
    }

    this.hp = function (pxy, type) {
      //highlight pieces with piece xy array of type.
      for (let it = 0; it < pxy.length; it++) {
        let x = pxy[it][0], y = pxy[it][1];
        td[x][y].updatep(type);
      }
    }

    this.resetPiece = function () {
      let kp = this.getkillpieces();
      if (kp.length > 0) {
        //kill pieces exist, bring lg pieces at that pos
        this.hp(kp, "e");
      } else {
        let en = this.getn("lg");
        this.hp(en, "e");
      }
      //c("reseted")
    }

    this.updatep = function (t) {
      this.t = t;
      this.drawp();
    }

    this.addClass = function (cls) {
      this.pc.querySelector("div").classList.add(cls);
    }

    this.removeClass = function (cls) {
      this.pc.querySelector("div").classList.remove(cls)
    }
  }


  let psp = [2, 2]; // previous selected piece

  function handlec(e, i, j, ec=true) {
    //external click set to true for single player opponent
    if(gs.pm=="single"&&gs.pc=="black"&&td[i][j].t=="w"&&ec) return;
    if(gs.pm=="single"&&gs.pc=="white"&&td[i][j].t=="b"&&ec) return;
    if (td[i][j].t == "e") return;
    if ((!td[i][j].yh) && (td[i][j].t != "lg")) return;
    if (td[i][j].t == "w" && pt == "b") return;
    if (td[i][j].t == "b" && pt == "w") return;
    //c(td[i][j].yh)

    //c("td[i][j].t,pt",td[i][j].t,pt)
    const pi = psp[0], pj = psp[1]
    let pp = td[pi][pj];
    const pct = pp.t;
    //c("bef",pct);
    let ct = td[i][j].handlec(pp);
    //c("aft",pct)
    if (ct) {
      pt = pt == "w" ? "b" : "w";
      if(pt=="w"){
        playerTurnPiece.classList.remove("black-piece");
        playerTurnPiece.classList.add("white-piece");
        playerTurnPiece.innerHTML = getPieceSVG("#fff");
      } else {
        playerTurnPiece.classList.remove("white-piece");
        playerTurnPiece.classList.add("black-piece");
        playerTurnPiece.innerHTML = getPieceSVG("#000");
      }
      //c("pt",pt)
    }
    if (pct == td[i][j].t && ct) {
      highlightMovablePieces(i, j);
      //c("called");
    }
    //c("ct",ct)
    psp = [i, j];

    const aiColor = gs.pc == "white" ? "b" : "w";
    if(gs.pm=="single" && pt == aiColor && ct && pct == td[i][j].t){
      aiPlay();
    }

    return;
  }

  const delay = ms => new Promise(res => setTimeout(res, ms));

  function gameBoardToString(board){
    return board.map(v => v.map(x => `${x}`).join('')).join('')
  }
  
  function convertGameBoard(board){
    let state = JSON.parse(JSON.stringify(board))
    for(let i=0; i<state.length; i++){
      for(let j=0; j<state[0].length; j++){
        if(state[i][j].t == "w"){
          state[i][j] = 2
        } else if (state[i][j].t == "b"){
          state[i][j] = 1
        } else {
          state[i][j] = 0
        }
      }
    }
    return state
  }
  
  function heuristicValue(state, maxPlayer){
    let value = 0
    for(let i=0; i<state.length; i++){
      for(let j=0; j<state.length; j++){
        if(state[i][j] == maxPlayer){
          value += 1
        }
      }
    }
    return value
  }
    
  function terminalNode(state, maxPlayer){
    let maxPlayerPieces = 0
    for(let i=0; i<state.length; i++){
      for(let j=0; j<state.length; j++){
        if(state[i][j] == maxPlayer){
          maxPlayerPieces += 1
        }
      }
    }
    return maxPlayerPieces == 0
  }
  
  function minimax(state, depth, maximizingPlayer){
    if(depth == 0 || terminalNode(state, maximizingPlayer)){
      return heuristicValue(state, maximizingPlayer)
    }
  }

  function getNeighbors(row, col) {
    const neighbors = [];
  
    if (row > 0) {
      neighbors.push([row - 1, col]);
    }
    if (row < 4) {
      neighbors.push([row + 1, col]);
    }
    if (col > 0) {
      neighbors.push([row, col - 1]);
    }
    if (col < 4) {
      neighbors.push([row, col + 1]);
    }
  
    // Check if the row,col has diagonal move
    if ((row+col) % 2 == 0){
      if (row > 0 && col > 0) {
        neighbors.push([row - 1, col - 1]);
      }
      if (row < 4 && col > 0) {
        neighbors.push([row + 1, col - 1]);
      }
      if (row > 0 && col < 4) {
        neighbors.push([row - 1, col + 1]);
      }
      if (row < 4 && col < 4) {
        neighbors.push([row + 1, col + 1]);
      }
    }
  
    return neighbors;
  }
  
  

  function getPossibleActions(state, player) {
    const neighborMovablePieces = [];
    const killMovablePieces = [];

    const killPiece = player == 1 ? 2 : 1;
    
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 5; col++) {
        const piece = state[row][col];
        if (piece === player) {
          // Check for possible moves
          for (const neighbor of getNeighbors(row, col)) {
            if (state[neighbor[0]][neighbor[1]] === 0) {
              neighborMovablePieces.push([row, col, neighbor[0], neighbor[1]]);
            }
          }
  
          // Check for possible kills
          for (const neighbor of getNeighbors(row, col)) {
            if (state[neighbor[0]][neighbor[1]] === killPiece) {
              for (const nextNeighbor of getNeighbors(neighbor[0], neighbor[1])) {
                if (state[nextNeighbor[0]][nextNeighbor[1]] === 0) {
                  killMovablePieces.push([row, col, neighbor[0], neighbor[1], nextNeighbor[0], nextNeighbor[1]]);
                }
              }
            }
          }
        }
      }
    }
  
    return { neighborMovablePieces, killMovablePieces };
  }
  

  function performActionOnState(state, action){ 
    if(action.length == 6){
      // perform kill operation
      let [row, col, killx, killy, jumpx, jumpy] = action;
      let oldPiece = state[row][col];
      state[killx][killy] = 0;
      state[jumpx][jumpy] = oldPiece;
      state[row][col] = 0;
    } else if (action.length == 4) {
      let [row, col, jumpx, jumpy] = action;
      let oldPiece = state[row][col];
      state[jumpx][jumpy] = oldPiece;
      state[row][col] = 0;
    }
    return state
  }

  function getStateValue(state, action, minPlayer=true){
    let stateString = gameBoardToString(state);
    let value;
    const countOnes = (stateString.match(/1/g) || []).length;
    const countTwos = (stateString.match(/2/g) || []).length;
    if(countTwos <= 2){
      exploredStates[stateString] = 1;
      // check only 1's in the board i.e, 2's count is 0
      return 1;
    } else if (countOnes <= 2){
      exploredStates[stateString] = -1;
      // check only 2's in the board i.e, 1's count is 0
      return -1;
    } else {
      let newState = performActionOnState(state, action);
      let newStateString = gameBoardToString(newState);
      console.log("newStateString", newStateString);
      if(exploredStates[newStateString] != undefined){
        return exploredStates[newStateString]
      }

      if(minPlayer){
        value = 999999999;
        let userActions = getPossibleActions(newState, newState[action[0]][action[1]]);
        if (userActions.killMovablePieces.length >= 1){
          userActions.killMovablePieces.forEach(act => {
            value = Math.min(value, getStateValue(newState, act, false))
          });
        } else {
          userActions.neighborMovablePieces.forEach(act => {
            value = Math.min(value, getStateValue(newState, act, false))
          });
        }
      } else {
        value = -999999999;
        let compActions = getPossibleActions(newState, newState[action[0]][action[1]]);
        if(compActions.killMovablePieces.length >= 1){
          compActions.killMovablePieces.forEach(act => {
            value = Math.max(value, getStateValue(newState, act, true));
          })
        } else {
          compActions.neighborMovablePieces.forEach(act => {
            value = Math.max(value, getStateValue(newState, act, true));
          })
        }
      }

      exploredStates[newStateString] = value;
      return value;
    }
  }

  let firstRun = true;

  async function aiPlay(){
    let state = convertGameBoard(td)
    console.log("State", state)
    console.log("value", minimax(state, 0, 1))
    //random item
    let ri = gs.yhp[Math.floor(Math.random()*gs.yhp.length)];

    if(firstRun){
      let stateValue = getStateValue(state, [1,3,3,3], true);
      console.log("state value", stateValue)
      firstRun = false;
    }
    
    // optimal move
    // let ri =  

    await delay(500);
    handlec("e",ri[0],ri[1],false)
    let rgi = gs.ghp[Math.floor(Math.random()*gs.ghp.length)];
    
    // rest green highlighted pieces so that it will be set again after the click
    // gs.ghp = [];
    
    await delay(500);
    handlec("e",rgi[0],rgi[1],false);
    
    while (gs.ghp.length != 0){
      rgi = gs.ghp[Math.floor(Math.random()*gs.ghp.length)];
      await delay(500);
      handlec("e",rgi[0],rgi[1],false);
    }

  }

  function highlightMovablePieces() {
    let ckp = []; // can kill pieces
    let onmp = [];  // only neighbor movable pieces
    //c("gs", Object.values(gs))
    if (gs.nwp == 0 || gs.nbp == 0) {
      // gameWon.play();
      setTimeout(()=>zzfx(2.06,0,800,.03,.44,.32,2,1.35,0,0,0,0,.3,.1,0,0,0,.31,.02,.08),1)
      setTimeout(()=>zzfx(2.06,0,800,.03,.44,.32,2,1.35,0,0,0,0,.3,.1,0,0,.26,.31,.02,.08),550)
      gs.nwp==0?celebrate("𝔅𝔩𝔞𝔠𝔨"):celebrate("𝔚𝔥𝔦𝔱𝔢");
      instructions.remove();
      game.style.width = "100%";
      boardContainer.hidden = true;
    }
    gs.yhp = []; // reset yellow highlight pieces
    for (let x = 0; x < td.length; x++) {
      for (let y = 0; y < td[x].length; y++) {
        if (td[x][y].t == pt) {
          let kp = td[x][y].getkillpieces();
          //c("kp",kp)
          if (kp.length > 0) {
            ckp = ckp.concat([[x, y]]);
          } else {
            let np = td[x][y].getn("e");
            if (np.length > 0) {
              onmp = onmp.concat([[x, y]]);
            }
          }
        } else if (td[x][y].t != "e") {
          td[x][y].removeClass("green-border");
          td[x][y].removeClass("yellow-border");
          td[x][y].yh = false;
          //c("removed");
        }
      }
    }
    //c("ckp",ckp)
    //c("onmp",onmp)
    if (ckp.length > 0) {
      for (let it = 0; it < ckp.length; it++) {
        let x = ckp[it][0], y = ckp[it][1];
        td[x][y].addClass("yellow-border");
        td[x][y].yh = true;
        //c("added yb",x,y);
      }
      gs.yhp = ckp;
    } else {
      for (let it = 0; it < onmp.length; it++) {
        let x = onmp[it][0], y = onmp[it][1];
        td[x][y].addClass("yellow-border");
        td[x][y].yh = true;
      }
      gs.yhp = onmp;
    }
    //c("hp",hp);
  }


  function getTdCenterCoordinates(td) {
    const centerX = td.clientWidth / 2;
    const centerY = td.clientHeight / 2;
    const absoluteX = centerX + td.offsetLeft;
    const absoluteY = centerY + td.offsetTop;
    return {
      x: absoluteX,
      y: absoluteY
    };
  }

  function generateBoardDesign() {
    const p00 = td[0][0].cc; // piece 00
    const p44 = td[4][4].cc;
    //console.log(p00.x,p00.y);
    svg.innerHTML = `<rect x=${p00.x} y=${p00.y} width=${p44.y - p00.y} height=${p44.x - p00.x} stroke-width=${strokeWidth} stroke="black" fill="transparent" />`
    // for loop for generating lines li --> linesIndex which contains x1,y1,x2,y2
    const li = [[1, 0, 1, 4], [2, 0, 2, 4], [3, 0, 3, 4], [0, 1, 4, 1], [0, 2, 4, 2], [0, 3, 4, 3], [0, 2, 2, 0], [0, 2, 2, 4], [2, 0, 4, 2], [2, 4, 4, 2], [0, 0, 4, 4], [0, 4, 4, 0]]
    for (let ind in li) {
      const x1 = td[li[ind][0]][li[ind][1]].cc.x
      const y1 = td[li[ind][0]][li[ind][1]].cc.y
      const x2 = td[li[ind][2]][li[ind][3]].cc.x
      const y2 = td[li[ind][2]][li[ind][3]].cc.y
      svg.innerHTML += `<line x1=${x1} x2=${x2} y1=${y1} y2=${y2} stroke-width=${strokeWidth} stroke="black"/>`;
    }
  }


  function generateTable(table) {
    for (let i = 0; i < rc; i++) {
      let row = table.insertRow();
      for (let j = 0; j < rc; j++) {
        let cmd = true;
        if (pic % 2 == 1) {
          cmd = false;
        }
        let cell = row.insertCell();
        let text = document.createTextNode(``);
        cell.classList.add("cell")
        let pct = "e"; // piece type
        if (i <= 1 || (i == 2 && j <= 1)) {
          //cell.style.backgroundColor="yellow";
          //cell.style.color = "white";
          pct = "b";
        }
        else if (i > 2 || (i == 2 && j > 2)) {
          //cell.style.backgroundColor="yellow";
          pct = "w";
        }
        cell.appendChild(text);
        const cc = getTdCenterCoordinates(cell)
        //if (!(i==2 && j==2)){
        td[i][j] = new Piece(cell, i, j, pct, cc, cmd);
        td[i][j].drawp();
        //}
        cell.addEventListener("click", (e) => handlec(e, i, j)); //handleclick
        //console.log(cc.x,cc.y)

        pic++;
      }
    }
  }

  function getPieceSVG(fc){
    return `<svg xmlns="http://www.w3.org/2000/svg" version="1.0" viewBox="0 0 900 900"><g fill="${fc}"><path d="M413 1a460 460 0 0 0-225 84A484 484 0 0 0 31 284l-15 46-3 11A502 502 0 0 0 1 495c2 19 8 52 12 66l3 11a414 414 0 0 0 56 125 528 528 0 0 0 107 115l10 6a387 387 0 0 0 38 24 528 528 0 0 0 87 38l13 4a439 439 0 0 0 243 1l11-4 9-2 13-5a114 114 0 0 0 15-6l10-4 17-8a102 102 0 0 0 17-9 252 252 0 0 0 20-11l14-9c51-33 96-78 129-129l9-14 2-3 5-9a540 540 0 0 0 41-100 402 402 0 0 0 17-85l1-36-1-36-3-14a409 409 0 0 0-62-183l-12-18a694 694 0 0 0-20-28 479 479 0 0 0-106-97l-14-9-3-2-8-4a366 366 0 0 0-41-21l-32-13-9-3A545 545 0 0 0 449 0l-36 1zm68 107a353 353 0 0 1 82 18l7 2a431 431 0 0 1 57 28l14 9 26 19a363 363 0 0 1 110 163 338 338 0 0 1-61 322 358 358 0 0 1-146 105 350 350 0 0 1-269-12 347 347 0 0 1-180-415l10-29a343 343 0 0 1 129-155l8-5a285 285 0 0 1 56-28c13-5 36-12 56-16 19-4 18-4 50-7 10-1 34-1 51 1z"/><path d="M432 160c-15 1-22 1-38 5a235 235 0 0 0-56 16 288 288 0 0 0-72 43l-9 8a260 260 0 0 0-42 44 285 285 0 0 0-55 212 274 274 0 0 0 20 75 285 285 0 0 0 42 71l8 9a251 251 0 0 0 63 55l9 5 33 17 14 5 6 2 4 1a274 274 0 0 0 127 13 274 274 0 0 0 105-35 313 313 0 0 0 77-63l8-9a313 313 0 0 0 50-93 274 274 0 0 0 13-127 274 274 0 0 0-35-105 290 290 0 0 0-273-149zm29 125c4 3 12 10 17 18l3 4a273 273 0 0 1 19 24l13 18c26 33 26 33 30 33l9-2 11-3 11-3 21-5 11-4c4 0 9-2 11-3 6-2 15-1 20 1s12 9 14 14 3 15 1 20l-10 32c-3 13-4 17-6 20l-3 11-2 10a561 561 0 0 0-15 52l-4 11-3 11-3 10-3 11c-2 9-10 17-18 19l-137 1c-149 0-138 1-147-8l-5-7-1-4-4-10c0-4-2-8-3-11l-3-10c0-4-2-9-3-11l-5-20-6-22c-1-3-3-7-3-11l-4-10-3-11-3-11-3-10-3-11-3-11-3-10c-2-5-1-15 1-20s9-12 14-14 14-3 20-1c2 1 7 3 11 3l11 3 11 3 11 3 10 3a1036 1036 0 0 0 20 5c4 0 4 0 30-33l13-18a1426 1426 0 0 0 19-24l3-5a89 89 0 0 1 8-9c6-7 12-10 21-10 5 0 8 0 12 2z"/><path d="M443 360a1519 1519 0 0 0-43 55 98 98 0 0 1-19 21c-5 3-6 3-13 3l-13-1-22-7-10-3c-8-2-12-2-13-1l5 21 4 11 3 10a776 776 0 0 1 8 32l3 10 4 11 1 6 1 3 110 1h109l2-6 6-21 4-13 3-10 2-9 3-10 4-13 3-10c2-10 3-12 2-13s-2-1-23 5l-10 3-11 3-13 1c-7 0-8 0-13-3-4-3-9-8-18-19a16099 16099 0 0 0-50-64l-6 7z"/></g></svg>`
  }

  const canvas = document.getElementById('celebrationCanvas');
  const ctx = canvas.getContext('2d');
  
  // Function to create a 13th century celebration effect
  function celebrate(winningPlayer) {
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create Image objects for each particle shape
    const svtag = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" `;
    const swordImage = new Image();
    swordImage.src = `${svtag}fill="%23C0C0C0" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0z"/><path d="M17 3h4v4l-5 5 2 3 2-2 1 2-2 2 3 3-2 2-3-3-2 2-2-1 2-2-3-2-3 2 2 2-2 1-2-2-3 3-2-2 3-3-2-2 1-2 2 2 2-3-5-5V3h4l5 5 5-5zm-7 10-3 3 1 1 3-3-1-1zm9-8h-1l-5 5 1 1 5-5V5zM5 5v1l11 11 1-1L6 5H5z"/></svg>`;

    const swordImage2 = new Image();
    swordImage2.src = `${svtag}fill="%23DC143C" viewBox="0 0 24 24"><path fill="none" d="M0 0h24v24H0z"/><path d="M17 3h4v4l-5 5 2 3 2-2 1 2-2 2 3 3-2 2-3-3-2 2-2-1 2-2-3-2-3 2 2 2-2 1-2-2-3 3-2-2 3-3-2-2 1-2 2 2 2-3-5-5V3h4l5 5 5-5zm-7 10-3 3 1 1 3-3-1-1zm9-8h-1l-5 5 1 1 5-5V5zM5 5v1l11 11 1-1L6 5H5z"/></svg>`;

    const shieldImage = new Image();
    shieldImage.src = `${svtag}fill="%23D2B48C" viewBox="0 0 512 512"><path d="M479 111a16 16 0 0 0-13-14c-86-16-122-28-200-63-8-3-13-3-20 0-78 35-114 47-200 63a16 16 0 0 0-13 14c-4 61 4 118 24 170a349 349 0 0 0 72 112c44 47 94 75 119 86a20 20 0 0 0 16 0c27-11 74-38 119-86a349 349 0 0 0 72-112c20-52 28-109 24-170Z"/></svg>`;


    const shieldImage2 = new Image();
    shieldImage2.src = `${svtag}fill="%238B4513" viewBox="0 0 512 512"><path d="M479 111a16 16 0 0 0-13-14c-86-16-122-28-200-63-8-3-13-3-20 0-78 35-114 47-200 63a16 16 0 0 0-13 14c-4 61 4 118 24 170a349 349 0 0 0 72 112c44 47 94 75 119 86a20 20 0 0 0 16 0c27-11 74-38 119-86a349 349 0 0 0 72-112c20-52 28-109 24-170Z"/></svg>`;

    const crownImage = new Image();
    crownImage.src = `${svtag}fill="%23FFD700" viewBox="0 0 640 512"><path d="M528 448H112c-9 0-16 7-16 16v32c0 9 7 16 16 16h416c9 0 16-7 16-16v-32c0-9-7-16-16-16zm64-320a48 48 0 0 0-44 68l-72 43c-15 9-35 4-44-11L350 85a48 48 0 0 0-30-85 48 48 0 0 0-30 85l-82 143c-9 15-29 20-44 11l-72-43c2-6 4-13 4-20a48 48 0 1 0-40 47l72 193h384l72-193 8 1a48 48 0 0 0 0-96z"/></svg>`;

    const crownImage2 = new Image();
    crownImage2.src = `${svtag}fill="%23800080" viewBox="0 0 640 512"><path d="M528 448H112c-9 0-16 7-16 16v32c0 9 7 16 16 16h416c9 0 16-7 16-16v-32c0-9-7-16-16-16zm64-320a48 48 0 0 0-44 68l-72 43c-15 9-35 4-44-11L350 85a48 48 0 0 0-30-85 48 48 0 0 0-30 85l-82 143c-9 15-29 20-44 11l-72-43c2-6 4-13 4-20a48 48 0 1 0-40 47l72 193h384l72-193 8 1a48 48 0 0 0 0-96z"/></svg>`;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const particleCount = 70; // Number of particles

    const replay = document.querySelector(".replay");
    replay.hidden = false;
    replay.style.left = (centerX-20)+"px";
    replay.style.top = (centerY-30)+"px";
    replay.addEventListener("click", () => {window.location.reload()});

    function createParticle() {
      const angle = Math.random() * Math.PI * 2; // Random angle
      const distance = Math.random() * 50 + 10; // Random distance from the center
      const x = centerX + Math.cos(angle) * distance;
      const y = centerY + Math.sin(angle) * distance;
      const shape = getMedievalShape(); // Random medieval shape
      const shapeImage = getRandomShapeImage(shape);

      return {
        x,
        y,
        shape,
        shapeImage,
        alpha: 1 // Initial opacity
      };
    }

    function getMedievalShape() {
      // Add more shapes as needed
      const medievalShapes = ['sword', 'shield', 'crown'];
      return medievalShapes[Math.floor(Math.random() * medievalShapes.length)];
    }

    function getRandomShapeImage(shape) {
      let randomShapeImage = null;
      switch (shape) {
        case 'sword':
          randomShapeImage = Math.random() < 0.5 ? swordImage : swordImage2;
          break;
        case 'shield':
          randomShapeImage = Math.random() < 0.5 ? shieldImage : shieldImage2;
          break;
        case 'crown':
          randomShapeImage = Math.random() < 0.5 ? crownImage : crownImage2;
          break;
        default:
          break;
      }
      return randomShapeImage;
    }

    const particles = [];

    // Create and animate particles
    function animateParticles() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Create new particles
      if (particles.length < particleCount) {
        particles.push(createParticle());
      }

      particles.forEach((particle, index) => {
        ctx.globalAlpha = particle.alpha;

        // Draw medieval shapes using the Image objects
        const imageSize = 30; // Size of the image
        ctx.drawImage(particle.shapeImage, particle.x - imageSize / 2, particle.y - imageSize / 2, imageSize, imageSize);
        // switch (particle.shape) {
        //     case 'sword':
        //         ctx.drawImage(Math.random()<0.5 ? swordImage : swordImage2, particle.x - imageSize / 2, particle.y - imageSize / 2, imageSize, imageSize);
        //         break;
        //     case 'shield':
        //         ctx.drawImage(Math.random()<0.5 ? shieldImage : shieldImage2, particle.x - imageSize / 2, particle.y - imageSize / 2, imageSize, imageSize);
        //         break;
        //     case 'crown':
        //         ctx.drawImage(Math.random()<0.5 ? crownImage: crownImage2, particle.x - imageSize / 2, particle.y - imageSize / 2, imageSize, imageSize);
        //         break;
        //     default:
        //         break;
        // }

        // Move particles away from the center
        const dx = particle.x - centerX;
        const dy = particle.y - centerY;
        //const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        const speed = 4; // Adjust the speed as needed
        particle.x += Math.cos(angle) * speed;
        particle.y += Math.sin(angle) * speed;

        // Fade out the particle
        particle.alpha -= 0.01;

        // Remove faded out particles and add new ones
        if (particle.alpha <= 0) {
          particles.splice(index, 1);
          particles.push(createParticle());
        }
      });

      // Display which player won at the center
      ctx.font = '23px Berry Rotunda';
      ctx.fillStyle = 'black';
      ctx.fillText(`P𝔩𝔞𝔶𝔢𝔯 ${winningPlayer} 𝔗𝔯𝔦𝔲𝔪𝔭𝔥𝔰!`, centerX - 105, centerY+150);

      requestAnimationFrame(animateParticles);
    }

    animateParticles();
  }
//  celebrate("Black")

startGame()
}



