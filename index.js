//TODO
//!!KÓD takarítás 
//!!view optimalizáció -> a render két féle adatot tud lekérni:optimializált(undefined-al jeloljük a nem változott négyzeteket) / teljes || zoom+mozgatás+első betöltés után teljes alapból optimalizált
//alertbox hibaüzenetekkel
//optimalizálni a selectálást

function buildGrid(cols, rows) {
    return new Array(cols).fill(null).map(
        () => new Array(rows).fill(0).map(
            () => Math.floor(Math.random() * 2)
        )
    );
}

//MODELL
class Modell {
    constructor(cols, rows) {
        this.speeds = [25,50,100, 250, 500, 750, 1000, 1500, 2000];

        this.cols = cols;
        this.rows = rows;
        this.grid = buildGrid(cols, rows);

        this.state = undefined; //undefined=>még nem indult el a modell, 0=>modell álló helyzetben, 1=>modell mozgásban 
        this.speed = 4;
        this.intervalID = undefined;

        this.gridLog = [];

        //EVENT LISTENERS
        document.getElementById('start').addEventListener('click', () => this.start());
        document.getElementById('stop').addEventListener('click', () => this.stop());
        document.getElementById('speedUp').addEventListener('click', () => this.speedUp());
        document.getElementById('slowDown').addEventListener('click', () => this.slowDown());
        document.getElementById('-10').addEventListener('click', (e) => this.timeManagment(e));
        document.getElementById('-1').addEventListener('click', (e) => this.timeManagment(e));
        document.getElementById('+1').addEventListener('click', (e) => this.timeManagment(e));
        document.getElementById('+10').addEventListener('click', (e) => this.timeManagment(e));
    }

    nextGen() {
        //debugger;
        //console.log(this.speeds[this.speed]);

        this.gridLogPush(this.grid.map(arr => [...arr]));

        const nextGen = this.grid.map(arr => [...arr]);
        

        for (let col = 0; col < this.cols; col++) {
            for (let row = 0; row < this.rows; row++) {
                const cell = this.grid[col][row];
                let numNeighbours = 0;

                //A sejt körül életben lévő sejtek megszámolása
                for (let x = -1; x < 2; x++) {
                    for (let y = -1; y < 2; y++) {
                        if (x === 0 && y === 0) continue;

                        if (this.grid[col + x] !== undefined && this.grid[col + x][row + y] !== undefined) {
                            const currentNeighbour = this.grid[col + x][row + y];
                            numNeighbours += currentNeighbour;
                        }
                    }
                }

                //Ha él és kevesebb,mint 2, vagy több, mint 3 szomszédja van meghal
                //Ha halott és 3 szomszédja él, újra életre kel
                if (cell === 1 && (numNeighbours < 2 || numNeighbours > 3)) {
                    nextGen[col][row] = 0;
                } else if (cell === 0 && numNeighbours === 3) {
                    nextGen[col][row] = 1;
                }
            }
        }
        this.grid = nextGen;
    }

    start() {//Elindítja a modell működését, abban az esetben, ha álló helyzetben(state=0) van, vagy még nem indult el a működés(state=undefined)
        if (this.state === 0 || this.state === undefined) {
            this.intervalID = setInterval((() => this.nextGen()), this.speeds[this.speed]);
            this.state = 1;
        }

    }

    stop() {
        if (this.state === 1) {
            clearInterval(this.intervalID);
            this.state = 0;
        }
    }

    getGrid() {
        return this.grid.map(arr => [...arr]);
    }

    speedUp() {
        if (this.speed > 0) {
            this.speed -= 1;
        }
        this.stop();
        this.start();
    }

    slowDown() {
        if (this.speed < 8) {
            this.speed += 1;
        }
        this.stop();
        this.start();
    }

    manageCell(x, y) {
        let cell = this.grid[x][y];

        if (cell === 0) {
            this.grid[x][y] = 1;
        } else if (cell === 1) {
            this.grid[x][y] = 0;
        }
    }

    setSelectedArea(selectedArea) {
        this.selectedArea = {
            xMin: selectedArea.xMin,
            xMax: selectedArea.xMax,
            yMin: selectedArea.yMin,
            yMax: selectedArea.yMax,
        };
    }

    delSelectedArea() {
        this.selectedArea = undefined;
    }

    getSelectedArea() {
        if (this.selectedArea === undefined) {
            return undefined;
        } else {
            let sizeX = this.selectedArea.xMax - this.selectedArea.xMin + 1;
            let sizeY = this.selectedArea.yMax - this.selectedArea.yMin + 1;
            let result = new Array(sizeX).fill(null).map(
                (col, Xindex) => new Array(sizeY).fill(null).map(
                    (row, Yindex) => this.grid[this.selectedArea.xMin + Xindex][this.selectedArea.yMin + Yindex]
                )
            );

            return result;
        }


    }

    gridLogGet(parameter) {
        switch (parameter) {
            case "-10":
                if (this.gridLog.length >= 10) {
                    let res;
                    for (let i = 0; i < 10; i++) {
                        res = this.gridLog.pop();
                    }
                    return res;
                }
                //HIBA ÜZENET
                return undefined;

            case "-1":
                if (this.gridLog.length >= 1) {
                    let res = this.gridLog.pop();
                    return res;
                }
                //HIBA ÜZENET
                return undefined;

            case "+1":
                this.nextGen();
                return false;

            case "+10":
                for (let i = 0; i < 10; i++) {
                    this.nextGen();
                }
                return false;
        }
    }

    gridLogPush(grid) {
        if (this.gridLog.length >= 100) {
            this.gridLog.shift();
            this.gridLog.push(grid);
        } else {
            this.gridLog.push(grid);
        }
    }

    timeManagment(e) {
        //console.log(e.target.id);
        if (this.state === 0) {
            let returnValue = this.gridLogGet(e.target.id);
            if (returnValue) {//ha visszatér valamivel akkor állítani kell a gridlogon
                this.grid = returnValue;
            }
        }else{
            //HIBA ÜZENET
        }

    }
}

//VIEW
class View {
    constructor(canvas, modell, width, height, selectCanvas) {
        this.resolutions = [4, 8, 20, 40, 100];

        this.canvas = canvas;
        this.modell = modell;
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = width;
        this.canvas.height = height;

        this.selectCanvas = selectCanvas;
        this.selectctx = this.selectCanvas.getContext('2d');
        this.selectCanvas.width = 200;
        this.selectCanvas.height = 200;

        this.height = height;
        this.width = width;
        this.cols = this.modell.cols;
        this.rows = this.modell.rows;

        this.zoom = 1;
        this.renderStartX = 0;
        this.renderStartY = 0;

        this.selectMode = 0; //0=>nem selectMód, 1=>SelectMód első klikk előtt, 2=>SelectMód második klikk előtt
        this.selectedArea = { //A kijelölt terület határait határozza meg, nincs kijelölés =>minden undefined
            xMin: undefined,
            xMax: undefined,
            yMin: undefined,
            yMax: undefined,
            startX: undefined,
            startY: undefined,
        };

        //EVENT LISTENERS
        document.getElementById('maincanvas').addEventListener('wheel', (e) => this.handleZoom(this.canvas, e));
        document.getElementById('left').addEventListener('click', (e) => this.moveView(e));
        document.getElementById('up').addEventListener('click', (e) => this.moveView(e));
        document.getElementById('down').addEventListener('click', (e) => this.moveView(e));
        document.getElementById('right').addEventListener('click', (e) => this.moveView(e));
        document.querySelector('canvas').addEventListener('click', (e) => this.canvasCellClick(this.canvas, e));
        document.querySelector('canvas').addEventListener('click', (e) => this.canvasSelectClick(this.canvas, e));
        document.getElementById('select').addEventListener('click', () => this.switchSelectMode());
    }

    handleZoom(canvas, e) {
        e.preventDefault();

        let currResolution = this.resolutions[this.zoom];

        const rect = canvas.getBoundingClientRect();
        const x = Math.floor(((e.clientX - rect.left) / currResolution) + this.renderStartX);
        const y = Math.floor(((e.clientY - rect.top) / currResolution) + this.renderStartY);

        //Hogy ne tekerje izomból
        let wheel = 0;
        if (e.deltaY > 0) {
            wheel = -1;
        } else {
            wheel = 1;
        }

        if (this.zoom + wheel >= 0 && this.zoom + wheel <= 4) {
            if (e.deltaY > 0) {
                this.zoom -= 1;
            } else {
                this.zoom += 1;
            }

            let newResolution = this.resolutions[this.zoom];
            let newCols = this.width / newResolution;
            let newRows = this.height / newResolution;

            let startPointX = x - Math.floor(newCols / 2);
            let startPointY = y - Math.floor(newRows / 2);

            if (startPointX < 0) startPointX = 0;
            if (startPointX + newCols > this.cols) startPointX = this.cols - newCols;

            if (startPointY < 0) startPointY = 0;
            if (startPointY + newRows > this.rows) startPointY = this.rows - newRows;

            this.renderStartX = startPointX;
            this.renderStartY = startPointY;
        }
    }

    moveView(e) {
        let startPointX = this.renderStartX;
        let startPointY = this.renderStartY;

        let zoom = 10 - (2 * this.zoom);

        switch (e.target.id) {
            case "up":
                startPointY -= zoom;
                break;
            case "down":
                startPointY += zoom;
                break;
            case "left":
                startPointX -= zoom;
                break;
            case "right":
                startPointX += zoom;
                break;
        }

        let newResolution = this.resolutions[this.zoom];
        let newCols = this.width / newResolution;
        let newRows = this.height / newResolution;

        if (startPointX < 0) startPointX = 0;
        if (startPointX + newCols > this.cols) startPointX = this.cols - newCols;

        if (startPointY < 0) startPointY = 0;
        if (startPointY + newRows > this.rows) startPointY = this.rows - newRows;

        this.renderStartX = startPointX;
        this.renderStartY = startPointY;
    }

    canvasCellClick(canvas, e) {
        let modellState = this.modell.state;
        if (modellState !== 0 || this.selectMode !== 0) return; //Csak álló állapotban lehessen módosítani a modellen, ha nem select módban vagyunk,alertet küldeni

        let currResolution = this.resolutions[this.zoom];

        const rect = canvas.getBoundingClientRect();
        const x = Math.floor(((e.clientX - rect.left) / currResolution) + this.renderStartX);
        const y = Math.floor(((e.clientY - rect.top) / currResolution) + this.renderStartY);

        this.modell.manageCell(x, y);
    }

    switchSelectMode() {
        if (this.modell.state !== 0) return;//alert hogy állítsa meg a kijelöléshez


        if (this.selectMode !== 0) {//SELECT MÓD KIVESZ

            if (this.selectMode === 2) {
                document.getElementById('maincanvas').removeEventListener('mousemove', this.selectHandler);

                this.selectedArea = {
                    xMin: undefined,
                    xMax: undefined,
                    yMin: undefined,
                    yMax: undefined,
                    startX: undefined,
                    startY: undefined,
                }

                this.modell.delSelectedArea();
                this.selectctx.clearRect(0, 0, 200, 200);
            }

            this.selectMode = 0;
            document.getElementById('start').disabled = false;
        } else if (this.selectMode === 0) {//SELECT MÓD BERAK
            this.selectMode = 1;
            document.getElementById('start').disabled = true;
        }


        console.log(this.selectMode);
    }

    canvasSelectClick(canvas, e) {
        let modellState = this.modell.state;
        if (modellState !== 0 || this.selectMode === 0) return; //Csak álló állapotban lehessen kijelölni, ha select módban vagyunk
        if (this.selectMode === 1) {
            let currResolution = this.resolutions[this.zoom];

            const rect = canvas.getBoundingClientRect();
            const x = Math.floor(((e.clientX - rect.left) / currResolution) + this.renderStartX);
            const y = Math.floor(((e.clientY - rect.top) / currResolution) + this.renderStartY);

            this.selectedArea.xMin = x;
            this.selectedArea.xMax = x;
            this.selectedArea.yMin = y;
            this.selectedArea.yMax = y;
            this.selectedArea.startX = x;
            this.selectedArea.startY = y;

            this.selectMode = 2;

            document.getElementById('maincanvas').addEventListener('mousemove', this.selectHandler);
        } else if (this.selectMode === 2) {
            document.getElementById('maincanvas').removeEventListener('mousemove', this.selectHandler);
            this.modell.setSelectedArea({ ...this.selectedArea });
        }

        //TODO 3-as mód megvalósítása
    }

    //Hogy le lehessen venni az event listenert
    selectHandler = (e) => this.dragSelect(this.canvas, e);

    dragSelect(canvas, e) {
        let currResolution = this.resolutions[this.zoom];

        const rect = canvas.getBoundingClientRect();
        const x = Math.floor(((e.clientX - rect.left) / currResolution) + this.renderStartX);
        const y = Math.floor(((e.clientY - rect.top) / currResolution) + this.renderStartY);

        let xMin = this.selectedArea.xMin;
        let xMax = this.selectedArea.xMax;
        let yMin = this.selectedArea.yMin;
        let yMax = this.selectedArea.yMax;
        let startX = this.selectedArea.startX;
        let startY = this.selectedArea.startY;

        if (x < xMin) {
            if (startX - x + 1 <= 50) {
                this.selectedArea.xMin = x;
                this.selectedArea.xMax = startX;
            } else {
                //HIBA ÜZENET : NEM LEHET 100nál szélesebbet kijelölni
            }
        }
        if (x > xMax || (x > xMin && x < xMax)) {
            if (x - startX + 1 <= 50) {
                this.selectedArea.xMax = x;
                this.selectedArea.xMin = startX;
            } else {
                //HIBA
            }
        }
        if (y < yMin) {
            if (startY - y + 1 <= 50) {
                this.selectedArea.yMin = y;
                this.selectedArea.yMax = startY;
            } else {
                //HIBA
            }

        }
        if (y > yMax || (y > yMin && y < yMax)) {
            if (y - startY + 1 <= 50) {
                this.selectedArea.yMax = y;
                this.selectedArea.yMin = startY;
            } else {
                //HIBA
            }

        }
    }

    render() {
        let grid = this.modell.getGrid();

        let xMin = this.selectedArea.xMin;
        let xMax = this.selectedArea.xMax;
        let yMin = this.selectedArea.yMin;
        let yMax = this.selectedArea.yMax;

        for (let ix = xMin; ix <= xMax; ix++) {
            for (let iy = yMin; iy <= yMax; iy++) {
                if (grid[ix][iy] === 0 /*csak a fehéreket rakja sárgára*/ && (ix === xMin || ix === xMax || iy === yMin || iy === yMax)) {
                    grid[ix][iy] = 2;
                };
            }
        }
        //console.log(grid);
        let currResolution = this.resolutions[this.zoom];
        //console.log(currResolution);

        let currCols = this.width / currResolution;
        //console.log(currCols);
        let currRows = this.height / currResolution;
        //console.log(currRows);

        let state = this.modell.state;

        for (let col = 0; col < currCols; col++) {
            for (let row = 0; row < currRows; row++) {
                const cell = grid[col + this.renderStartX][row + this.renderStartY];
                //console.log(cell);

                this.ctx.beginPath();
                this.ctx.rect(col * currResolution, row * currResolution, currResolution, currResolution);

                if (cell === 0) {
                    this.ctx.fillStyle = "white";
                } else if (cell === 1) {
                    this.ctx.fillStyle = "black";
                } else {
                    this.ctx.fillStyle = "yellow";
                }

                this.ctx.fill();

                if (state !== 1) this.ctx.stroke();
            }
        }
    }

    renderSelect() { // selected area renderelése, amennyiben létezik

        if (!this.modell.getSelectedArea()) return;

        let grid = this.modell.getSelectedArea();
        let sizeX = grid.length;
        let sizeY = grid[0].length;

        let maxSize = sizeX > sizeY ? sizeX : sizeY;
        let resoulution = Math.floor(200 / maxSize);

        for (let col = 0; col < sizeX; col++) {
            for (let row = 0; row < sizeY; row++) {
                const cell = grid[col][row];

                this.selectctx.beginPath();
                this.selectctx.rect(col * resoulution, row * resoulution, resoulution, resoulution);

                if (cell === 0) {
                    this.selectctx.fillStyle = "white";
                } else {
                    this.selectctx.fillStyle = "black";
                }

                this.selectctx.fill();
            }
        }
    }

    animate() {
        this.render();
        this.renderSelect();
        requestAnimationFrame(() => this.animate());
    }

    start() {
        this.modell.start();
        this.render();
        this.renderSelect();
        this.animate();
    }
}

let M = new Modell(200, 150);

const canvas = document.getElementById('maincanvas');
const selectCanvas = document.getElementById('selectCanvas');
let V = new View(canvas, M, 800, 600, selectCanvas);

V.start();