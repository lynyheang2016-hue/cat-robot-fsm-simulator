// render();
const row = 8;
const col = 8;
const grid = document.querySelector('.grid');
for(let i = 0; i < row; i++){
    for(let j = 0; j < col; j++){
        const cell = document.createElement('div');
        cell.classList.add('cell');
        grid.appendChild(cell);
    }
}

const start_X = 0;
const start_Y = 0;
const cell_size_X = 150;
const cell_size_Y = 100;
const catIdlingImg = document.getElementById('cat-idling-img');
const catPickWoolImg = document.getElementById('cat-pickWool-img');
const woolImg = document.getElementById('wool-img');

const cat = {
    row: 2,
    col: 2,
    carrying: false
}
const wool = {
    row: 4,
    col: 4,
    picked: false
}

function render(){
    const x = start_X + cat.col * cell_size_X;
    const y = start_Y + cat.row * cell_size_Y;

    catIdlingImg.style.left = x + 'px';
    catIdlingImg.style.top = y + 'px';
    catPickWoolImg.style.left = x + 'px';
    catPickWoolImg.style.top = y + 'px';

    if(cat.carrying){
        catIdlingImg.style.display = 'none';
        catPickWoolImg.style.display = 'block';
    }else{
        catIdlingImg.style.display = 'block';
        catPickWoolImg.style.display = 'none';
    }

    if(wool.picked){
        woolImg.style.display = 'none';
    }else{
        woolImg.style.display = 'block';
        woolImg.style.left = (start_X + wool.col * cell_size_X) + 'px';
        woolImg.style.top = (start_Y + wool.row * cell_size_Y) + 'px';
    }
}

function runCmd(cmd){
    console.log('runCmd called with:', cmd, 'cat:', JSON.stringify(cat));
    if(cmd === 'F'){
        if(cat.col < 7) cat.col++;
    }else if(cmd === 'B'){
        if(cat.col > 0) cat.col--;
    }else if(cmd === 'L'){
        if(cat.row > 0) cat.row--;
    }else if(cmd === 'R'){
        if(cat.row < 7) cat.row++;
    }else if(cmd === 'P'){
        const distRow = Math.abs(cat.row - wool.row);
        const distCol = Math.abs(cat.col - wool.col);
        console.log('pick attempt, distRow:', distRow, 'distCol:', distCol, 'wool.picked:', wool.picked, 'carrying:', cat.carrying);
        if(distRow <= 1 && distCol <= 1 && !wool.picked && !cat.carrying){
            cat.carrying = true;
            wool.picked = true;
        }
    }else if(cmd === 'D'){
        if(cat.carrying){
            cat.carrying = false;
            wool.picked = false;
            wool.row = cat.row;
            wool.col = cat.col;
        }
    }
    render();
}

render();

