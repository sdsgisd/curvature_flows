MaxSaveImage = 500;
Mouse_Position_Info = false;
Evolving = false;
Draw_Tangents_and_Normals = false;
Num_Max_Edge = 200; //100;
surface_tension = 30.0; //1.0;
damp = 1.; //995; //.999; //0.995;1.0; //0.99;
dt = 0.1; //0.2;//0.2;
Minimum_dl = 4.0;
dl = Minimum_dl;

var Curve_Type; //Currently either of VPHMCF_Curve, HMCF_Curve, MCF_Curve, VPMCF_Curve, and Curve.

var equations = {

    "mean curvature flow": ["\\(  \\displaystyle   \\frac{d x}{ dt} = -H n\\)", ""],

    "volume preserving mean curvature flow": ["\\(  \\displaystyle   \\frac{d x}{ dt} = \\left( -H+ \\int _{\\partial \\Omega} H \\, ds \\Big/ \\int_{\\partial \\Omega} \\, ds  \\right) n \\)", ", where the second term preserves the enclosed area."],

    // "volume preserving mean curvature flow":"\\(  \\displaystyle   \\frac{d x}{ dt} = \\left( -H+\\frac{\\int _{\\scriptsize{\\partial \\Omega}} H \\, \\scriptsize{ds} }{\\int_{\\scriptsize{\\partial \\Omega}} \\, \\scriptsize{ds} } \\right) n\\)",

    // "volume preserving mean curvature flow":"\\(  \\displaystyle   \\frac{d x}{ dt} = \\left( -H+\\frac{\\int _{\\partial \\Omega} H \\, ds }{\\int_{\\partial \\Omega} \\, ds } \\right) n\\)",

    "hyperbolic mean curvature flow": ["\\(  \\displaystyle   \\frac{d^2 x}{ dt^2} = -H n\\)", ""],
    "volume preserving hyperbolic mean curvature flow": ["\\(  \\displaystyle   \\frac{d^2 x}{ dt^2} = \\left( -H + \\Delta p \\right)n\\)", ", where $\\Delta p(t)$ is a real value such that the enclosed area $A$ satisfies $\\displaystyle \\frac{d A}{dt}=0$."],

};

set_curvature_type = function(curve_type1, curve_type2, curve_string1, curve_string2) {
    if (Curve_Type != curve_type1) {
        Curve_Type = curve_type1;
        string_curve_type = curve_string1
    } else {
        Curve_Type = curve_type2;
        string_curve_type = curve_string2
    }

    if (document.getElementById("flow_type") != null) {
        document.getElementById("flow_type").innerHTML = "Current flow is <font color='brown'>" + string_curve_type + "</font>:<br><font color='darkblue'>" +
            equations[string_curve_type][0] + "</font>" + equations[string_curve_type][1];

        //Call MathJax dynamically to update the equations.
        MathJax.Hub.Typeset();

    }
}

set_curvature_type(VPHMCF_Curve, HMCF_Curve, "volume preserving hyperbolic mean curvature flow", "hyperbolic mean curvature flow");
Volume_Preserving = Curve_Type.Volume_Preserving;
With_Velocity = Curve_Type.With_Velocity;

var local_curve = new Curve_Type();
local_curve.vertices = [];

var curves = []

var canvas = $('canvas')[0];

var ctx = canvas.getContext('2d');
// ctx.scale(0.5,0.5)

var drawing = false;

var save_canvas_image = false;

var resize = function() {

    var dpr = window.devicePixelRatio || 1;
    var bsr = ctx.webkitBackingStorePixelRatio ||
        ctx.mozBackingStorePixelRatio ||
        ctx.msBackingStorePixelRatio ||
        ctx.oBackingStorePixelRatio ||
        ctx.backingStorePixelRatio || 1;
    var PIXEL_RATIO = dpr / bsr;

    canvas.height = $('canvas').height() * PIXEL_RATIO;
    canvas.width = $('canvas').width() * PIXEL_RATIO;

};

function run_and_stop() {
    if (!Evolving) {
        Evolving = setInterval(step, 15);
    } else {
        clearInterval(Evolving)
        Evolving = false;
    }
};

function save_canvas(filename) {

    var a = document.createElement('a');
    var e = document.createEvent('MouseEvent');

    a.download = filename;

    a.href = canvas.toDataURL();

    e.initEvent("click", true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
    a.dispatchEvent(e);

}

$(window).on('load', function() {

    resize();

    init();

    setInterval(draw, 15);

    document.onkeydown = function(e) {
        console.log("input key number = " + e.keyCode)

        if (e.keyCode == 87) { //w

            if (e.shiftKey) { //shift+w
                save_canvas("bubble_snapshot.png");
            } else { //only w
                save_canvas_image = !save_canvas_image;
            }

        }

        if (e.keyCode == 77) { //m

            reset();
            set_curvature_type(MCF_Curve, VPMCF_Curve, "mean curvature flow", "volume preserving mean curvature flow");
            dt = 1.0;

        }

        if (e.keyCode == 72) { //h
            reset();
            set_curvature_type(HMCF_Curve, VPHMCF_Curve, "hyperbolic mean curvature flow", "volume preserving hyperbolic mean curvature flow");

            dt = 0.1;
        }

        if (e.keyCode == 32) { //space
            run_and_stop();
        }

        if (e.keyCode == 83) { //s

            step()
        }

        if (e.keyCode == 82) { //r

            reset()

        }

        if (e.keyCode == 84) { //t

            tangents();
            normals();

            Draw_Tangents_and_Normals = !Draw_Tangents_and_Normals;

        }

    }
});

function reset() {

    if (typeof TOP_PAGE === "undefined") {
        clearInterval(Evolving);
        Evolving = false;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    local_curve.vertices = [];
    curves = [];
}

function init() {

    if (!canvas || !canvas.getContext) {
        return false;
    }

    var mouse = {
        startX: 0,
        startY: 0,
        x: 0,
        y: 0,
        color: "black",
    };
    var borderWidth = 0;

    canvas.onmousemove = mousemove_func;

    function mousemove_func(e) {

        //Get mouse position.
        var rect = canvas.getBoundingClientRect();

        mouse.x = (e.clientX - rect.left) / (rect.right - rect.left) * canvas.width,
            mouse.y = (e.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height

        if (Mouse_Position_Info) {
            if (document.getElementById("mouse_position_info") != null) {
                document.getElementById("mouse_position_info").innerHTML =
                    " clientX = " + Math.floor(e.clientX) + "px" +
                    " clientY = " + Math.floor(e.clientY) + "px" + '<br>' +
                    " rect.left = " + Math.floor(rect.left) + "px" +
                    " rect.top = " + Math.floor(rect.top) + "px" + '<br><br>' +
                    " pageX = " + Math.floor(e.pageX) + "px" +
                    " pageY = " + Math.floor(e.pageY) + "px" + '<br>' +
                    ' offsetLeft = ' + Math.floor(canvas.offsetLeft) + "px" +
                    ' offsetTop = ' + Math.floor(canvas.offsetTop) + "px" + '<br><br>' +
                    " canvas_x = " + Math.floor(mouse.x) + "px" +
                    " canvas_y = " + Math.floor(mouse.y) + "px" + '<br>';
            }

        }

        if (drawing) {

            mouse.startX = mouse.x;
            mouse.startY = mouse.y;

            local_curve.vertices.push(new Vertex([mouse.x, mouse.y]))

        }
    }

    canvas.onmousedown = mousedown_func;

    function mousedown_func(e) {
        drawing = true;
        mouse.startX = mouse.x;
        mouse.startY = mouse.y;

    }

    canvas.onmouseup = mouseup_func;

    function mouseup_func(e) {
        drawing = false;

        curves.push(new Curve_Type(local_curve.vertices));

        local_curve.vertices = [];

    }
    canvas.addEventListener('mouseleave', function(e) {
        drawing = false;
    });

    $(canvas).on('touchstart', function(e) {
        mousedown_func(e.originalEvent.changedTouches[0]);
        return false;
    });

    $(canvas).on('touchmove', function(e) {
        mousemove_func(e.originalEvent.changedTouches[0]);
        return false;
    });

    $(canvas).on('touchend', function(e) {
        mouseup_func(e.originalEvent.changedTouches[0]);
        return false;
    });
}

function normalize() {
    curves.forEach(function(curve) {
        curve.normalize();
    });
}

function tangents() {
    curves.forEach(function(curve) {
        curve.compute_tangents();
    });
}

function normals() {
    curves.forEach(function(curve) {
        curve.compute_normals();
    });
}

function step() {

    if (save_canvas_image) {

        if (typeof image_counter === "undefined") {
            image_counter = 0;
        }

        save_canvas("image" + image_counter + ".png");
        image_counter++;
        if (image_counter > MaxSaveImage) {
            save_canvas_image = false;
        }

    }

    curves.forEach(function(curve) {
        curve.step();

    });

    if (!Volume_Preserving) {
        const minimum_area = 30;
        var n_curves = curves.length;
        eachcurve: for (var ci = 0; ci < n_curves; ++ci) {
            curves[ci].compute_area_and_length();
            if (Math.abs(curves[ci].area) < minimum_area) {
                curves.splice(ci, 1);
                --ci;
                --n_curves;
            }
        }
    }

    if (Draw_Tangents_and_Normals) {
        curves.forEach(function(curve) {
            curve.compute_tangents();
            curve.compute_normals();

        });
    }
}

function message_on_canvas(){
  //Write something if you want to show messages on the canvas.
}

function draw() {

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (typeof TOP_PAGE === "undefined") {
        ctx.fillStyle = 'black';
    } else {
        ctx.fillStyle = 'white';

    }
    ctx.fillRect(0, 0, canvas.width, canvas.height);


    message_on_canvas();

    if (drawing) {
        local_curve.draw(temp_curve = true);
    }

    curves.forEach(function(curve) {
        curve.draw();
        if (Draw_Tangents_and_Normals) {
            curve.draw_tangents();
            curve.draw_normals();
        }

    });

}
