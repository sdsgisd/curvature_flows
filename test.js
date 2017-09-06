test_compute_area_and_length = function() {
    reset();
    vertices = []
    var edge_length=canvas.width/2;//100;
    var offset_x=canvas.width/2-edge_length/2;
    var offset_y=canvas.height/2-edge_length/2;

    vertices.push(new Vertex([offset_x, offset_y]));
    vertices.push(new Vertex([offset_x,offset_y+ edge_length]));
    vertices.push(new Vertex([offset_x+edge_length, offset_y+edge_length]));
    vertices.push(new Vertex([offset_x+edge_length, offset_y]));


    curve = new Curve_Type(vertices);
    curve.compute_area_and_length();

    console.log("area:" + curve.area + ",length:" + curve.length)
    curves.push(curve)
}

Curve.prototype.class_test = function() {
    console.log(Curve_Type.Volume_Preserving)
}

function intersect_test() {
    var radius = 2;
    var center = [0, 0]
    var start_p = [0, 0]
    var end_p = [4, 0]
    var intersection = [];

    console.log(t0)

    console.log(intersection.length == 0)
    console.log("residue:" + (1 % 5))

    var hit = intersect(radius, center, start_p, end_p, intersection);
    console.log(t0)
    console.log(intersection.length == 0)
    console.log(hit + ":" + intersection)
}
