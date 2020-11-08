function Grid(D) {
    this.D = D;
    this.targets = [];
    this.cells = [];
    this.evaporationCoefficient = 0.8; // between 0 and 1
    this.currentMaxPheromones = 0;
    this.maxDesirability = appSettings.targetMaxDesirability; // Initial desirability for targets
    this.visitedCells = new Set();
    this.isPathStabilized = false;
    this.stablePath; // will hold the solution when isPathStabilized is true

    for (let y = 0; y < this.D; y++) {
        this.cells.push([]);
        for (let x = 0; x < this.D; x++) {
            this.cells[y].push(new Cell(x, y));
        }
    }

    this.createTargets = () => {
        for (_ = 0; _ < appSettings.minNbTargets; _++) {
            this.createTarget();
        }
    };

    this.createTarget = (dx, dy) => {
        // If a position is given use it otherwise create a
        // random target
        if (dx != null && dy != null) {
            this.cells[dy][dx].desirability = this.maxDesirability;
            return;
        }
        // Generate a target in a circle radius
        const pos = p5.Vector.random2D();
        const mag = map(Math.random(), 0, 1, D * 0.1, D * 0.4);
        pos.setMag(mag);
        pos.add(new p5.Vector(D / 2, D / 2));
        const x = parseInt(pos.x);
        const y = parseInt(pos.y);

        // Avoid selecting a cell which is already a target or which is an obstacle
        if (this.cells[y][x].desirability > 1 || this.cells[y][x].isObstacle) {
            return this.createTarget();
        }
        this.cells[y][x].desirability = this.maxDesirability;
    };

    this.removeTarget = (dx, dy) => {
        this.cells[dy][dx].desirability = 1;
    };

    this.createObstacle = (x, y) => {
        this.cells[y][x].isObstacle = true;
    };

    this.removeObstacle = (x, y) => {
        this.cells[y][x].isObstacle = false;
    };

    this.createObstacles = () => {
        for (let x = 23; x < 28; x++) {
            this.createObstacle(x, 21);
            this.createObstacle(x, 31);
        }
        for (let y = 24; y < 29; y++) {
            this.createObstacle(22, y);
            this.createObstacle(28, y);
        }
    };

    this.createObstaclesRandom = () => {
        const nbObstacles = 200;
        let i = 0;
        while (i < nbObstacles) {
            console.log(i);
            const v = new p5.Vector(1, 0);
            v.setMag((Math.random() * D) / 2);
            v.rotate(Math.random() * 2 * PI);
            const x = parseInt(v.x + D / 2);
            const y = parseInt(v.y + D / 2);
            if (!this.cells[y][x].isObstacle) {
                i++;
                this.createObstacle(x, y);
            }
        }
    };

    this.draw = () => {
        for (let y = 0; y < this.D; y++) {
            for (let x = 0; x < this.D; x++) {
                const c = this.cells[y][x];

                // Show visited cells
                if (appSettings.showExploredCells && this.visitedCells.has(vecKey(c.pos))) {
                    stroke('rgba(50, 50, 50, 0.2)');
                    circle(x * scale, y * scale, scale);
                }

                // Show quantity
                if (c.desirability > 1 && appSettings.showTargetQuantity) {
                    stroke(0);
                    fill(0);
                    text(c.desirability, x * scale, y * scale - 10);
                }

                noStroke();
                fill(230, 250, 230); // Not sure we I need that here

                if (c.isObstacle) {
                    // Obstacles are black
                    fill('rgba(0, 0, 0, 0.2)');
                    circle(x * scale, y * scale, scale);
                } else if (c.desirability > 1) {
                    // Targets are blue with brightness depending on how desirable they are
                    const rg = map(c.desirability, 1, this.maxDesirability, 200, 100);
                    fill(rg, rg, 200);
                    circle(x * scale, y * scale, scale);
                } else if (c.pheromones > 0) {
                    // Gradient on the amount of pheromones
                    const paint = map(c.pheromones, 0, this.currentMaxPheromones, 180, 10);
                    fill(paint, 250, paint);
                    circle(x * scale, y * scale, scale);
                }

                // if we have a solution show it but not the target
                if (this.isPathStabilized && this.stablePath.has(vecKey(c.pos)) && c.desirability <= 1) {
                    fill(200, 180, 180);
                    circle(x * scale, y * scale, scale);
                }
            }
        }

        // Show the starting point
        fill(250, 0, 0);
        circle(startingPoint.x * scale, startingPoint.y * scale, scale);
    };

    this.updatePheromones = (ants) => {
        // Pheromones evaporation
        for (let y = 0; y < this.D; y++) {
            for (let x = 0; x < this.D; x++) {
                this.cells[y][x].pheromones *= 1 - this.evaporationCoefficient;
                if (this.cells[y][x].pheromones < 1) {
                    this.cells[y][x].pheromones = 0;
                }
            }
        }

        // Ants which found a target add pheromones proportionnaly to the length of their path
        const emptiedTarget = new Set();
        this.visitedCells = new Set();
        const pathKeys = new Set();
        const longestPathLength = Math.max(...ants.map((a) => a.path.length)); // used the calculate the amount of pheromones to leave
        ants.forEach((ant) => {
            if (ant.foundTarget) {
                let pathKey = '';
                ant.path.forEach((c) => {
                    pathKey += vecKey(c.pos);
                    // Deposit pheromones proportionnaly to the longest path
                    // so shorter path = more pheromones
                    c.pheromones += longestPathLength - ant.path.length;
                });
                // Keep a track of the different paths
                pathKeys.add(pathKey);
                const targetCell = ant.path[ant.path.length - 1];

                // An ant found the target and took some food out of it
                // Only if we don't wait for a solution or if we wait for
                // a solution but found it
                if (!appSettings.waitForSolution || this.isPathStabilized) {
                    targetCell.desirability = targetCell.desirability - 1 || 1;
                }

                // If the target has no food anymore mark it
                if (targetCell.desirability === 1) {
                    emptiedTarget.add(vecKey(targetCell.pos));
                }
            }

            // Keep track of all the visited cells
            ant.path.forEach((c) => this.visitedCells.add(vecKey(c.pos)));
        });

        // All the ants take the same path we have a solution
        this.isPathStabilized = pathKeys.size === 1;
        appSettings.isAntPathStabilized = this.isPathStabilized;
        // Use the first ant to get the solution (they now all follow the same path)
        if (this.isPathStabilized) {
            this.stablePath = ants[0].pathKeys;
        }

        // Regenerate a new target for each emptied one
        // only if we always want some targets on the grid
        if (appSettings.minNbTargets > 0) {
            for (let _ = 0; _ < emptiedTarget.size; _++) {
                this.createTarget();
            }
        }
        // Move the starting point if the settings say so
        if (emptiedTarget.size > 0 && appSettings.startFromLastTarget) {
            const v = emptiedTarget.values().next().value;
            startingPoint = keyToVec(v);
        }

        // Calculate the max amount of pheromones on a cell
        // And update the attraction of each cells with its new amount of pheromones
        this.currentMaxPheromones = 0;
        for (let y = 0; y < this.D; y++) {
            for (let x = 0; x < this.D; x++) {
                if (this.cells[y][x].pheromones > this.currentMaxPheromones) {
                    this.currentMaxPheromones = this.cells[y][x].pheromones;
                }
                this.cells[y][x].updateAttraction();
            }
        }
    };
}
