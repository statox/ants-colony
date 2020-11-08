function Cell(x, y, desirability, pheromones) {
    this.pos = new p5.Vector(x, y);
    this.key = vecKey(this.pos);
    this.desirability = desirability || 1;
    this.pheromones = pheromones || 0;
    this.isObstacle = false;
    // A combination of desirability and pheromones
    this.totalAttraction = 0;

    this.updateAttraction = () => {
        const {desirabilityFactor, pheromonesFactor} = appSettings;
        this.totalAttraction =
            Math.pow(this.desirability, desirabilityFactor) + Math.pow(this.pheromones, pheromonesFactor);
    };

    this.updateAttraction();
}
