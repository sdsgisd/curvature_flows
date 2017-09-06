HMCF_Curve = function(vertices) {
    Curve.call(this, vertices);
    HMCF_Curve.Volume_Preserving=false
    HMCF_Curve.With_Velocity=true;
    console.log("HMCF_Curve")

}

HMCF_Curve.prototype = Object.create(Curve.prototype, {value: {constructor: HMCF_Curve}});

HMCF_Curve.prototype.init=function(){

  this.vertices.forEach(function(vertex) {
      vertex.velocity=[0,0];
  });
  Curve.prototype.init.call(this);

}

HMCF_Curve.prototype.compute_curvature_normals = function() {
  var n_ev=this.vertices.length;
  for(var i=0;i<n_ev;++i){
      const prev=(i-1+n_ev)%n_ev;
      const next=(i+1)%n_ev;
      const p=this.vertices[i].pos;
      const q1=this.vertices[prev].pos;
      const q2=this.vertices[next].pos;

      const dist1=norm(sub(p,q1));
      const dist2=norm(sub(p,q2));

      const normal=add(mul(1/dist1,sub(p,q1)),mul(1/dist2,sub(p,q2)));
      this.vertices[i].normal=normal;

  }

}

HMCF_Curve.prototype.compute_normals=function(){
  this.compute_curvature_normals();

}

HMCF_Curve.prototype.step=function(){
  Curve.prototype.step.call(this);
  this.compute_normals();

  var n_ev=this.vertices.length;

  this.vertices.forEach(function(vertex) {
      var force=mul(-surface_tension,vertex.normal);
      vertex.velocity=add(vertex.velocity,mul(dt,force))

  });

  this.vertices.forEach(function(vertex) {
    vertex.pos=add(vertex.pos,mul(dt,vertex.velocity));
    vertex.velocity=mul(damp,vertex.velocity)
  });

  this.normalize();
}

HMCF_Curve.prototype.normalize=function(){
  Curve.prototype.normalize.call(this);

}

VPHMCF_Curve = function(vertices) {
    HMCF_Curve.call(this, vertices);
    console.log("VPHMCF_Curve")
    VPHMCF_Curve.Volume_Preserving=true
    VPHMCF_Curve.With_Velocity=true;

}

VPHMCF_Curve.prototype = Object.create(HMCF_Curve.prototype, {value: {constructor: VPHMCF_Curve}});

VPHMCF_Curve.prototype.step=function(){
  this.compute_normals();

  HMCF_Curve.prototype.step.call(this);

  //Volume correction part
  this.compute_area_and_length();
  const delta_area=this.initial_area-this.area;
  const d=delta_area/this.length;

  //compute normals for volume correction.
  Curve.prototype.compute_tangents.call(this);
  Curve.prototype.compute_normals.call(this);

  var n_ev=this.vertices.length;

  this.vertices.forEach(function(vertex) {
    var dx=mul(d,vertex.normal);
    vertex.pos=add(vertex.pos,dx);
    vertex.velocity=add(vertex.velocity, mul(d/dt,vertex.normal));

  });

  //Removing the commenting below gets more stable, but more kinetic energy is lost.
  // this.normalize();
}
