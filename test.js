function Test() {
    let ant = new Ant();

    let neighbors = [new Cell(0, 0, 1, 0), new Cell(2, 0, 1, 0), new Cell(1, 2, 1, 0)];
    neighbors.forEach((c, i) => (c.id = i));
    neighbors.forEach((c) => c.updateAttraction());

    console.log(neighbors);

    let res = neighbors.map((n) => 0);
    let totalTries = 10000;
    for (let i = 0; i < totalTries; i++) {
        chosenId = ant.chooseDestination(neighbors).id;
        res[chosenId]++;
    }

    console.log('result');
    console.log(res);
    console.log(res.map((v) => (v * 100) / totalTries));
    console.log(
        'control',
        res.map((v) => (v * 100) / totalTries).reduce((a, b) => (a += b))
    );

    console.log('=========================================================');
    console.log('END OF TESTS');
}
