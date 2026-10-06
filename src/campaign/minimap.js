export function drawMap(canvas,district,colliders,player,target,route,police,pickups){
  const c=canvas.getContext('2d'),s=canvas.width,w=district.bounds[1]-district.bounds[0],h=district.bounds[3]-district.bounds[2],scale=(s-28)/Math.max(w,h),centerX=(district.bounds[0]+district.bounds[1])/2,centerZ=(district.bounds[2]+district.bounds[3])/2;
  const p=(x,z)=>[s/2+(x-centerX)*scale,s/2+(z-centerZ)*scale];c.clearRect(0,0,s,s);c.fillStyle=district.marine?'#174157':'#233a30';c.fillRect(0,0,s,s);
  c.strokeStyle='#ffffff09';c.lineWidth=1;for(let i=0;i<s;i+=32){c.beginPath();c.moveTo(i,0);c.lineTo(i,s);c.moveTo(0,i);c.lineTo(s,i);c.stroke();}
  if(district.ellipse){const [x,z,rx,rz]=district.ellipse,q=p(x,z);c.fillStyle='#3a5143';c.beginPath();c.ellipse(q[0],q[1],rx*scale,rz*scale,0,0,Math.PI*2);c.fill();}
  c.strokeStyle='#68807c';c.lineWidth=7;c.beginPath();district.routes.forEach(([x,z],i)=>{const q=p(x,z);i?c.lineTo(...q):c.moveTo(...q)});c.stroke();
  c.fillStyle='#142822';for(const b of colliders){const q=p(b.x-b.w/2,b.z-b.d/2);c.fillRect(...q,b.w*scale,b.d*scale);}
  if(route){c.strokeStyle='#e8bb72';c.lineWidth=2;c.setLineDash([5,4]);c.beginPath();route.forEach(([x,z],i)=>{const q=p(x,z);i?c.lineTo(...q):c.moveTo(...q)});c.stroke();c.setLineDash([]);}
  const dot=(x,z,color,r=3)=>{c.fillStyle=color;c.beginPath();c.arc(...p(x,z),r,0,Math.PI*2);c.fill();};pickups.forEach(o=>dot(o[0],o[1],'#7dcfd3',2));police.forEach(o=>dot(o.x,o.z,'#eb6778',3));if(target){dot(...target,'#f6c77b',7);dot(...target,'#203e32',3);}
  const q=p(player.x,player.z);c.save();c.translate(...q);c.rotate(-player.heading);c.fillStyle='#e4efd0';c.strokeStyle='#10251e';c.lineWidth=2;c.beginPath();c.moveTo(0,8);c.lineTo(-5,-6);c.lineTo(0,-3);c.lineTo(5,-6);c.closePath();c.fill();c.stroke();c.restore();c.fillStyle='#aec2b9';c.font='10px Arial';c.fillText('N',s-17,17);
}
