// Wall-clock deadlines keep time accurate when a tab is throttled or reloaded.
globalThis.FocusClock={
 create(minutes=25){const ms=Math.max(1,Math.min(240,Number(minutes)||25))*60000;return {duration:ms,remaining:ms,deadline:null,running:false,completed:false}},
 remaining(s,now=Date.now()){return s.running?Math.max(0,s.deadline-now):s.remaining},
 start(s,now=Date.now()){if(s.running)return s;if(s.completed)s={...s,remaining:s.duration,completed:false};return {...s,running:true,deadline:now+s.remaining}},
 pause(s,now=Date.now()){return {...s,remaining:this.remaining(s,now),running:false,deadline:null}},
 reset(s){return {...s,remaining:s.duration,deadline:null,running:false,completed:false}},
 tick(s,now=Date.now()){return s.running&&this.remaining(s,now)===0?{...s,remaining:0,running:false,deadline:null,completed:true}:s},
 valid(s){return s&&Number.isFinite(s.duration)&&s.duration>=60000&&s.duration<=14400000&&Number.isFinite(s.remaining)&&s.remaining>=0&&s.remaining<=s.duration&&typeof s.running==='boolean'&&typeof s.completed==='boolean'&&(!s.running||Number.isFinite(s.deadline))}
};
