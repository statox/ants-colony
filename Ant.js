function Ant() {
    // this.pos = new p5.Vector(parseInt(D / 2), D - 1);
    this.pos = startingPoint;
    this.offset = p5.Vector.random2D();
    this.offset.setMag(random(width / D / 2));
    this.ttl = appSettings.antTTL;
    this.path = [];
    this.pathKeys = new Set();
    this.foundTarget = false;

    this.reset = () => {
        this.pos = startingPoint;
        this.ttl = appSettings.antTTL;
        this.path = [];
        this.pathKeys = new Set();
        this.foundTarget = false;
    };

    this.getUnivisitedNeighbors = () => {
        const {x, y} = this.pos;
        const currentCell = grid.cells[y][x];

        // Filter already visited neighbors and the obstacles
        return currentCell.neighbors.filter((possibleDestination) => {
            const alreadyVisited = this.pathKeys.has(possibleDestination.key);
            const notAnObstacle = !this.getCellInPath(possibleDestination).isObstacle;
            return !alreadyVisited && notAnObstacle;
        });
    };

    // Given the current position and a desired destination
    // Return the neighbor in a radius 1 going in the right direction
    this.getCellInPath = (idealDestination) => {
        const {x, y} = this.pos;
        const {x: xn, y: yn} = idealDestination.pos;

        // top row
        if (yn < y) {
            if (xn < x) return grid.cells[y - 1][x - 1];
            if (xn > x) return grid.cells[y - 1][x + 1];
            return grid.cells[y - 1][x];
        }
        // same row
        if (yn === y) {
            if (xn < x) return grid.cells[y][x - 1];
            if (xn > x) return grid.cells[y][x + 1];
            return grid.cells[y][x]; // shouldn't happen
        }
        // bottom row
        if (yn > y) {
            if (xn < x) return grid.cells[y + 1][x - 1];
            if (xn > x) return grid.cells[y + 1][x + 1];
            return grid.cells[y + 1][x];
        }
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
        this.pathKeys.add(destination.key);

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
