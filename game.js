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
  cross.style.display = 'none';
  let gs = {
    yhp: [], // yellow highlight pieces
    nbp: 12, // number of black pieces
    nwp: 12  // number of white pieces
  }; // game state

  document.addEventListener("keyup", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      if (boardContainer.hidden == true) {
        startGameBtn.click();
      }
    }
  });

  sound.addEventListener("click", (e) => {
    zzfxV=zzfxV==0?0.3:0;
    volbars.style.display = volbars.style.display==='none'? '': 'none';
    cross.style.display = cross.style.display==='none'? '': 'none';
    zzfx(2.08,.05,495,.01,.01,0,0,.93,-20,0,323,.08,.03,0,-279,.6,.02,1,.01,0); 
  })

  

  // Function to gather game settings and return them as a JSON object
  function setGameSettings() {
    const playerModeOptions = document.querySelectorAll('input[name="playerMode"]');
    const playerColorOptions = document.querySelectorAll('input[name="playerColor"]');
    const enableChallengesCheckbox = document.getElementById('miniChallenges');

    let selectedPlayerMode = '';
    let selectedPlayerColor = '';
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

    // Check if mini challenges are enabled
    enableChallenges = enableChallengesCheckbox.checked;

    gs.pm = selectedPlayerMode;
    gs.pc = selectedPlayerColor;
    gs.ec = enableChallenges;
  }


  function startGame() {
    optionsScreen.hidden = true;
    boardContainer.hidden = false;

    c("gs", gs);

    setGameSettings();
    generateTable(table);
    generateBoardDesign();
    highlightMovablePieces();

    boardDesign.style.height = table.offsetHeight;
    boardDesign.style.width = table.offsetWidth;
    boardTop.style.width = table.offsetWidth+"px";
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
  let width = window.innerWidth;
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
      txt = '';
      if (this.t == "b") {
        //console.log("black");
        this.pc.innerHTML = `<div class="black-piece">${txt}</div>`
      } else if (this.t == "w") {
        //console.log("white")
        this.pc.innerHTML = `<div class="white-piece">${txt}</div>`
      } else if (this.t == "lg") {
        this.pc.innerHTML = `<div class="lg-piece">${txt}</div>`
      } else {
        //c("empty");
        this.pc.innerHTML = "";
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
      // previous piece
      if (this.t == "lg") {
        let kill = false;
        this.updatep(pp.t);
        pp.updatep("e");
        const dfx = this.i - pp.i, dfy = this.j - pp.j;//diff x & y
        if (Math.abs(dfx) == 2 || Math.abs(dfy) == 2) {
          // explosion 35
          // zzfx(2.76,.05,452,.02,.28,.43,4,.71,.2,.8,0,0,.03,1.3,0,.2,.04,.33,.03,.14);
          zzfx(1.01,.05,1798,0,.12,.01,4,2.76,0,0,0,0,0,.1,0,.1,0,.58,.15,0);
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
          kp = this.getkillpieces();
          //c("came kp", kp)
          this.hp(kp, "lg");
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
          ct = kp.length === 0;
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

  function handlec(e, i, j) {
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
      } else {
        playerTurnPiece.classList.remove("white-piece");
        playerTurnPiece.classList.add("black-piece");
      }
      //c("pt",pt)
    }
    if (pct == td[i][j].t && ct) {
      highlightMovablePieces(i, j);
      //c("called");
    }
    //c("ct",ct)
    psp = [i, j];
    return;
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




  function c(a, ...b) {
    console.log(a, b);
  }





  function containsArray(arr, target) {
    //c("arr", arr, arr.length, "target", target);
    for (let i = 0; i < arr.length; i++) {
      if (arr[i][0] === target[0] && arr[i][1] === target[1]) {
        return true;
      }
    }
    return false;
  }





  function highlightMovablePiecesOld(i, j) {
    let hp = []; // highlight pieces
    for (let x = 0; x < td.length; x++) {
      for (let y = 0; y < td[x].length; y++) {
        if (td[x][y].t == pt) {
          td[x][y].checknn();
          if (td[x][y].empxy.length > 0 || td[x][y].pk.length > 0) {
            hp = hp.concat([[x, y]]);
          }
        } else if (td[x][y].t != "e") {
          td[x][y].removeClass("yellow-border");
          td[x][y].yh = false;
        }
      }
    }
    let ckp = [] // can kill pieces
    for (let a = 0; a < hp.length; a++) {
      let x = hp[a][0], y = hp[a][1];
      if (td[x][y].pk.length > 0) {
        ckp = ckp.concat([[x, y]]);
      }
    }
    if (ckp.length > 0) {
      for (let it = 0; it < ckp.length; it++) {
        let x = ckp[it][0], y = ckp[it][1];
        td[x][y].addClass("yellow-border");
        td[x][y].yh = true;
      }
    } else {
      for (let it = 0; it < hp.length; it++) {
        let x = hp[it][0], y = hp[it][1];
        //c(x,y);
        td[x][y].addClass("yellow-border");
        td[x][y].yh = true;
      }
    }
    //c("hp",hp);
  }


  const canvas = document.getElementById('celebrationCanvas');
  const ctx = canvas.getContext('2d');

  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Function to create a 13th century celebration effect
  function celebrate(winningPlayer) {
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
      ctx.fillText(`P𝔩𝔞𝔶𝔢𝔯 ${winningPlayer} 𝔗𝔯𝔦𝔲𝔪𝔭𝔥𝔰!`, centerX - 105, centerY);

      requestAnimationFrame(animateParticles);
    }

    animateParticles();
  }
//  celebrate("Black")

}



