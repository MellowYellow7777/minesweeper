var canvas, ctx, graphics, offsets,
  load, game, gamestate,
  width, height, mines, time,
  custom, mouse,
  hovering, clicked, holding,
  pool;



window.onload = function init() {
  var p = new URLSearchParams(window.location.search);

  var p_difficulty = 'beginner',
      p_width = 9,
      p_height = 9,
      p_mines = 10,
      p_embed = false;

  if (p.has('embed')) p_embed = p.get('embed') === 'true';
  if (p.has('difficulty')) p_difficulty = p.get('difficulty');

  if (p_difficulty === 'intermediate') {
    p_width = 16;
    p_height = 16;
    p_mines = 40;
  } else if (p_difficulty === 'expert') {
    p_width = 30;
    p_height = 16;
    p_mines = 99;
  }

  if (p.has('width')) p_width = p.get('width');
  if (p.has('height')) p_height = p.get('height');
  if (p.has('mines')) p_mines = p.get('mines');

  if (p_embed) {
    document.body.innerHTML = '';
    canvas = document.createElement('canvas');
    ctx = canvas.getContext('2d');
    document.body.appendChild(canvas);
    canvas.style = `
      position: absolute;
      left: 0px;
      top: 0px;
    `;
    document.body.style.overflow = 'hidden';
  } else {
    canvas = document.querySelector('canvas');
    ctx = canvas.getContext('2d');
  }

  mouse = {x:0,y:0,tile:{x:0,y:0,index:0},d:'00',down:false,state:'up'};

  canvas.onpointermove = function(event) {
    mouse.x = event.offsetX - canvas.width/2;
    mouse.y = canvas.height/2 - event.offsetY;
  }

  canvas.onpointerdown = function(event) {
    this.setPointerCapture(event.pointerId);
    mouse.down = true;
    mouse._button = event.button;
    clicked = hovering;
  }
  canvas.onpointerup = function(event) {
    this.releasePointerCapture(event.pointerId);
    mouse.down = false;
  }

  window.oncontextmenu = function(event) {
    event.preventDefault();
  }

  ctx.clear = function() {
    this.clearRect(0,0,canvas.width,canvas.height);
  }

  ctx.draw = function(key,x,y) {
    var offset = offsets[key];
    this.drawImage(graphics,
      offset.x,offset.y,
      offset.w,offset.h,
      Math.ceil(x),Math.ceil(y),
      offset.w,offset.h
    );
  }

  ctx.center = function(key,x,y) {
    var offset = offsets[key];
    this.draw(key,x-offset.w/2,y-offset.h/2);
  }

  ctx.stamp = function(cos,scale=1) {
    if (cos) {
      var _cos = this.cos;
      this.cos = cos;
      this.stamp(false,scale);
      this.cos = _cos;
      return;
    }
    this.center(this.cos,this.x,this.y);
  }

  ctx.x = 0;
  ctx.y = 0;
  ctx.screen = {};

  Object.defineProperties(ctx.screen, {
    x: {
      get() {return ctx.x - canvas.width/2},
      set(x) {ctx.x = x + canvas.width/2}
    },
    y: {
      get() {return canvas.height/2 - ctx.y},
      set(y) {ctx.y = canvas.height/2 - y}
    }
  });

  ctx.cos = '';

  graphics = new Image();
  graphics.src = 'minesweeper0.png';

  offsets = {

    'bg': {x: 88, y: 20, w: 16, h: 16},

    '7seg-blank': {x: 0, y: 0, w: 13, h: 23},
    '7seg-neg': {x: 13, y: 0, w: 13, h: 23},
    '7seg-0': {x: 26, y: 0, w: 13, h: 23},
    '7seg-1': {x: 39, y: 0, w: 13, h: 23},
    '7seg-2': {x: 52, y: 0, w: 13, h: 23},
    '7seg-3': {x: 65, y: 0, w: 13, h: 23},
    '7seg-4': {x: 0, y: 23, w: 13, h: 23},
    '7seg-5': {x: 13, y: 23, w: 13, h: 23},
    '7seg-6': {x: 26, y: 23, w: 13, h: 23},
    '7seg-7': {x: 39, y: 23, w: 13, h: 23},
    '7seg-8': {x: 52, y: 23, w: 13, h: 23},
    '7seg-9': {x: 65, y: 23, w: 13, h: 23},

    'border-tl': {x: 78, y: 0, w: 10, h: 10},
    'border-tr': {x: 104, y: 0, w: 10, h: 10},
    'border-ml': {x: 78, y: 10, w: 10, h: 10},
    'border-mr': {x: 104, y: 10, w: 10, h: 10},
    'border-bl': {x: 78, y: 36, w: 10, h: 10},
    'border-br': {x: 104, y: 36, w: 10, h: 10},
    'border-h': {x: 88, y: 0, w: 16, h: 10},
    'border-v': {x: 78, y: 20, w: 10, h: 16},

    'cell-open-0': {x: 0, y: 72, w: 16, h: 16},
    'cell-open-bomb': {x: 16, y: 72, w: 16, h: 16},
    'cell-open-bomb-x': {x: 32, y: 72, w: 16, h: 16},
    'cell-open-bomb-red': {x: 48, y: 72, w: 16, h: 16},
    'cell-open-question': {x: 64, y: 72, w: 16, h: 16},
    'cell': {x: 80, y: 72, w: 16, h: 16},
    'cell-flag': {x: 96, y: 72, w: 16, h: 16},
    'cell-question': {x: 112, y: 72, w: 16, h: 16},
    'cell-open-1': {x: 0, y: 88, w: 16, h: 16},
    'cell-open-2': {x: 16, y: 88, w: 16, h: 16},
    'cell-open-3': {x: 32, y: 88, w: 16, h: 16},
    'cell-open-4': {x: 48, y: 88, w: 16, h: 16},
    'cell-open-5': {x: 64, y: 88, w: 16, h: 16},
    'cell-open-6': {x: 80, y: 88, w: 16, h: 16},
    'cell-open-7': {x: 96, y: 88, w: 16, h: 16},
    'cell-open-8': {x: 112, y: 88, w: 16, h: 16},

    'guy-open': {x: 0, y: 46, w: 26, h: 26},
    'guy': {x: 26, y: 46, w: 26, h: 26},
    'guy-ooo': {x: 52, y: 46, w: 26, h: 26},
    'guy-dead': {x: 78, y: 46, w: 26, h: 26},
    'guy-shades': {x: 104, y: 46, w: 26, h: 26},

  }

  pool = [];

  custom = {
    width: 50,
    height: 50,
    mines: 500,
  }

  load = function(w,h,m) {
    width = w;
    height = h;
    mines = m;
  }

  clearMap = function() {
    map = [];
    flags = [];
    questions = [];
    while (map.length < width * height) map.push('');
    gamestate = 'new';
    time = 0;
  }

  load.beginner = () => load(9,9,10);
  load.intermediate = () => load(16,16,40);
  load.expert = () => load(30,16,99);
  load.custom = () => load(custom.width,custom.height,custom.mines);

  newGame = function() {
    load[game]();
    clearMap();
    startTime = 0;
  }

  game = 'beginner';

  if (!p_embed) {

  var game_x = document.getElementById('x'),
    game_beginner = document.getElementById('beginner'),
    game_intermediate = document.getElementById('intermediate'),
    game_expert = document.getElementById('expert'),
    game_custom = document.getElementById('custom'),
    game_custom_width = document.getElementById('custom-width'),
    game_custom_height = document.getElementById('custom-height'),
    game_custom_mines = document.getElementById('custom-mines'),
    game_new = document.getElementById('newgame'),
    game_menu_open = document.getElementById('game-menu-open'),
    game_menu_closed = document.getElementById('game-menu-closed'),
    game_open = document.getElementById('open');


  game_beginner.onclick = function() {
    game = 'beginner';
  }
  game_intermediate.onclick = function() {
    game = 'intermediate';
  }
  game_expert.onclick = function() {
    game = 'expert';
  }
  game_custom.onclick = function() {
    game = 'custom';
  }
  game_new.onclick = function() {
    newGame();
  }
  game_custom_width.onchange = function() {
    this.value = Math.floor(Math.max(7,+this.value));
    custom.width = +this.value;
    game_custom_mines.value = Math.floor(Math.min(custom.width*custom.height,+game_custom_mines.value));
    custom.mines = +game_custom_mines.value;
  }
  game_custom_height.onchange = function() {
    this.value = Math.floor(Math.max(1,+this.value));
    custom.height = +this.value;
    game_custom_mines.value = Math.floor(Math.min(custom.width*custom.height,+game_custom_mines.value));
    custom.mines = +game_custom_mines.value;
  }
  game_custom_mines.onchange = function() {
    this.value = Math.floor(Math.min(custom.width*custom.height,+this.value));
    custom.mines = +this.value;
  }
  game_x.onclick = function() {
    game_menu_open.setAttribute('hidden',true);
    game_menu_closed.removeAttribute('hidden');
  }
  game_open.onclick = function() {
    game_menu_closed.setAttribute('hidden',true);
    game_menu_open.removeAttribute('hidden');
  }

  }

  load(p_width,p_height,p_mines);
  clearMap();
  startTime = 0;
    
  if (p_embed) window.parent.postMessage([16 * p_width + 20,16 * p_height + 62], '*');

  loop();
}




function loop() {
  requestAnimationFrame(loop);
  upd();
  draw();
}


function upd() {
  mouse.tile.x = mouse.x + ((16*width) + 20) / 2 - 10;
  mouse.tile.y = ((16*height) + 62) / 2 - mouse.y - 53;
  mouse.tile.x = Math.floor(mouse.tile.x/16);
  mouse.tile.y = Math.floor(mouse.tile.y/16);
  if (validXY(mouse.tile.x,mouse.tile.y)) {
    mouse.tile.index = XYtoI(mouse.tile.x,mouse.tile.y);
  } else {
    mouse.tile.x = null;
    mouse.tile.y = null;
    mouse.tile.index = null;
  }
  if (mouse.x >= -13 && mouse.x < 13 && mouse.y >= 8*(height-1) && mouse.y < 8*(height-1)+26) mouse.tile.index = 'guy';
  mouse.flagsAround = flagsAround(mouse.tile.x,mouse.tile.y);
  mouse.minesAround = minesAround(mouse.tile.x,mouse.tile.y);
  mouse.contents = map[mouse.tile.index];
  hovering = mouse.tile.index
  if (mouse.down) {
    holding = hovering;
    if (mouse.button == 0) {
      getMouseButton();
    }
  } else {
    if (!(holding === null)) {
    if (holding == 'guy') {
      if (clicked == 'guy') {
      if (mouse.button == 1 || mouse.button == 2) {
        clearMap();
        startTime = 0;
      }
      }
    } else {
      if (gamestate == 'new' || gamestate == 'playing') {
      if (mouse.button == 1) {
        if (!(clicked === null) && !(clicked == 'guy')) {
        if (!(flags.includes(mouse.tile.index))) {
          if (gamestate == 'new') {
          placeMines(0,mines);
          floodFill(mouse.tile.x,mouse.tile.y);
          gamestate = 'playing';
          startTime = Date.now();
          }
          if ('12345678'.includes(mouse.contents) && mouse.contents !== '') {
          chord(mouse.tile.x,mouse.tile.y);
          } else {
          if (map[mouse.tile.index] == 'mine') {
            gamestate = 'lose';
            map[mouse.tile.index] = 'red mine';
          } else {
            holding = '';
            floodFill(mouse.tile.x,mouse.tile.y);
            pool = [];
          }
          }
        }
        }
      }
      }
    }
    }
    holding = null;
    mouse.button = 0;
    clicked = null;
  }
  if (!(map.includes(''))) gamestate = 'win';
  if (gamestate == 'playing') time = time;

}

function getMouseButton() {
  if (mouse._button == 0) mouse.button = 1;
  if (mouse._button == 1) mouse.button = 2;
  if (mouse._button == 2) {
    mouse.button = 3;
    if (gamestate == 'new' || gamestate == 'playing') {
    if (map[mouse.tile.index] == '' || map[mouse.tile.index] == 'mine') {
      if (flags.includes(mouse.tile.index)) {
      flags.splice(flags.indexOf(mouse.tile.index),1);
      questions.push(mouse.tile.index);
      return;
      }
      if (questions.includes(mouse.tile.index)) {
      questions.splice(questions.indexOf(mouse.tile.index),1);
      return;
      }
      flags.push(mouse.tile.index);
    }
    }
  }
}

function random(a,b) {
  return Math.min(a,b) + Math.floor(Math.random() * (Math.abs(b-a) + 1))
}

function placeMines(step,max) {
  if (step == 0) {
  map.splice(0,map.length);
  while (map.length < width*height) map.push('');
  [
    {x:-1,y:-1},
    {x: 0,y:-1},
    {x: 1,y:-1},
    {x:-1,y: 0},
    {x: 1,y: 0},
    {x:-1,y: 1},
    {x: 0,y: 1},
    {x: 1,y: 1},
  ].forEach(off => {
    if (validXY(mouse.tile.x + off.x, mouse.tile.y + off.y)) {
    var i = XYtoI(mouse.tile.x + off.x, mouse.tile.y + off.y);
    map[i] = 0;
    }
  })
  }
  map[holding] = 0;
  if (step < max) {
  var i = -1;
  var r = random(1,map.length - step - 10);
  for (j = 0; j < r; j++) {
    i++;
    while(map[i] !== '') i++;
  }
  map[i] = 'mine';
  placeMines(step+1,max);
  }
}

function floodFill(x,y){
  if (!validXY(x,y)) return;
  var index = y*width+x;
  if (pool.includes(index)) return;
  if (flags.includes(index)) return;
  pool.push(index);
  if (map[index] == 'mine') return;
  map[index] = getNeighbors(x,y);
  if (questions.includes(index)) {
    questions.splice(questions.indexOf(index),1);
  }
  if (map[index] == 0) {
    floodFill(x-1,y-1);
    floodFill(x-1,y+1);
    floodFill(x-1,y+0);
    floodFill(x+1,y-1);
    floodFill(x+1,y+1);
    floodFill(x+1,y+0);
    floodFill(x+0,y-1);
    floodFill(x+0,y+1);
  }
};



function getNeighbors(x,y) {
  return (
    checkForMine(x-1,y-1) +
    checkForMine(x-1,y+1) +
    checkForMine(x-1,y+0) +
    checkForMine(x+1,y-1) +
    checkForMine(x+1,y+1) +
    checkForMine(x+1,y+0) +
    checkForMine(x+0,y-1) +
    checkForMine(x+0,y+1));
}

function checkForMine(x,y) {
  if (!validXY(x,y)) return false;
  return map[XYtoI(x,y)] == 'mine';
}

function validXY(x,y) {
  return !(x<0 || x>=width || y<0 || y>=height);
}

function XYtoI(x,y) {
  return y*width+x;
}

function flagsAround(x,y) {
  return [
  {x:-1,y:-1},
  {x: 0,y:-1},
  {x: 1,y:-1},
  {x:-1,y: 0},
  {x: 1,y: 0},
  {x:-1,y: 1},
  {x: 0,y: 1},
  {x: 1,y: 1},
  ].filter(off => 
  validXY(x+off.x,y+off.y) && 
  flags.includes(XYtoI(x+off.x,y+off.y))
  ).length;
}

function minesAround(x,y) {
  return [
  {x:-1,y:-1},
  {x: 0,y:-1},
  {x: 1,y:-1},
  {x:-1,y: 0},
  {x: 1,y: 0},
  {x:-1,y: 1},
  {x: 0,y: 1},
  {x: 1,y: 1},
  ].filter(off => 
  checkForMine(x+off.x,y+off.y)
  ).length;
}

function chord(x,y) {
  if (minesAround(x,y) == flagsAround(x,y)) {
  var off = [
    {x:-1,y:-1},
    {x: 0,y:-1},
    {x: 1,y:-1},
    {x:-1,y: 0},
    {x: 1,y: 0},
    {x:-1,y: 1},
    {x: 0,y: 1},
    {x: 1,y: 1},
  ];
  if (off.some(off => {
    if (
    checkForMine(x+off.x,y+off.y) && 
    !flags.includes(XYtoI(x+off.x,y+off.y))
    ) {
    map[XYtoI(x+off.x,y+off.y)] = 'red mine';
    gamestate = 'lose';
    return true;
    }
    return false;
  })) {
    return;
  }
  off.forEach(off => {
    if (!checkForMine(x+off.x,y+off.y)) {
    floodFill(x+off.x,y+off.y);
    }
  });
  }
}

function draw() {
  if (!(
    (canvas.width == 16 * width + 20) &&
    (canvas.height == 16 * height + 62)
  )) {
    canvas.width = 16 * width + 20;
    canvas.height = 16 * height + 62;
  }
  ctx.clear();
  drawField(width,height);
  drawBorder(8*(width-1) + 13, 8*(height-1)+13);
  drawInfo(8*(width-1), 8*(height-1));
  test();
}

function test(){}



function drawField(w,h) {

  function setCos(i,flag,ques,mine,redm,none) {
    if (gamestate == 'lose') {
    if (mine) {
      ctx.cos = 'cell-open-bomb';
      return;
    }
    if (flag) {
      ctx.cos = 'cell-open-bomb-x';
      return;
    }
    if (ques) {
      ctx.cos = 'cell-question';
      return;
    }
    if (redm) {
      ctx.cos = 'cell-open-bomb-red';
      return;
    }
    if (none) {
      ctx.cos = 'cell-open-0';
      return;
    }
    ctx.cos = 'cell-open-' + map[i];
    } else {
    if (flag) {
      ctx.cos = 'cell-flag';
      return;
    }
    if (ques) {
      ctx.cos = 'cell-question';
      return;
    }
    if (mine && gamestate == 'win') {
      ctx.cos = 'cell-flag';
      return;
    }
    if (mine || none) {
      if (i == hovering && mouse.button == 1
      && clicked !== null && clicked != 'guy') {
      ctx.cos = 'cell-open-0';
      } else {
      ctx.cos = 'cell';
      }
    } else {
      ctx.cos = 'cell-open-' + map[i];
    }
    }
  }


  ctx.cos = 'cell';
  ctx.screen.y = 8*(h-1) - 21;
  var i = 0;
  for (y = 0; y < height; y++) {
    ctx.screen.x = -8 * (w-1);
    for (x = 0; x < width; x++) {
    setCos(i,
      flags.includes(i),
      questions.includes(i),
      map[i] == 'mine',
      map[i] == 'red mine',
      map[i] === '',
    );
    ctx.stamp();
    ctx.screen.x += 16;
    i++;
    }
    ctx.screen.y -= 16;
  }
}

function drawBorder(w2,h2) {
  ctx.cos = 'border-bl';
  ctx.screen.x = -w2;
  ctx.screen.y = -h2 - 21;
  ctx.stamp();
  ctx.cos = 'border-ml';
  ctx.screen.y = h2 - 21;
  ctx.stamp();
  ctx.cos = 'border-h';
  ctx.screen.x += 13;
  for (x = 0; x < width; x++) {
    ctx.screen.y = -h2 - 21;
    ctx.stamp();
    ctx.screen.y = h2 - 21;
    ctx.stamp();
    ctx.screen.x += 16;
  }
  ctx.cos = 'border-mr';
  ctx.screen.x = w2;
  ctx.stamp();
  ctx.cos = 'border-br';
  ctx.screen.y = -h2 - 21;
  ctx.stamp();
  ctx.cos = 'border-v';
  ctx.screen.y += 13;
  for (y = 0; y < height; y++) {
    ctx.screen.x = w2;
    ctx.stamp();
    ctx.screen.x = -w2;
    ctx.stamp();
    ctx.screen.y += 16;
  }
  ctx.screen.y += 10;
  for (i = 0; i < 2; i++) {
    ctx.stamp();
    ctx.screen.x += 13;
    ctx.cos = 'bg';
    for (x = 0; x < width; x++) {
      ctx.stamp();
      ctx.screen.x += 16;
    }
    ctx.cos = 'border-v';
    ctx.screen.x = w2;
    ctx.stamp();
    ctx.screen.y += 16;
    ctx.screen.x = -w2;
  }
  ctx.screen.y -= 3;
  ctx.cos = 'border-tl';
  ctx.stamp();
  ctx.screen.x += 13;
  ctx.cos = 'border-h';
  for (x = 0; x < width; x++) {
    ctx.stamp();
    ctx.screen.x += 16;
  }
  ctx.cos = 'border-tr';
  ctx.screen.x = w2;
  ctx.stamp();
}


function drawInfo(w2,h2) {
  var _mines = map.filter(cell => cell == 'mine').length;
  time = startTime ? Math.floor((Date.now() - startTime)/1000) : '000';
  var tsec = time % 60,
    tmin = Math.floor(time / 60) % 60,
    thr  = Math.floor(tmin / 60);
  tsec = tsec.toString().padStart(2,'0');
  tmin = tmin.toString().padStart(2,'0');
  
  _mines = _mines.toString().padStart(3,'0');
  var _time = time.toString().padStart(3,'0');
  ctx.screen.x = 3 - w2;
  ctx.screen.y = h2 + 13;
  ctx.stamp('7seg-' + _mines[0]);
  ctx.screen.x += 13;
  ctx.stamp('7seg-' + _mines[1]);
  ctx.screen.x += 13;
  ctx.stamp('7seg-' + _mines[2]);
  ctx.screen.x = w2 - 3;
  ctx.stamp('7seg-' + _time[2]);
  ctx.screen.x -= 13;
  ctx.stamp('7seg-' + _time[1]);
  ctx.screen.x -= 13;
  ctx.stamp('7seg-' + _time[0]);

  ctx.screen.x = 0;
  if (gamestate == 'win') return ctx.stamp('guy-shades');
  if (gamestate == 'lose') return ctx.stamp('guy-dead');
  if (mouse.button < 2) {
    if (clicked === null) {
    if (holding == 'guy') {
      return ctx.stamp('guy-open');
    } else {
      return ctx.stamp('guy');
    }
    } else {
    if (clicked == 'guy') {
      return ctx.stamp('guy-open');
    } else {
      return ctx.stamp('guy-ooo');
    }
    }
  }
  if (mouse.button == 2) {
    if (holding == 'guy') {
    return ctx.stamp('guy-open');
    } else {
    return ctx.stamp('guy');
    }
  }
  if (mouse.button == 3) return ctx.stamp('guy');
}
