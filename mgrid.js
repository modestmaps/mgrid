(function(context) {
    // This isn't compatible with node.js,
    // so it exits before changing the environment
    if (typeof module !== "undefined") return;

    var transformProperty = (function(props) {
        if (!this.document) return; // node.js safety
        var style = document.documentElement.style;
        for (var i = 0; i < props.length; i++) {
            if (props[i] in style) {
                return props[i];
            }
        }
        return false;
    })(['transformProperty', 'WebkitTransform', 'OTransform', 'MozTransform', 'msTransform']);

    var reset = 'position:absolute;top:0px;left:0px;width:100%;height:100%;margin:0;padding:0;z-index:0;';
    var absolute = 'position:absolute;-webkit-user-select:none;' +
                '-webkit-user-drag:none;-moz-user-drag:none;-webkit-transform-origin:0 0;' +
                '-moz-transform-origin:0 0;-o-transform-origin:0 0;-ms-transform-origin:0 0;';
    var relative = 'position:relative;';

    function multiply(a, b) {
        var c = [];
        for (var i = 0; i < a.length && i < b.length; i++) {
            c.push(a[i] * b[i]);
        }
        return c;
    }

    // Create the mgrid object factory. This produces
    // mgrids and their scopes should be entirely contained
    // in the function closure.
    function mgrid() {
        var grid = {},
            // the container element - which is
            // appended inside of the parent element
            elem = document.createElement('div'),
            // cardinality of the tree. By
            // default, trees are quadtrees
            n = 2,
            // usually coordinates are square,
            // but we will be nice. x, y
            coordSize = [0, 256, 256],
            // an object containing references
            // to all contained zoom levels
            zooms = {};

        // start positioning chain.
        elem.style.cssText = relative;

        // set the parent element of the grid.
        // this is required for the effects to be
        // present on the DOM
        grid.parent = function(x) {
            if (!arguments.length) return x.parentNode;
            x.appendChild(elem);
            return grid;
        };

        grid.zoom = function(z) {
            if (!zooms[z]) {
                var s = 1 / Math.pow(n, z);
                zooms[z] = elem.appendChild(document.createElement('div'));
                zooms[z].style.cssText = reset;
                zooms[z].style[transformProperty + 'Origin'] = '0 0';
                zooms[z].style[transformProperty] = 'scale(' + s + ', ' + s + ')';
            }
            return zooms[z];
        };

        // Set a tile, or remove a tile if given null
        grid.tile = function(coord, elem) {
            var zelem = grid.zoom(coord[0]);
            var transformed_coord = multiply(coord, coordSize);
            elem.style.cssText = absolute;
            elem.style[transformProperty] = 'translate(' + transformed_coord[1] + 'px, ' + transformed_coord[2] + 'px)';
            zelem.appendChild(elem);
        };

        return grid;
    }

    context.mgrid = mgrid;
})(this);
