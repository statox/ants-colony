function Grid(D) {
    this.D = D;
    this.targets = [];
    this.cells = [];
    this.evaporationCoefficient = 0.8; // between 0 and 1
    this.currentMaxPheromones = 0;
    this.maxDesirability = appSettings.targetMaxDesirability; // Initial desirability for targets
    this.visitedCells = new Set();
    this.isPathStabilized = false;

    for (let y = 0; y < this.D; y++) {
        this.cells.push([]);
        for (let x = 0; x < this.D; x++) {
            this.cells[y].push(new Cell(x, y));
        }
    }

    this.createTargets = () => {
        for (_ = 0; _ < appSettings.nbTargets; _++) {
            this.createTarget();
        }
    };

    this.createTarget = () => {
        /*
         * const x = parseInt(random(D));
         * const y = parseInt(random(D));
         */
        // Generate a target in a circle radius
        const pos = p5.Vector.random2D();
        const mag = map(Math.random(), 0, 1, D * 0.1, D * 0.4);
        pos.setMag(mag);
        pos.add(new p5.Vector(D / 2, D / 2));
        const x = parseInt(pos.x);
        const y = parseInt(pos.y);

        // Avoid selecting a cell which is already a target
        if (this.cells[y][x].desirability > 1) {
            return this.createTarget();
        }
        this.cells[y][x].desirability = this.maxDesirability;
    };

    this.draw = () => {
        for (let y = 0; y < this.D; y++) {
            for (let x = 0; x < this.D; x++) {
                if (this.cells[y][x].desirability > 1) {
                    // Targets are blue with brightness depending on how desirable they are
                    const rg = map(this.cells[y][x].desirability, 1, this.maxDesirability, 200, 100);
                    const b = map(this.cells[y][x].desirability, 1, this.maxDesirability, 200, 200);
                    fill(rg, rg, b);
                } else if (this.cells[y][x].pheromones === 0) {
                    // Empty are white
                    fill(250, 250, 250);
                    // Using this get some interesting results to investigate
                    // fill('rgba(250, 250, 250, 0.3)');
                } else {
                    // Gradient on the amount of pheromones
                    const paint = map(this.cells[y][x].pheromones, 0, this.currentMaxPheromones, 250, 10);
                    fill(paint, 250, paint);
                }

                if (x === startingPoint.x && y === startingPoint.y) {
                    fill(250, 0, 0);
                }

                // Change stroke to show visited cells
                if (appSettings.showExploredCells && this.visitedCells.has(vecKey(this.cells[y][x].pos))) {
                    stroke('rgba(50, 50, 50, 0.3)');
                } else {
                    stroke('rgba(150, 150, 150, 0.1)');
                }

                square(x * scale, y * scale, scale);

                if (this.cells[y][x].desirability > 1) {
                    fill(0, 0, 0);
                    stroke(0, 0, 0);
                    if (appSettings.showTargetQuantity) {
                        text(this.cells[y][x].desirability, x * scale, y * scale);
                    }
                }
            }
        }
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
        ants.forEach((ant) => {
            if (ant.foundTarget) {
                let pathKey = '';
                ant.path.forEach((c) => {
                    pathKey += vecKey(c.pos);
                    c.pheromones += D * D - ant.path.length;
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

        // Regenerate a new target for each emptied one
        for (let _ = 0; _ < emptiedTarget.size; _++) {
            this.createTarget();
        }

        // Calculate the max amount of pheromones on a cell
        // And update the attraction of each cells with its new amount of pheromones
        // this.currentMaxPheromones = 0;
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
