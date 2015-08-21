"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Tink = (function () {
  function Tink(PIXI, element) {
    var scale = arguments[2] === undefined ? 1 : arguments[2];

    _classCallCheck(this, Tink);

    //Add element and scale properties
    this.element = element;
    this.scale = scale;

    //An array to store all the draggable sprites
    this.draggableSprites = [];

    //An array to store all the pointer objects
    //(there will usually just be one)
    this.pointers = [];

    //An array to store all the buttons and button-like
    //interactive sprites
    this.buttons = [];

    //A local PIXI reference
    this.PIXI = PIXI;

    //Aliases for Pixi objects
    this.TextureCache = this.PIXI.utils.TextureCache;
    this.MovieClip = this.PIXI.extras.MovieClip;
    this.Texture = this.PIXI.Texture;
  }

  _createClass(Tink, [{
    key: "makeDraggable",

    //`makeDraggable` lets you make a drag-and-drop sprite by pushing it
    //into the `draggableSprites` array
    value: function makeDraggable() {
      var _this = this;

      for (var _len = arguments.length, sprites = Array(_len), _key = 0; _key < _len; _key++) {
        sprites[_key] = arguments[_key];
      }

      sprites.forEach(function (sprite) {
        _this.draggableSprites.push(sprite);
        sprite.draggable = true;
      });
    }
  }, {
    key: "makeUndraggable",

    //`makeUndraggable` removes the sprite from the `draggableSprites`
    //array
    value: function makeUndraggable() {
      var _this2 = this;

      for (var _len2 = arguments.length, sprites = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        sprites[_key2] = arguments[_key2];
      }

      sprites.forEach(function (sprite) {
        _this2.draggableSprites.splice(_this2.draggableSprites.indexOf(sprite), 1);
        sprite.undraggable = false;
      });
    }
  }, {
    key: "makePointer",
    value: function makePointer() {
      var element = arguments[0] === undefined ? this.element : arguments[0];
      var scale = arguments[1] === undefined ? this.scale : arguments[1];

      //Get a reference to Tink's global `draggableSprites` array
      var draggableSprites = this.draggableSprites;

      //Get a reference to Tink's `addGlobalPositionProperties` method
      var addGlobalPositionProperties = this.addGlobalPositionProperties;

      //The pointer object will be returned by this function
      var pointer = Object.defineProperties({
        element: element,
        scale: scale,

        //Private x and y properties
        _x: 0,
        _y: 0,

        //Booleans to track the pointer state
        isDown: false,
        isUp: true,
        tapped: false,

        //Properties to help measure the time between up and down states
        downTime: 0,
        elapsedTime: 0,

        //Optional `press`,`release` and `tap` methods
        press: undefined,
        release: undefined,
        tap: undefined,

        //A `dragSprite` property to help with drag and drop
        dragSprite: null,

        //The drag offsets to help drag sprites
        dragOffsetX: 0,
        dragOffsetY: 0,

        //The pointer's mouse `moveHandler`
        moveHandler: function moveHandler(event) {

          //Get the element that's firing the event
          var element = event.target;

          //Find the pointer’s x and y position (for mouse).
          //Subtract the element's top and left offset from the browser window
          this._x = event.pageX - element.offsetLeft;
          this._y = event.pageY - element.offsetTop;

          //Prevent the event's default behavior
          event.preventDefault();
        },

        //The pointer's `touchmoveHandler`
        touchmoveHandler: function touchmoveHandler(event) {
          var element = event.target;

          //Find the touch point's x and y position
          this._x = event.targetTouches[0].pageX - element.offsetLeft;
          this._y = event.targetTouches[0].pageY - element.offsetTop;
          event.preventDefault();
        },

        //The pointer's `downHandler`
        downHandler: function downHandler(event) {

          //Set the down states
          this.isDown = true;
          this.isUp = false;
          this.tapped = false;

          //Capture the current time
          this.downTime = Date.now();

          //Call the `press` method if it's been assigned
          if (this.press) this.press();
          event.preventDefault();
        },

        //The pointer's `touchstartHandler`
        touchstartHandler: function touchstartHandler(event) {
          var element = event.target;

          //Find the touch point's x and y position
          this._x = event.targetTouches[0].pageX - element.offsetLeft;
          this._y = event.targetTouches[0].pageY - element.offsetTop;

          //Set the down states
          this.isDown = true;
          this.isUp = false;
          this.tapped = false;

          //Capture the current time
          this.downTime = Date.now();

          //Call the `press` method if it's been assigned
          if (this.press) this.press();
          event.preventDefault();
        },

        //The pointer's `upHandler`
        upHandler: function upHandler(event) {

          //Figure out how much time the pointer has been down
          this.elapsedTime = Math.abs(this.downTime - Date.now());

          //If it's less than 200 milliseconds, it must be a tap or click
          if (this.elapsedTime <= 200 && this.tapped === false) {
            this.tapped = true;

            //Call the `tap` method if it's been assigned
            if (this.tap) this.tap();
          }
          this.isUp = true;
          this.isDown = false;

          //Call the `release` method if it's been assigned
          if (this.release) this.release();
          event.preventDefault();
        },

        //The pointer's `touchendHandler`
        touchendHandler: function touchendHandler(event) {

          //Figure out how much time the pointer has been down
          this.elapsedTime = Math.abs(this.downTime - Date.now());

          //If it's less than 200 milliseconds, it must be a tap or click
          if (this.elapsedTime <= 200 && this.tapped === false) {
            this.tapped = true;

            //Call the `tap` method if it's been assigned
            if (this.tap) this.tap();
          }
          this.isUp = true;
          this.isDown = false;

          //Call the `release` method if it's been assigned
          if (this.release) this.release();
          event.preventDefault();
        },

        //`hitTestSprite` figures out if the pointer is touching a sprite
        hitTestSprite: function hitTestSprite(sprite) {

          //Add global `gx` and `gy` properties to the sprite if they
          //don't already exist
          addGlobalPositionProperties(sprite);

          //The `hit` variable will become `true` if the pointer is
          //touching the sprite and remain `false` if it isn't
          var hit = false;

          //Is the sprite rectangular?
          if (!sprite.circular) {

            //Get the position of the sprite's edges using global
            //coordinates
            var left = sprite.gx,
                right = sprite.gx + sprite.width,
                _top = sprite.gy,
                bottom = sprite.gy + sprite.height;

            //Find out if the pointer is intersecting the rectangle.
            //`hit` will become `true` if the pointer is inside the
            //sprite's area
            hit = this.x > left && this.x < right && this.y > _top && this.y < bottom;
          }

          //Is the sprite circular?
          else {

            //Find the distance between the pointer and the
            //center of the circle
            var vx = this.x - (sprite.gx + sprite.width / 2),
                vy = this.y - (sprite.gy + sprite.width / 2),
                distance = Math.sqrt(vx * vx + vy * vy);

            //The pointer is intersecting the circle if the
            //distance is less than the circle's radius
            hit = distance < sprite.width / 2;
          }
          return hit;
        }
      }, {
        x: { //The public x and y properties are divided by the scale. If the
          //HTML element that the pointer is sensitive to (like the canvas)
          //is scaled up or down, you can change the `scale` value to
          //correct the pointer's position values

          get: function () {
            return this._x / this.scale;
          },
          configurable: true,
          enumerable: true
        },
        y: {
          get: function () {
            return this._y / this.scale;
          },
          configurable: true,
          enumerable: true
        },
        centerX: {

          //Add `centerX` and `centerY` getters so that we
          //can use the pointer's coordinates with easing
          //and collision functions

          get: function () {
            return this.x;
          },
          configurable: true,
          enumerable: true
        },
        centerY: {
          get: function () {
            return this.y;
          },
          configurable: true,
          enumerable: true
        },
        position: {

          //`position` returns an object with x and y properties that
          //contain the pointer's position

          get: function () {
            return { x: this.x, y: this.y };
          },
          configurable: true,
          enumerable: true
        },
        cursor: {

          //Add a `cursor` getter/setter to change the pointer's cursor
          //style. Values can be "pointer" (for a hand icon) or "auto" for
          //an ordinary arrow icon.

          get: function (value) {
            return this.element.style.cursor;
          },
          set: function (value) {
            this.element.style.cursor = value;
          },
          configurable: true,
          enumerable: true
        }
      });

      //Bind the events to the handlers
      //Mouse events
      element.addEventListener("mousemove", pointer.moveHandler.bind(pointer), false);
      element.addEventListener("mousedown", pointer.downHandler.bind(pointer), false);

      //Add the `mouseup` event to the `window` to
      //catch a mouse button release outside of the canvas area
      window.addEventListener("mouseup", pointer.upHandler.bind(pointer), false);

      //Touch events
      element.addEventListener("touchmove", pointer.touchmoveHandler.bind(pointer), false);
      element.addEventListener("touchstart", pointer.touchstartHandler.bind(pointer), false);

      //Add the `touchend` event to the `window` object to
      //catch a mouse button release outside of the canvas area
      window.addEventListener("touchend", pointer.touchendHandler.bind(pointer), false);

      //Disable the default pan and zoom actions on the `canvas`
      element.style.touchAction = "none";

      //Add the pointer to Tink's global `pointers` array
      this.pointers.push(pointer);

      //Return the pointer
      return pointer;
    }
  }, {
    key: "addGlobalPositionProperties",

    //Many of Tink's objects, like pointers, use collision
    //detection using the sprites' global x and y positions. To make
    //this easier, new `gx` and `gy` properties are added to sprites
    //that reference Pixi sprites' `getGlobalPosition()` values.
    value: function addGlobalPositionProperties(sprite) {
      if (sprite.gx === undefined) {
        Object.defineProperty(sprite, "gx", {
          get: function get() {
            return sprite.getGlobalPosition().x;
          }
        });
      }

      if (sprite.gy === undefined) {
        Object.defineProperty(sprite, "gy", {
          get: function get() {
            return sprite.getGlobalPosition().y;
          }
        });
      }
    }
  }, {
    key: "updateDragAndDrop",

    //A method that implments drag-and-drop functionality
    //for each pointer
    value: function updateDragAndDrop(draggableSprites) {

      //Create a pointer if one doesn't already exist
      if (this.pointers.length === 0) {
        this.makePointer(this.element, this.scale);
      }

      //Loop through all the pointers in Tink's global `pointers` array
      //(there will usually just be one, but you never know)
      this.pointers.forEach(function (pointer) {

        //Check whether the pointer is pressed down
        if (pointer.isDown) {

          //You need to capture the co-ordinates at which the pointer was
          //pressed down and find out if it's touching a sprite

          //Only run pointer.code if the pointer isn't already dragging
          //sprite
          if (pointer.dragSprite === null) {

            //Loop through the `draggableSprites` in reverse to start searching at the bottom of the stack
            for (var i = draggableSprites.length - 1; i > -1; i--) {

              //Get a reference to the current sprite
              var sprite = draggableSprites[i];

              //Check for a collision with the pointer using `hitTestSprite`
              if (pointer.hitTestSprite(sprite) && sprite.draggable) {

                //Calculate the difference between the pointer's
                //position and the sprite's position
                pointer.dragOffsetX = pointer.x - sprite.gx;
                pointer.dragOffsetY = pointer.y - sprite.gy;

                //Set the sprite as the pointer's `dragSprite` property
                pointer.dragSprite = sprite;

                //The next two lines re-order the `sprites` array so that the
                //selected sprite is displayed above all the others.
                //First, splice the sprite out of its current position in
                //its parent's `children` array
                var children = sprite.parent.children;
                children.splice(children.indexOf(sprite), 1);

                //Next, push the `dragSprite` to the end of its `children` array so that it's
                //displayed last, above all the other sprites
                children.push(sprite);

                //Reorganize the `draggableSpites` array in the same way
                draggableSprites.splice(draggableSprites.indexOf(sprite), 1);
                draggableSprites.push(sprite);

                //Break the loop, because we only need to drag the topmost sprite
                break;
              }
            }
          }

          //If the pointer is down and it has a `dragSprite`, make the sprite follow the pointer's
          //position, with the calculated offset
          else {
            pointer.dragSprite.x = pointer.x - pointer.dragOffsetX;
            pointer.dragSprite.y = pointer.y - pointer.dragOffsetY;
          }
        }

        //If the pointer is up, drop the `dragSprite` by setting it to `null`
        if (pointer.isUp) {
          pointer.dragSprite = null;
        }

        //Change the mouse arrow pointer to a hand if it's over a
        //draggable sprite
        draggableSprites.some(function (sprite) {
          if (pointer.hitTestSprite(sprite) && sprite.draggable) {
            pointer.cursor = "pointer";
            return true;
          } else {
            pointer.cursor = "auto";
            return false;
          }
        });
      });
    }
  }, {
    key: "makeInteractive",
    value: function makeInteractive(o) {

      //The `press`,`release`, `over`, `out` and `tap` methods. They're `undefined`
      //for now, but they can be defined in the game program
      o.press = o.press || undefined;
      o.release = o.release || undefined;
      o.over = o.over || undefined;
      o.out = o.out || undefined;
      o.tap = o.tap || undefined;

      //The `state` property tells you the button's
      //current state. Set its initial state to "up"
      o.state = "up";

      //The `action` property tells you whether its being pressed or
      //released
      o.action = "";

      //The `pressed` and `hoverOver` Booleans are mainly for internal
      //use in this code to help figure out the correct state.
      //`pressed` is a Boolean that helps track whether or not
      //the sprite has been pressed down
      o.pressed = false;

      //`hoverOver` is a Boolean which checks whether the pointer
      //has hovered over the sprite
      o.hoverOver = false;

      //tinkType is a string that will be set to "button" if the
      //user creates an object using the `button` function
      o.tinkType = "";

      //Add the sprite to the global `buttons` array so that it can
      //be updated each frame in the `updateButtons method
      this.buttons.push(o);
    }
  }, {
    key: "updateButtons",

    //The `updateButtons` method will be called each frame
    //inside the game loop. It updates all the button-like sprites
    value: function updateButtons() {
      var _this3 = this;

      //Create a pointer if one doesn't already exist
      if (this.pointers.length === 0) {
        this.makePointer(this.element, this.scale);
      }

      //Loop through all the button-like sprites that were created
      //using the `makeInteractive` method
      this.buttons.forEach(function (o) {

        //Loop through all of Tink's pointers (there will usually
        //just be one)
        _this3.pointers.forEach(function (pointer) {

          //Figure out if the pointer is touching the sprite
          var hit = pointer.hitTestSprite(o);

          //1. Figure out the current state
          if (pointer.isUp) {

            //Up state
            o.state = "up";

            //Show the first image state frame, if this is a `Button` sprite
            if (o.tinkType === "button") o.gotoAndStop(0);
          }

          //If the pointer is touching the sprite, figure out
          //if the over or down state should be displayed
          if (hit) {

            //Over state
            o.state = "over";

            //Show the second image state frame if this sprite has
            //3 frames and it's a `Button` sprite
            if (o.totalFrames && o.totalFrames === 3 && o.tinkType === "button") {
              o.gotoAndStop(1);
            }

            //Down state
            if (pointer.isDown) {
              o.state = "down";

              //Show the third frame if this sprite is a `Button` sprite and it
              //has only three frames, or show the second frame if it
              //only has two frames
              if (o.tinkType === "button") {
                if (o.totalFrames === 3) {
                  o.gotoAndStop(2);
                } else {
                  o.gotoAndStop(1);
                }
              }
            }

            //Change the pointer icon to a hand
            pointer.cursor = "pointer";
          } else {
            pointer.cursor = "auto";
          }

          //Perform the correct interactive action

          //a. Run the `press` method if the sprite state is "down" and
          //the sprite hasn't already been pressed
          if (o.state === "down") {
            if (!o.pressed) {
              if (o.press) o.press();
              o.pressed = true;
              o.action = "pressed";
            }
          }

          //b. Run the `release` method if the sprite state is "over" and
          //the sprite has been pressed
          if (o.state === "over") {
            if (o.pressed) {
              if (o.release) o.release();
              o.pressed = false;
              o.action = "released";
              //If the pointer was tapped and the user assigned a `tap`
              //method, call the `tap` method
              if (pointer.tapped && o.tap) o.tap();
            }

            //Run the `over` method if it has been assigned
            if (!o.hoverOver) {
              if (o.over) o.over();
              o.hoverOver = true;
            }
          }

          //c. Check whether the pointer has been released outside
          //the sprite's area. If the button state is "up" and it's
          //already been pressed, then run the `release` method.
          if (o.state === "up") {
            if (o.pressed) {
              if (o.release) o.release();
              o.pressed = false;
              o.action = "released";
            }

            //Run the `out` method if it has been assigned
            if (o.hoverOver) {
              if (o.out) o.out();
              o.hoverOver = false;
            }
          }
        });
      });
    }
  }, {
    key: "button",

    //A function that creates a sprite with 3 frames that
    //represent the button states: up, over and down
    value: function button(source) {
      var x = arguments[1] === undefined ? 0 : arguments[1];
      var y = arguments[2] === undefined ? 0 : arguments[2];

      //The sprite object that will be returned
      var o = undefined;

      //Is it an array of frame ids or textures?
      if (typeof source[0] === "string") {

        //They're strings, but are they pre-existing texture or
        //paths to image files?
        //Check to see if the first element matches a texture in the
        //cache
        if (this.TextureCache[source[0]]) {

          //It does, so it's an array of frame ids
          o = this.MovieClip.fromFrames(source);
        } else {

          //It's not already in the cache, so let's load it
          o = this.MovieClip.fromImages(source);
        }
      }

      //If the `source` isn't an array of strings, check whether
      //it's an array of textures
      else if (source[0] instanceof this.Texture) {

        //Yes, it's an array of textures.
        //Use them to make a MovieClip o
        o = new this.MovieClip(source);
      }

      //Add interactive properties to the button
      this.makeInteractive(o);

      //Set the `tinkType` to "button"
      o.tinkType = "button";

      //Position the button
      o.x = x;
      o.y = y;

      //Return the new button sprite
      return o;
    }
  }, {
    key: "update",

    //Run the `udpate` function in your game loop
    //to update all of Tink's interactive objects
    value: function update() {

      //Update the drag and drop system
      if (this.draggableSprites.length !== 0) this.updateDragAndDrop(this.draggableSprites);

      //Update the buttons and button-like interactive sprites
      if (this.buttons.length !== 0) this.updateButtons();
    }
  }, {
    key: "keyboard",

    /*
    `keyboard` is a method that listens for and captures keyboard events. It's really
    just a convenient wrapper function for HTML `keyup` and `keydown` events so that you can keep your application code clutter-free and easier to write and read.
     Here's how to use the `keyboard` method. Create a new keyboard object like this:
    ```js
    let keyObject = keyboard(asciiKeyCodeNumber);
    ```
    It's one argument is the ASCII key code number of the keyboard key
    that you want to listen for. [Here's a list of ASCII key codes you can
    use](http://www.asciitable.com).
    Then assign `press` and `release` methods to the keyboard object like this:
    ```js
    keyObject.press = () => {
      //key object pressed
    };
    keyObject.release = () => {
      //key object released
    };
    ```
    Keyboard objects also have `isDown` and `isUp` Boolean properties that you can use to check the state of each key. 
    */
    value: function keyboard(keyCode) {
      var key = {};
      key.code = keyCode;
      key.isDown = false;
      key.isUp = true;
      key.press = undefined;
      key.release = undefined;

      //The `downHandler`
      key.downHandler = function (event) {
        if (event.keyCode === key.code) {
          if (key.isUp && key.press) key.press();
          key.isDown = true;
          key.isUp = false;
        }
        event.preventDefault();
      };

      //The `upHandler`
      key.upHandler = function (event) {
        if (event.keyCode === key.code) {
          if (key.isDown && key.release) key.release();
          key.isDown = false;
          key.isUp = true;
        }
        event.preventDefault();
      };

      //Attach event listeners
      window.addEventListener("keydown", key.downHandler.bind(key), false);
      window.addEventListener("keyup", key.upHandler.bind(key), false);

      //Return the key object
      return key;
    }
  }]);

  return Tink;
})();
//# sourceMappingURL=tink.js.map