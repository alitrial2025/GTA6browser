export const GAME_DISTRICTS=[
  {id:'resort',name:'Valetta Coast',tag:'HOTELS & CANALS',scene:0,base:0,spawn:{x:-85,z:78,heading:Math.PI/2},bounds:[-230,106,-420,112],routes:[[-45,78],[20,78],[92,78],[91,105],[15,106],[-67,106]],pickups:[[-12,105],[75,80],[-165,-178]],color:'#e5b28e'},
  {id:'towers',name:'Biscayne Bay',tag:'TOWERS & PROMENADE',scene:1,base:2.2,spawn:{x:96,z:4,heading:-2.5},bounds:[-150,112,-79,69],ellipse:[-22,-5,130,76],routes:[[78,-41],[1,-65],[-73,-66],[-117,-40],[-128,19],[-66,56],[1,65],[53,55],[89,32],[96,4]],pickups:[[3,62],[-124,7],[81,-42]],color:'#9acbd0'},
  {id:'gellhorn',name:'Port Gellhorn',tag:'DUST & SUNSET',scene:2,base:0,spawn:{x:27,z:35,heading:Math.PI},bounds:[-125,110,-146,58],routes:[[29,-11],[40,-55],[33,-111],[-42,-111],[-34,-51],[-42,-4],[-27,28]],pickups:[[37,-39],[-32,-44],[-10,-88]],color:'#e2a465'},
  {id:'keys',name:'Leonida Keys',tag:'BOATS & OPEN WATER',scene:3,base:0,marine:true,spawn:{x:33,z:37,heading:Math.PI},bounds:[-150,180,-112,125],routes:[[39,-9],[56,-60],[28,-96],[-33,-91],[-69,-38],[-46,6],[9,53],[64,71]],pickups:[[65,-30],[-62,-59],[12,84]],color:'#7ccdd0'},
  {id:'murals',name:'Little Vice',tag:'MURALS & STREET RACING',scene:4,base:0,spawn:{x:2.7,z:-10,heading:Math.PI},bounds:[-33,30,-129,16],routes:[[3,-42],[6,-88],[-6,-117],[-16,-100],[-29,-62],[-31,-13],[-26,10],[3,11]],pickups:[[5,-58],[-31,-83],[-15,8]],color:'#cdb0ed'},
];
const delivery=['BLUE HOUR DELIVERY','THE PENTHOUSE CALL','DUSTY BUSINESS','TIDE RUNNER','UNDER THE CONCRETE'];
const races=['COASTAL CIRCUIT','BAYLINE SPRINT','DIRT ROAD RALLY','WAKE CHASER','THE MURAL RUN'];
const finales=['AFTER HOURS','GLASS & THUNDER','SUNSET HEAT','RUNNING WITH THE TIDE','VICE FINALE'];
export const MISSIONS=GAME_DISTRICTS.flatMap((d,i)=>[
  {id:d.id+'-delivery',district:i,title:delivery[i],kind:'delivery',description:'A discreet drop. Follow the gold markers and reach your contact.',route:d.routes.slice(0,3),limit:130,reward:1200+i*250},
  {id:d.id+'-race',district:i,title:races[i],kind:'race',description:d.marine?'Thread the harbor gates. Beat the clock.':'Take every checkpoint. Find the fast line. Beat the clock.',route:d.routes,limit:120,reward:1800+i*300},
  {id:d.id+'-escape',district:i,title:finales[i],kind:'escape',description:'The patrol is on your tail. Keep moving through the escape route.',route:[...d.routes.slice(0,5),...d.routes.slice(0,3)],limit:145,reward:2500+i*400},
]);
export const SAVE_KEY='vice-horizon-campaign-v1';
