function Person(game, mom, dad, x, y) {
    this.gender = null;
    this.age = 0
    this.maxAge = 30 + Math.floor((Math.random() * 8));
    this.hasMatured = false;
    this.hasPartner = false;
    this.partner = null; //reference to partner
    this.colors = null;
    this.isAlive = true;
    this.isTerminallyIll = false;
    this.deathCountdown = 0;
    this.parents = [mom, dad]; //[];//preffered order of mom, dad
    this.listOfChildren = [];
    this.maxChildren = Math.floor(Math.random() * 5);
    this.radar = 200;
    this.reproductionWait = 0
    this.radius = 15;
    this.visualRadius = 500;
    this.velocity = { x: Math.random() * 1000, y: Math.random() * 1000 };
    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    if (speed > maxSpeed) {
        var ratio = maxSpeed / speed;
        this.velocity.x *= ratio;
        this.velocity.y *= ratio;
    }
    Entity.call(this, game, x, y);
};

Person.prototype = new Entity();
Person.prototype.constructor = Person;

Person.prototype.setIt = function () {
    this.it = true;
    this.color = 0;
    this.visualRadius = 500;
};

Person.prototype.setNotIt = function () {
    this.it = false;
    this.color = 3;
    this.visualRadius = 200;
};


//checks collision between 2 persons
Person.prototype.collide = function (other) {
    return distance(this, other) < this.radius + other.radius;
};

//checks if mating is possible, if so, sets references to each other
Person.prototype.matingOccured = function (other) {
    if (this.isAlive && other.isAlive && !this.isTerminallyIll && !other.isTerminallyIll) { // checks in case other dies right at collision
        if (!this.parents[0].listOfChildren.includes(other)) {//we dont support incest
            if ((!this.hasPartner && !other.hasPartner && !(this.gender === other.gender))) {
                this.produceChild(other);
            }
            if ((this.partner === other) && (other.partner == this)) {
                this.produceChild(other);
                return true;
            }
        }
        return false
    }
}

Person.prototype.produceChild = function (other) {
    let mom = null;
    let dad = null;
    let child = null;
    if (this.gender === "female") {
        mom = this;
        dad = other;
    } else {
        mom = other;
        dad = this;
    }
    let childY = calculateMidY(this.y, other.y);
    let childX = calculateMidY(this.x, other.x);

    let genderRandomizer = Math.floor(Math.random() * 100);

    if (genderRandomizer < 50) {
        child = new Female(this.game, mom, dad, childX, childY);
    } else {
        child = new Male(this.game, mom, dad, childX, childY);
    }
    this.listOfChildren.push(child);
    other.listOfChildren.push(child);

    this.game.addEntity(child);
}


//Checks collision against canvas borders-----------------------------//

Person.prototype.collideLeft = function () {
    return (this.x - this.radius) < ZERO;
};

Person.prototype.collideRight = function () {
    return (this.x + this.radius) > canvasWidth;
};

Person.prototype.collideTop = function () {
    return (this.y - this.radius) < ZERO;
};

Person.prototype.collideBottom = function () {
    return (this.y + this.radius) > canvasHeight;
};
//--------------------------------------------------------------------//

Person.prototype.draw = function (ctx) {
    if (this.isAlive) {
        ctx.beginPath();
        let color = null;
        if (this.hasMatured) {
            if (this.isTerminallyIll) {
                color = this.colors[2];
            } else {
                color = this.colors[0];
            }
        } else {
            color = this.colors[1];
        }
        ctx.fillStyle = color;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
        ctx.fill();
        ctx.closePath();
    }

};

Person.prototype.update1 = function () {
    Entity.prototype.update.call(this);
}

Person.prototype.update = function () {

    //  console.log(this.velocity);
    if (this.isAlive) {
        if (Math.random() < 0.00001) {
            this.isTerminallyIll = true;
        }
        if (this.isTerminallyIll) {
            if(this.deathCountdown > timeTillDeathFromIllness){
                this.isAlive = false;
            }
            this.deathCountdown++;
        }
        if (!this.hasMatured) {
            if (this.getAge() >= matureAge) {
                this.hasMatured = true;
            }
        } else {
            if (this.getAge() >= this.maxAge) {
                this.isAlive = false;
            }
        }


        this.x += this.velocity.x * this.game.clockTick;
        this.y += this.velocity.y * this.game.clockTick;

        //deals with canvas edge collision-----------------------------------//
        if (this.collideLeft() || this.collideRight()) {
            this.velocity.x = -this.velocity.x * friction;
            if (this.collideLeft()) this.x = this.radius;
            if (this.collideRight()) this.x = canvasWidth - this.radius;
            this.x += this.velocity.x * this.game.clockTick;
            this.y += this.velocity.y * this.game.clockTick;
        }

        if (this.collideTop() || this.collideBottom()) {
            this.velocity.y = -this.velocity.y * friction;
            if (this.collideTop()) this.y = this.radius;
            if (this.collideBottom()) this.y = canvasHeight - this.radius;
            this.x += this.velocity.x * this.game.clockTick;
            this.y += this.velocity.y * this.game.clockTick;
        }
        //-----------------------------------------------------------------//

        for (var i = 0; i < this.game.entities.length; i++) {
            var entity = this.game.entities[i];
            if (entity.isAlive && entity !== this && this.collide(entity)) {
                if (this.hasMatured && !this.isTerminallyIll) {
                    if (this.reproductionWait > reproductionWaitTime && (this.listOfChildren.length < this.maxChildren)) {
                        var mated = this.matingOccured(entity);
                        this.reproductionWait = 0;
                    }
                }

                var temp = { x: this.velocity.x, y: this.velocity.y };

                var dist = distance(this, entity);
                var delta = this.radius + entity.radius - dist;
                var difX = (this.x - entity.x) / dist;
                var difY = (this.y - entity.y) / dist;

                this.x += difX * delta / 2;
                this.y += difY * delta / 2;
                entity.x -= difX * delta / 2;
                entity.y -= difY * delta / 2;

                this.velocity.x = entity.velocity.x * friction;
                this.velocity.y = entity.velocity.y * friction;
                entity.velocity.x = temp.x * friction;
                entity.velocity.y = temp.y * friction;
                this.x += this.velocity.x * this.game.clockTick;
                this.y += this.velocity.y * this.game.clockTick;
                entity.x += entity.velocity.x * this.game.clockTick;
                entity.y += entity.velocity.y * this.game.clockTick;

            }

            if (entity != this && this.collide({ x: entity.x, y: entity.y, radius: this.visualRadius })) {
                var dist = distance(this, entity);
                if (this.it && dist > this.radius + entity.radius + 10) {
                    var difX = (entity.x - this.x) / dist;
                    var difY = (entity.y - this.y) / dist;
                    this.velocity.x += difX * acceleration / (dist * dist);
                    this.velocity.y += difY * acceleration / (dist * dist);
                    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
                    if (speed > maxSpeed) {
                        var ratio = maxSpeed / speed;
                        this.velocity.x *= ratio;
                        this.velocity.y *= ratio;
                    }
                }
                if (entity.it && dist > this.radius + entity.radius) {
                    var difX = (entity.x - this.x) / dist;
                    var difY = (entity.y - this.y) / dist;
                    this.velocity.x -= difX * acceleration / (dist * dist);
                    this.velocity.y -= difY * acceleration / (dist * dist);
                    var speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
                    if (speed > maxSpeed) {
                        var ratio = maxSpeed / speed;
                        this.velocity.x *= ratio;
                        this.velocity.y *= ratio;
                    }
                }
            }
        }
        this.age++;
        this.reproductionWait++;
    }

    this.velocity.x -= (1 - friction) * this.game.clockTick * this.velocity.x;
    this.velocity.y -= (1 - friction) * this.game.clockTick * this.velocity.y;
};

Person.prototype.getAge = function () {
    return this.age / 60;
}



function Male(game, mom, dad, x, y) {
    Person.call(this, game, mom, dad, x, y);
    this.gender = "male";
    this.colors = ["DodgerBlue", "SkyBlue", "White"];


}
Male.prototype = Object.create(Person.prototype);
Male.prototype.constructor = Male;

function Female(game, mom, dad, x, y) {
    Person.call(this, game, mom, dad, x, y);
    this.gender = "female";
    this.colors = ["Violet", "Thistle", "White"];

}

Female.prototype = Object.create(Person.prototype);
Female.prototype.constructor = Female;
