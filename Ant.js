function Ant() {
    // this.pos = new p5.Vector(parseInt(D / 2), D - 1);
    this.pos = startingPoint;
    this.offset = p5.Vector.random2D();
    this.offset.setMag(random(width / D / 2));
    this.ttl = 400;
    this.path = [];
    this.pathKeys = new Set();
    this.foundTarget = false;

    this.reset = () => {
        this.pos = startingPoint;
        this.ttl = 100;
        this.path = [];
        this.pathKeys = new Set();
        this.foundTarget = false;
    };

    this.getUnivisitedNeighbors = () => {
        const {x, y} = this.pos;

        const neighbors = [];

        // Get all the possible neighbors position within the perception radius
        const perception = appSettings.antPerceptionRadius;
        const destinations = [];
        for (let yd = y - perception; yd <= y + perception; yd++) {
            for (let xd = x - perception; xd <= x + perception; xd++) {
                destinations.push({x: xd, y: yd});
            }
        }

        // filter the out of grid positions and the ones already visited
        destinations.forEach(({x, y}) => {
            if (x > 0 && x < D && y > 0 && y < D && !this.pathKeys.has(xyKey(x, y))) {
                neighbors.push(grid.cells[y][x]);
            }
        });

        return neighbors;
    };

    // Given the current position and an ideal destination
    // Return the neighbor in a radius 1 going in the right direction
    this.getCellInPath = (idealDestination) => {
        const diff = idealDestination.pos.copy().sub(this.pos);
        diff.setMag(1);
        const destinationPos = this.pos.copy().add(diff);
        destinationPos.x = Math.round(destinationPos.x);
        destinationPos.y = Math.round(destinationPos.y);

        return grid.cells[destinationPos.y][destinationPos.x];
    };

    this.chooseDestination = (neighbors) => {
        // Choose the destination cell based on its desirability (target or not) and its
        // amount of pheromones
        let totalScore = 0;
        let cumulatedScores = [];
        for (let i = 0; i < neighbors.length; i++) {
            const n = neighbors[i];
            totalScore += n.totalAttraction;
            cumulatedScores.push(totalScore);

            // If a neighbors is a target go choose it directly
            if (n.desirability > 1) {
                return this.getCellInPath(n);
            }
        }

        const selectedScore = Math.random() * totalScore;

        for (let i = 0; i < neighbors.length; i++) {
            if (selectedScore <= cumulatedScores[i]) {
                return this.getCellInPath(neighbors[i]);
            }
        }
    };

    this.chooseRandomDestination = (neighbors) => {
        return neighbors[Math.floor(Math.random() * neighbors.length)];
    };

    this.walk = () => {
        if (this.ttl === 0) {
            return;
        }

        const neighbors = this.getUnivisitedNeighbors();

        // No unvisited neighbors means we are stuck
        if (!neighbors.length) {
            this.ttl = 0;
            return;
        }

        const destination = this.chooseDestination(neighbors);
        // const destination = this.chooseRandomDestination(neighbors);
        this.ttl--;
        this.pos = destination.pos;
        this.path.push(destination);
        this.pathKeys.add(vecKey(this.pos));
        // Stop walking if you are on a target
        if (destination.desirability > 1) {
            this.ttl = 0;
            this.foundTarget = true;
        }
    };

    this.draw = () => {
        if (this.foundTarget) {
            fill(100, 200, 100);
        } else if (this.ttl === 0) {
            fill(200, 100, 50);
        } else {
            fill(100, 100, 250);
        }

        push();
        translate(this.pos.x * scale + scale * 0.5 + this.offset.x, this.pos.y * scale + scale * 0.5 + this.offset.y);
        circle(0, 0, scale * 0.5);
        pop();
    };
}
