const Resolutions = [4,8,20,40,100];

let gameOfLife = {
    width: 800,
    height: 600,
    cols: 200,
    rows: 150,

    resolution: 4,
    zoom: 1,
    renderStartX: 0,
    renderStartY: 0,
}


//ELŐFELTÉTELEK
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = gameOfLife.width;
canvas.height = gameOfLife.height;

//Előkészítés
function buildGrid() {
    return new Array(gameOfLife.cols).fill(null).map(
        () => new Array(gameOfLife.rows).fill(0).map(
            () => Math.floor(Math.random() * 2)
        )
    );
}

//Logika
function nextGen(grid) {
     //Lemásolja a gridet

    for (let col = 0; col < grid.length; col++) {
        for (let row = 0; row < grid[col].length; row++) {
            const cell = grid[col][row];
            let numNeighbours = 0;

            for (let i = -1; i < 2; i++) {
                for (let j = -1; j < 2; j++) {

                    if (i === 0 && j === 0) continue;

                    if (grid[col + i] !== undefined && grid[col + i][row + j] !== undefined) {
                        const currentNeighbour = grid[col + i][row + j];
                        numNeighbours += currentNeighbour;
                    }
                }
            }

            if (cell === 1 && numNeighbours < 2) {
                nextGen[col][row] = 0;
            } else if (cell === 1 && numNeighbours > 3) {
                nextGen[col][row] = 0;
            } else if (cell === 0 && numNeighbours === 3) {
                nextGen[col][row] = 1;
            }
        }
    }
    return nextGen;
}

//Nézet
function render(grid){
    let currResolution = Resolutions[gameOfLife.zoom];

    let currCols = gameOfLife.width / currResolution;//kirajzolt négyzetek száma
    let currRows = gameOfLife.height / currResolution;//kirajzolt négyzetek száma

    for(let col=0;col<currCols;col++){
        for(let row=0;row<currRows;row++){
            const cell = grid[col+gameOfLife.renderStartX][row+gameOfLife.renderStartY];

            ctx.beginPath();
            ctx.rect(col*currResolution,row*currResolution,currResolution,currResolution);
            ctx.fillStyle = cell ? 'black' : 'white';
            if(col+gameOfLife.renderStartX===199 && row+gameOfLife.renderStartY ===149){
                ctx.fillStyle = "yellow";
            }
            if(col+gameOfLife.renderStartX===0 && row+gameOfLife.renderStartY ===0){
                ctx.fillStyle = "green";
            }
            ctx.fill();
            ctx.stroke();
        }
    }
}

//EVENT LISTENERS
canvas.addEventListener('wheel', function(e){
    zoom(canvas,e)
});
document.getElementById("control").addEventListener('click',handleClick);

//EVENT HANDLERS
function zoom(canvas,e) {
    e.preventDefault();
    
    let currResolution = Resolutions[gameOfLife.zoom];

    let currCols = gameOfLife.width / currResolution;//kirajzolt négyzetek száma
    let currRows = gameOfLife.height / currResolution;//kirajzolt négyzetek száma

    const rect = canvas.getBoundingClientRect();
    const x = Math.floor(((event.clientX-rect.left)/currResolution)+gameOfLife.renderStartX);
    const y = Math.floor(((event.clientY-rect.top)/currResolution)+gameOfLife.renderStartY);

    //console.log(x);
    //console.log(y);

    let wheel=0;
    if(e.deltaY>0){
        wheel=-1;
    }else{
        wheel=1;
    }

    if (gameOfLife.zoom+wheel>=0 && gameOfLife.zoom+wheel<=4) {
        if(e.deltaY>0){
            gameOfLife.zoom-=1;
        }else{
            gameOfLife.zoom+=1;
        }
    }

    let newResolution = Resolutions[gameOfLife.zoom];
    let newCols = gameOfLife.width / newResolution;
    let newRows = gameOfLife.height / newResolution;

    
    let startPointX = x-Math.floor(newCols/2);
    let startPointY = y-Math.floor(newRows/2);

    //console.log(currRows+"  "+newRows);
    //console.log(currCols+"  "+newCols);
    if(startPointX<0) startPointX=0;
    if(startPointX+newCols>gameOfLife.cols) startPointX=gameOfLife.cols-newCols;

    if(startPointY<0) startPointY=0;
    if(startPointY+newRows>gameOfLife.rows) startPointY=gameOfLife.rows-newRows;
    
    gameOfLife.renderStartX = startPointX;
    gameOfLife.renderStartY = startPointY;

    console.log(startPointX);
    console.log(startPointY);
}

function handleClick(e){
    let startPointX=gameOfLife.renderStartX;
    let startPointY=gameOfLife.renderStartY;

    let zoom=10-(2*gameOfLife.zoom);
    
    switch(e.target.id){
        case "up":
            startPointY-=zoom;
            break;
        case "down":
            startPointY+=zoom;
            break;
        case "left":
            startPointX-=zoom;
            break;
        case "right":
            startPointX+=zoom;
            break;
    }

    let newResolution = Resolutions[gameOfLife.zoom];
    let newCols = gameOfLife.width / newResolution;
    let newRows = gameOfLife.height / newResolution;
    
    if(startPointX<0) startPointX=0;
    if(startPointX+newCols>gameOfLife.cols) startPointX=gameOfLife.cols-newCols;

    if(startPointY<0) startPointY=0;
    if(startPointY+newRows>gameOfLife.rows) startPointY=gameOfLife.rows-newRows;
    
    gameOfLife.renderStartX = startPointX;
    gameOfLife.renderStartY = startPointY;
}

//GAME LOOP
function update() {
    grid = nextGen(grid);
    render(grid);
    requestAnimationFrame(update);
}

//START
let grid = buildGrid();
update();