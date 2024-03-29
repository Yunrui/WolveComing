// combine.js
// this file for combining entities
(function (app) {

    // Why do we need class? All data are static!!!!
    var Config = Class.extend({
        init: function(type, possibility, imgName, promotion, score) {
            this.type = type;
            this.possibility = possibility;
            this.imgName = imgName;
            this.promotion = promotion;
            this.score = score;
        },
    });

    var Beetle = Config.extend({
        init: function (promotion) {
            this._super("beetle", 7500, "beetle", promotion, 0);
        },
    });

    var Bee = Config.extend({
        init: function (promotion) {
            this._super("bee", 1875, "bee", promotion, 0);
        },
    });

    var Bird = Config.extend({
        init: function (promotion) {
            this._super("bird", 470, "bird", promotion, 2);
        },
    });

    var Rabbit = Config.extend({
        init: function (promotion) {
            this._super("rabbit", 120, "rabbit", promotion, 4);
        },
    });

    var Sheep = Config.extend({
        init: function (promotion) {
            this._super("sheep", 25, "sheep", promotion, 8);
        },
    });

    var Donkey = Config.extend({
        init: function (promotion) {
            this._super("donkey", 7, "donkey", promotion, 32);
        },
    });

    var Panda = Config.extend({
        init: function (promotion) {
            this._super("panda", 2, "panda", promotion, 64);
        },
    });

    var Bull = Config.extend({
        init: function (promotion) {
            this._super("bull", 1, "bull", promotion, 128);
        },
    });

    var Lion = Config.extend({
        init: function (promotion) {
            this._super("lion", 0, "lion", promotion, 256);
        },
    });

    var Elephant = Config.extend({
        init: function (promotion) {
            this._super("elephant", 0, "elephant", promotion, 512);
        },
    });

    var Whale = Config.extend({
        init: function (promotion) {
            this._super("whale", 0, "whale", promotion, 1024);
        },
    });

    var Bomb = Config.extend({
        init: function () {
            this._super("bomb", 30, "bomb", undefined, 0);
        },
    });

    var Blocker = Config.extend({
        init: function () {
            this._super("blocker", 50, "blocker", undefined, 0);
        }
    });


    var Combine = function () {
        this.entities = [];

        var whale = new Whale();
        var elephant = new Elephant(whale);
        var lion = new Lion(elephant);
        var bull = new Bull(lion);
        var panda = new Panda(bull);
        var donkey = new Donkey(panda);
        var sheep = new Sheep(donkey);
        var rabbit = new Rabbit(sheep);
        var bird = new Bird(rabbit);
        var bee = new Bee(bird);
        var beetle = new Beetle(bee);

        this.entities.push(beetle);
        this.entities.push(bee);
        this.entities.push(bird);
        this.entities.push(rabbit);
        this.entities.push(sheep);
        this.entities.push(donkey);
        this.entities.push(panda);
        this.entities.push(bull);
        this.entities.push(lion);
        this.entities.push(elephant);
        this.entities.push(whale);
        this.entities.push(new Bomb());
        this.entities.push(new Blocker());
    };

    Combine.prototype.next = function () {
        var
            totalNumber = 0,
            number = 0,
            sum = 0;

        for (var i = 0; i < this.entities.length; i++) {
            totalNumber += this.entities[i].possibility;
        }

        number = parseInt((Math.random() * totalNumber));

        for (var i = 0; i < this.entities.length; i++) {
            sum += this.entities[i].possibility;

            if (number <= sum) {
                return this.entities[i];
            }
        }
    };

    app.combine = new Combine();
    app.combine.Bomb = Bomb;
    app.combine.Blocker = Blocker;
}(app));