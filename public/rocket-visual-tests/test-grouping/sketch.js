
let rocket;
let rocketImg;
function preload() {
    rocketImg = loadImage('../../../assets/rocket.png');
}

function setup() {
    createCanvas(800, 800);
    rocket = new Rocket(100, 100, 30, 100, {}, 0, { collisionFilter: {} });
}

function draw() {
    background(0);

    rocket.draw();
}