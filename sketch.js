const D = 50;
let grid;
let scale;
let nbAnts = 200;
let ants = [];
let appSettings = {
    showWalking: false,
    showExploredCells: true,
    showTargetQuantity: false,
    showFPS: true,
    waitForSolution: true, // If true new target is regenerate only when a stable solution is found
    antPerceptionRadius: 2,
    antTTL: 50,
    targetMaxDesirability: 1000,
    // These two constants are used to weight the desirability and pheromones in totalAttraction of cells
    desirabilityFactor: 1,
    pheromonesFactor: 5,
    minNbTargets: 1, // minimum nb of target cells to have constantly on the grid
    startFromLastTarget: false // if true: when a target is finished use its position as the new starting point
};
let startingPoint = new p5.Vector(parseInt(D / 2), parseInt(D / 2));

function keyToVec(s) {
    const [x, y] = s.split(':').map(Number);
    return new p5.Vector(x, y);
}
function vecKey(v) {
    return xyKey(v.x, v.y);
}
function xyKey(x, y) {
    return `${x}:${y}`;
}

function customResizeCanvas() {
    const minD = Math.min(windowWidth, windowHeight);
    resizeCanvas(minD * 0.98, minD * 0.98);
}

function windowResized() {
    customResizeCanvas();
}

function setup() {
    createCanvas(700, 700);
    customResizeCanvas();

    grid = new Grid(D, 1);
    grid.createTargets();
    grid.createObstacles();

    for (let _ = 0; _ < nbAnts; _++) {
        ants.push(new Ant());
    }
    walkingAnts = ants.length;
}

let walkingAnts;
function draw() {
    // frameRate(5);
    scale = width / grid.D;
    grid.draw();

    walkingAnts = walkAnts();
    if (!appSettings.showWalking) {
        while (walkingAnts) {
            walkingAnts = walkAnts();
        }
    }

    // All the ants either found a target or expired their ttl
    if (!walkingAnts) {
        grid.updatePheromones(ants);
        ants.forEach((a) => a.reset());
    }

    if (keyIsDown(CONTROL) && isMouseInScreen()) {
        const {x, y} = mouseToXY();
        grid.createObstacle(x, y);
    }

    // Show text if we found a solution
    if (appSettings.isAntPathStabilized) {
        fill(0);
        stroke(0);
        text('Found solution', 30, 30);
    }

    // Show FPS
    if (appSettings.showFPS) {
        fill(0);
        stroke(0);
        text(`FPS: ${parseInt(frameRate())}`, 30, height - 30);
    }
}

// Return the number of ants still walking
function walkAnts() {
    let walkingAnts = 0;
    ants.forEach((ant) => {
        ant.walk();
        if (appSettings.showWalking) {
            ant.draw();
        }

        if (ant.ttl > 0) {
            walkingAnts++;
        }
    });
    return walkingAnts;
}

function mousePressed() {
    if (!isMouseInScreen()) {
        return;
    }
    // Get the mouse position in the grid
    const {x, y} = mouseToXY();
    const c = grid.cells[y][x];
    if (c.desirability < grid.maxDesirability && !c.isObstacle) {
        // Create a new target if an empty cell is clicked
        grid.createTarget(x, y);
    } else if (c.desirability === grid.maxDesirability && !c.isObstacle) {
        // Replace a target by an obstacle if it is clicked on
        grid.removeTarget(x, y);
        grid.createObstacle(x, y);
    } else if (c.isObstacle) {
        // Remove an obstacle if it is clicked on
        grid.removeObstacle(x, y);
    }
}

function isMouseInScreen() {
    return !(mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height);
}

function mouseToXY() {
    const mousePosition = new p5.Vector(mouseX, mouseY);
    const inGridPosition = mousePosition.div(scale);
    const x = parseInt(inGridPosition.x);
    const y = parseInt(inGridPosition.y);
    return new p5.Vector(x, y);
}
