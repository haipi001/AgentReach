"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { useReducedMotion } from "motion/react";
import { useAgentStore } from "@/stores/agent-store";

const VERTEX = `
attribute vec2 a_position;
void main(){ gl_Position=vec4(a_position,0.0,1.0); }
`;

const FRAGMENT = `
precision highp float;
uniform vec2 u_resolution;
uniform vec2 u_pointer;
uniform float u_time;
uniform float u_aura;
uniform float u_finish;
uniform vec3 u_accent;

float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123); }
float noise(vec2 p){
  vec2 i=floor(p),f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.)),f.x),f.y);
}

void main(){
  vec2 p=(gl_FragCoord.xy*2.0-u_resolution.xy)/min(u_resolution.x,u_resolution.y);
  p.x-=u_pointer.x*.055; p.y-=u_pointer.y*.04;
  float r=length(p);
  if(r>0.79){ gl_FragColor=vec4(0.0); return; }

  float z=sqrt(max(0.0,0.79*0.79-dot(p,p)));
  vec3 n=normalize(vec3(p,z));
  n.xy+=u_pointer*.08*(1.0-r);
  vec3 view=vec3(0.,0.,1.);
  float fresnel=pow(1.0-max(dot(n,view),0.0),2.7);
  vec3 key=normalize(vec3(-.48,.68,.92));
  vec3 rim=normalize(vec3(.74,-.25,.55));
  float diffuse=max(dot(n,key),0.0);
  float secondary=max(dot(n,rim),0.0);

  float flow=noise(n.xy*3.2+vec2(u_time*.035,-u_time*.022));
  float band=sin(n.y*8.0+n.x*4.5+flow*3.0+u_time*.16)*.5+.5;
  float film=sin((n.x-n.y)*7.5+n.z*3.0+u_time*.11)*.5+.5;
  vec3 spectral=.5+.5*cos(6.28318*(vec3(.08,.37,.72)+film*.32+flow*.13));
  vec3 base=mix(vec3(.035,.055,.052),vec3(.55,.68,.64),diffuse*.72);
  base=mix(base,u_accent,band*(.12+u_aura*.18));
  base+=spectral*(.05+u_finish*.16)*(1.0-fresnel*.35);
  base+=vec3(.65,.93,.84)*secondary*.09;
  base+=vec3(.82,1.0,.95)*fresnel*(.38+u_aura*.28);

  float spec=pow(max(dot(reflect(-key,n),view),0.0),mix(18.0,90.0,u_finish));
  base+=vec3(.88,1.0,.97)*spec*(.24+u_finish*.55);
  float inner=1.0-smoothstep(.0,.79,r);
  base+=u_accent*pow(inner,3.0)*u_aura*.08;
  float alpha=1.0-smoothstep(.775,.79,r);
  alpha*=.985+noise(gl_FragCoord.xy*.5)*.015;
  gl_FragColor=vec4(base,alpha);
}
`;

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source); gl.compileShader(shader);
  return gl.getShaderParameter(shader, gl.COMPILE_STATUS) ? shader : null;
}

export function AgentCore() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduceMotion = useReducedMotion();
  const persona = useAgentStore((state) => state.persona);
  const pointer = useRef({ x: 0, y: 0 });
  const hue = { lichen: "0deg", cobalt: "54deg", ember: "-72deg" }[persona.accent];
  const style = { "--core-aura": persona.aura, "--core-hue": hue } as CSSProperties;

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext("webgl", { alpha: true, antialias: true, premultipliedAlpha: true });
    if (!canvas || !gl) return;
    const vertex = compile(gl, gl.VERTEX_SHADER, VERTEX);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT);
    const program = gl.createProgram();
    if (!vertex || !fragment || !program) return;
    gl.attachShader(program, vertex); gl.attachShader(program, fragment); gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return;
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]), gl.STATIC_DRAW);
    const position = gl.getAttribLocation(program, "a_position");
    const resolution = gl.getUniformLocation(program, "u_resolution");
    const pointerUniform = gl.getUniformLocation(program, "u_pointer");
    const time = gl.getUniformLocation(program, "u_time");
    const aura = gl.getUniformLocation(program, "u_aura");
    const finish = gl.getUniformLocation(program, "u_finish");
    const accent = gl.getUniformLocation(program, "u_accent");
    const accentValue: [number, number, number] = { lichen: [.38,.96,.74], cobalt: [.35,.68,.95], ember: [.95,.66,.32] }[persona.accent] as [number, number, number];
    const finishValue = { matte: .12, chrome: .9, porcelain: .48 }[persona.finish];
    let frame = 0;
    const started = performance.now();

    const draw = () => {
      const dpr = Math.min(devicePixelRatio, 1.6);
      const width = Math.max(1, Math.round(canvas.clientWidth*dpr));
      const height = Math.max(1, Math.round(canvas.clientHeight*dpr));
      if (canvas.width !== width || canvas.height !== height) { canvas.width=width; canvas.height=height; }
      gl.viewport(0,0,width,height); gl.clearColor(0,0,0,0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program); gl.enableVertexAttribArray(position); gl.vertexAttribPointer(position,2,gl.FLOAT,false,0,0);
      gl.uniform2f(resolution,width,height); gl.uniform2f(pointerUniform,pointer.current.x,pointer.current.y);
      gl.uniform1f(time,reduceMotion ? 0 : (performance.now()-started)/1000); gl.uniform1f(aura,persona.aura);
      gl.uniform1f(finish,finishValue); gl.uniform3f(accent,...accentValue);
      gl.drawArrays(gl.TRIANGLES,0,6);
      if (!reduceMotion) frame=requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(frame); gl.deleteProgram(program); gl.deleteBuffer(buffer); gl.deleteShader(vertex); gl.deleteShader(fragment); };
  }, [persona.accent, persona.aura, persona.finish, reduceMotion]);

  return <div style={style} className={`agent-core finish-${persona.finish} accent-${persona.accent}`} role="img" aria-label={`私人智能体 3D 球形核心，场强 ${Math.round(persona.aura * 100)}%`} onPointerMove={(event) => { const rect=event.currentTarget.getBoundingClientRect(); pointer.current={ x:(event.clientX-rect.left)/rect.width*2-1, y:1-(event.clientY-rect.top)/rect.height*2 }; }} onPointerLeave={() => { pointer.current={x:0,y:0}; }}>
    <div className="agent-core-aura" aria-hidden="true"/>
    <div className="agent-core-fallback" aria-hidden="true"><i/><i/><i/></div>
    <canvas ref={canvasRef} className="agent-core-canvas" aria-hidden="true"/>
    <div className="agent-core-rings" aria-hidden="true"><i/><i/><i/></div>
  </div>;
}
