import { useState, useEffect, useRef, useCallback } from "react";

// Storage helper (uses localStorage for web deployment)
const storage = {
  async get(key) {
    try { const v = localStorage.getItem(key); return v ? { value: v } : null; } catch { return null; }
  },
  async set(key, value) {
    try { localStorage.setItem(key, value); return { key, value }; } catch { return null; }
  },
};

const STANDINGS_2026 = [
  { pos:1, driver:"Kimi Antonelli", team:"Mercedes", pts:72, flag:"🇮🇹", results:[18,29,25] },
  { pos:2, driver:"George Russell", team:"Mercedes", pts:63, flag:"🇬🇧", results:[25,26,12] },
  { pos:3, driver:"Charles Leclerc", team:"Ferrari", pts:49, flag:"🇲🇨", results:[15,19,15] },
  { pos:4, driver:"Lewis Hamilton", team:"Ferrari", pts:41, flag:"🇬🇧", results:[12,21,8] },
  { pos:5, driver:"Lando Norris", team:"McLaren", pts:25, flag:"🇬🇧", results:[10,5,10] },
  { pos:6, driver:"Oscar Piastri", team:"McLaren", pts:21, flag:"🇦🇺", results:[0,3,18] },
  { pos:7, driver:"Oliver Bearman", team:"Haas", pts:17, flag:"🇬🇧", results:[6,11,0] },
  { pos:8, driver:"Pierre Gasly", team:"Alpine", pts:15, flag:"🇫🇷", results:[1,8,6] },
  { pos:9, driver:"Max Verstappen", team:"Red Bull", pts:12, flag:"🇳🇱", results:[8,0,4], isMax:true },
  { pos:10, driver:"Liam Lawson", team:"Racing Bulls", pts:10, flag:"🇳🇿", results:[0,8,2] },
];

const RACES_2026 = [
  { rnd:1, name:"호주 GP", circuit:"앨버트 파크", loc:"멜버른", date:"3/8", maxPos:"6th", maxPts:8, winner:"Russell", trackColor:"#00D2BE", len:"5.278km", turns:14, done:true },
  { rnd:2, name:"중국 GP", circuit:"상하이 인터내셔널", loc:"상하이", date:"3/15", maxPos:"DNP", maxPts:0, winner:"Antonelli", trackColor:"#FF1801", len:"5.451km", turns:16, done:true },
  { rnd:3, name:"일본 GP", circuit:"스즈카", loc:"스즈카", date:"3/29", maxPos:"8th", maxPts:4, winner:"Antonelli", trackColor:"#FFD700", len:"5.807km", turns:18, done:true },
  { rnd:4, name:"마이애미 GP", circuit:"마이애미 인터내셔널", loc:"마이애미", date:"5/3", done:false },
  { rnd:5, name:"캐나다 GP", circuit:"질 빌뇌브", loc:"몬트리올", date:"5/24", done:false },
  { rnd:6, name:"모나코 GP", circuit:"몬테카를로", loc:"모나코", date:"6/7", done:false },
  { rnd:7, name:"스페인 GP", circuit:"마드리드 시가지", loc:"마드리드", date:"6/14", done:false },
  { rnd:8, name:"오스트리아 GP", circuit:"레드불 링", loc:"슈필베르크", date:"6/28", done:false },
  { rnd:9, name:"영국 GP", circuit:"실버스톤", loc:"실버스톤", date:"7/5", done:false },
  { rnd:10, name:"벨기에 GP", circuit:"스파-프랑코르샹", loc:"스파", date:"7/19", done:false },
  { rnd:11, name:"헝가리 GP", circuit:"헝가로링", loc:"부다페스트", date:"7/26", done:false },
  { rnd:12, name:"네덜란드 GP", circuit:"잔드보르트", loc:"잔드보르트", date:"8/23", done:false },
  { rnd:13, name:"이탈리아 GP", circuit:"몬차", loc:"몬차", date:"9/6", done:false },
  { rnd:14, name:"바르셀로나-카탈루냐 GP", circuit:"카탈루냐", loc:"바르셀로나", date:"9/13", done:false },
  { rnd:15, name:"아제르바이잔 GP", circuit:"바쿠 시가지", loc:"바쿠", date:"9/26", done:false },
  { rnd:16, name:"싱가포르 GP", circuit:"마리나 베이", loc:"싱가포르", date:"10/11", done:false },
  { rnd:17, name:"미국 GP", circuit:"COTA", loc:"오스틴", date:"10/25", done:false },
  { rnd:18, name:"멕시코 GP", circuit:"에르마노스 로드리게스", loc:"멕시코시티", date:"11/1", done:false },
  { rnd:19, name:"브라질 GP", circuit:"인테를라고스", loc:"상파울루", date:"11/8", done:false },
  { rnd:20, name:"라스베이거스 GP", circuit:"라스베이거스 스트립", loc:"라스베이거스", date:"11/21", done:false },
  { rnd:21, name:"카타르 GP", circuit:"루사일", loc:"루사일", date:"11/29", done:false },
  { rnd:22, name:"아부다비 GP", circuit:"야스 마리나", loc:"아부다비", date:"12/6", done:false },
];

const QUIZ_QUESTIONS = [
  { q:"막스 베르스타펜이 F1 역대 최연소 우승을 달성한 나이는?", opts:["17세","18세","19세","20세"], ans:1 },
  { q:"2023년 막스가 세운 시즌 최다승 기록은?", opts:["15승","17승","19승","21승"], ans:2 },
  { q:"막스의 아버지 요스 베르스타펜은 어떤 팀에서 F1에 출전했나?", opts:["Ferrari","Benetton","Williams","McLaren"], ans:1 },
  { q:"2021년 막스가 첫 월드 챔피언을 확정지은 그랑프리는?", opts:["브라질 GP","사우디 GP","아부다비 GP","카타르 GP"], ans:2 },
  { q:"막스가 F1 데뷔 전 활약한 하위 카테고리는?", opts:["F2","F3","F4","유러피언 F3"], ans:3 },
  { q:"2026시즌 막스의 카 넘버는?", opts:["1번","33번","3번","11번"], ans:2 },
  { q:"막스가 #3번을 선택한 이유와 관련된 전 팀동료는?", opts:["세르히오 페레스","알렉산더 알본","다니엘 리카르도","피에르 가슬리"], ans:2 },
  { q:"막스가 즐기는 취미로 유명한 게임 장르는?", opts:["FPS","RPG","심레이싱","스포츠"], ans:2 },
  { q:"2026시즌 막스의 새 팀동료는?", opts:["유키 츠노다","이삭 아다르","리암 로슨","다니엘 리카르도"], ans:1 },
  { q:"막스의 별명 'Mad Max'의 유래는?", opts:["영화에서","공격적 드라이빙","아버지가 지어줌","팬 투표"], ans:1 },
];

const EASTER_EGGS = {
  "루이스 해밀턴": { emoji:"😤", title:"루이스 해밀턴", subtitle:"2021년 아부다비의 악몽...", lines:["마지막 랩 Safety Car 재출발... 그 뒤로 루이스는 아직도 그 이야기만 나오면 표정이 굳는다고 합니다 😂","현재 Ferrari에서 새 출발 중! 하지만 Max에게 2포인트 차로 타이틀을 빼앗긴 건 여전히 아픔...","🏆 통산 105승의 레전드이지만, Max 앞에서는 늘 조금 부족했던...?"], color:"#00D2BE" },
  "lewis hamilton": { emoji:"😤", title:"Lewis Hamilton", subtitle:"Abu Dhabi 2021... Never forget", lines:["마지막 랩 Safety Car 재출발... 루이스의 표정은 아직도 전설 😂","Ferrari로 갔지만 Max의 그림자는 여전히...","🏆 105승 레전드, 하지만 Max 상대 전적은...?"], color:"#00D2BE" },
  "란도 노리스": { emoji:"🍊", title:"란도 노리스", subtitle:"2025 챔피언이긴 한데...", lines:["2포인트 차이로 챔피언? Max가 풀시즌 컨디션이었으면...? 🤔","밀크 좋아하는 아저씨가 챔피언이라니!","하지만 인정할 건 인정합시다, 2026시즌은 Max보다 앞서고 있긴 합니다 (현재)"], color:"#FF8700" },
  "lando norris": { emoji:"🍊", title:"Lando Norris", subtitle:"Champion by 2 points... really?", lines:["If Max had a full season... 🤔","The milk-loving champion!","OK 2026 시즌은 인정합니다만..."], color:"#FF8700" },
  "세르히오 페레스": { emoji:"💤", title:"세르히오 페레스", subtitle:"전직 Max의 충실한 윙맨", lines:["Q2 탈락의 아이콘 🥲","'Checo, where are you?'","카딜락으로 갔지만... 상황이 나아졌을까요?"], color:"#3671C6" },
  "레드불": { emoji:"🐂", title:"Oracle Red Bull Racing", subtitle:"날개를 달아주는 팀", lines:["에너지 드링크 회사가 F1 최강팀이 된 전설 🏆","2026시즌은 좀 고전 중이지만... Max가 있잖아!","'크리스티안 호너'가 웃으면 뭔가 작전이 있다는 뜻"], color:"#3671C6" },
  "red bull": { emoji:"🐂", title:"Red Bull Racing", subtitle:"Gives you wings!", lines:["에너지 드링크 → F1 최강팀 변신 🏆","2026 좀 힘들지만 Max가 있으니까!"], color:"#3671C6" },
  "페라리": { emoji:"🐴", title:"Scuderia Ferrari", subtitle:"세상에서 가장 느린 빨간차... 였는데?", lines:["2026시즌 해밀턴 영입했는데 생각보다 빠르다?! 😱","'다음 해는 우리 해' — 매년 하는 말","하지만 빨간 차는 역시 멋있긴 합니다 (Max빼고)"], color:"#DC143C" },
  "ferrari": { emoji:"🐴", title:"Ferrari", subtitle:"Next Year is finally here?", lines:["해밀턴 + 르클레르 조합이 꽤 무서운데...","매년 '다음 해는 우리 해' 하더니 진짜?"], color:"#DC143C" },
  "메르세데스": { emoji:"⭐", title:"Mercedes-AMG", subtitle:"2026 규정 최대 수혜자?!", lines:["안토넬리가 역대 최연소 챔십 리더!","2026 새 규정에서 날개를 달았다 😅","볼프 아저씨 미소가 다시 돌아왔습니다"], color:"#00D2BE" },
  "mercedes": { emoji:"⭐", title:"Mercedes", subtitle:"Toto's smile is back!", lines:["Antonelli + Russell = 무적 콤비?","새 규정 최대 수혜자!"], color:"#00D2BE" },
  "max verstappen": { emoji:"🦁", title:"MAX VERSTAPPEN", subtitle:"THE GOAT", lines:["역대 최강 드라이버 🏆🏆🏆🏆","Simply Lovely! 🎉","2026시즌 힘들어도 Max는 Max다!"], color:"#FFD700" },
  "막스 베르스타펜": { emoji:"🦁", title:"맥스 베르스타펜", subtitle:"THE GOAT", lines:["4회 월드 챔피언, 역대 최강! 🏆🏆🏆🏆","Simply Lovely! 항상 최선을 다하는 남자","올해는 힘들어도, Max는 언제나 Max입니다!"], color:"#FFD700" },
  "simply lovely": { emoji:"🎉", title:"SIMPLY LOVELY!", subtitle:"Max의 상징적 무선 메시지", lines:["우승할 때마다 들리는 그 한마디!","전세계 Max 팬들의 심장을 뛰게 하는 마법의 주문"], color:"#FFD700" },
  "이안": { emoji:"⭐", title:"SUPER FAN 이안!", subtitle:"미래의 F1 드라이버?!", lines:["Max의 #1 팬! 🇰🇷","이 팬페이지의 진정한 주인공!","언젠가 Max를 만날 수 있을 거야! Simply Lovely! 🎉"], color:"#FF1801" },
  "ian": { emoji:"⭐", title:"SUPER FAN IAN!", subtitle:"Future F1 Driver?!", lines:["Max's #1 fan from Korea! 🇰🇷","The true hero of this fan page!","Simply Lovely! 🎉"], color:"#FF1801" },
};

const BG = "#0a0e27";
const RED = "#FF1801";
const GOLD = "#FFD700";
const NAVY = "#1E3CBA";

function RedBullLogo() {
  return (
    <svg viewBox="0 0 400 60" style={{ width:"clamp(200px,40vw,360px)", height:"auto" }}>
      <defs><linearGradient id="rbGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#FFD700"/><stop offset="50%" stopColor="#FF1801"/><stop offset="100%" stopColor="#FFD700"/></linearGradient></defs>
      <text x="200" y="32" textAnchor="middle" fontFamily="Oswald,Impact,sans-serif" fontWeight="700" fontSize="28" fill="url(#rbGrad)" letterSpacing="6">ORACLE RED BULL RACING</text>
      <text x="200" y="52" textAnchor="middle" fontFamily="monospace" fontSize="10" fill="rgba(255,255,255,0.4)" letterSpacing="3">FORMULA 1 TEAM</text>
      <circle cx="45" cy="30" r="18" fill="none" stroke="#FF1801" strokeWidth="1.5" opacity="0.6"/>
      <circle cx="355" cy="30" r="18" fill="none" stroke="#FF1801" strokeWidth="1.5" opacity="0.6"/>
      <path d="M35 28 Q45 18 55 28" fill="none" stroke="#FFD700" strokeWidth="2"/>
      <path d="M345 28 Q355 18 365 28" fill="none" stroke="#FFD700" strokeWidth="2"/>
      <path d="M37 34 Q45 40 53 34" fill="none" stroke="#FF1801" strokeWidth="1.5"/>
      <path d="M347 34 Q355 40 363 34" fill="none" stroke="#FF1801" strokeWidth="1.5"/>
    </svg>
  );
}

function SearchBar() {
  const [query, setQuery] = useState("");
  const [isSpecial, setIsSpecial] = useState(false);
  const [eggResult, setEggResult] = useState(null);
  const handleSearch = () => {
    if (!query.trim()) return;
    if (isSpecial) {
      const key = query.trim().toLowerCase();
      const egg = EASTER_EGGS[key] || Object.entries(EASTER_EGGS).find(([k])=>key.includes(k))?.[1];
      if (egg) setEggResult(egg);
      else setEggResult({ emoji:"🔍", title:query, subtitle:"Easter Egg를 찾지 못했어요!", lines:[`"${query}"에 대한 특별한 결과가 없습니다.`,"다른 F1 드라이버나 팀 이름을 검색해 보세요!","힌트: 막스 베르스타펜, 루이스 해밀턴, 레드불, 이안, simply lovely..."], color:"#666" });
    } else { window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, "_blank"); }
  };
  return (
    <div style={{ padding:"40px 24px 20px" }}>
      <div style={{ maxWidth:560, margin:"0 auto" }}>
        <div style={{ display:"flex", justifyContent:"center", marginBottom:16, gap:4 }}>
          <button onClick={()=>{setIsSpecial(false);setEggResult(null);}} style={{ padding:"7px 18px", borderRadius:"20px 0 0 20px", border:`1px solid ${isSpecial?"rgba(255,255,255,0.1)":RED}`, background:isSpecial?"rgba(255,255,255,0.03)":"rgba(255,24,1,0.15)", color:isSpecial?"rgba(255,255,255,0.5)":"white", fontFamily:"monospace", fontSize:11, cursor:"pointer", transition:"all 0.3s" }}>🔍 Google 검색</button>
          <button onClick={()=>{setIsSpecial(true);setEggResult(null);}} style={{ padding:"7px 18px", borderRadius:"0 20px 20px 0", border:`1px solid ${!isSpecial?"rgba(255,255,255,0.1)":GOLD}`, background:!isSpecial?"rgba(255,255,255,0.03)":"rgba(255,215,0,0.15)", color:!isSpecial?"rgba(255,255,255,0.5)":GOLD, fontFamily:"monospace", fontSize:11, cursor:"pointer", transition:"all 0.3s" }}>⚡ 특별한 검색</button>
        </div>
        <div style={{ display:"flex", borderRadius:28, overflow:"hidden", border:`2px solid ${isSpecial?"rgba(255,215,0,0.3)":"rgba(255,255,255,0.1)"}`, background:"rgba(255,255,255,0.04)" }}>
          <input value={query} onChange={e=>setQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSearch()} placeholder={isSpecial?"F1 드라이버·팀 이름을 입력해 보세요...":"Google 검색..."} style={{ flex:1, padding:"12px 20px", background:"transparent", border:"none", outline:"none", color:"white", fontFamily:"monospace", fontSize:13 }}/>
          <button onClick={handleSearch} style={{ padding:"12px 20px", background:isSpecial?GOLD:RED, border:"none", color:isSpecial?"#000":"#fff", cursor:"pointer", fontFamily:"Oswald,sans-serif", fontSize:14, fontWeight:700 }}>{isSpecial?"⚡":"🔍"}</button>
        </div>
        {isSpecial&&<div style={{ textAlign:"center", marginTop:8, fontFamily:"monospace", fontSize:9, color:"rgba(255,255,255,0.25)" }}>힌트: 막스 베르스타펜, 루이스 해밀턴, 란도 노리스, 레드불, 페라리, 이안, simply lovely...</div>}
        {eggResult&&(<div style={{ marginTop:20, borderRadius:16, overflow:"hidden", border:`1px solid ${eggResult.color}33`, background:`linear-gradient(135deg,${eggResult.color}11,transparent)`, animation:"slideUp 0.4s ease" }}>
          <div style={{ padding:"20px 20px 16px", borderBottom:`1px solid ${eggResult.color}22` }}>
            <div style={{ fontSize:44, marginBottom:6 }}>{eggResult.emoji}</div>
            <div style={{ fontFamily:"Oswald,sans-serif", fontSize:22, fontWeight:700, color:"white" }}>{eggResult.title}</div>
            <div style={{ fontFamily:"monospace", fontSize:11, color:eggResult.color, marginTop:4 }}>{eggResult.subtitle}</div>
          </div>
          <div style={{ padding:"14px 20px" }}>
            {eggResult.lines.map((line,i)=>(<div key={i} style={{ fontFamily:"monospace", fontSize:12, color:"rgba(255,255,255,0.8)", lineHeight:1.8, padding:"5px 0", borderBottom:i<eggResult.lines.length-1?"1px solid rgba(255,255,255,0.05)":"none" }}>{line}</div>))}
          </div>
        </div>)}
      </div>
    </div>
  );
}

function HeroSection() {
  const [loaded, setLoaded] = useState(false);
  useEffect(()=>{setTimeout(()=>setLoaded(true),100);},[]);
  return (
    <div style={{ position:"relative", minHeight:"100vh", display:"flex", flexDirection:"column", justifyContent:"center", alignItems:"center", overflow:"hidden", background:`linear-gradient(135deg,${BG} 0%,#1a0a2e 30%,#0d1b3e 60%,${BG} 100%)` }}>
      <div style={{ position:"absolute", top:0, left:0, right:0, bottom:0, background:"repeating-linear-gradient(90deg,transparent,transparent 60px,rgba(30,60,180,0.03) 60px,rgba(30,60,180,0.03) 61px),repeating-linear-gradient(0deg,transparent,transparent 60px,rgba(30,60,180,0.03) 60px,rgba(30,60,180,0.03) 61px)", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", top:"-30%", right:"-10%", width:500, height:"200%", background:"linear-gradient(160deg,transparent 40%,rgba(255,24,1,0.08) 50%,transparent 60%)", transform:"rotate(-15deg)", pointerEvents:"none" }}/>
      <div style={{ position:"absolute", fontSize:"min(70vw,500px)", fontFamily:"Oswald,Impact,sans-serif", fontWeight:900, color:"rgba(255,255,255,0.015)", lineHeight:1, userSelect:"none" }}>3</div>
      <div style={{ position:"relative", zIndex:2, textAlign:"center", padding:"60px 24px 0", transform:loaded?"translateY(0)":"translateY(40px)", opacity:loaded?1:0, transition:"all 1.2s cubic-bezier(0.16,1,0.3,1)" }}>
        <div style={{ marginBottom:20 }}><RedBullLogo/></div>
        <h1 style={{ fontFamily:"Oswald,Impact,sans-serif", fontSize:"clamp(56px,12vw,130px)", fontWeight:900, color:"white", lineHeight:0.9, margin:0, textShadow:"0 0 80px rgba(255,24,1,0.3)" }}>MAX</h1>
        <h1 style={{ fontFamily:"Oswald,Impact,sans-serif", fontSize:"clamp(36px,8vw,90px)", fontWeight:400, color:"transparent", lineHeight:0.95, margin:0, letterSpacing:"0.1em", WebkitTextStroke:"1.5px rgba(255,255,255,0.5)" }}>VERSTAPPEN</h1>
        <div style={{ marginTop:28, display:"flex", gap:28, justifyContent:"center", flexWrap:"wrap", opacity:loaded?1:0, transition:"all 1.2s cubic-bezier(0.16,1,0.3,1) 0.3s" }}>
          {[{l:"월드 챔피언",v:"4×"},{l:"레이스 우승",v:"71"},{l:"폴 포지션",v:"48"},{l:"포디움",v:"127"}].map((s,i)=>(
            <div key={i} style={{ textAlign:"center" }}>
              <div style={{ fontFamily:"Oswald,sans-serif", fontSize:"clamp(26px,5vw,44px)", fontWeight:700, color:RED }}>{s.v}</div>
              <div style={{ fontFamily:"monospace", fontSize:9, color:"rgba(255,255,255,0.5)", letterSpacing:"0.2em", textTransform:"uppercase" }}>{s.l}</div>
            </div>))}
        </div>
      </div>
      <div style={{ position:"relative", zIndex:3, width:"100%", marginTop:20 }}><SearchBar/></div>
      <div style={{ position:"absolute", bottom:16, display:"flex", flexDirection:"column", alignItems:"center", animation:"bounce 2s ease-in-out infinite", zIndex:2 }}>
        <div style={{ fontFamily:"monospace", fontSize:9, color:"rgba(255,255,255,0.3)", letterSpacing:"0.2em", marginBottom:6 }}>SCROLL</div>
        <div style={{ width:1, height:30, background:"linear-gradient(to bottom,rgba(255,255,255,0.3),transparent)" }}/>
      </div>
    </div>
  );
}

function TrackSVG({rnd}) {
  const t={1:<path d="M30 45 Q15 45 15 35 L15 20 Q15 10 25 10 L55 10 Q65 10 65 20 L65 25 Q65 30 60 32 L40 40 Q35 42 35 47 Q35 52 40 52 L60 52 Q70 52 70 42 L70 25" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>,2:<path d="M20 50 L20 15 Q20 10 25 10 L60 10 Q70 10 70 20 L70 30 Q70 35 65 35 L35 35 Q30 35 30 40 L30 50 Q30 55 35 55 L65 55 Q70 55 70 50 L70 45" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>,3:<path d="M15 50 L15 15 Q15 8 22 8 L30 8 Q40 8 45 15 L55 30 Q58 35 55 40 L45 50 Q40 55 35 50 L30 40 Q28 37 30 34 L50 15 Q55 10 60 10 L68 10 Q75 10 75 17 L75 50" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>};
  return(<svg viewBox="0 0 85 65" style={{width:70,height:55,color:"rgba(255,255,255,0.35)"}}>{t[rnd]||<circle cx="42" cy="32" r="20" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4 3"/>}</svg>);
}

function RaceResultsSection() {
  const [tab,setTab]=useState("results");
  const cr=RACES_2026.filter(r=>r.done);
  const nr=RACES_2026.find(r=>!r.done);
  return (
    <div style={{background:BG,padding:"80px 24px"}}>
      <div style={{maxWidth:720,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:36}}>
          <div style={{fontFamily:"monospace",fontSize:10,color:GOLD,letterSpacing:"0.3em",marginBottom:8}}>2026 SEASON</div>
          <h2 style={{fontFamily:"Oswald,sans-serif",fontSize:"clamp(28px,5vw,42px)",fontWeight:700,color:"white"}}><span style={{color:RED}}>레이스</span> 트래커</h2>
        </div>
        <div style={{display:"flex",justifyContent:"center",gap:6,marginBottom:28}}>
          {[["results","레이스 결과"],["standings","드라이버 순위"],["calendar","캘린더"]].map(([k,l])=>(<button key={k} onClick={()=>setTab(k)} style={{padding:"7px 18px",borderRadius:20,border:`1px solid ${tab===k?RED:"rgba(255,255,255,0.1)"}`,background:tab===k?"rgba(255,24,1,0.15)":"transparent",color:tab===k?"white":"rgba(255,255,255,0.5)",fontFamily:"monospace",fontSize:11,cursor:"pointer",transition:"all 0.3s"}}>{l}</button>))}
        </div>
        {tab==="results"&&(<div>
          {nr&&(<div style={{background:"linear-gradient(135deg,rgba(255,24,1,0.1),rgba(255,215,0,0.05))",border:"1px solid rgba(255,24,1,0.2)",borderRadius:16,padding:20,marginBottom:20,textAlign:"center"}}>
            <div style={{fontFamily:"monospace",fontSize:10,color:GOLD,letterSpacing:"0.2em"}}>NEXT RACE</div>
            <div style={{fontFamily:"Oswald,sans-serif",fontSize:24,fontWeight:700,color:"white",margin:"6px 0"}}>Round {nr.rnd} · {nr.name}</div>
            <div style={{fontFamily:"monospace",fontSize:12,color:"rgba(255,255,255,0.6)"}}>{nr.circuit} · {nr.loc} · {nr.date}</div>
          </div>)}
          {cr.map(r=>(<div key={r.rnd} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:14,padding:"16px 18px",marginBottom:10,display:"flex",alignItems:"center",gap:14,flexWrap:"wrap"}}>
            <div style={{textAlign:"center",minWidth:42}}><div style={{fontFamily:"Oswald,sans-serif",fontSize:24,fontWeight:700,color:r.trackColor||"white"}}>R{r.rnd}</div></div>
            <TrackSVG rnd={r.rnd}/>
            <div style={{flex:1,minWidth:130}}><div style={{fontFamily:"Oswald,sans-serif",fontSize:16,fontWeight:700,color:"white"}}>{r.name}</div><div style={{fontFamily:"monospace",fontSize:10,color:"rgba(255,255,255,0.5)"}}>{r.circuit} · {r.len} · {r.turns}개 코너</div></div>
            <div style={{textAlign:"center"}}><div style={{fontFamily:"monospace",fontSize:9,color:"rgba(255,255,255,0.4)"}}>MAX</div><div style={{fontFamily:"Oswald,sans-serif",fontSize:20,fontWeight:700,color:r.maxPos==="DNP"?"#666":parseInt(r.maxPos)<=3?GOLD:"white"}}>{r.maxPos}</div><div style={{fontFamily:"monospace",fontSize:9,color:"rgba(255,255,255,0.3)"}}>우승: {r.winner}</div></div>
          </div>))}
        </div>)}
        {tab==="standings"&&(<div>{STANDINGS_2026.map(d=>(<div key={d.pos} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",marginBottom:5,borderRadius:10,background:d.isMax?"rgba(255,24,1,0.1)":"rgba(255,255,255,0.03)",border:d.isMax?`1px solid ${RED}44`:"1px solid rgba(255,255,255,0.04)"}}>
          <div style={{fontFamily:"Oswald,sans-serif",fontSize:18,fontWeight:700,color:d.pos<=3?GOLD:"rgba(255,255,255,0.4)",minWidth:26,textAlign:"center"}}>{d.pos}</div>
          <div style={{fontSize:16}}>{d.flag}</div>
          <div style={{flex:1}}><div style={{fontFamily:"Oswald,sans-serif",fontSize:14,fontWeight:d.isMax?700:400,color:d.isMax?RED:"white"}}>{d.driver}{d.isMax&&" ⭐"}</div><div style={{fontFamily:"monospace",fontSize:9,color:"rgba(255,255,255,0.4)"}}>{d.team}</div></div>
          <div style={{display:"flex",gap:3}}>{d.results.map((r,i)=>(<div key={i} style={{width:24,height:24,borderRadius:5,display:"flex",alignItems:"center",justifyContent:"center",background:r>=25?"rgba(255,215,0,0.2)":r>0?"rgba(255,255,255,0.06)":"rgba(255,255,255,0.02)",fontFamily:"monospace",fontSize:9,color:r>=25?GOLD:r>0?"rgba(255,255,255,0.6)":"rgba(255,255,255,0.2)"}}>{r}</div>))}</div>
          <div style={{fontFamily:"Oswald,sans-serif",fontSize:18,fontWeight:700,color:d.isMax?RED:"white",minWidth:36,textAlign:"right"}}>{d.pts}</div>
        </div>))}</div>)}
        {tab==="calendar"&&(<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:8}}>{RACES_2026.map(r=>(<div key={r.rnd} style={{padding:"12px 14px",borderRadius:10,background:r.done?"rgba(255,255,255,0.03)":"rgba(255,255,255,0.01)",border:r.done?"1px solid rgba(255,255,255,0.08)":"1px solid rgba(255,255,255,0.04)",opacity:r.done?1:0.6}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:3}}><span style={{fontFamily:"Oswald,sans-serif",fontSize:11,color:GOLD}}>R{r.rnd}</span><span style={{fontFamily:"monospace",fontSize:9,color:"rgba(255,255,255,0.4)"}}>{r.date}</span></div>
          <div style={{fontFamily:"Oswald,sans-serif",fontSize:13,fontWeight:700,color:"white"}}>{r.name}</div>
          {r.done&&r.maxPos&&<div style={{fontFamily:"monospace",fontSize:9,color:RED,marginTop:3}}>MAX: {r.maxPos}</div>}
          {!r.done&&<div style={{fontFamily:"monospace",fontSize:9,color:"rgba(255,255,255,0.3)",marginTop:3}}>예정</div>}
        </div>))}</div>)}
      </div>
    </div>
  );
}

function TimelineSection() {
  const seasons=[{year:2015,pos:"12th",hl:"F1 데뷔 — 역대 최연소 출전 (17세)"},{year:2016,pos:"5th",hl:"스페인 GP 우승 — 역대 최연소 우승 (18세)"},{year:2017,pos:"6th",hl:"말레이시아·멕시코 GP 우승"},{year:2018,pos:"4th",hl:"오스트리아·멕시코 GP 우승"},{year:2019,pos:"3rd",hl:"오스트리아·독일·브라질 GP 우승"},{year:2020,pos:"3rd",hl:"Abu Dhabi GP 등 2승"},{year:2021,pos:"🏆",hl:"Abu Dhabi 최종전 역전 — 첫 월드 챔피언!"},{year:2022,pos:"🏆",hl:"15승 — 시즌 최다승 신기록"},{year:2023,pos:"🏆",hl:"19승 — 역대 최다승 시즌 기록 경신"},{year:2024,pos:"🏆",hl:"4연속 챔피언 — 치열한 후반 대역전극"},{year:2025,pos:"2nd",hl:"노리스에게 2포인트 차 준우승"},{year:2026,pos:"🔥",hl:"새 규정 시대 — #3 번호로 새 출발"}];
  const [vis,setVis]=useState(false);const ref=useRef(null);
  useEffect(()=>{const obs=new IntersectionObserver(([e])=>{if(e.isIntersecting)setVis(true);},{threshold:0.1});if(ref.current)obs.observe(ref.current);return()=>obs.disconnect();},[]);
  return (
    <div ref={ref} style={{background:"linear-gradient(180deg,#0d1030,#0a0e27)",padding:"80px 24px"}}>
      <div style={{maxWidth:680,margin:"0 auto"}}>
        <h2 style={{fontFamily:"Oswald,sans-serif",fontSize:"clamp(28px,5vw,42px)",fontWeight:700,color:"white",textAlign:"center",marginBottom:44}}><span style={{color:GOLD}}>커리어</span> 타임라인</h2>
        <div style={{position:"relative"}}>
          <div style={{position:"absolute",left:26,top:0,bottom:0,width:2,background:`linear-gradient(to bottom,${RED},${GOLD},${NAVY})`}}/>
          {seasons.map((s,i)=>(<div key={s.year} style={{display:"flex",gap:16,marginBottom:16,paddingLeft:6,opacity:vis?1:0,transform:vis?"translateX(0)":"translateX(-20px)",transition:`all 0.6s cubic-bezier(0.16,1,0.3,1) ${i*0.07}s`}}>
            <div style={{minWidth:36,display:"flex",flexDirection:"column",alignItems:"center",paddingTop:4}}><div style={{width:11,height:11,borderRadius:"50%",background:s.pos==="🏆"?GOLD:s.pos==="🔥"?RED:NAVY,border:"2px solid rgba(255,255,255,0.2)",boxShadow:s.pos==="🏆"?"0 0 12px rgba(255,215,0,0.5)":"none"}}/></div>
            <div style={{flex:1,background:s.pos==="🏆"?"linear-gradient(135deg,rgba(255,215,0,0.08),rgba(255,215,0,0.02))":"rgba(255,255,255,0.03)",borderRadius:11,padding:"14px 18px",border:s.pos==="🏆"?"1px solid rgba(255,215,0,0.2)":"1px solid rgba(255,255,255,0.06)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4,flexWrap:"wrap",gap:6}}>
                <span style={{fontFamily:"Oswald,sans-serif",fontSize:20,fontWeight:700,color:"white"}}>{s.year}</span>
                <span style={{fontFamily:"monospace",fontSize:11,color:s.pos==="🏆"?GOLD:RED,background:s.pos==="🏆"?"rgba(255,215,0,0.1)":"rgba(255,24,1,0.1)",padding:"2px 10px",borderRadius:20}}>{s.pos}</span>
              </div>
              <div style={{fontFamily:"monospace",fontSize:12,color:"rgba(255,255,255,0.7)",lineHeight:1.5}}>{s.hl}</div>
            </div>
          </div>))}
        </div>
      </div>
    </div>
  );
}

function QuizSection() {
  const [started,setStarted]=useState(false);const [qIdx,setQIdx]=useState(0);const [score,setScore]=useState(0);const [selected,setSelected]=useState(null);const [done,setDone]=useState(false);const [shuffled,setShuffled]=useState([]);
  const startQuiz=()=>{setShuffled([...QUIZ_QUESTIONS].sort(()=>Math.random()-0.5).slice(0,5));setStarted(true);setQIdx(0);setScore(0);setSelected(null);setDone(false);};
  const handleAnswer=(i)=>{if(selected!==null)return;setSelected(i);if(i===shuffled[qIdx].ans)setScore(s=>s+1);setTimeout(()=>{if(qIdx+1<shuffled.length){setQIdx(q=>q+1);setSelected(null);}else setDone(true);},1200);};
  const getGrade=()=>{if(score===5)return{emoji:"🏆",msg:"완벽! 당신은 진정한 Super Max 팬!"};if(score>=4)return{emoji:"🥇",msg:"훌륭해요! Max도 인정할 실력!"};if(score>=3)return{emoji:"🥈",msg:"괜찮아요! 조금만 더!"};return{emoji:"📚",msg:"Max에 대해 더 알아볼 시간이에요!"};};
  return (
    <div style={{background:"linear-gradient(135deg,#1a0a2e,#0d1b3e)",padding:"80px 24px"}}>
      <div style={{maxWidth:560,margin:"0 auto",textAlign:"center"}}>
        <div style={{fontFamily:"monospace",fontSize:10,color:GOLD,letterSpacing:"0.3em",marginBottom:8}}>TEST YOUR KNOWLEDGE</div>
        <h2 style={{fontFamily:"Oswald,sans-serif",fontSize:"clamp(28px,5vw,42px)",fontWeight:700,color:"white",marginBottom:28}}><span style={{color:RED}}>Max</span> 퀴즈</h2>
        {!started?(<div><div style={{fontSize:56,marginBottom:14}}>🏎️</div><div style={{fontFamily:"monospace",fontSize:13,color:"rgba(255,255,255,0.6)",marginBottom:20,lineHeight:1.8}}>5문제 랜덤 출제!<br/>Max에 대해 얼마나 알고 있나요?</div><button onClick={startQuiz} style={{padding:"12px 36px",borderRadius:24,background:RED,border:"none",color:"white",fontFamily:"Oswald,sans-serif",fontSize:16,fontWeight:700,cursor:"pointer"}}>퀴즈 시작!</button></div>)
        :done?(<div style={{animation:"slideUp 0.5s ease"}}><div style={{fontSize:72,marginBottom:14}}>{getGrade().emoji}</div><div style={{fontFamily:"Oswald,sans-serif",fontSize:32,fontWeight:700,color:"white",marginBottom:6}}>{score}/{shuffled.length}</div><div style={{fontFamily:"monospace",fontSize:13,color:GOLD,marginBottom:20}}>{getGrade().msg}</div><button onClick={startQuiz} style={{padding:"10px 28px",borderRadius:20,background:"rgba(255,255,255,0.1)",border:`1px solid ${RED}`,color:"white",fontFamily:"Oswald,sans-serif",fontSize:14,cursor:"pointer"}}>다시 도전!</button></div>)
        :(<div>
          <div style={{fontFamily:"monospace",fontSize:11,color:"rgba(255,255,255,0.4)",marginBottom:14}}>{qIdx+1}/{shuffled.length} · 점수: {score}</div>
          <div style={{width:"100%",height:4,borderRadius:2,background:"rgba(255,255,255,0.1)",marginBottom:20}}><div style={{width:`${((qIdx+1)/shuffled.length)*100}%`,height:"100%",borderRadius:2,background:RED,transition:"width 0.3s"}}/></div>
          <div style={{fontFamily:"Oswald,sans-serif",fontSize:18,fontWeight:500,color:"white",lineHeight:1.5,marginBottom:20}}>{shuffled[qIdx].q}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
            {shuffled[qIdx].opts.map((opt,i)=>{const ic=i===shuffled[qIdx].ans;const is=i===selected;let bg="rgba(255,255,255,0.05)",bd="rgba(255,255,255,0.1)";if(selected!==null){if(ic){bg="rgba(0,200,100,0.15)";bd="#00c864";}else if(is){bg="rgba(255,24,1,0.15)";bd=RED;}}return(<button key={i} onClick={()=>handleAnswer(i)} style={{padding:"12px 14px",borderRadius:10,background:bg,border:`1px solid ${bd}`,color:"white",fontFamily:"monospace",fontSize:12,cursor:selected!==null?"default":"pointer",transition:"all 0.3s",textAlign:"center"}}>{opt}</button>);})}
          </div>
        </div>)}
      </div>
    </div>
  );
}

function MessageBoard() {
  const [messages,setMessages]=useState([]);const [name,setName]=useState("");const [text,setText]=useState("");const [loading,setLoading]=useState(true);
  const loadMessages=useCallback(async()=>{try{const r=await storage.get("fan-messages");if(r?.value)setMessages(JSON.parse(r.value));}catch{}setLoading(false);},[]);
  useEffect(()=>{loadMessages();},[loadMessages]);
  const addMessage=async()=>{if(!name.trim()||!text.trim())return;const m={id:Date.now(),name:name.trim(),text:text.trim(),time:new Date().toLocaleString("ko-KR"),emoji:["🏎️","🏆","🦁","⚡","🔥","💙","👑","🇳🇱"][Math.floor(Math.random()*8)]};const u=[m,...messages].slice(0,50);setMessages(u);setName("");setText("");try{await storage.set("fan-messages",JSON.stringify(u));}catch{}};
  return (
    <div style={{background:BG,padding:"80px 24px"}}>
      <div style={{maxWidth:560,margin:"0 auto"}}>
        <div style={{textAlign:"center",marginBottom:28}}><div style={{fontFamily:"monospace",fontSize:10,color:GOLD,letterSpacing:"0.3em",marginBottom:8}}>FAN WALL</div><h2 style={{fontFamily:"Oswald,sans-serif",fontSize:"clamp(28px,5vw,42px)",fontWeight:700,color:"white"}}><span style={{color:RED}}>응원</span> 메시지</h2></div>
        <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:18,marginBottom:20}}>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="이름" style={{width:"100%",padding:"9px 14px",borderRadius:8,border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.04)",color:"white",fontFamily:"monospace",fontSize:12,marginBottom:8,outline:"none",boxSizing:"border-box"}}/>
          <textarea value={text} onChange={e=>setText(e.target.value)} placeholder="Max에게 응원 메시지를 남겨 주세요!" rows={3} style={{width:"100%",padding:"9px 14px",borderRadius:8,border:"1px solid rgba(255,255,255,0.1)",background:"rgba(255,255,255,0.04)",color:"white",fontFamily:"monospace",fontSize:12,marginBottom:8,outline:"none",resize:"none",boxSizing:"border-box"}}/>
          <button onClick={addMessage} style={{width:"100%",padding:"10px",borderRadius:8,background:RED,border:"none",color:"white",fontFamily:"Oswald,sans-serif",fontSize:14,fontWeight:700,cursor:"pointer"}}>응원 보내기 🏁</button>
        </div>
        {loading?(<div style={{textAlign:"center",color:"rgba(255,255,255,0.4)",fontFamily:"monospace",fontSize:12}}>로딩 중...</div>)
        :messages.length===0?(<div style={{textAlign:"center",padding:36}}><div style={{fontSize:44,marginBottom:10}}>💬</div><div style={{fontFamily:"monospace",fontSize:12,color:"rgba(255,255,255,0.4)"}}>첫 번째 응원 메시지를 남겨 주세요!</div></div>)
        :(<div style={{display:"flex",flexDirection:"column",gap:6}}>{messages.map(m=>(<div key={m.id} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.06)",borderRadius:10,padding:"12px 14px"}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}><span style={{fontSize:16}}>{m.emoji}</span><span style={{fontFamily:"Oswald,sans-serif",fontSize:13,fontWeight:700,color:"white"}}>{m.name}</span><span style={{fontFamily:"monospace",fontSize:9,color:"rgba(255,255,255,0.3)",marginLeft:"auto"}}>{m.time}</span></div>
          <div style={{fontFamily:"monospace",fontSize:12,color:"rgba(255,255,255,0.7)",lineHeight:1.6}}>{m.text}</div>
        </div>))}</div>)}
      </div>
    </div>
  );
}

function Footer() {
  return (<div style={{background:"#060918",padding:"36px 24px",textAlign:"center"}}>
    <div style={{fontFamily:"Oswald,sans-serif",fontSize:22,fontWeight:700,color:"rgba(255,255,255,0.1)",letterSpacing:"0.2em",marginBottom:10}}>MV3</div>
    <div style={{fontFamily:"monospace",fontSize:10,color:"rgba(255,255,255,0.25)"}}>비공식 팬 페이지 · Made with 💙 by Super Fan 이안 (Ian)</div>
    <div style={{fontFamily:"monospace",fontSize:9,color:"rgba(255,255,255,0.15)",marginTop:6}}>© 2026 · Red Bull Racing 또는 Max Verstappen과 공식 제휴 관계가 없습니다</div>
  </div>);
}

export default function App() {
  return (
    <div style={{fontFamily:"system-ui,sans-serif",background:BG,minHeight:"100vh",overflowX:"hidden"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;700&display=swap');@keyframes bounce{0%,100%{transform:translateY(0);opacity:0.5}50%{transform:translateY(8px);opacity:1}}@keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}*{box-sizing:border-box;margin:0}body{margin:0;background:${BG}}input::placeholder,textarea::placeholder{color:rgba(255,255,255,0.3)}`}</style>
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,background:"rgba(10,14,39,0.92)",backdropFilter:"blur(12px)",borderBottom:"1px solid rgba(255,255,255,0.06)",padding:"8px 16px",display:"flex",justifyContent:"center",gap:4,flexWrap:"wrap"}}>
        {[["hero","🏠 홈"],["race","🏎️ 레이스"],["timeline","📅 타임라인"],["quiz","🧠 퀴즈"],["messages","💬 응원"]].map(([id,label])=>(<button key={id} onClick={()=>document.getElementById(id)?.scrollIntoView({behavior:"smooth"})} style={{padding:"5px 12px",borderRadius:14,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",color:"rgba(255,255,255,0.7)",fontFamily:"monospace",fontSize:10,cursor:"pointer"}}>{label}</button>))}
      </nav>
      <div id="hero"><HeroSection/></div>
      <div id="race"><RaceResultsSection/></div>
      <div id="timeline"><TimelineSection/></div>
      <div id="quiz"><QuizSection/></div>
      <div id="messages"><MessageBoard/></div>
      <Footer/>
    </div>
  );
}
