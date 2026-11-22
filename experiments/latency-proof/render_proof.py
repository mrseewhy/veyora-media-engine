"""Standalone 10-second video proof. Simulated UI and metrics; NOT real performance data.
Requires Pillow, FFmpeg, and a narration WAV. This is not the production Remotion renderer.
"""
from PIL import Image, ImageDraw, ImageFont
import os, sys, subprocess, tempfile
W,H,FPS,DUR=1280,720,30,10
HERE=os.path.dirname(__file__)
FONT="/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
BOLD="/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
MONO="/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"
def ft(n,b=False,m=False): return ImageFont.truetype(MONO if m else BOLD if b else FONT,n)
def txt(d,xy,s,n=20,c="#f1f5f9",b=False,m=False):d.text(xy,s,font=ft(n,b,m),fill=c)
def box(d,xy,c,r=12):d.rounded_rectangle(xy,radius=r,fill=c)
def ease(x):x=max(0,min(1,x));return 1-(1-x)**3
def frame(i):
 t=i/FPS
 im=Image.new("RGB",(W,H),"#0b101b");d=ImageDraw.Draw(im)
 d.rectangle((0,0,W,8),fill="#35c5f4")
 txt(d,(60,37),"TOOLPILOT",19,"#c7f2ff",True)
 txt(d,(1030,40),"TECH EXPLAINED",15,"#778ba5",True)
 txt(d,(60,91),"A FAST UI IS NOT A FAST API",37,"#f3f7ff",True)
 txt(d,(60,145),"Simulated example  •  Timing values are illustrative",17,"#8fa2ba")
 box(d,(60,198,766,622),"#141d2b");box(d,(60,198,766,246),"#202c3d")
 d.rectangle((60,231,766,246),fill="#202c3d")
 for x,c in [(84,"#f87171"),(106,"#fbbf24"),(128,"#4ade80")]:d.ellipse((x,217,x+11,228),fill=c)
 txt(d,(170,212),"demo.local  /  assistant",16,"#adbed0",m=True)
 txt(d,(88,275),"User:  Explain API latency.",21,m=True)
 if t>.5:
  box(d,(88,334,715,438),"#253a47")
  txt(d,(106,351),"Assistant",17,"#55d4ef",True)
  s="Here is your answer, rendered smoothly."
  txt(d,(106,383),s[:int(len(s)*ease((t-.7)/1.2))],18)
 if t<4:
  txt(d,(88,480),"UI animation",17,"#94a3b8")
  box(d,(88,513,712,529),"#344457",8)
  box(d,(88,513,88+int(624*ease(t/2.5)),529),"#37c6f4",8)
  txt(d,(88,549),"Looks instant...",19,"#71e2f7",True)
 else:txt(d,(88,480),"Visible UI: READY",19,"#75e7c5",True)
 box(d,(795,198,1220,622),"#111b29")
 txt(d,(819,222),"NETWORK / POST /chat",18,"#d4e4f2",True,True)
 d.line((819,265,1192,265),fill="#334155",width=2)
 txt(d,(819,287),"Request sent",17,"#a9bdd1");txt(d,(1113,287),"0 ms",18,m=True)
 txt(d,(819,335),"First token",17,"#a9bdd1")
 txt(d,(1095,335),f"{int(1200*ease((t-2)/2.5)):>4} ms",18,"#facc15",m=True)
 txt(d,(819,384),"Full response",17,"#a9bdd1")
 txt(d,(1085,384),f"{int(3900*ease((t-3)/3.2)):>4} ms",18,"#fb7185",m=True)
 txt(d,(819,448),"API timeline",17,b=True)
 d.rectangle((819,492,1184,511),fill="#263547")
 d.rectangle((819,492,819+int(365*ease((t-2)/5)),511),fill="#fbbf24")
 d.line((932,482,932,521),fill="#f8fafc",width=2)
 txt(d,(819,534),"TTFT 1.2s  TOTAL 3.9s",16,"#f9d883",m=True)
 if t>=6.6:
  box(d,(61,643,1219,697),"#1d4e63")
  txt(d,(89,651),"MEASURE THE REQUEST, NOT THE ANIMATION",22,b=True)
 else:txt(d,(63,656),"Actual latency can be hidden by polished interfaces.",18,"#a6b6cb")
 return im
def main():
 if len(sys.argv)!=2:raise SystemExit("Usage: python render_proof.py /path/to/narration.wav")
 with tempfile.TemporaryDirectory() as tmp:
  for i in range(FPS*DUR):frame(i).save(os.path.join(tmp,f"{i:04}.png"))
  subprocess.run(["ffmpeg","-hide_banner","-loglevel","error","-y","-framerate",str(FPS),"-i",os.path.join(tmp,"%04d.png"),"-i",sys.argv[1],"-t",str(DUR),"-vf","scale=1920:1080","-c:v","libx264","-preset","veryfast","-crf","20","-pix_fmt","yuv420p","-c:a","aac","-b:a","192k","-movflags","+faststart",os.path.join(HERE,"toolpilot-latency-proof.mp4")],check=True)
if __name__=="__main__":main()
