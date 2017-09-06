MCF_Curve = function(vertices) {
    Curve.call(this, vertices);
    console.log("MCF_Curve")

    MCF_Curve.Volume_Preserving=false
    MCF_Curve.With_Velocity=false;
}

MCF_Curve.prototype = Object.create(Curve.prototype, {value: {constructor: MCF_Curve}});

MCF_Curve.prototype.compute_curvature_normals = function() {
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

MCF_Curve.prototype.compute_normals=function(){
  this.compute_curvature_normals();
}

MCF_Curve.prototype.step=function(){
  this.compute_normals();

  var n_ev=this.vertices.length;
  for(var i=0;i<n_ev;++i){
    var dx=mul(-dt,this.vertices[i].normal);
    this.vertices[i].pos=add(this.vertices[i].pos,dx);

  }
  this.normalize();
}

VPMCF_Curve = function(vertices) {
    MCF_Curve.call(this, vertices);
    console.log("VPMCF_Curve")
    VPMCF_Curve.Volume_Preserving=true
    VPMCF_Curve.With_Velocity=false;

}

VPMCF_Curve.prototype = Object.create(MCF_Curve.prototype, {value: {constructor: VPMCF_Curve}});

VPMCF_Curve.prototype.step=function(){
  this.compute_normals();

  MCF_Curve.prototype.step.call(this);

  //Volume correction part
  this.compute_area_and_length();
  const delta_area=this.initial_area-this.area;
  const d=delta_area/this.length;

  Curve.prototype.compute_tangents.call(this);
  Curve.prototype.compute_normals.call(this);//compute normals for volume correction.
  var n_ev=this.vertices.length;

  for(var i=0;i<n_ev;++i){
    var dx=mul(d,this.vertices[i].normal);
    this.vertices[i].pos=add(this.vertices[i].pos,dx);

  }

  //this.normalize();
}
