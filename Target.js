function Target(x, y, amount) {
    this.pos = new p5.Vector(x, y);
    this.amount = amount;
    this.originalAmount = amount;

    this.draw = () => {
        fill(100, 100, 200);
        square(this.pos.x * scale, this.pos.y * scale, scale);
    };
}
