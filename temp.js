const Resolutions = [4, 8, 20, 40, 100];

let gameOfLife = {
    width: 800,
    height: 600,
    cols: 200,
    rows: 150,

    resolution: 4,
    zoom: 0,
    renderStartX: 0,
    renderStartY: 0,
}

function buildGrid(cols, rows) {
    return new Array(cols).fill(null).map(
        () => new Array(rows).fill(0).map(
            () => Math.floor(Math.random() * 2)
        )
    );
}

class Modell {
    constructor(width, height, resolution) {
        this.width = width;
        this.height = height;
        this.resolution = resolution;

        this.cols = width / resolution;
        this.rows = height / resolution;

        this.grid = buildGrid(this.cols, this.rows);

        this.gridLog = [];
    }

    nextGen() {
        const nextGen = this.grid.map(arr => [...arr]);
        let changes = [];

        //elmentjük a jelenlegi állapoto a naplóba
        if (this.gridLog.length < 40) {
            this.gridLog.push(this.grid);
        } else {
            this.gridLog.shift();
            this.gridLog.push(this.grid);
        }

        for (let col = 0; col < this.grid.length; col++) {
            for (let row = 0; row < this.grid[col].length; row++) {
                const cell = this.grid[col][row];
                let numNeighbours = 0;

                for (let i = -1; i < 2; i++) {
                    for (let j = -1; j < 2; j++) {

                        if (i === 0 && j === 0) continue;

                        if (this.grid[col + i] !== undefined && this.grid[col + i][row + j] !== undefined) {
                            const currentNeighbour = this.grid[col + i][row + j];
                            numNeighbours += currentNeighbour;
                        }
                    }
                }

                if (cell === 1 && numNeighbours < 2) {
                    nextGen[col][row] = 0;
                    changes.push({
                        x: col,
                        y: row,
                    });
                } else if (cell === 1 && numNeighbours > 3) {
                    nextGen[col][row] = 0;
                    changes.push({
                        x: col,
                        y: row,
                    });
                } else if (cell === 0 && numNeighbours === 3) {
                    nextGen[col][row] = 1;
                    changes.push({
                        x: col,
                        y: row,
                    });
                }
            }
        }
        this.grid = nextGen;
        return changes;
    }

}

//RÉGI
const canvas = document.querySelector('canvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

function render(grid, changes) {
    let currResolution = Resolutions[gameOfLife.zoom];

    let currCols = gameOfLife.width / currResolution;//kirajzolt négyzetek száma
    let currRows = gameOfLife.height / currResolution;//kirajzolt négyzetek száma

    if (changes === undefined) {
        for (let col = 0; col < currCols; col++) {
            for (let row = 0; row < currRows; row++) {
                const cell = grid[col + gameOfLife.renderStartX][row + gameOfLife.renderStartY];

                ctx.beginPath();
                ctx.rect(col * currResolution, row * currResolution, currResolution, currResolution);
                ctx.fillStyle = cell ? 'black' : 'white';
                if (col + gameOfLife.renderStartX === 199 && row + gameOfLife.renderStartY === 149) {
                    ctx.fillStyle = "yellow";
                }
                if (col + gameOfLife.renderStartX === 0 && row + gameOfLife.renderStartY === 0) {
                    ctx.fillStyle = "green";
                }
                ctx.fill();
                ctx.stroke();
            }
        }
    }else{
        for(let i=0;i<changes.length;i++){

        }
    }
}

let M = new Modell(800,600,4);
function update(){
    M.nextGen();
    render(M.grid);
    requestAnimationFrame(update);
}
update();