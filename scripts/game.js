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
        this.totalGameTime = 0;

        // create a two dimentional array of entities to be updated and drawn
        this.entities = new Array(6);
        for (var i = 0; i < 6; i++) {
            this.entities[i] = new Array(6);
        }

        // create a Box2d world that will handle the physics
        app.util.Box2dUtil.createWorld(new b2Vec2(0, 0));

        // set up debug checkbox
        var debugContext = document.getElementById('debug').getContext('2d');
        var checkbox = document.getElementById('debugToggle');
        checkbox.addEventListener('click', function(e){
            app.util.Box2dUtil.toggleDebugDraw(debugContext, checkbox.checked);
        });

        app.util.Box2dUtil.toggleDebugDraw(debugContext, true);

        // Begin 

        var self = this;
        $("#debug").bind ("click", (function (e) {
            var
                offset = $("#debug").offset(),
                indexX = Math.floor((e.pageX - offset.left) / 100),
                indexY = Math.floor((e.pageY - offset.top) / 100),
                x = indexX * 100 + 50,
                y = indexY * 100 + 50,
                found = false,
                entity,
                position;

            if (!(self.entities[indexX][indexY] instanceof app.entity.GameEntity)) {

                var insertEntity = new app.entity.Grass(x, y);
                // step one: find related
                var group = self.findGroup(indexX, indexY, insertEntity);
                
                if (group.length >= 2) {
                    // step two: remove related
                    self.removeEntities(group);
                }

                // step three: insert advanced
                self.addEntity(indexX, indexY, new app.entity.Grass(x, y));
            }
        }));
        // End

        // after initialization, hook up to and start the dispatcher to begin calling updates
        app.util.dispatcher.register(this);
        app.util.dispatcher.start();
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
            
        if (map[x][y] !== true && this.entities[x][y] instanceof app.entity.GameEntity) {
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
