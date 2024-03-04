# Evolving curves under different curvature flows.

This is a browser demo for different curvature flows (in JavaScript).  
Currently, four flows are supported:
* Mean curvature flow
* Volume preserving mean curvature flow
* Hyperbolic mean curvature flow
* Volume preserving hyperbolic mean curvature flow

[[Browser demo]][D]  
<a href="https://sadashigeishida.bitbucket.io/curvature_flows/curvature_flows.html">  <img src="https://github.com/sdsgisd/curvature_flows/blob/master/evolving_curve.png" width="200px"> </a>  
[[Youtube video]][Y]  
<a href="https://www.youtube.com/watch?v=pvgPOb8_gvw"><img src="http://i.ytimg.com/vi/pvgPOb8_gvw/0.jpg" width="200px"></a>

[Y]:https://www.youtube.com/watch?v=pvgPOb8_gvw
[D]:https://sadashigeishida.bitbucket.io/curvature_flows/curvature_flows.html
Author: Sadashige Ishida  
License: MIT


## Basic usage  
[MOUSE SETTING]  
Mouse drag: add a new curve.  

[KEY SETTING]  
Space: Turn on/off the clock.  
s: Proceed one time step.  
r: Reset.  
t: Show tangents and normals.  

m: Switch flow to mean curvature flow / volume preserving mean curvature flow.  
h: Switch flow to heyperbolic mean curvature flow / volume preserving hyperbolic mean curvature flow
shift+w: save the screenshot.  
w: Turn on/off image save mode.  

For making a movie with libav,  
"avconv -start_number 2 -r 100 -i ./image%d.png -r 60 -vf "scale=640:450,setsar=1" -b:v 120000k ../bubblemovie.mp4"


## Curvature flows
### Parabolic flows

* Mean curvature flow  
<img src="https://latex.codecogs.com/gif.latex?\frac{dx}{dt}=-Hn"/>

* Volume preserving mean curvature flow  

<img src="https://latex.codecogs.com/gif.latex?\frac{dx}{dt}=\left(-H+\frac{\int_{\partial\Omega}Hds}{\int_{\partial\Omega}ds}\right)n"/>
<img src="https://latex.codecogs.com/gif.latex?\mbox{where\&space;the\&space;second\&space;term\&space;preserves\&space;the\&space;enclosed\&space;area.}"/>

### Hyperbolic flows

* Hyperbolic mean curvature flow  
<img src="https://latex.codecogs.com/gif.latex?\frac{d^2x}{dt^2}=-Hn"/>  

* Volume preserving hyperbolic mean curvature flow <a href="https://repository.kulib.kyoto-u.ac.jp/dspace/handle/2433/224716" target="_blank">[Ginder, Katayama, Svadlenka 2016]</a>,
<a href="https://sadashigeishida.bitbucket.io/hgf/" target="_blank">[Ishida et al. 2017]</a>.  
<img src="https://latex.codecogs.com/gif.latex?\frac{d^2x}{dt^2}=(-H+\Delta&space;p)n"/>
<img src="https://latex.codecogs.com/gif.latex?\mbox{where}\&space;\Delta&space;p(t)\mbox{\&space;is\&space;a\&space;real\&space;value\&space;such\&space;that\&space;the\&space;area}\&space;A\mbox{\&space;satisfies}\&space;\frac{dA}{dt}=0."/>
