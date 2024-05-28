function rgbToArr(s){
    let r = parseInt(s.slice(0,2), 16);
    let g = parseInt(s.slice(2, 4), 16);
    let b = parseInt(s.slice(4), 16);
    return [r,g,b];
}

function colorFromCoord(arr1, arr2, i, m){
    let [r1,g1,b1] = arr1;
    let [r2,g2,b2] = arr2;
    return [Math.round((r2*i+r1*(m-1-i))/(m-1)), Math.round((g2*i+g1*(m-1-i))/(m-1)), Math.round((b2*i+b1*(m-1-i))/(m-1))];
}

function arrToRgb(arr){
    let [r, g, b] = arr.map(item  => item.toString(16));
    r = '0'.repeat(2-r.length) + r;
    g = '0'.repeat(2-g.length) + g;
    b = '0'.repeat(2-b.length) + b;
    return r+g+b;
}

function shuffle(array, pos) {
    for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
      [pos[i], pos[j]] = [pos[j], pos[i]]
    }
  }

function indexFromPos(pos) {
    let j = (pos-1) % n;
    let i = (pos-1 - j) / n;
    return [i,j];

}

const selectCellToMove = (e) => {
    if (cellIsActive) return;

    cellIsActive = true;
    offsetXCell = e.offsetX;
    offsetYCell = e.offsetY;
    e.preventDefault();
    let currentElement = e.target;

    if (currentElement.classList == "pinCell"){
        rockingCell(currentElement);
        return;
    }

    currentCell = currentElement;
    currentCell.style.backgroundColor='#232323';
}

const selectCellToPaste = (e) => {
    if (!cellIsActive) return;
    cellIsActive = false;
    e.preventDefault();
    movingCell.style.display = 'none';

    let elem = document.elementFromPoint(e.clientX, e.clientY);
    let currentElement = elem;
    if (currentElement.classList !="cell"){
       
        if (currentElement.classList == "pinCell"){
            rockingCell(currentElement);
            if (!currentCell){return;}
            currentElement = currentCell;
        }
        else{
            cellIsActive = true;
            return;

        }

    }
    if (!currentCell){return;}

    let position1 = currentCell.getAttribute('old-position');
    let position2 = currentElement.getAttribute('old-position');
    let [i1,j1] = indexFromPos(position1);
    let [i2,j2] = indexFromPos(position2);


    currentElement.style.backgroundColor = `rgb(${colorArr[i1][j1]})`;
    currentCell.style.backgroundColor = `rgb(${colorArr[i2][j2]})`;


    currentCell.setAttribute('old-position', position2);
    currentElement.setAttribute('old-position', position1);
    currentCell = null;

    let flagWin = true;
    for (let i=0;i<m*n;i++){
        if (arrDiv[i].getAttribute('old-position') != i+1){
            flagWin = false;
            break;
        }
    }
    if (flagWin){
        barrier.style.display = 'flex';
        barrier.firstElementChild.style.display='flex';
        setTimeout(()=>{barrier.firstElementChild.classList.add('active');},100);
    }

}

const mouseMove = (e) => {
    if (cellIsActive && currentCell) {
        let position = currentCell.getAttribute('old-position');
        let [i,j] = indexFromPos(position);

        movingCell.style.backgroundColor = `rgb(${colorArr[i][j]})`;
        movingCell.style.display = 'flex';
        movingCell.style.top = `${e.pageY - offsetYCell}px`;
        movingCell.style.left = `${e.pageX - offsetXCell}px`;

      }
}

const rockingCell = (elem) => {
    animation(elem, 'rocking', 1, 0);
}

const animation = (elem, name, duration, delay) => {

    elem.style['animation-name'] = name;
    elem.style['animation-duration'] = `${duration}s`;
    elem.style['animation-delay'] = `${delay}s`;
    elem.style['animation-fill-mode'] = 'forwards';

    setTimeout(() => {elem.style['animation-name'] = null; elem.style['animation-duration'] = null; elem.style['animation-delay'] = null;}, 1000*(delay + duration));
}

const animationSvg = () =>{
    if (flagFirstSvg){
        wall.innerHTML = levelSvg[currentLevel];
        wall.firstElementChild.style.display='flex';
        draw = document.querySelector('.wall svg')
        setTimeout(()=>{draw.classList.add('active');},100);
        flagFirstSvg = false;
    }
    else{
        draw.classList.remove('active');
        setTimeout(()=>{
            wall.firstElementChild.style.display='none';
            wall.innerHTML = levelSvg[currentLevel];
            draw = document.querySelector('.wall svg')
            wall.firstElementChild.style.display='flex';
            setTimeout(()=>{draw.classList.add('active');},100);
        }, 2000);
    }
}

function game(){
    try{
    animationSvg();}
    catch{}

    puzzle.innerHTML = '';
    movingCell = document.querySelector('#movingcell');
    movingCell.innerHTML = ''

    cellIsActive = false;

    let size;

    if (m > 12) {
        size = Math.round((n>16?450:500)/m);
    }
    else if (m > 8) {
        size = Math.round((n>12?400:450)/m);
    }
    else {
        size = Math.round((n>8?350:400)/m);
    }

    let pin = [[0,0].join(','), [0,n-1].join(','), [m-1, 0].join(','), [m-1, n-1].join(',')];

    barrier.style.display = 'block';
    barrier.firstElementChild.classList.remove('active');
    barrier.firstElementChild.style.display='none';
    container.style['width'] = `${n*size}px`
    container.style['height'] = `${m*size}px`
    barrier.style['width'] = `${n*size}px`
    barrier.style['height'] = `${m*size}px`
    wall.style['width'] = `max-content`;
    wall.style['height'] = `${m*size}px`
    puzzle.style['grid-template-columns']= `repeat(${n}, 1fr)`;
    puzzle.style['grid-template-rows']= `repeat(${m}, 1fr)`;
    movingCell.style['width'] = `${size}px`
    movingCell.style['height'] = `${size}px`
    wall.style.right = `${Math.round(((window.innerWidth - n*size)/2-350)/2)}px`;



    colorArr = Array();
    for (let i=0; i<m; i++){
        colorArr.push(Array());
        for (let j=0;j<n; j++){
            colorArr[i].push([0,0,0]);
        }
    }
    colorArr[0][0] = rgbToArr(color00);
    colorArr[m-1][0] = rgbToArr(color10);
    colorArr[0][n-1] = rgbToArr(color01);
    colorArr[m-1][n-1] = rgbToArr(color11);

    colorIndexRandom = Array();


    for (let i of [0,m-1]){
        for (let j = 1; j<n-1; j++){
            colorArr[i][j] = colorFromCoord(colorArr[i][0], colorArr[i][n-1], j, n);
        }
    }
    for (let j=0;j<n;j++){
        for (let i=1;i<m-1;i++){
            colorArr[i][j] = colorFromCoord(colorArr[0][j], colorArr[m-1][j], i, m);
        }
    }
    arrDiv = Array()
    pos = Array()
    for(let i=0; i<m; i++){
        for (let j=0; j<n; j++){
            if (!pin.includes(`${i},${j}`)){
                colorIndexRandom.push([i,j]);
                pos.push(i*n+j+1);
            }
            let div = document.createElement("div");
            div.addEventListener("mousedown", selectCellToMove);
            div.addEventListener("mouseup", selectCellToPaste);
            div.className='cell';
            div.style.backgroundColor = `rgb(${colorArr[i][j]})`;
            if (pin.includes(`${i},${j}`)){
                div.innerHTML = `<div class="pin"></div>`;
                div.className='pinCell';

            }
            puzzle.appendChild(div);
            arrDiv.push(div);
        }
    }




    shuffle(colorIndexRandom, pos);
    pos.push(0);
    for (let i of [0, m-1]){
        for (let j of [0, n-1]){
            pos.splice(i*n+j, 0, i*n+j+1);
        }
    }
    index = 0;
    let animationDelay = 0.5;
    for (let elem of arrDiv){
        elem.setAttribute('old-position', pos[index++]);

        if (!elem.firstChild){
            
            elem.style['animation-name'] = 'compression';
            elem.style['animation-duration'] = '1s';
            elem.style['animation-delay'] = `${animationDelay+=0.5/(m*n)}s`;
            elem.style['animation-fill-mode'] = 'forwards';
        }
    }
    function a(){
        let index = 0;
        for (let elem of arrDiv){
            if (!elem.firstChild){

                let [i,j] = colorIndexRandom[index++];
                elem.style.backgroundColor = `rgb(${colorArr[i][j]})`;
                elem.style['animation-name'] = 'magnification';
                elem.style['animation-duration'] = '1s';
                elem.style['animation-delay'] = `0s`;
                elem.style['animation-fill-mode'] = 'forwards';
            }
        }
    }
    setTimeout(a, animationDelay*1000+1000);
    setTimeout(()=>{    barrier.style.display = 'none';}, animationDelay*1000+2000);

    container.addEventListener('mousemove', mouseMove);
    container.addEventListener("mouseup", selectCellToPaste);


}

let puzzle = document.querySelector('.puzzle');
let container = document.querySelector('.container');
let wall = document.querySelector('.wall');
let barrier = document.querySelector('#barrier');
let description = document.querySelector('#description');
let movingCell;
let draw;
let flagFirstSvg = true;
let previousLevel;
let currentLevel;

let cellIsActive = false;
let offsetXCell, offsetYCell;

let currentCell;
let colorIndexRandom;

let color00;
let color10;
let color01;
let color11;
let m;
let n;
let colorArr;

let arrDiv;
let pos;


const l1 = document.querySelector('#one');
const l2 = document.querySelector('#two');
const l3 = document.querySelector('#three');
const l4 = document.querySelector('#four');
const l5 = document.querySelector('#five');
const l6 = document.querySelector('#six');
const l7 = document.querySelector('#seven');
const l8 = document.querySelector('#eight');
let levelArr = [l1, l2, l3, l4, l5, l6, l7, l8];
let levelSize = [[4,4], [5,5], [4,6], [6,6], [8, 10], [10,10], [10,14], [14,14]];
let levelColor = [
            ['eef627', 'e33e2a', '33c6f2', '52229a'],
            ['a72241', 'fff890', '531b96', '39ceb8'],
            ['ee52a3', 'edd679', '743db2', '449ddf'],
            ['65383b', 'ec4597', '3284d6', 'cac8cd'],
            ['3cd8e5', '595e62', 'eff3a7', 'd87c3d'],
            ['f9b6e1', 'ef58c1', '9292e8', '4c52aa'],
            ['1e2399', '30baad', 'cc2ef5', 'f0f9c0'],
            ['81022d', '51d694', 'f63341', 'ffe707'],]

let levelSvg = [
    `<!--?xml version="1.0" encoding="UTF-8"?-->
    <svg id="_Слой_2" data-name="Слой 2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 349.02 76.25" width="349.0199890136719" height="76.25">
        <defs>
          <style>
            .cls-1 {
              fill: none;
              stroke-width: 1.25px;
            }
      
            .cls-1, .cls-2 {
              stroke: #fff;
              stroke-miterlimit: 10;
            }
      
            .cls-2 {
              fill: #fff;
              stroke-width: .5px;
            }
          </style>
        </defs>
        <g id="_Слой_1-2" data-name="Слой 1">
          <g>
            <path class="cls-2 level1-svg-elem-1" d="m65.12,24.91h-12.36v-1.68h26.52v1.68h-12.36v27h-1.8v-27Z"></path>
            <path class="cls-2 level1-svg-elem-2" d="m88.82,37.63c0-9.36,6.84-15.12,14.28-15.12s12.72,4.92,12.72,13.2c0,.6,0,1.2-.12,1.92h-26.28v-1.68h25.8l-1.08.96c0-8.64-4.56-12.72-11.04-12.72s-12.36,4.92-12.36,13.32,6.12,13.44,13.08,13.44c4.08,0,7.26-1.32,9.96-3.24l.84,1.56c-2.52,1.62-5.58,3.36-10.8,3.36-8.16,0-15-5.64-15-15Z"></path>
            <path class="cls-2 level1-svg-elem-3" d="m146.18,38.83c-2.94.6-4.02.96-7.32.96-8.4,0-12.36-2.82-12.36-9.72v-6.84h1.8v6.84c0,5.82,3.36,8.04,10.8,8.04,2.58,0,4.44-.36,7.08-.96v-13.92h1.8v28.68h-1.8v-13.08Z"></path>
            <path class="cls-2 level1-svg-elem-4" d="m160.82,37.63c0-9.36,6.84-15.12,14.28-15.12s12.72,4.92,12.72,13.2c0,.6,0,1.2-.12,1.92h-26.28v-1.68h25.8l-1.08.96c0-8.64-4.56-12.72-11.04-12.72s-12.36,4.92-12.36,13.32,6.12,13.44,13.08,13.44c4.08,0,7.26-1.32,9.96-3.24l.84,1.56c-2.52,1.62-5.58,3.36-10.8,3.36-8.16,0-15-5.64-15-15Z"></path>
            <path class="cls-2 level1-svg-elem-5" d="m198.62,23.23h1.8v12.72h19.2v-12.72h1.8v28.68h-1.8v-14.28h-19.2v14.28h-1.8v-28.68Z"></path>
            <path class="cls-2 level1-svg-elem-6" d="m235.28,23.23h1.8v15.24c0,3.18-.12,7.08-.24,10.92h.24c1.2-1.8,3-4.44,4.2-6.24l13.68-19.92h1.8v28.68h-1.8v-15.24c0-3.18.12-7.08.24-10.92h-.24c-1.2,1.8-3,4.44-4.2,6.24l-13.68,19.92h-1.8v-28.68Z"></path>
            <path class="cls-2 level1-svg-elem-7" d="m268.82,37.63c0-9.36,6.84-15.12,14.28-15.12s12.72,4.92,12.72,13.2c0,.6,0,1.2-.12,1.92h-26.28v-1.68h25.8l-1.08.96c0-8.64-4.56-12.72-11.04-12.72s-12.36,4.92-12.36,13.32,6.12,13.44,13.08,13.44c4.08,0,7.26-1.32,9.96-3.24l.84,1.56c-2.52,1.62-5.58,3.36-10.8,3.36-8.16,0-15-5.64-15-15Z"></path>
          </g>
          <path class="cls-1 level1-svg-elem-8" d="m.02,16.61C19.78,17.28,28.39.62,45.62.62s34.46,16,53.13,16S130.34.62,147.57.62s35.9,16,54.56,16S233.72.62,252.39.62s34.46,16,50.26,16S332.22.62,349.02.62"></path>
          <path class="cls-1 level1-svg-elem-9" d="m.02,75.61c19.76.67,28.37-15.98,45.6-15.98s34.46,16,53.13,16,31.59-16,48.82-16,35.9,16,54.56,16,31.59-16,50.26-16,34.46,16,50.26,16,29.57-16,46.38-16"></path>
        </g>
      </svg>`,
    `<!--?xml version="1.0" encoding="UTF-8"?-->
    <svg id="_Слой_2" data-name="Слой 2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350.73 97.54" width="350.7300109863281" height="97.54000091552734">
        <defs>
          <style>
            .cls-1 {
              fill: none;
              stroke-width: 1.25px;
            }
      
            .cls-1, .cls-2 {
              stroke: #fff;
              stroke-miterlimit: 10;
            }
      
            .cls-2 {
              fill: #fff;
              stroke-width: .5px;
            }
          </style>
        </defs>
        <g id="_Слой_1-2" data-name="Слой 1">
          <g>
            <path class="cls-2 level2-svg-elem-1" d="m35.03,44.21c0-9.6,6.3-15.12,13.8-15.12s13.8,5.52,13.8,15.12-6.3,15-13.8,15-13.8-5.52-13.8-15Zm25.68,0c0-7.92-5.04-13.44-11.88-13.44s-11.88,5.52-11.88,13.44,5.04,13.32,11.88,13.32,11.88-5.4,11.88-13.32Z"></path>
            <path class="cls-2 level2-svg-elem-2" d="m71.63,29.81h1.8v27h10.56v-27h1.68v27h10.56v-27h1.8v28.68h-26.4v-28.68Zm28.44,28.68h-2.64v-1.68h4.44v.96l-.24,11.04h-1.56v-10.32Z"></path>
            <path class="cls-2 level2-svg-elem-3" d="m106.85,71.21l.6-1.68c.72.24,1.8.48,2.88.48,4.62,0,7.56-3.48,9.42-8.16l1.08-2.64-14.16-29.4h1.92l8.88,18.84c1.14,2.4,2.64,5.52,4.08,8.04h.24c1.2-2.52,2.46-5.64,3.48-8.04l7.92-18.84h1.8l-13.8,32.76c-1.56,4.44-5.16,9.24-11.04,9.24-1.08,0-2.52-.24-3.3-.6Z"></path>
            <path class="cls-2 level2-svg-elem-4" d="m143.63,29.81h1.8v27h10.56v-27h1.68v27h10.56v-27h1.8v28.68h-26.4v-28.68Zm28.44,28.68h-2.64v-1.68h4.44v.96l-.24,11.04h-1.56v-10.32Z"></path>
            <path class="cls-2 level2-svg-elem-5" d="m179.63,44.21c0-9.36,6.84-15.12,14.28-15.12s12.72,4.92,12.72,13.2c0,.6,0,1.2-.12,1.92h-26.28v-1.68h25.8l-1.08.96c0-8.64-4.56-12.72-11.04-12.72s-12.36,4.92-12.36,13.32,6.12,13.44,13.08,13.44c4.08,0,7.26-1.32,9.96-3.24l.84,1.56c-2.52,1.62-5.58,3.36-10.8,3.36-8.16,0-15-5.64-15-15Z"></path>
            <path class="cls-2 level2-svg-elem-6" d="m217.43,29.81h1.8v12.72h19.2v-12.72h1.8v28.68h-1.8v-14.28h-19.2v14.28h-1.8v-28.68Z"></path>
            <path class="cls-2 level2-svg-elem-7" d="m254.09,29.81h1.8v15.24c0,3.18-.12,7.08-.24,10.92h.24c1.2-1.8,3-4.44,4.2-6.24l13.68-19.92h1.8v28.68h-1.8v-15.24c0-3.18.12-7.08.24-10.92h-.24c-1.2,1.8-3,4.44-4.2,6.24l-13.68,19.92h-1.8v-28.68Z"></path>
            <path class="cls-2 level2-svg-elem-8" d="m287.62,44.21c0-9.36,6.84-15.12,14.28-15.12s12.72,4.92,12.72,13.2c0,.6,0,1.2-.12,1.92h-26.28v-1.68h25.8l-1.08.96c0-8.64-4.56-12.72-11.04-12.72s-12.36,4.92-12.36,13.32,6.12,13.44,13.08,13.44c4.08,0,7.26-1.32,9.96-3.24l.84,1.56c-2.52,1.62-5.58,3.36-10.8,3.36-8.16,0-15-5.64-15-15Z"></path>
          </g>
          <path class="cls-1 level2-svg-elem-9" d="m.23,96.92s46.1-18.21,81.1-18.21,40.48,17.13,71,17c35.67-.16,36.06-20.08,75-23,38.24-2.87,53.27,15.19,80,3,12.46-5.68,26-12,27-30S284.33-1.29,244.33,13.71,164.62-1.14,132.33.71C103.92,2.33,29.02,6.62,20.33,39.71c-4.92,18.73,11.72,45.4,33,53,30.69,10.96,47.44-26.14,92-24,38.68,1.86,49.29,30.93,85,28,24.68-2.03,22-26,53-28s67,28.21,67,28.21"></path>
        </g>
      </svg>`,
    `<!--?xml version="1.0" encoding="UTF-8"?-->
    <svg id="_Слой_2" data-name="Слой 2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350.03 91.74" width="350.0299987792969" height="91.73999786376953">
        <defs>
          <style>
            .cls-1 {
              fill: none;
              stroke-width: 1.25px;
            }
      
            .cls-1, .cls-2 {
              stroke: #fff;
              stroke-miterlimit: 10;
            }
      
            .cls-2 {
              fill: #fff;
              stroke-width: .5px;
            }
          </style>
        </defs>
        <g id="_Слой_1-2" data-name="Слой 1">
          <g>
            <path class="cls-2 level3-svg-elem-1" d="m52.1,57.92v-.96h28.44v.96l-.24,11.04h-1.56v-10.32h-24.84v10.32h-1.56l-.24-11.04Zm22.8-26.28h-14.04l-1.44,12.24c-1.32,11.4-3.48,13.2-4.8,14.16l-1.44-1.08c1.8-.96,3.3-3,4.56-13.2l1.68-13.8h17.28v28.68h-1.8v-27Z"></path>
            <path class="cls-2 level3-svg-elem-2" d="m88.58,44.36c0-9.6,6.3-15.12,13.8-15.12s13.8,5.52,13.8,15.12-6.3,15-13.8,15-13.8-5.52-13.8-15Zm25.68,0c0-7.92-5.04-13.44-11.88-13.44s-11.88,5.52-11.88,13.44,5.04,13.32,11.88,13.32,11.88-5.4,11.88-13.32Z"></path>
            <path class="cls-2 level3-svg-elem-3" d="m127.58,29.96h13.08c6.48,0,10.32,2.22,10.32,7.02,0,3.78-2.34,5.4-5.1,6.3v.18c3.12.72,6.42,2.7,6.42,7.02,0,5.52-4.32,8.16-11.4,8.16h-13.32v-28.68Zm11.94,12.72c6.9,0,9.54-2.16,9.54-5.58s-2.7-5.46-8.94-5.46h-10.74v11.04h10.14Zm.78,14.28c6.66,0,10.08-2.22,10.08-6.54,0-3.9-3.78-6.06-10.56-6.06h-10.44v12.6h10.92Z"></path>
            <path class="cls-2 level3-svg-elem-4" d="m161.17,44.36c0-9.36,6.84-15.12,14.28-15.12s12.72,4.92,12.72,13.2c0,.6,0,1.2-.12,1.92h-26.28v-1.68h25.8l-1.08.96c0-8.64-4.56-12.72-11.04-12.72s-12.36,4.92-12.36,13.32,6.12,13.44,13.08,13.44c4.08,0,7.26-1.32,9.96-3.24l.84,1.56c-2.52,1.62-5.58,3.36-10.8,3.36-8.16,0-15-5.64-15-15Z"></path>
            <path class="cls-2 level3-svg-elem-5" d="m198.97,29.96h1.56l.24,4.32h.12c2.94-2.88,7.2-5.04,11.04-5.04,8.22,0,12.24,5.76,12.24,14.64,0,9.72-6.3,15.48-13.56,15.48-2.76,0-6.84-1.56-9.84-4.2h-.12l.12,6v10.8h-1.8V29.96Zm23.28,13.92c0-7.32-2.94-12.96-10.44-12.96-3.18,0-7.2,1.8-11.04,5.64v16.56c3.6,3.3,7.62,4.56,9.96,4.56,6.72,0,11.52-5.76,11.52-13.8Z"></path>
            <path class="cls-2 level3-svg-elem-6" d="m235.63,29.96h1.8v15.24c0,3.18-.12,7.08-.24,10.92h.24c1.2-1.8,3-4.44,4.2-6.24l13.68-19.92h1.8v28.68h-1.8v-15.24c0-3.18.12-7.08.24-10.92h-.24c-1.2,1.8-3,4.44-4.2,6.24l-13.68,19.92h-1.8v-28.68Z"></path>
            <path class="cls-2 level3-svg-elem-7" d="m269.17,44.36c0-9.36,6.84-15.12,14.28-15.12s12.72,4.92,12.72,13.2c0,.6,0,1.2-.12,1.92h-26.28v-1.68h25.8l-1.08.96c0-8.64-4.56-12.72-11.04-12.72s-12.36,4.92-12.36,13.32,6.12,13.44,13.08,13.44c4.08,0,7.26-1.32,9.96-3.24l.84,1.56c-2.52,1.62-5.58,3.36-10.8,3.36-8.16,0-15-5.64-15-15Z"></path>
          </g>
          <circle class="cls-1 level3-svg-elem-8" cx="42.37" cy="36.36" r="6.5"></circle>
          <circle class="cls-1 level3-svg-elem-9" cx="308.37" cy="36.36" r="6.5"></circle>
          <path class="cls-1 level3-svg-elem-10" d="m43.87,24.86c1.26-4.42,4.56-13.3,13-19,13.09-8.84,33.28-6.46,49,7"></path>
          <path class="cls-1 level3-svg-elem-11" d="m113.87,19.86c1.02,1,6.51,6.16,15,6,9.61-.18,15.24-7.05,16-8"></path>
          <path class="cls-1 level3-svg-elem-12" d="m150.87,10.86c3.41-3.41,8.22-6.96,14-7,11.46-.08,16.01,13.69,30,17,5.4,1.28,12.3,1.02,21-3"></path>
          <path class="cls-1 level3-svg-elem-13" d="m223.87,11.86c4.48-3.8,10.92-7.89,18-7,10.29,1.29,13.44,12.02,24,14,4.65.87,11.52.19,21-7"></path>
          <path class="cls-1 level3-svg-elem-14" d="m294.87,6.86c10.81-4.39,21.35.04,24,7,2.44,6.42-2.48,13.29-3,14"></path>
          <circle class="cls-1 level3-svg-elem-15" cx="26.37" cy="55.36" r="6.5"></circle>
          <circle class="cls-1 level3-svg-elem-16" cx="326.37" cy="55.36" r="6.5"></circle>
          <path class="cls-1 level3-svg-elem-17" d="m16.87,58.86c-4,1-18.31,8.08-16,17,3.62,14.02,35.61,14.02,38,14,13.78-.13,24.39-4.94,30-8"></path>
          <path class="cls-1 level3-svg-elem-18" d="m85.87,73.86c6.58-3.88,16.29-8.19,28-8,14.23.23,22.33,6.99,35,12,11.18,4.42,27.74,8.21,51,5"></path>
          <path class="cls-1 level3-svg-elem-19" d="m211.87,81.86c6.27-.49,10.52-1.01,16-5,6.71-4.89,6.69-6.81,14-10,7.21-3.14,14.3-1.59,17-1,9.36,2.05,15.03,7.8,17,10"></path>
          <path class="cls-1 level3-svg-elem-20" d="m282.87,80.86c4,3,10.34,7.24,17,9,2.33.62,36.71,5.41,47-9,5-7,1.86-14.48-3-20-2.15-2.44-4.96-3.5-7-4"></path>
        </g>
      </svg>`,
    `<!--?xml version="1.0" encoding="UTF-8"?-->
    <svg id="_Слой_2" data-name="Слой 2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350.89 144.23" width="350.8900146484375" height="144.22999572753906">
        <defs>
          <style>
            .cls-1 {
              stroke-width: 1.25px;
            }
      
            .cls-1, .cls-2, .cls-3 {
              stroke: #fff;
              stroke-miterlimit: 10;
            }
      
            .cls-1, .cls-3 {
              fill: none;
            }
      
            .cls-2 {
              fill: #fff;
              stroke-width: .5px;
            }
      
            .cls-3 {
              stroke-width: 1.5px;
            }
          </style>
        </defs>
        <g id="_Слой_1-2" data-name="Слой 1">
          <g>
            <path class="cls-2 level4-svg-elem-1" d="m.25,96c0-9.6,6.96-15.12,15.48-15.12,4.86,0,7.92,2.16,10.26,4.44l-1.2,1.32c-2.46-2.4-5.34-4.08-9.06-4.08-8.04,0-13.56,5.52-13.56,13.44s5.4,13.32,13.56,13.32c4.02,0,7.32-1.8,9.96-4.32l1.08,1.32c-2.88,2.76-6.48,4.68-11.04,4.68-8.88,0-15.48-5.52-15.48-15Z"></path>
            <path class="cls-2 level4-svg-elem-2" d="m35.05,96c0-9.6,6.3-15.12,13.8-15.12s13.8,5.52,13.8,15.12-6.3,15-13.8,15-13.8-5.52-13.8-15Zm25.68,0c0-7.92-5.04-13.44-11.88-13.44s-11.88,5.52-11.88,13.44,5.04,13.32,11.88,13.32,11.88-5.4,11.88-13.32Z"></path>
            <path class="cls-2 level4-svg-elem-3" d="m71.29,106.56l1.08-1.32c3.42,3.18,7.02,4.08,11.28,4.08,6.48,0,10.8-2.4,10.8-6.78s-4.38-6.54-11.88-6.54h-3.36v-1.68h2.52c7.38,0,11.04-2.34,11.04-6,0-3.96-3.6-5.76-9.12-5.76-4.8,0-7.5,1.38-10.44,3.6l-1.08-1.32c2.88-2.28,6.24-3.96,11.52-3.96,6.36,0,11.04,2.52,11.04,7.32,0,3.24-2.16,5.28-5.16,6.72v.24c3.6.96,6.84,3.12,6.84,7.44,0,5.16-4.8,8.4-12.66,8.4-4.68,0-8.82-1.08-12.42-4.44Z"></path>
            <path class="cls-2 level4-svg-elem-4" d="m107.65,96c0-9.36,6.84-15.12,14.28-15.12s12.72,4.92,12.72,13.2c0,.6,0,1.2-.12,1.92h-26.28v-1.68h25.8l-1.08.96c0-8.64-4.56-12.72-11.04-12.72s-12.36,4.92-12.36,13.32,6.12,13.44,13.08,13.44c4.08,0,7.26-1.32,9.96-3.24l.84,1.56c-2.52,1.62-5.58,3.36-10.8,3.36-8.16,0-15-5.64-15-15Z"></path>
            <path class="cls-2 level4-svg-elem-5" d="m145.45,81.6h1.56l.24,4.32h.12c2.94-2.88,7.2-5.04,11.04-5.04,8.22,0,12.24,5.76,12.24,14.64,0,9.72-6.3,15.48-13.56,15.48-2.76,0-6.84-1.56-9.84-4.2h-.12l.12,6v10.8h-1.8v-42Zm23.28,13.92c0-7.32-2.94-12.96-10.44-12.96-3.18,0-7.2,1.8-11.04,5.64v16.56c3.6,3.3,7.62,4.56,9.96,4.56,6.72,0,11.52-5.76,11.52-13.8Z"></path>
            <path class="cls-2 level4-svg-elem-6" d="m181.51,81.6h1.8v27h19.14v-27h1.8v28.68h-22.74v-28.68Zm24.78,28.68h-2.64v-1.68h4.44v.96l-.24,11.04h-1.56v-10.32Z"></path>
            <path class="cls-2 level4-svg-elem-7" d="m216.61,103.26c0-6.42,6.6-9.42,22.44-10.86,0-5.04-1.92-9.84-8.88-9.84-4.56,0-8.94,2.4-11.16,4.08l-.96-1.44c2.04-1.56,7.08-4.32,12.24-4.32,7.62,0,10.56,5.04,10.56,10.8v18.6h-1.56l-.24-4.44h-.12c-3.36,2.7-7.92,5.16-12.24,5.16-5.04,0-10.08-2.28-10.08-7.74Zm22.44.54v-9.84c-15.48,1.44-20.52,4.32-20.52,9.24,0,4.44,4.2,6.12,8.28,6.12,3.84,0,7.92-1.86,12.24-5.52Z"></path>
            <path class="cls-2 level4-svg-elem-8" d="m253.45,81.6h1.8v12.72h19.2v-12.72h1.8v28.68h-1.8v-14.28h-19.2v14.28h-1.8v-28.68Z"></path>
            <path class="cls-2 level4-svg-elem-9" d="m290.11,81.6h1.8v15.24c0,3.18-.12,7.08-.24,10.92h.24c1.2-1.8,3-4.44,4.2-6.24l13.68-19.92h1.8v28.68h-1.8v-15.24c0-3.18.12-7.08.24-10.92h-.24c-1.2,1.8-3,4.44-4.2,6.24l-13.68,19.92h-1.8v-28.68Z"></path>
            <path class="cls-2 level4-svg-elem-10" d="m323.65,96c0-9.36,6.84-15.12,14.28-15.12s12.72,4.92,12.72,13.2c0,.6,0,1.2-.12,1.92h-26.28v-1.68h25.8l-1.08.96c0-8.64-4.56-12.72-11.04-12.72s-12.36,4.92-12.36,13.32,6.12,13.44,13.08,13.44c4.08,0,7.26-1.32,9.96-3.24l.84,1.56c-2.52,1.62-5.58,3.36-10.8,3.36-8.16,0-15-5.64-15-15Z"></path>
          </g>
          <line class="cls-1 level4-svg-elem-11" x1=".35" y1="70.5" x2="350.35" y2="70.5"></line>
          <path class="cls-3 level4-svg-elem-12" d="m160.35,70.5c0-8.28,6.72-15,15-15s15,6.72,15,15"></path>
          <line class="cls-3 level4-svg-elem-13" x1="174.85" y1="50" x2="174.85"></line>
          <line class="cls-3 level4-svg-elem-14" x1="188.53" y1="54.6" x2="220.67" y2="16.31"></line>
          <line class="cls-3 level4-svg-elem-15" x1="128.79" y1="16.49" x2="161.39" y2="55.33"></line>
          <line class="cls-3 level4-svg-elem-16" x1="184" y1="44.35" x2="189.82" y2="28.37"></line>
          <line class="cls-3 level4-svg-elem-17" x1="159.41" y1="28.37" x2="165.4" y2="44.83"></line>
          <line class="cls-3 level4-svg-elem-18" x1="199.24" y1="56.27" x2="213.54" y2="48.02"></line>
          <line class="cls-3 level4-svg-elem-19" x1="135.33" y1="48.39" x2="150.89" y2="57.37"></line>
          <line class="cls-3 level4-svg-elem-20" x1="104.65" y1="57.01" x2="154.96" y2="65.88"></line>
          <line class="cls-3 level4-svg-elem-21" x1="195.74" y1="65.62" x2="244.57" y2="57.01"></line>
          <path class="cls-1 level4-svg-elem-22" d="m.78,143.58c21.91.67,31.47-15.98,50.58-15.98s38.22,16,58.92,16,35.03-16,54.14-16,39.81,16,60.51,16,35.03-16,55.74-16,38.22,16,55.74,16c4.77,0,9.38-1.19,13.94-2.92"></path>
          <path class="cls-1 level4-svg-elem-23" d="m.78,126.36c4.1-1.69,8.47-2.84,13.49-2.84,19.11,0,38.22,16,58.92,16s35.03-16,54.14-16,39.81,16,60.51,16,35.03-16,55.74-16,38.22,16,55.74,16,32.8-16,51.43-16"></path>
        </g>
      </svg>`,
    `<!--?xml version="1.0" encoding="UTF-8"?-->
    <svg id="_Слой_2" data-name="Слой 2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 351.12 106.68" width="351.1199951171875" height="106.68000030517578">
        <defs>
          <style>
            .cls-1 {
              fill: none;
              stroke-width: 1.25px;
            }
      
            .cls-1, .cls-2 {
              stroke: #fff;
              stroke-miterlimit: 10;
            }
      
            .cls-2 {
              fill: #fff;
              stroke-width: .5px;
            }
          </style>
        </defs>
        <g id="_Слой_1-2" data-name="Слой 1">
          <g>
            <path class="cls-2 level5-svg-elem-1" d="m48.22,37.41h-12.36v-1.68h26.52v1.68h-12.36v27h-1.8v-27Z"></path>
            <path class="cls-2 level5-svg-elem-2" d="m71.92,50.13c0-9.36,6.84-15.12,14.28-15.12s12.72,4.92,12.72,13.2c0,.6,0,1.2-.12,1.92h-26.28v-1.68h25.8l-1.08.96c0-8.64-4.56-12.72-11.04-12.72s-12.36,4.92-12.36,13.32,6.12,13.44,13.08,13.44c4.08,0,7.26-1.32,9.96-3.24l.84,1.56c-2.52,1.62-5.58,3.36-10.8,3.36-8.16,0-15-5.64-15-15Z"></path>
            <path class="cls-2 level5-svg-elem-3" d="m109.72,35.73h1.56l.24,4.32h.12c2.94-2.88,7.2-5.04,11.04-5.04,8.22,0,12.24,5.76,12.24,14.64,0,9.72-6.3,15.48-13.56,15.48-2.76,0-6.84-1.56-9.84-4.2h-.12l.12,6v10.8h-1.8v-42Zm23.28,13.92c0-7.32-2.94-12.96-10.44-12.96-3.18,0-7.2,1.8-11.04,5.64v16.56c3.6,3.3,7.62,4.56,9.96,4.56,6.72,0,11.52-5.76,11.52-13.8Z"></path>
            <path class="cls-2 level5-svg-elem-4" d="m145.72,35.73h22.8v28.68h-1.8v-27h-19.2v27h-1.8v-28.68Z"></path>
            <path class="cls-2 level5-svg-elem-5" d="m179.92,50.13c0-9.36,6.84-15.12,14.28-15.12s12.72,4.92,12.72,13.2c0,.6,0,1.2-.12,1.92h-26.28v-1.68h25.8l-1.08.96c0-8.64-4.56-12.72-11.04-12.72s-12.36,4.92-12.36,13.32,6.12,13.44,13.08,13.44c4.08,0,7.26-1.32,9.96-3.24l.84,1.56c-2.52,1.62-5.58,3.36-10.8,3.36-8.16,0-15-5.64-15-15Z"></path>
            <path class="cls-2 level5-svg-elem-6" d="m217.72,35.73h1.8v12.72h19.2v-12.72h1.8v28.68h-1.8v-14.28h-19.2v14.28h-1.8v-28.68Z"></path>
            <path class="cls-2 level5-svg-elem-7" d="m254.38,35.73h1.8v15.24c0,3.18-.12,7.08-.24,10.92h.24c1.2-1.8,3-4.44,4.2-6.24l13.68-19.92h1.8v28.68h-1.8v-15.24c0-3.18.12-7.08.24-10.92h-.24c-1.2,1.8-3,4.44-4.2,6.24l-13.68,19.92h-1.8v-28.68Z"></path>
            <path class="cls-2 level5-svg-elem-8" d="m287.92,50.13c0-9.36,6.84-15.12,14.28-15.12s12.72,4.92,12.72,13.2c0,.6,0,1.2-.12,1.92h-26.28v-1.68h25.8l-1.08.96c0-8.64-4.56-12.72-11.04-12.72s-12.36,4.92-12.36,13.32,6.12,13.44,13.08,13.44c4.08,0,7.26-1.32,9.96-3.24l.84,1.56c-2.52,1.62-5.58,3.36-10.8,3.36-8.16,0-15-5.64-15-15Z"></path>
          </g>
          <path class="cls-1 level5-svg-elem-9" d="m.62,106.63C8.62.63,15.87.51,17.62.63c3.36.24,7,77,32,77S56.62.63,71.62.63s15,30,36,30,16-14,32-15-9,42,6,59,36-7,62-6c15,0,28,13,39,13s17-7,30-7h74.5"></path>
        </g>
      </svg>`,
    `<!--?xml version="1.0" encoding="UTF-8"?-->
    <svg id="_Слой_2" data-name="Слой 2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350.63 138.99" width="350.6300048828125" height="138.99000549316406">
        <defs>
          <style>
            .cls-1 {
              fill: none;
              stroke-width: 1.25px;
            }
      
            .cls-1, .cls-2 {
              stroke: #fff;
              stroke-miterlimit: 10;
            }
      
            .cls-2 {
              fill: #fff;
              stroke-width: .5px;
            }
          </style>
        </defs>
        <g id="_Слой_1-2" data-name="Слой 1">
          <g>
            <path class="cls-2 level6-svg-elem-1" d="m56.67,62.7h1.8v12.84h10.98l11.58,15.84h-2.04l-10.44-14.16h-10.08v14.16h-1.8v-28.68Zm11.16,14.1l4.92-8.58c2.82-4.92,4.02-6.24,6.36-6.24.42,0,.96.12,1.2.24l-.48,1.8c-.36-.12-.42-.12-.84-.12-1.56,0-2.28.9-4.56,4.8l-4.8,8.28-1.8-.18Z"></path>
            <path class="cls-2 level6-svg-elem-2" d="m90.27,84.36c0-6.42,6.6-9.42,22.44-10.86,0-5.04-1.92-9.84-8.88-9.84-4.56,0-8.94,2.4-11.16,4.08l-.96-1.44c2.04-1.56,7.08-4.32,12.24-4.32,7.62,0,10.56,5.04,10.56,10.8v18.6h-1.56l-.24-4.44h-.12c-3.36,2.7-7.92,5.16-12.24,5.16-5.04,0-10.08-2.28-10.08-7.74Zm22.44.54v-9.84c-15.48,1.44-20.52,4.32-20.52,9.24,0,4.44,4.2,6.12,8.28,6.12,3.84,0,7.92-1.86,12.24-5.52Z"></path>
            <path class="cls-2 level6-svg-elem-3" d="m125.91,77.1c0-9.6,6.96-15.12,15.48-15.12,4.86,0,7.92,2.16,10.26,4.44l-1.2,1.32c-2.46-2.4-5.34-4.08-9.06-4.08-8.04,0-13.56,5.52-13.56,13.44s5.4,13.32,13.56,13.32c4.02,0,7.32-1.8,9.96-4.32l1.08,1.32c-2.88,2.76-6.48,4.68-11.04,4.68-8.88,0-15.48-5.52-15.48-15Z"></path>
            <path class="cls-2 level6-svg-elem-4" d="m162.26,84.36c0-6.42,6.6-9.42,22.44-10.86,0-5.04-1.92-9.84-8.88-9.84-4.56,0-8.94,2.4-11.16,4.08l-.96-1.44c2.04-1.56,7.08-4.32,12.24-4.32,7.62,0,10.56,5.04,10.56,10.8v18.6h-1.56l-.24-4.44h-.12c-3.36,2.7-7.92,5.16-12.24,5.16-5.04,0-10.08-2.28-10.08-7.74Zm22.44.54v-9.84c-15.48,1.44-20.52,4.32-20.52,9.24,0,4.44,4.2,6.12,8.28,6.12,3.84,0,7.92-1.86,12.24-5.52Z"></path>
            <path class="cls-2 level6-svg-elem-5" d="m199.1,62.7h1.8v12.72h19.2v-12.72h1.8v28.68h-1.8v-14.28h-19.2v14.28h-1.8v-28.68Z"></path>
            <path class="cls-2 level6-svg-elem-6" d="m235.76,62.7h1.8v15.24c0,3.18-.12,7.08-.24,10.92h.24c1.2-1.8,3-4.44,4.2-6.24l13.68-19.92h1.8v28.68h-1.8v-15.24c0-3.18.12-7.08.24-10.92h-.24c-1.2,1.8-3,4.44-4.2,6.24l-13.68,19.92h-1.8v-28.68Z"></path>
            <path class="cls-2 level6-svg-elem-7" d="m269.3,77.1c0-9.36,6.84-15.12,14.28-15.12s12.72,4.92,12.72,13.2c0,.6,0,1.2-.12,1.92h-26.28v-1.68h25.8l-1.08.96c0-8.64-4.56-12.72-11.04-12.72s-12.36,4.92-12.36,13.32,6.12,13.44,13.08,13.44c4.08,0,7.26-1.32,9.96-3.24l.84,1.56c-2.52,1.62-5.58,3.36-10.8,3.36-8.16,0-15-5.64-15-15Z"></path>
          </g>
          <path class="cls-1 level6-svg-elem-8" d="m18,.6c39.15,11.25,96.11,25.45,166,35,93.89,12.83,166.01,11.13,166,12,0,.82-64.25,1.17-350-1"></path>
          <line class="cls-1 level6-svg-elem-9" x1="57" y1="100.6" x2="296" y2="100.6"></line>
          <path class="cls-1 level6-svg-elem-10" d="m57,138.6s30-38,120-38,119,38,119,38"></path>
        </g>
      </svg>`,
    `<!--?xml version="1.0" encoding="UTF-8"?-->
    <svg id="_Слой_2" data-name="Слой 2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350 114.45" width="350" height="114.44999694824219">
        <defs>
          <style>
            .cls-1 {
              fill: none;
              stroke-width: 1.25px;
            }
      
            .cls-1, .cls-2 {
              stroke: #fff;
              stroke-miterlimit: 10;
            }
      
            .cls-2 {
              fill: #fff;
              stroke-width: .5px;
            }
          </style>
        </defs>
        <g id="_Слой_1-2" data-name="Слой 1">
          <g>
            <path class="cls-2 level7-svg-elem-1" d="m70.94,67.01l1.08-1.32c3.42,3.18,7.02,4.08,11.28,4.08,6.48,0,10.8-2.4,10.8-6.78s-4.38-6.54-11.88-6.54h-3.36v-1.68h2.52c7.38,0,11.04-2.34,11.04-6,0-3.96-3.6-5.76-9.12-5.76-4.8,0-7.5,1.38-10.44,3.6l-1.08-1.32c2.88-2.28,6.24-3.96,11.52-3.96,6.36,0,11.04,2.52,11.04,7.32,0,3.24-2.16,5.28-5.16,6.72v.24c3.6.96,6.84,3.12,6.84,7.44,0,5.16-4.8,8.4-12.66,8.4-4.68,0-8.82-1.08-12.42-4.44Z"></path>
            <path class="cls-2 level7-svg-elem-2" d="m109.1,42.06h1.8v12.72h19.2v-12.72h1.8v28.68h-1.8v-14.28h-19.2v14.28h-1.8v-28.68Z"></path>
            <path class="cls-2 level7-svg-elem-3" d="m144.26,63.72c0-6.42,6.6-9.42,22.44-10.86,0-5.04-1.92-9.84-8.88-9.84-4.56,0-8.94,2.4-11.16,4.08l-.96-1.44c2.04-1.56,7.08-4.32,12.24-4.32,7.62,0,10.56,5.04,10.56,10.8v18.6h-1.56l-.24-4.44h-.12c-3.36,2.7-7.92,5.16-12.24,5.16-5.04,0-10.08-2.28-10.08-7.74Zm22.44.54v-9.84c-15.48,1.44-20.52,4.32-20.52,9.24,0,4.44,4.2,6.12,8.28,6.12,3.84,0,7.92-1.86,12.24-5.52Z"></path>
            <path class="cls-2 level7-svg-elem-4" d="m181.1,42.06h1.8v12.72h19.2v-12.72h1.8v28.68h-1.8v-14.28h-19.2v14.28h-1.8v-28.68Z"></path>
            <path class="cls-2 level7-svg-elem-5" d="m217.76,42.06h1.8v15.24c0,3.18-.12,7.08-.24,10.92h.24c1.2-1.8,3-4.44,4.2-6.24l13.68-19.92h1.8v28.68h-1.8v-15.24c0-3.18.12-7.08.24-10.92h-.24c-1.2,1.8-3,4.44-4.2,6.24l-13.68,19.92h-1.8v-28.68Z"></path>
            <path class="cls-2 level7-svg-elem-6" d="m251.3,56.46c0-9.36,6.84-15.12,14.28-15.12s12.72,4.92,12.72,13.2c0,.6,0,1.2-.12,1.92h-26.28v-1.68h25.8l-1.08.96c0-8.64-4.56-12.72-11.04-12.72s-12.36,4.92-12.36,13.32,6.12,13.44,13.08,13.44c4.08,0,7.26-1.32,9.96-3.24l.84,1.56c-2.52,1.62-5.58,3.36-10.8,3.36-8.16,0-15-5.64-15-15Z"></path>
          </g>
          <polyline class="cls-1 level7-svg-elem-7" points="0 81.3 110 81.3 110 55.95 131.14 55.82 131 31.6 239 31.6 239 10.16 350 10.16"></polyline>
          <polyline class="cls-1 level7-svg-elem-8" points="109 114.45 109 97.95 182.07 97.95 182.07 10.16"></polyline>
          <line class="cls-1 level7-svg-elem-9" x1="182.5" y1="85.95" x2="301.9" y2="85.95"></line>
          <polyline class="cls-1 level7-svg-elem-10" points="172.1 19.95 182 10.05 191.9 19.95"></polyline>
          <polyline class="cls-1 level7-svg-elem-11" points="339 .44 348.9 10.34 339 20.24"></polyline>
          <polyline class="cls-1 level7-svg-elem-12" points="292 76.36 301.9 86.26 292 96.16"></polyline>
        </g>
      </svg>`,
    `<!--?xml version="1.0" encoding="UTF-8"?-->
    <svg id="_Слой_2" data-name="Слой 2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 350.39 160.09" width="350.3900146484375" height="160.08999633789062">
        <defs>
          <style>
            .cls-1 {
              fill: none;
              stroke-width: 1.25px;
            }
      
            .cls-1, .cls-2 {
              stroke: #fff;
              stroke-miterlimit: 10;
            }
      
            .cls-2 {
              fill: #fff;
              stroke-width: .5px;
            }
          </style>
        </defs>
        <g id="_Слой_1-2" data-name="Слой 1">
          <g>
            <path class="cls-2 level8-svg-elem-1" d="m35.74,94.58c0-9.36,6.84-15.12,14.28-15.12s12.72,4.92,12.72,13.2c0,.6,0,1.2-.12,1.92h-26.28v-1.68h25.8l-1.08.96c0-8.64-4.56-12.72-11.04-12.72s-12.36,4.92-12.36,13.32,6.12,13.44,13.08,13.44c4.08,0,7.26-1.32,9.96-3.24l.84,1.56c-2.52,1.62-5.58,3.36-10.8,3.36-8.16,0-15-5.64-15-15Z"></path>
            <path class="cls-2 level8-svg-elem-2" d="m70.66,108.14v-.96h28.44v.96l-.24,11.04h-1.56v-10.32h-24.84v10.32h-1.56l-.24-11.04Zm22.8-26.28h-14.04l-1.44,12.24c-1.32,11.4-3.48,13.2-4.8,14.16l-1.44-1.08c1.8-.96,3.3-3,4.56-13.2l1.68-13.8h17.28v28.68h-1.8v-27Z"></path>
            <path class="cls-2 level8-svg-elem-3" d="m110.2,80.18h1.8v15.24c0,3.18-.12,7.08-.24,10.92h.24c1.2-1.8,3-4.44,4.2-6.24l13.68-19.92h1.8v28.68h-1.8v-15.24c0-3.18.12-7.08.24-10.92h-.24c-1.2,1.8-3,4.44-4.2,6.24l-13.68,19.92h-1.8v-28.68Z"></path>
            <path class="cls-2 level8-svg-elem-4" d="m145.54,80.18h1.8v12.72h19.2v-12.72h1.8v28.68h-1.8v-14.28h-19.2v14.28h-1.8v-28.68Z"></path>
            <path class="cls-2 level8-svg-elem-5" d="m179.74,94.58c0-9.36,6.84-15.12,14.28-15.12s12.72,4.92,12.72,13.2c0,.6,0,1.2-.12,1.92h-26.28v-1.68h25.8l-1.08.96c0-8.64-4.56-12.72-11.04-12.72s-12.36,4.92-12.36,13.32,6.12,13.44,13.08,13.44c4.08,0,7.26-1.32,9.96-3.24l.84,1.56c-2.52,1.62-5.58,3.36-10.8,3.36-8.16,0-15-5.64-15-15Z"></path>
            <path class="cls-2 level8-svg-elem-6" d="m217.54,80.18h1.8v12.72h19.2v-12.72h1.8v28.68h-1.8v-14.28h-19.2v14.28h-1.8v-28.68Z"></path>
            <path class="cls-2 level8-svg-elem-7" d="m254.2,80.18h1.8v15.24c0,3.18-.12,7.08-.24,10.92h.24c1.2-1.8,3-4.44,4.2-6.24l13.68-19.92h1.8v28.68h-1.8v-15.24c0-3.18.12-7.08.24-10.92h-.24c-1.2,1.8-3,4.44-4.2,6.24l-13.68,19.92h-1.8v-28.68Z"></path>
            <path class="cls-2 level8-svg-elem-8" d="m287.74,94.58c0-9.36,6.84-15.12,14.28-15.12s12.72,4.92,12.72,13.2c0,.6,0,1.2-.12,1.92h-26.28v-1.68h25.8l-1.08.96c0-8.64-4.56-12.72-11.04-12.72s-12.36,4.92-12.36,13.32,6.12,13.44,13.08,13.44c4.08,0,7.26-1.32,9.96-3.24l.84,1.56c-2.52,1.62-5.58,3.36-10.8,3.36-8.16,0-15-5.64-15-15Z"></path>
          </g>
          <line class="cls-1 level8-svg-elem-9" x1="175.44" y1="130.08" x2="175.44" y2="72.08"></line>
          <polyline class="cls-1 level8-svg-elem-10" points="103.47 150.57 124.96 129.08 155.56 129.08 175.26 109.38 196.47 129.08 229.44 129.08 250.39 150.03"></polyline>
          <polyline class="cls-1 level8-svg-elem-11" points="154.86 150.57 175.44 129.98 196.12 150.66"></polyline>
          <path class="cls-1 level8-svg-elem-12" d="m35.98,60.58c-.64,4.64,7.53,9.77,13.48,12,4.28,1.6,9.54,2.5,25.99,0,11.8-1.79,17.7-2.69,25.03-5,12.53-3.95,19.63-8.55,27.91-5,2.26.97,1.53,1.22,4.81,3,8.1,4.38,12.41,2.73,26.95,5,9.24,1.44,9.9,2.48,14.44,2,7.22-.76,7.86-3.65,14.44-5,8.14-1.68,9.42,2.27,25.03,4,8.12.9,7.95-.15,17.33,1,8.76,1.07,9.91,2.11,15.4,2,5.63-.11,6.41-1.24,16.36-3,8.28-1.46,12.42-2.19,17.33-2,8.62.34,9.93,2.75,20.21,3,9.27.23,11.49-1.65,12.51-3,1.78-2.35,2.37-6.33.96-9-1.07-2.03-2.43-1.66-3.85-4-1.85-3.05-.35-5-1.93-7-1.17-1.48-3.67-1.65-8.66-2-4.41-.31-6.23.06-9.63-1-1.73-.54-2.86-1.14-3.85-2-1.78-1.54-1.91-2.89-2.89-4-1.95-2.23-5.46-1.45-10.59-1-3.58.32-7.84.21-16.36,0-11.91-.29-6.61-1.09-11.55-1-2,.04-3.67.18-4.81-1-1.58-1.63-1.22-4.78-.96-7,.44-3.84,1.59-4.62.96-6-.91-1.99-3.69-1.23-7.7-3-4.61-2.03-4.09-4.44-7.7-6-4.06-1.76-8.23-.24-14.44,2-7.4,2.68-7.29,4.47-11.55,5-2.66.33-3.82-.23-14.44-4-12.54-4.45-13.99-4.76-16.36-7-4.03-3.8-3.19-6.06-6.74-8-4.64-2.55-11.43-1.61-15.4,2-1.67,1.52-1.46,2.25-5.78,11-2.74,5.55-4.11,8.32-4.81,9-5.39,5.18-11.83.56-19.25,5-5.76,3.45-3.64,7.29-8.66,11-10.74,7.94-25.57-5.79-35.61,2-5.35,4.15-4.05,10.3-9.63,12-4.87,1.49-7.37-2.74-14.44-2-4.82.5-11.03,3.24-11.55,7Z"></path>
          <path class="cls-1 level8-svg-elem-13" d="m212.44,55.08c3.92,2.58,9.96,5.63,16,4,6.62-1.79,7.54-7.64,13-8,6.67-.44,8.93,8.09,18,10,5.04,1.06,9.71-.45,13-2"></path>
          <path class="cls-1 level8-svg-elem-14" d="m167.44,8.08c2.51.99,5.81,1.77,8.14,0,2.62-1.99,1.93-5.61,4.52-7,2.59-1.39,6.04.72,8.14,2,4.18,2.55,3.87,4.62,7.23,6,3.17,1.3,4.42-.15,8.14,1,2.9.89,5,2.65,6.33,4"></path>
          <polyline class="cls-1 level8-svg-elem-15" points=".44 159.65 26 134.09 119.95 134.09"></polyline>
          <polyline class="cls-1 level8-svg-elem-16" points="349.94 159.64 325.35 134.08 234.94 134.08"></polyline>
        </g>
      </svg>`
]

for (let i=0;i<8;i++){
    levelArr[i].addEventListener('click', (e) =>{
        description.style.display='none';
        [color00, color10, color01, color11] = levelColor[i];
        [m,n] = levelSize[i];
        currentLevel = i;
        game();
    });
}