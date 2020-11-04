function Grid(D, nbTargets) {
    this.D = D;
    this.nbTargets = nbTargets;
    this.targets = [];
    this.cells = [];
    this.evaporationCoefficient = 0.8; // between 0 and 1
    this.currentMaxPheromones = 0;
    this.maxDesirability = 200; // Initial desirability for targets
    this.nbTargets = 5;

    for (let y = 0; y < this.D; y++) {
        this.cells.push([]);
        for (let x = 0; x < this.D; x++) {
            this.cells[y].push(new Cell(x, y));
        }
    }

    this.createTargets = () => {
        for (_ = 0; _ < this.nbTargets; _++) {
            this.createTarget();
        }
    };

    this.createTarget = () => {
        const x = parseInt(random(D));
        const y = parseInt(random(D));

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
                    const rg = map(this.cells[y][x].desirability, 0, this.maxDesirability, 200, 100);
                    const b = map(this.cells[y][x].desirability, 0, this.maxDesirability, 200, 200);
                    fill(rg, rg, b);
                } else if (this.cells[y][x].desirability < 0) {
                    // Walls are black
                    fill(0, 0, 0);
                } else if (this.cells[y][x].pheromones === 0) {
                    // Empty are white
                    fill(250, 250, 250);
                    // Using this get some interesting results to investigate
                    // fill('rgba(250, 250, 250, 0.3)');
                } else {
                    // Gradient on the amount of pheromones
                    const paint = map(this.cells[y][x].pheromones, 0, this.currentMaxPheromones, 250, 10);
                    fill(250, paint, 250);
                }

                stroke('rgba(0, 0, 0, 0.2)');
                square(x * scale, y * scale, scale);

                if (this.cells[y][x].desirability > 1) {
                    fill(0, 0, 0);
                    stroke(0, 0, 0);
                    text(this.cells[y][x].desirability, x * scale, y * scale);
                }
            }
        }
    };

    this.updatePheromones = (ants) => {
        // Pheromones evaporation
        for (let y = 0; y < this.D; y++) {
            for (let x = 0; x < this.D; x++) {
                this.cells[y][x].pheromones *= 1 - this.evaporationCoefficient;
            }
        }

        // Ants which found a target add pheromones proportionnaly to the length of their path
        const emptiedTarget = new Set();
        ants.forEach((ant) => {
            if (ant.foundTarget) {
                ant.path.forEach((c) => (c.pheromones += D * D - ant.path.length));
                const targetCell = ant.path[ant.path.length - 1];

                // An ant found the target and took some food out of it
                targetCell.desirability = targetCell.desirability - 1 || 1;

                // If the target has no food anymore mark it
                if (targetCell.desirability === 1) {
                    emptiedTarget.add(vecKey(targetCell.pos));
                }
            }
        });

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
