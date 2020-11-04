function Ant() {
    // this.pos = new p5.Vector(parseInt(D / 2), D - 1);
    this.pos = new p5.Vector(parseInt(D / 2), parseInt(D / 2));
    this.offset = p5.Vector.random2D();
    this.offset.setMag(random(scale));
    this.ttl = 400;
    this.path = [];
    this.pathKeys = new Set();
    this.foundTarget = false;

    this.reset = () => {
        this.pos = new p5.Vector(parseInt(D / 2), parseInt(D / 2));
        this.ttl = 100;
        this.path = [];
        this.pathKeys = new Set();
        this.foundTarget = false;
    };

    this.getUnivisitedNeighbors = () => {
        const {x, y} = this.pos;

        const neighbors = [];
        let destinations = [
            {x: this.pos.x - 1, y: this.pos.y},
            {x: this.pos.x + 1, y: this.pos.y},
            {x: this.pos.x, y: this.pos.y - 1},
            {x: this.pos.x, y: this.pos.y + 1},

            {x: this.pos.x - 1, y: this.pos.y - 1},
            {x: this.pos.x + 1, y: this.pos.y - 1},
            {x: this.pos.x - 1, y: this.pos.y + 1},
            {x: this.pos.x + 1, y: this.pos.y + 1}
        ];

        destinations.forEach(({x, y}) => {
            if (x > 0 && x < D && y > 0 && y < D && !this.pathKeys.has(xyKey(x, y))) {
                neighbors.push(grid.cells[y][x]);
            }
        });

        return neighbors;
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
                return n;
            }
        }

        const selectedScore = Math.random() * totalScore;

        // console.log(cumulatedScores);
        // console.log(selectedScore);
        for (let i = 0; i < neighbors.length; i++) {
            if (selectedScore <= cumulatedScores[i]) {
                // console.log('chosen', i);
                return neighbors[i];
            }
        }
        // return this.chooseRandomDestination(neighbors);
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
        this.ttl--;
        this.pos = destination.pos;
        this.path.push(destination);
        this.pathKeys.add(vecKey(destination.pos));
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
