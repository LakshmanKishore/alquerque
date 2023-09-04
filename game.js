window.onload = function () {
  const optionsScreen = document.querySelector(".options-screen");
  const boardContainer = document.querySelector(".board-container");
  const startGameBtn = document.querySelector('.startGameBtn');
  const boardDesign = document.querySelector(".board-design");
  const gameWon = new Audio("./audio/gamewon.mp3");
  const killAudio = new Audio("./audio/kill.mp3");
  const move = new Audio("./audio/move.mp3");
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

    setGameSettings();
    generateTable(table);
    generateBoardDesign();
    highlightMovablePieces();

    boardDesign.style.height = table.offsetHeight;
    boardDesign.style.width = table.offsetWidth;
  }

  // Event listeners
  startGameBtn.addEventListener('click', startGame);

  // You can add event listeners and functionality for the "Start Game" button here

  let table = document.querySelector("#table");
  const svg = document.querySelector(".board-design");

  function Create2DArray(rows, columns) {
    var x = new Array(rows);
    for (i = 0; i < rows; i++) {
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
          killAudio.play();
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
          move.play();
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
    if (gs.nwp == 0) {
      gameWon.play();
      celebrate("Black");
      boardContainer.hidden = true;
    } else if (gs.nbp == 0) {
      gameWon.play();
      celebrate("White");
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
    for (ind in li) {
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
    const swordImage = new Image();
    swordImage.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24" fill="%23C0C0C0"><g><path d="M0 0h24v24H0z" fill="none"/><path d="M17.457 3L21 3.003l.002 3.523-5.467 5.466 2.828 2.829 1.415-1.414 1.414 1.414-2.474 2.475 2.828 2.829-1.414 1.414-2.829-2.829-2.475 2.475-1.414-1.414 1.414-1.415-2.829-2.828-2.828 2.828 1.415 1.415-1.414 1.414-2.475-2.475-2.829 2.829-1.414-1.414 2.829-2.83-2.475-2.474 1.414-1.414 1.414 1.413 2.827-2.828-5.46-5.46L3 3l3.546.003 5.453 5.454L17.457 3zm-7.58 10.406L7.05 16.234l.708.707 2.827-2.828-.707-.707zm9.124-8.405h-.717l-4.87 4.869.706.707 4.881-4.879v-.697zm-14 0v.7l11.241 11.241.707-.707L5.716 5.002l-.715-.001z" fill-rule="nonzero"/></g></svg>`;

    const swordImage2 = new Image();
    swordImage2.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 24 24" fill="%23DC143C"><g><path d="M0 0h24v24H0z" fill="none"/><path d="M17.457 3L21 3.003l.002 3.523-5.467 5.466 2.828 2.829 1.415-1.414 1.414 1.414-2.474 2.475 2.828 2.829-1.414 1.414-2.829-2.829-2.475 2.475-1.414-1.414 1.414-1.415-2.829-2.828-2.828 2.828 1.415 1.415-1.414 1.414-2.475-2.475-2.829 2.829-1.414-1.414 2.829-2.83-2.475-2.474 1.414-1.414 1.414 1.413 2.827-2.828-5.46-5.46L3 3l3.546.003 5.453 5.454L17.457 3zm-7.58 10.406L7.05 16.234l.708.707 2.827-2.828-.707-.707zm9.124-8.405h-.717l-4.87 4.869.706.707 4.881-4.879v-.697zm-14 0v.7l11.241 11.241.707-.707L5.716 5.002l-.715-.001z" fill-rule="nonzero"/></g></svg>`;

    const shieldImage = new Image();
    shieldImage.src = `data:image/svg+xml,<svg height="512" viewBox="0 0 512 512" width="512" xmlns="http://www.w3.org/2000/svg" fill="%23D2B48C" ><title/><path d="M479.07,111.35A16,16,0,0,0,465.92,96.6C379.89,81.18,343.69,69.12,266,34.16c-7.76-2.89-12.57-2.84-20,0-77.69,35-113.89,47-199.92,62.44a16,16,0,0,0-13.15,14.75c-3.85,61.1,4.34,118,24.36,169.15a348.86,348.86,0,0,0,71.43,112.41c44.67,47.43,94.2,75.12,119.74,85.6a20,20,0,0,0,15.11,0c27-10.92,74.69-37.82,119.71-85.62A348.86,348.86,0,0,0,454.71,280.5C474.73,229.36,482.92,172.45,479.07,111.35Z"/></svg>`;


    const shieldImage2 = new Image();
    shieldImage2.src = `data:image/svg+xml,<svg height="512" viewBox="0 0 512 512" width="512" xmlns="http://www.w3.org/2000/svg" fill="%238B4513" ><title/><path d="M479.07,111.35A16,16,0,0,0,465.92,96.6C379.89,81.18,343.69,69.12,266,34.16c-7.76-2.89-12.57-2.84-20,0-77.69,35-113.89,47-199.92,62.44a16,16,0,0,0-13.15,14.75c-3.85,61.1,4.34,118,24.36,169.15a348.86,348.86,0,0,0,71.43,112.41c44.67,47.43,94.2,75.12,119.74,85.6a20,20,0,0,0,15.11,0c27-10.92,74.69-37.82,119.71-85.62A348.86,348.86,0,0,0,454.71,280.5C474.73,229.36,482.92,172.45,479.07,111.35Z"/></svg>`;

    const crownImage = new Image();
    crownImage.src = `data:image/svg+xml,<svg viewBox="0 0 640 512" xmlns="http://www.w3.org/2000/svg" fill="%23FFD700"><path d="M528 448H112c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h416c8.8 0 16-7.2 16-16v-32c0-8.8-7.2-16-16-16zm64-320c-26.5 0-48 21.5-48 48 0 7.1 1.6 13.7 4.4 19.8L476 239.2c-15.4 9.2-35.3 4-44.2-11.6L350.3 85C361 76.2 368 63 368 48c0-26.5-21.5-48-48-48s-48 21.5-48 48c0 15 7 28.2 17.7 37l-81.5 142.6c-8.9 15.6-28.9 20.8-44.2 11.6l-72.3-43.4c2.7-6 4.4-12.7 4.4-19.8 0-26.5-21.5-48-48-48S0 149.5 0 176s21.5 48 48 48c2.6 0 5.2-.4 7.7-.8L128 416h384l72.3-192.8c2.5.4 5.1.8 7.7.8 26.5 0 48-21.5 48-48s-21.5-48-48-48z"/></svg>`;

    const crownImage2 = new Image();
    crownImage2.src = `data:image/svg+xml,<svg viewBox="0 0 640 512" xmlns="http://www.w3.org/2000/svg" fill="%23800080"><path d="M528 448H112c-8.8 0-16 7.2-16 16v32c0 8.8 7.2 16 16 16h416c8.8 0 16-7.2 16-16v-32c0-8.8-7.2-16-16-16zm64-320c-26.5 0-48 21.5-48 48 0 7.1 1.6 13.7 4.4 19.8L476 239.2c-15.4 9.2-35.3 4-44.2-11.6L350.3 85C361 76.2 368 63 368 48c0-26.5-21.5-48-48-48s-48 21.5-48 48c0 15 7 28.2 17.7 37l-81.5 142.6c-8.9 15.6-28.9 20.8-44.2 11.6l-72.3-43.4c2.7-6 4.4-12.7 4.4-19.8 0-26.5-21.5-48-48-48S0 149.5 0 176s21.5 48 48 48c2.6 0 5.2-.4 7.7-.8L128 416h384l72.3-192.8c2.5.4 5.1.8 7.7.8 26.5 0 48-21.5 48-48s-21.5-48-48-48z"/></svg>`;

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
      ctx.fillText(`Player ${winningPlayer} Triumphs!`, centerX - 165, centerY);

      requestAnimationFrame(animateParticles);
    }

    animateParticles();
  }
//  celebrate("Black")

}






/*
 
 
//highlight possible moves
this.highlightpm = function() {
    //console.log("highlighting");
    this.addClass("green-border");
    this.removeClass("yellow-border");
    //c(this.cmd)
    //this.checknn();
    c("empxy",this.empxy);
    c("pk",this.pk)
    if(this.pk.length>0){
      for(let i=0;i<this.pk.length;i++){
        td[this.pk[i][2]][this.pk[i][3]].updatep("lg");
        }
    } else {
      for(let i=0;i<this.empxy.length;i++){
        td[this.empxy[i][0]][this.empxy[i][1]].updatep("lg");
      }
    }
    return;
    
    
    let n = [[-1,0],[0,1],[1,0],[0,-1]]
    if(this.cmd){
        n = n.concat([[-1,-1],[-1,1],[1,1],[1,-1]])
    }
    for(let i=0;i<n.length;i++){
        let nx = this.i+n[i][0],ny = this.j+n[i][1];
        if(nx>4||nx<0||ny>4||ny<0) continue;
        //c(td[nx][ny].t)
        let opp = "b";
        if(this.t == "b") opp = "w";
        if(td[nx][ny].t=="e"){
            td[nx][ny].t="lg";
            td[nx][ny].drawp();
        } else if(td[nx][ny].t==opp){
            // check for neighbors neighbor for kill
            let nn = [n[i][0]+n[i][0], n[i][1]+n[i][1]];
            let nnx = this.i+nn[0], nny = this.j+nn[1]
            c(nnx,nny);
            if(nnx>4||nnx<0||nny>4||nny<0) continue;
            if(td[nnx][nny].t=="e"){
                td[nnx][nny].t = "lg";
                td[nnx][nny].drawp();
                //c(nx,ny);
                this.pk = this.pk.concat([nx,ny]);
                //td[nx][ny].t = "e";
                //td[nx][ny].drawp();
            }
        }
    }
}
 
this.checknn = function(){
    //this.empxy = [];
    //this.pk = [];
    
    let n = this.getpn();
    for(let i=0;i<n.length;i++){
        let nx = this.i+n[i][0],ny = this.j+n[i][1];
        if(nx>4||nx<0||ny>4||ny<0) continue;
        //c(td[nx][ny].t)
        let opp = "b";
        if(this.t == "b") opp = "w";
        if(td[nx][ny].t=="e" || td[nx][ny].t == "lg"){
            this.empxy = this.empxy.concat([[nx,ny]]);
        } else if(td[nx][ny].t==opp){
            // check for neighbors neighbor for kill
            let nn = [n[i][0]+n[i][0], n[i][1]+n[i][1]];
            let nnx = this.i+nn[0], nny = this.j+nn[1]
            //c("nnx,nny",nnx,nny);
            if(nnx>4||nnx<0||nny>4||nny<0) continue;
            if(td[nnx][nny].t=="e"){
                this.pk = this.pk.concat([[nx,ny,nnx,nny]]);
            }
        }
    }
}
 
this.resethighlight = function(ex,ey) {
    let skip = [[ex,ey]]; // exclude/except x and y
    if(td[ex][ey].empxy.length>0){
      skip = skip.concat(td[ex][ey].empxy); 
    }
    let epk = []
    for(let j=0;j<td[ex][ey].pk.length;j++){
      epk = epk.concat([[td[ex][ey].pk[j][2],td[ex][ey].pk[j][3]]])
    }
    skip = epk.length>0?skip.concat(epk):skip;
    c(td[ex][ey].pk)
    c("skip",skip);
    c("pxpy.empxy",this.empxy,this.empxy.length)
    for(let i=0;i<this.empxy.length;i++){
      let emp = this.empxy[i]
      if(!containsArray(skip, emp)){
        td[emp[0]][emp[1]].updatep("e");       
      }
    }
    this.yh = false;
    this.empxy = [];
    this.pk = [];
}
 
 
// this was inside handlec function
  
  //td[pi][pj].drawp();
  
  if (td[i][j].t == "lg"){
      //console.log("selected");
      td[i][j].updatep(td[pi][pj].t);
      td[pi][pj].updatep("e");
      
      let ct = true; // change turn
      
      c("pi,pi",pi,pj,td[pi][pj].pk, td[pi][pj].pk.length,td[pi][pj].t);
      if (td[pi][pj].pk.length>0){
        for(let id=0;id<td[pi][pj].pk.length;id++){
          let kx = td[pi][pj].pk[id][0], ky = td[pi][pj].pk[id][1];
          let mx = td[pi][pj].pk[id][2], my = td[pi][pj].pk[id][3]
          //c("kx",kx,ky);
          if(mx == i && my == j){
            td[kx][ky].updatep("e");
            td[i][j].checknn();
            ct = td[i][j].pk.length==0;
          }
        }
        
      }
      //c("pk",td[pi][pj].pk);
      //psp = [];
      c("before",td[i][j].pk)
      //td[i][j].checknn();
      c("after",td[i][j].pk)
      //let chng = td[i][j].pk.length==0;
      if(ct){
        pt = pt == "w"? "b": "w";
      }
  } else if(td[i][j].t != "e"){
    //console.log("piece present");
    td[i][j].highlightpm();
    //c("pk",td[i][j].pk);
    //c("emp", td[i][j].empxy)
    
  }
  //console.log(e,i,j);
  //td[i][j].drawp();
  if(pi!=-1&&pj!=-1){
    td[pi][pj].resethighlight(i,j);   
  }
  highlightMovablePieces(i,j);
  psp = [i,j];
 
*/