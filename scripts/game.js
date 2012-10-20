// game.js
(function (window, document, app) {
    var b2Vec2 = Box2D.Common.Math.b2Vec2;

    function Game() {
        // get the drawing canvas and context of the game
        this.canvas = document.getElementById('surface');
        this.context = this.canvas.getContext('2d');

        // initialize some basic information about the game world
        this.screenWidth = this.canvas.width;
        this.screenHeight = this.canvas.height;
        this.fixLength = 100;
        this.totalGameTime = 0;

        // create a two dimentional array of entities to be updated and drawn
        this.entities = new Array(6);
        for (var i = 0; i < 6; i++) {
            this.entities[i] = new Array(6);
        }

        // create a Box2d world that will handle the physics
        app.util.Box2dUtil.createWorld(new b2Vec2(0, 0));

        /*
        // set up debug checkbox
        var debugContext = document.getElementById('debug').getContext('2d');
        var checkbox = document.getElementById('debugToggle');
        checkbox.addEventListener('click', function(e){
            app.util.Box2dUtil.toggleDebugDraw(debugContext, checkbox.checked);
        });
        */

        this.background = new app.entity.Background(600, 600);

        var self = this;
        var next = app.combine.next();
        var second = app.combine.next();
        var third = app.combine.next();
        this.updateComingQueue(next, second, third);

        $("#debug").bind("click", (function (e) {
            var
                offset = $("#debug").offset(),
                indexX = Math.floor((e.pageX - offset.left) / self.fixLength),
                indexY = Math.floor((e.pageY - offset.top) / self.fixLength),
                x = self.calculatePosition(indexX),
                y = self.calculatePosition(indexY),
                found = false,
                entity,
                position,
                goDeep,
                rc;

            entity = next;

            if (entity instanceof app.combine.Bomb) {
                self.removeEntities([{ indexX: indexX, indexY: indexY }]);
            }
            else if (entity instanceof app.combine.Blocker) {
                // find a random empty place, animation, and then put it there
                rc = self.findRandomEmptyCell();

                if (rc !== undefined) {
                    self.addEntity(rc.x, rc.y, new app.entity.Blocker(self.calculatePosition(rc.x), self.calculatePosition(rc.y), entity));
                }
            }
            else if (!(self.entities[indexX][indexY] instanceof app.entity.Animal)) {
                do {
                    // step one: find related
                    var group = self.findGroup(indexX, indexY, entity);
                    goDeep = false;

                    if (group.length >= 2 && entity.promotion !== undefined) {
                        // step two: remove related
                        self.removeEntities(group);
                        entity = entity.promotion;
                        goDeep = true;
                    }
                } while (goDeep);

                self.addEntity(indexX, indexY, new app.entity.Animal(x, y, entity));
            }
            else {
                return;
            }
            
            next = second;
            second = third;
            third = app.combine.next();
            self.updateComingQueue(next, second, third);
            $("#score").text(parseInt($("#score").text()) + entity.score);
        }));

        // after initialization, hook up to and start the dispatcher to begin calling updates
        app.util.dispatcher.register(this);
        app.util.dispatcher.start();
    }

    Game.prototype.calculatePosition = function (index) {
        return index * this.fixLength + this.fixLength / 2;
    }

    Game.prototype.findRandomEmptyCell = function () {
        //$TODO: optimize and cache empty list later
        var
            number = 0,
            empty = [];

        for (var i = 0; i < this.entities.length; i++) {
            for (var j = 0; j < this.entities[i].length; j++) {
                if (this.entities[i][j] === null || this.entities[i][j] === undefined) {
                    empty.push({ x: i, y: j });
                }
            }
        }

        if (empty.length > 0) {
            number = parseInt((Math.random() * empty.length));
            return empty[number];
        }
    }

    Game.prototype.updateComingQueue = function (next, second, third) {
        $("#nextEntity").attr("src", "img/" + next.imgName + ".png");
        $("#secondEntity").attr("src", "img/" + second.imgName + ".png");
        $("#thirdEntity").attr("src", "img/" + third.imgName + ".png");
    }

    Game.prototype.findGroup = function (x, y, entity) {
        var
            type = entity.type,
            map = new Array(6);

        for (var i = 0; i < 6; i++) {
             map[i] = new Array(6);
        }

        map[x][y] = true;
       

        return this.findNeighbor(x, y, map, entity);
    }

    Game.prototype.findNeighbor = function (x, y, map, entity) {
        var
            neighbor = [];

        // Left node
        if (x > 0) {
            neighbor = neighbor.concat(this.findNeighborCore(x - 1, y, entity, map));
        }

        if (x < 5) {
            neighbor = neighbor.concat(this.findNeighborCore(x + 1, y, entity, map));
        }

        if (y > 0) {
            neighbor = neighbor.concat(this.findNeighborCore(x, y - 1, entity, map));
        }

        if (y < 5) {
            neighbor = neighbor.concat(this.findNeighborCore(x, y + 1, entity, map));
        }

        return neighbor;
    }

    Game.prototype.findNeighborCore = function (x, y, entity, map) {

        var
            neighbor = [],
            tmp;
            
        if (map[x][y] !== true && this.entities[x][y] instanceof app.entity.Animal) {
            // mark that we have already test this point
            map[x][y] = true;

            if (entity.type === this.entities[x][y].type) {
                neighbor.push({ indexX: x, indexY: y });
                neighbor = neighbor.concat(this.findNeighbor(x, y, map, entity));
            }
        }
        return neighbor;
    }

    Game.prototype.addEntity = function(x, y, entity){
        this.entities[x][y] = entity;
    };

    Game.prototype.removeEntities = function (group) {
        for (var i = 0; i < group.length; i++) {
            this.entities[group[i].indexX][group[i].indexY] = null;
        }
    };

    // called by the dispatcher
    Game.prototype.update = function(time) {
        // update total game time
        this.totalGameTime += time.delta;

        // update the Box2d physics
        app.util.Box2dUtil.updateWorld(time.delta);

        // update each entity, passing in a time object that holds the delta time since last update,
        // the current time, and the previous update time
        for (var i = 0; i < this.entities.length; i++) {
            for (var j = 0; j < this.entities[i].length; j++) {
                if (this.entities[i][j] instanceof app.entity.GameEntity) {
                    this.entities[i][j].update(time);
                }
            }
        }

        // after update, draw everything
        this.draw();
    };

    Game.prototype.draw = function() {
        // clear our drawing context for a new draw
        this.context.clearRect(0, 0, this.screenWidth, this.screenHeight);

        this.background.draw(this.context);

        var entity;
        for (var i = 0; i < this.entities.length; i++) {
            for (var j = 0; j < this.entities[i].length; j++) {
                if (this.entities[i][j] instanceof app.entity.GameEntity) {
                    entity = this.entities[i][j];
                    if (entity.isVisible()) entity.draw(this.context);
                }
            }
        }
    };

    // app entry point: load assets, then on completion create a global instance of the game
    app.assets.load(function(){
        app.game = new Game();
    });

}(window, document, app));
