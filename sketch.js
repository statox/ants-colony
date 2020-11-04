const D = 50;
let grid;
let scale;
let nbAnts = 20;
let ants = [];
let appSettings = {
    showWalking: true
};

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
    // Test();
    // noLoop();
    createCanvas(700, 700);
    customResizeCanvas();

    grid = new Grid(D, 10);
    grid.createTargets();

    for (let _ = 0; _ < nbAnts; _++) {
        ants.push(new Ant());
    }
    walkingAnts = ants.length;
}

let walkingAnts;
function draw() {
    scale = width / grid.D;
    grid.draw();

    walkingAnts = walkAnts();
    if (!appSettings.showWalking) {
        frameRate(5);
        while (walkingAnts) {
            walkingAnts = walkAnts();
        }
    }

    // All the ants either found a target or expired their ttl
    if (!walkingAnts) {
        grid.updatePheromones(ants);
        ants.forEach((a) => a.reset());
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
