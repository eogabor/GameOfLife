//TODO
//!!KÓD takarítás 

// useractionok undo/redo✓
// kialakítani a mentést és betöltést a local storage-ba✓ 
// menteni kívánt alakzat nevének validálása
// üres/random indítás elkülönítése

function $(element) {
    return document.getElementById(element);
}

function buildGrid(cols, rows, gameType) {
    if (gameType === "random") {
        return new Array(cols).fill(null).map(
            () => new Array(rows).fill(0).map(
                () => Math.floor(Math.random() * 2)
            )
        );
    } else if (gameType === "blank") {
        return new Array(cols).fill(null).map(
            () => new Array(rows).fill(0)
        );
    }
}

function showAlert(alertString) {
    $("alertBox").innerHTML = alertString;
}

//MODELL
class Modell {
    constructor(cols, rows, gameType) {
        this.speeds = [25, 50, 100, 250, 500, 750, 1000, 1500, 2000];

        this.cols = cols;
        this.rows = rows;
        this.grid = buildGrid(cols, rows, gameType);
        this.gridLog = [];

        this.optimalizedGrid = this.grid.map(arr => [...arr]); // kezdetleg az alap grid van benne, de később csak az előző állapothoz viszonyított változásokat tartalmazza

        this.state = undefined; //undefined=>még nem indult el a modell, 0=>modell álló helyzetben, 1=>modell mozgásban 
        this.speed = 4;
        this.intervalID = undefined;

        this.redrawEventTarget = new EventTarget();

        //EVENT LISTENERS
        $('start').addEventListener('click', () => this.start());
        $('stop').addEventListener('click', () => this.stop());
        $('speedUp').addEventListener('click', () => this.speedUp());
        $('slowDown').addEventListener('click', () => this.slowDown());
        $('-10').addEventListener('click', (e) => this.timeManagment(e));
        $('-1').addEventListener('click', (e) => this.timeManagment(e));
        $('+1').addEventListener('click', (e) => this.timeManagment(e));
        $('+10').addEventListener('click', (e) => this.timeManagment(e));
    }

    nextGen() {
        //console.log(this.speeds[this.speed]);
        this.gridLogPush(this.grid.map(arr => [...arr]));
        const nextGen = this.grid.map(arr => [...arr]);
        const optGrid = [...Array(this.cols)].map(e => Array(this.rows));

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
                    optGrid[col][row] = 0;
                } else if (cell === 0 && numNeighbours === 3) {
                    nextGen[col][row] = 1;
                    optGrid[col][row] = 1;
                }
            }
        }

        this.grid = nextGen;

        this.optimalizedGrid = optGrid;
    }

    start() {//Elindítja a modell működését, abban az esetben, ha álló helyzetben(state=0) van, vagy még nem indult el a működés(state=undefined)
        if (this.state === 0 || this.state === undefined) {
            this.intervalID = setInterval((() => this.nextGen()), this.speeds[this.speed]);
            this.state = 1;
            $('start').disabled = true;
            $('stop').disabled = false;
        } else {
            showAlert("The simulation must be stopped before you can start it!");
        }
    }

    stop() {
        if (this.state === 1) {
            clearInterval(this.intervalID);
            this.state = 0;
            $('start').disabled = false;
            $('stop').disabled = true;
        } else {
            showAlert("The simulation must be running before you can stop it!")
        }
    }

    getGrid() {
        return this.grid.map(arr => [...arr]);
    }

    getOptGrid() {
        return this.optimalizedGrid.map(arr => [...arr]);
    }

    speedUp() {
        if (this.state === 1 && this.speed > 0) {
            this.speed -= 1;
            this.stop();
            this.start();
        } else {
            showAlert("You have reached maximum iteration speed!");
        }

    }

    slowDown() {
        if (this.state === 1 && this.speed < 8) {
            this.speed += 1;
            this.stop();
            this.start();
        } else {
            showAlert("You have reached minimal iteration speed!");
        }

    }

    manageCell(x, y) {
        let cell = this.grid[x][y];

        if (cell === 0) {
            this.grid[x][y] = 1;
            this.optimalizedGrid[x][y] = 1;
        } else if (cell === 1) {
            this.grid[x][y] = 0;
            this.optimalizedGrid[x][y] = 0;
        }
    }

    setSelectedArea(selectedArea) {
        let sizeX = selectedArea.xMax - selectedArea.xMin + 1;
        let sizeY = selectedArea.yMax - selectedArea.yMin + 1;
        this.selectedArea = new Array(sizeX).fill(null).map(
            (col, Xindex) => new Array(sizeY).fill(null).map(
                (row, Yindex) => this.grid[selectedArea.xMin + Xindex][selectedArea.yMin + Yindex]
            )
        );
    }

    delSelectedArea() {
        this.selectedArea = undefined;
    }

    getSelectedArea() {
        if (this.selectedArea === undefined) {
            return undefined;
        } else {
            return this.selectedArea.map(arr => [...arr]);
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
                showAlert("Not enough saved states left...");//HIBA ÜZENET
                return undefined;

            case "-1":
                if (this.gridLog.length >= 1) {
                    let res = this.gridLog.pop();

                    return res;
                }
                showAlert("No more saved states left...");
                return undefined;

            case "+1":
                this.nextGen();
                this.dispatchReDrawEvent();
                return false;

            case "+10":
                for (let i = 0; i < 10; i++) {
                    this.nextGen();
                }
                this.dispatchReDrawEvent();
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
                this.grid = returnValue.map(arr => [...arr]);
                this.optimalizedGrid = returnValue.map(arr => [...arr]);
                this.dispatchReDrawEvent();
            }
        } else {
            showAlert("You must stop the simulation, to manage time!")
        }

    }

    dispatchReDrawEvent() {
        this.redrawEventTarget.dispatchEvent(new Event('redrawEvent'));
    }

}

//VIEW
class View {
    constructor(canvas, width, height, selectCanvas, gameType) {
        this.resolutions = [4, 8, 20, 40, 100];

        this.canvas = canvas;
        this.modell = new Modell(200, 150, gameType);
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

        this.patternData = {
            startPointX: undefined,
            startPointY: undefined,
            patternGrid: undefined,
        }


        this.patternMode = 0;

        this.Persistence = new Persistence();

        this.redrawFlag = 1; //Ha a flag értéke 1 akkor az egész gridet rajzoljuk ki, ha 0 akkor csak a módosult cellákat

        this.renderBin = [];

        this.userActions = [];
        this.redoArray = [];

        //EVENT LISTENERS
        $('maincanvas').addEventListener('wheel', (e) => this.handleZoom(this.canvas, e));
        $('left').addEventListener('click', (e) => this.moveView(e));
        $('up').addEventListener('click', (e) => this.moveView(e));
        $('down').addEventListener('click', (e) => this.moveView(e));
        $('right').addEventListener('click', (e) => this.moveView(e));
        document.querySelector('canvas').addEventListener('click', (e) => this.canvasCellClick(this.canvas, e));
        document.querySelector('canvas').addEventListener('click', (e) => this.canvasSelectClick(this.canvas, e));
        $('select').addEventListener('click', () => this.switchSelectMode());
        $("patternList").addEventListener('click', (e) => this.patternModeOn(e));
        $("stopPattern").addEventListener('click', () => this.patternModeOff());
        $('start').addEventListener('click', () => this.setReDrawFlag());
        $('stop').addEventListener('click', () => this.setReDrawFlag());
        $('undo').addEventListener('click', () => this.undoUserAction());
        $('redo').addEventListener('click', () => this.redoUserAction());
        $('saveSelectedArea').addEventListener('click', () => this.saveSelectedArea());

        this.modell.redrawEventTarget.addEventListener('redrawEvent', () => this.setReDrawFlag());
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
            this.setReDrawFlag();
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
        this.setReDrawFlag();
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
        if (modellState !== 0 || this.selectMode !== 0) {
            //Csak álló állapotban lehessen módosítani a modellen, ha nem select módban vagyunk,alertet küldeni
            showAlert("You must stop the simulation, to manipulate cells.");
            return;
        }


        let currResolution = this.resolutions[this.zoom];

        const rect = canvas.getBoundingClientRect(); 0
        const x = Math.floor(((e.clientX - rect.left) / currResolution) + this.renderStartX);
        const y = Math.floor(((e.clientY - rect.top) / currResolution) + this.renderStartY);

        if (this.patternMode === 0) {
            this.modell.manageCell(x, y);
            this.saveUserAction([[x, y]], true);
        } else {
            let grid = this.modell.getGrid();
            let patternStartX = this.patternData.startPointX;
            let patternStartY = this.patternData.startPointY;
            let patternGrid = this.patternData.patternGrid;

            let actionArray = [];
            for (let ix = patternStartX; ix < patternStartX + patternGrid.length; ix++) {
                for (let iy = patternStartY; iy < patternStartY + patternGrid[0].length; iy++) {
                    if (patternGrid[ix - patternStartX][iy - patternStartY] === 1 && (ix < this.cols && iy < this.rows) && grid[ix][iy] === 0) {
                        this.modell.manageCell(ix, iy);
                        actionArray.push([ix, iy]);
                    }
                }
            }

            this.saveUserAction(actionArray, true);
        }
    }

    saveUserAction(actionArray, emptyRedoFlag) {
        let actionArrayCopy = actionArray.map(arr => [...arr]);
        if (emptyRedoFlag) {
            this.redoArray = [];
        }

        if (this.userActions.length < 30) {
            this.userActions.push(actionArrayCopy);
        } else {
            this.userActions.shift();
            this.userActions.push(actionArrayCopy);
        }
    }

    undoUserAction() {
        if (this.modell.state !== 0) {
            showAlert("You must stop the simulation, to undo/redo actions.");
        }

        if (this.userActions.length === 0) {
            showAlert("No more saved actions left.");
            return;
        }

        let actionArray = this.userActions.pop();
        this.redoArray.push(actionArray.map(arr => [...arr]));

        for (let i = 0; i < actionArray.length; i++) {
            let x = actionArray[i][0];
            let y = actionArray[i][1];
            this.modell.manageCell(x, y);
        }
    }

    redoUserAction() {
        if (this.modell.state !== 0) {
            showAlert("You must stop the simulation, to undo/redo actions.");
        }

        if (this.redoArray.length === 0) {
            showAlert("No more redoable actions left.");
            return;
        }

        let actionArray = this.redoArray.pop();
        this.saveUserAction(actionArray, false);

        for (let i = 0; i < actionArray.length; i++) {
            let x = actionArray[i][0];
            let y = actionArray[i][1];
            this.modell.manageCell(x, y);
        }

    }

    patternModeOff() {
        $('start').disabled = false;
        $('stopPattern').disabled = true;
        $('maincanvas').removeEventListener('mousemove', this.patternHandler);
        this.patternData = {
            startPointX: undefined,
            startPointY: undefined,
            patternGrid: undefined,
        }
        this.patternMode = 0;

        this.selectctx.clearRect(0, 0, 200, 200);
    }

    patternModeOn(e) {
        if (this.modell.state !== 0 || this.selectMode !== 0) {
            showAlert("You must stop the simulation, to put on a pattern.")
            return;//alert hogy állítsa meg a kijelöléshez
        }
        if (!e.target.classList.contains("patternListItem")) return; // ha nem egy elemre kattint a diven belül ne történjen semmi

        $('start').disabled = true;
        $('stopPattern').disabled = false;

        let pattern = this.Persistence.getPattern(e.target.id.split("-")[1]);
        this.selectctx.clearRect(0, 0, 200, 200);
        this.patternData.patternGrid = pattern;
        this.patternMode = 1;
        $('maincanvas').addEventListener('mousemove', (e) => this.patternHandler(e));
    }

    patternHandler = (e) => this.movePattern(this.canvas, e);

    movePattern(canvas, e) {
        let currResolution = this.resolutions[this.zoom];

        const rect = canvas.getBoundingClientRect();
        const x = Math.floor(((e.clientX - rect.left) / currResolution) + this.renderStartX);
        const y = Math.floor(((e.clientY - rect.top) / currResolution) + this.renderStartY);

        this.patternData.startPointX = x;
        this.patternData.startPointY = y;
    }

    switchSelectMode() {
        if (this.modell.state !== 0 || this.patternMode !== 0) {
            showAlert("You must stop the simulation, before entering select mode.")
            return;//alert hogy állítsa meg a kijelöléshez
        }


        if (this.selectMode !== 0) {//SELECT MÓD KIVESZ

            if (this.selectMode === 2 || this.selectMode === 3) {
                $('maincanvas').removeEventListener('mousemove', this.selectHandler);

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
            this.setReDrawFlag();
            $('start').disabled = false;
        } else if (this.selectMode === 0) {//SELECT MÓD BERAK
            this.selectMode = 1;
            $('start').disabled = true;
        }
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

            $('maincanvas').addEventListener('mousemove', this.selectHandler);
        } else if (this.selectMode === 2) {
            $('maincanvas').removeEventListener('mousemove', this.selectHandler);
            this.modell.setSelectedArea({ ...this.selectedArea });

            this.selectMode = 3;
        }

        //TODO 3-as mód megvalósítása
    }

    saveSelectedArea() {
        if (this.selectMode !== 3) {
            showAlert("You have to select an area, before saving it!");
            return;
        }

        let nameInput = $("selectedAreaName").value;

        if (!this.validateName()) return;

        debugger;

        let grid = this.modell.getSelectedArea();
        this.Persistence.saveSelectedArea({
            "name": nameInput,
            "pattern": grid.map(arr => [...arr])
        });

        this.switchSelectMode();
        $("selectedAreaName").value = "";
    }

    validateName(nameString) {
        return true;
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
                showAlert("The selected area can be maximum 50 cells wide.")
                //HIBA ÜZENET : NEM LEHET 100nál szélesebbet kijelölni
            }
        }
        if (x > xMax || (x > xMin && x < xMax)) {
            if (x - startX + 1 <= 50) {
                this.selectedArea.xMax = x;
                this.selectedArea.xMin = startX;
            } else {
                showAlert("The selected area can be maximum 50 cells high.")
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
        let grid;
        let wholeGrid = this.modell.getGrid();
        //optimalizáció
        if (this.redrawFlag === 1) {
            grid = this.modell.getGrid();

            this.redrawFlag = 0;
            this.renderBin = [];
        } else {
            grid = this.modell.getOptGrid();

            for (let i = 0; i < this.renderBin.length; i++) {
                let x = this.renderBin[i][0];
                let y = this.renderBin[i][1];
                grid[x][y] = 0;
            }
            this.renderBin = [];
        }

        //Select körvonal renderelése
        let xMin = this.selectedArea.xMin;
        let xMax = this.selectedArea.xMax;
        let yMin = this.selectedArea.yMin;
        let yMax = this.selectedArea.yMax;

        for (let ix = xMin; ix <= xMax; ix++) {
            for (let iy = yMin; iy <= yMax; iy++) {
                if ((wholeGrid[ix][iy] === 0) /*csak a fehéreket rakja sárgára*/ && (ix === xMin || ix === xMax || iy === yMin || iy === yMax)) {
                    grid[ix][iy] = 2;
                    this.renderBin.push([ix, iy]);//render optimalizáció miatt->a következő rendernél ezek törlésre kerülnek, hogy ne kelljen az egészet újra lekérni -> smooth select és pattern move
                };
            }
        }

        //pattern felrakás renderelése
        let patternStartX = this.patternData.startPointX;
        let patternStartY = this.patternData.startPointY;
        let patternGrid = this.patternData.patternGrid;

        if (this.patternMode === 1) {
            for (let ix = patternStartX; ix < patternStartX + patternGrid.length; ix++) {
                for (let iy = patternStartY; iy < patternStartY + patternGrid[0].length; iy++) {
                    if (patternGrid[ix - patternStartX][iy - patternStartY] === 1 && (ix < this.cols && iy < this.rows) && (wholeGrid[ix][iy] === 0)) {
                        grid[ix][iy] = 3;
                        this.renderBin.push([ix, iy]);
                    }
                }
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
                if (cell !== undefined) {
                    this.ctx.beginPath();
                    this.ctx.rect(col * currResolution, row * currResolution, currResolution, currResolution);

                    if (cell === 0) {
                        this.ctx.fillStyle = "white";
                    } else if (cell === 1) {
                        this.ctx.fillStyle = "black";
                    } else if (cell == 2) {
                        this.ctx.fillStyle = "yellow";
                    } else if (cell == 3) {
                        this.ctx.fillStyle = "blue";
                    }

                    this.ctx.fill();

                    if (state !== 1) this.ctx.stroke();
                }

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
                this.selectctx.stroke();

            }
        }
    }

    renderPatternSelect() {
        if (this.patternMode != 1) return;

        let grid = this.patternData.patternGrid;
        let sizeX = grid.length + 2;
        let sizeY = grid[0].length + 2;

        let maxSize = sizeX > sizeY ? sizeX : sizeY;
        let resoulution = Math.floor(200 / maxSize);

        for (let col = 0; col < sizeX; col++) {
            for (let row = 0; row < sizeY; row++) {
                if (col === 0 || col === sizeX - 1 || row === 0 || row === sizeY - 1) {
                    this.selectctx.beginPath();
                    this.selectctx.rect(col * resoulution, row * resoulution, resoulution, resoulution);
                    this.selectctx.fillStyle = "white";
                    this.selectctx.fill();
                    this.selectctx.stroke();

                } else {
                    const cell = grid[col - 1][row - 1];

                    this.selectctx.beginPath();
                    this.selectctx.rect(col * resoulution, row * resoulution, resoulution, resoulution);

                    if (cell === 0) {
                        this.selectctx.fillStyle = "white";
                    } else {
                        this.selectctx.fillStyle = "black";
                    }

                    this.selectctx.fill();
                    this.selectctx.stroke();
                }

            }
        }

    }

    setReDrawFlag() {
        this.redrawFlag = 1;
    }

    animate() {
        this.render();
        this.renderSelect();
        this.renderPatternSelect();
        requestAnimationFrame(() => this.animate());
    }

    start() {
        this.modell.start();
        this.render();
        this.renderSelect();
        this.animate();
    }
}

//Persistence
class Persistence {
    constructor() {
        this.dataLoaded = 0;
        this.patternList = [];
        //Alapértelmezet alakzatok betöltése
        fetch('basic.json')
            .then(response => response.json())
            .then(data => {
                for (let i = 0; i < data.length; i++) {
                    this.addListElement(data[i]);
                }
                this.dataLoaded++;
            });

        //Local StorageBan tárolt alakzatok betöltése
        let localData = localStorage.getItem("GOF_savedPatterns");

        if (!localData) {
            localStorage.setItem("GOF_savedPatterns", "[]");
            localData = "[]";
        }

        localData = JSON.parse(localData);
        this.localStorageData = localData;
        for (let i = 0; i < localData.length; i++) {
            this.addListElement(localData[i]);
        }

        this.dataLoaded++;
    }

    addListElement(element) {
        this.patternList.push(element);

        let iDiv = document.createElement('div');
        iDiv.id = "listElement-" + element.name;
        iDiv.innerHTML = element.name;
        iDiv.className = "patternListItem";

        $("patternList").appendChild(iDiv);
    }

    getPattern(patternName) {
        if (this.dataLoaded < 2) {
            showAlert("this pattern haven't loaded yet.")
            return;
        }

        for (let i = 0; i < this.patternList.length; i++) {
            if (this.patternList[i].name === patternName) {
                return this.patternList[i].pattern;
            }
        }
    }

    saveSelectedArea(pattern) {
        this.localStorageData.push(pattern);
        localStorage.setItem("GOF_savedPatterns", JSON.stringify(this.localStorageData));
        this.addListElement(pattern);
    }
}

$("GameOfLife").hidden = true;

$("randomGame").addEventListener('click', () => startGame("random"));
$("blankGame").addEventListener('click', () => startGame("blank"));



function startGame(gameType) {
    const canvas = $('maincanvas');
    const selectCanvas = $('selectCanvas');

    let V = new View(canvas, 800, 600, selectCanvas, gameType);
    V.start();
    $("randomGame").hidden = true;
    $("blankGame").hidden = true;
    $("GameOfLife").hidden = false;
}