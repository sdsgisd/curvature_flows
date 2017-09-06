var Vertex = function(xy) {
    this.pos = []
    this.pos[0] = xy[0]
    this.pos[1] = xy[1]

    this.tangent;
}

var Curve = function(vertices) {
    this.vertices = vertices;

    if (typeof this.vertices !== "undefined" && vertices.length > 0) {
        this.init();
    }
}

Curve.prototype.draw = function(temp_curve) {
    target_vertices = this.vertices;

    if (target_vertices == undefined || target_vertices.length == 0) {
        return;
    }

    if (typeof TOP_PAGE === "undefined") {
    ctx.strokeStyle = 'white'; // mouse.color;
    }
    else{
      ctx.strokeStyle = 'black';
    }
    // ctx.lineWidth =3;

    ctx.beginPath();

    ctx.moveTo(target_vertices[0].pos[0], target_vertices[0].pos[1]);

    for (i = 1; i < target_vertices.length; ++i) {
        ctx.lineTo(target_vertices[i].pos[0], target_vertices[i].pos[1]);

    }

    ctx.stroke();

    if (temp_curve) {

        ctx.strokeStyle = 'LightBlue'

    } else {}

    ctx.beginPath();

    ctx.moveTo(target_vertices[target_vertices.length - 1].pos[0], target_vertices[target_vertices.length - 1].pos[1]);

    ctx.lineTo(target_vertices[0].pos[0], target_vertices[0].pos[1]);

    ctx.stroke();
};

var t0 = 0.0; //Not available for pararell processing
var intersect_count = 0;  //Not available for pararell processing

//
function intersect(radius, center, start_p, end_p, intersection) {

    ++intersect_count;

    var dir = sub(end_p, start_p);
    var length = norm(dir);
    if (length != 0) {
        dir = div(dir, length);
    }
    var start_to_center = sub(center, start_p)
    const Discriminant = pow(dot(dir, start_to_center), 2) - pow(norm(start_to_center), 2) + pow(radius, 2);

    if (Discriminant < 0) {
        intersection = [];

        t0 = 0.0;
        return false;
    } else {
        var t1 = dot(dir, start_to_center) - sqrt(Discriminant);
        var t2 = dot(dir, start_to_center) + sqrt(Discriminant);

        if (t1 > t0) {
            if (length > t1) {
                t0 = t1;
                var intersect = add(start_p, mul(t1, dir));

                if (!isFinite(intersect[0]) || !isFinite(intersect[1])) {
                    console.error("infinite value in \"intersection\" method.");
                }
                intersection[0] = intersect[0];
                intersection[1] = intersect[1];

                return true;
            } else {

            }
        } else {

            if (t2 > t0) {
                t0 = t2;
            }

            if (length < t2) {
                t0 = 0.0;

                return false;
            }
            var intersect = add(start_p, mul(t2, dir));
            if (!isFinite(intersect[0]) || !isFinite(intersect[1])) {
                console.error("infinite value in \"intersection\" method.");
            }
            intersection[0] = intersect[0];
            intersection[1] = intersect[1];

            return true;
        }
        t0 = 0.0
        return false;
    }

    return false;
}

//Normalize so that the lengths of the edges are uniform.
//This is indispensable for hyperbolic flows.
Curve.prototype.normalize = function() {
    var n_ev = this.vertices.length;

    if (typeof n_ev === "undefined" || !n_ev > 0) {
        return;
    }

    var new_vertices = [];
    var edge_counted = 0;
    var new_vi = 0;
    var hit = false;

    //randomly choose which of the old vertices is to be the first of the new vertices.
    var ei = Math.floor(Math.random() * n_ev);

    var first_vertex = new Vertex(this.vertices[ei].pos);
    if (Curve_Type.With_Velocity) {
        first_vertex.velocity = this.vertices[ei].velocity
    }
    new_vertices.push(first_vertex)

    next_position = []

    while (true) {
        var next_ei = (ei + 1) % n_ev;

        if (this.vertices[next_ei] == undefined) {
            console.error("Next edge not found in \"normalize\" method.");
        }
        var hit = intersect(dl, new_vertices[new_vi].pos, this.vertices[ei].pos, this.vertices[next_ei].pos, next_position);

        if (hit) {

            if (Curve_Type.With_Velocity) {

                const interpolate_from_two_veriteces = 1;
                const VERY_LARGE = 1e5;

                if (interpolate_from_two_veriteces) {
                    var minDist = VERY_LARGE;
                    var secondMinDist = VERY_LARGE;

                    var closestIndex = -1;
                    for (var i = 0; i < n_ev; ++i) {
                        var vertex = this.vertices[i];
                        const dist = norm(sub(vertex.pos, next_position));

                        if (dist < secondMinDist) {
                            if (dist < minDist) {
                                secondMinDist = minDist;
                                minDist = dist;
                                secondClosestIndex = closestIndex;
                                closestIndex = i;
                            } else {
                                secondClosestIndex = i;
                                secondMinDist = dist;
                            }
                        }
                    }

                    var velocity = div(add(mul(secondMinDist, this.vertices[closestIndex].velocity), mul(minDist, this.vertices[secondClosestIndex].velocity)), minDist + secondMinDist);

                    var new_vertex = new Vertex(next_position);
                    new_vertex.velocity = velocity;
                } else {
                    var minDist = VERY_LARGE;
                    var closestIndex = -1;
                    for (var i = 0; i < n_ev; ++i) {
                        var vertex = this.vertices[i];
                        const dist = norm(sub(vertex.pos, next_position));
                        if (dist < minDist) {
                            minDist = dist;
                            closestIndex = i;
                        }
                    }

                    var new_vertex = new Vertex(next_position);
                    new_vertex.velocity = this.vertices[closestIndex].velocity;
                }

            } else {
                var new_vertex = new Vertex(next_position);

            }

            new_vertices.push(new_vertex);

            ++new_vi;

        } else {

            ++edge_counted;
            ei = next_ei; //(ei + 1) % n_ev;

            if (edge_counted >= n_ev) {

                //vi==(int)newVertices.size()-1;である。
                //最後の辺が近くにありすぎてnanになること対策
                const VERYSMALL_FOR_NORMALIZE = 1e-5;

                if (norm(sub(new_vertices[new_vi].pos, new_vertices[0].pos)) < VERYSMALL_FOR_NORMALIZE) {

                    //下の別の書き方。
                    //                    std::vector<Vertex*>::iterator temp=
                    //                    newVertices.erase(newVertices.end()-1);
                    //                    devare *temp;

                    new_vertices.pop();

                    --new_vi;
                }

                this.vertices = new_vertices;

                return;

            }
        }

    }

}

Curve.prototype.compute_tangents = function() {

    var n_ev = this.vertices.length;
    if (typeof n_ev === "undefined" || !n_ev > 0) {
        return;
    }
    for (i = 0; i < n_ev; ++i) {
        var prev = (i - 1 + n_ev) % n_ev;
        var next = (i + 1) % n_ev;
        this.vertices[i].tangent = sub(this.vertices[next].pos, this.vertices[prev].pos)
    }

}

Curve.prototype.compute_normals = function() {

    var n_ev = this.vertices.length;

    if (typeof n_ev === "undefined" || !n_ev > 0) {
        return;
    }

    //Tangents must have been computed.
    var zeroth_tangent = this.vertices[0].tangent;
    console.assert(typeof zeroth_tangent != "undefined")

    Rotation = [
        [0, -1],
        [1, 0]
    ];

    for (var i = 0; i < n_ev; i++) {
        var normal = dot(Rotation, this.vertices[i].tangent);

        var length = norm(normal);
        if (length != 0) {
            normal = div(normal, length);
        }
        this.vertices[i].normal = normal;
    }

}

Curve.prototype.draw_tangents = function() {

    var zeroth_tangent = this.vertices[0].tangent;
    if (typeof zeroth_tangent == "undefined") {
        return;
    }

    ctx.strokeStyle = 'blue'; // mouse.color;

    const draw_scale = 3;
    for (i = 0; i < target_vertices.length; ++i) {

        var vertex = target_vertices[i];

        ctx.beginPath();

        ctx.moveTo(vertex.pos[0], vertex.pos[1]);
        ctx.lineTo(vertex.pos[0] + draw_scale * vertex.tangent[0], vertex.pos[1] + draw_scale * vertex.tangent[1]);
        ctx.stroke();

    }

}

Curve.prototype.draw_normals = function() {

    var zeroth_tangent = this.vertices[0].normal;
    if (typeof zeroth_tangent == "undefined") {
        return;
    }

    ctx.strokeStyle = 'Red'; // mouse.color;

    const draw_scale = 50;
    for (i = 0; i < target_vertices.length; ++i) {

        var vertex = target_vertices[i];

        ctx.beginPath();

        ctx.moveTo(vertex.pos[0], vertex.pos[1]);
        ctx.lineTo(vertex.pos[0] + draw_scale * vertex.normal[0], vertex.pos[1] + draw_scale * vertex.normal[1]);
        ctx.stroke();

    }

}

Curve.prototype.compute_area_and_length = function(length, area) {
    var n_ev = this.vertices.length;
    this.length = 0
    this.area = 0
    for (var i = 0; i < n_ev; ++i) {
        const next = (i + 1) % n_ev;
        var mid_point = div(add(this.vertices[i].pos, this.vertices[next].pos), 2.0)
        var edge_vector = sub(this.vertices[next].pos, this.vertices[i].pos);
        var local_length = norm(edge_vector);
        edge_vector = div(edge_vector, local_length);

        Rotation = [
            [0, -1],
            [1, 0]
        ];
        var edge_normal = dot(Rotation, edge_vector);

        this.length += local_length;
        this.area += local_length * dot(mid_point, edge_normal);
    }

    this.area /= 2.0;

}

Curve.prototype.step = function() {
    dl = Math.max(this.length / Num_Max_Edge, Minimum_dl);
}

Curve.prototype.init = function() {
    this.normalize();
    this.compute_area_and_length();
    this.initial_area = this.area;
}
