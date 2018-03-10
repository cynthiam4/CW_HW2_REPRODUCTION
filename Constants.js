
//canvas defaults
var canvasWidth = 600;
var canvasHeight = 600;
var ZERO = 0;

//Entity Defaults
var maxAge = 50;
var matureAge= 10;
var timeTillDeathFromIllness = 2;
var reproductionWaitTime = 60;

//Entity Behavior
var friction = 1;
var acceleration = 1000000;
var maxSpeed = 200;

function calculateMidY(y1,y2) {
    return Math.abs((y2-y1)/2);
}
function calculateMidX(x1,x2) {
    return Math.abs((x2-x1)/2);
}

