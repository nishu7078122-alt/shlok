/* Jeevan Amrit — interactive behavior
   - drawRing: canvas ring writer
   - wellness/diet/bmi logic
   - auto-hide navbar
*/

/* ---------- Canvas ring drawing ---------- */
function drawRing(canvasId, percent, color='#c99b4b', suffix='%'){
  const c = document.getElementById(canvasId);
  if(!c) return;
  const ctx = c.getContext('2d');
  const w = c.width, h = c.height;
  const center = w/2, radius = Math.min(w,h)/2 - 12;
  ctx.clearRect(0,0,w,h);

  // background ring
  ctx.beginPath();
  ctx.arc(center,center,radius,0,Math.PI*2);
  ctx.strokeStyle = '#fff7ea';
  ctx.lineWidth = 10;
  ctx.stroke();

  // foreground arc
  const start = -Math.PI/2;
  const end = start + (Math.PI*2) * Math.max(0,Math.min(1,percent/100));
  ctx.beginPath();
  ctx.arc(center,center,radius,start,end);
  ctx.strokeStyle = color;
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.stroke();

  // text
  ctx.fillStyle = '#4a2f24';
  ctx.font = "14px Poppins, sans-serif";
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(percent + suffix, center, center);
}

/* ---------- Units and helpers ---------- */
const unitMap = {
  mood: ['minutes','hours'],
  exercise: ['minutes','sets'],
  sleep: ['hours']
};

function updateUnitOptions(){
  const act = document.getElementById('activityType').value;
  const sel = document.getElementById('unitType');
  sel.innerHTML = '<option value="">Unit</option>';
  if(!act) return;
  (unitMap[act]||[]).forEach(u=>{
    const o = document.createElement('option'); o.value = u; o.textContent = u; sel.appendChild(o);
  });
}

/* ---------- Wellness update ---------- */
const wellnessState = { goals:{mood:0,exercise:0,sleep:0}, prog:{mood:0,exercise:0,sleep:0} };

function updateWellness(){
  const type = document.getElementById('activityType').value;
  const unit = document.getElementById('unitType').value;
  const goal = parseFloat(document.getElementById('goalInput').value);
  const prog = parseFloat(document.getElementById('progressInput').value);
  if(!type || !unit || isNaN(goal) || isNaN(prog)) return alert('Fill activity, unit, goal & progress');

  let g = goal, p = prog;
  if(unit === 'hours'){ g *= 60; p *= 60; } // normalize to minutes

  wellnessState.goals[type] = g;
  wellnessState.prog[type] = Math.min(p,g);

  const percent = Math.round((wellnessState.prog[type]/wellnessState.goals[type])*100) || 0;
  drawRing(type + 'Canvas', percent, pickColor(percent));

  // overall wellness average (for defined goals)
  const keys = Object.keys(wellnessState.goals).filter(k=>wellnessState.goals[k]>0);
  const avg = keys.length ? Math.round(keys.reduce((s,k)=> s + (wellnessState.prog[k]/wellnessState.goals[k])*100,0)/keys.length) : 0;
  document.getElementById('statusFill').style.width = avg + '%';
}

/* ---------- Diet update ---------- */
const dietState = { goals:{calories:0,protein:0,water:0}, prog:{calories:0,protein:0,water:0} };

function updateDiet(){
  const type = document.getElementById('dietType').value;
  const goal = parseFloat(document.getElementById('dietGoalInput').value);
  const prog = parseFloat(document.getElementById('dietProgressInput').value);
  if(!type || isNaN(goal) || isNaN(prog)) return alert('Fill diet fields');

  dietState.goals[type] = goal;
  dietState.prog[type] = Math.min(prog,goal);
  const percent = Math.round((dietState.prog[type]/dietState.goals[type])*100) || 0;
  drawRing(type + 'Canvas', percent, pickColor(percent));

  const keys = Object.keys(dietState.goals).filter(k=>dietState.goals[k]>0);
  const avg = keys.length ? Math.round(keys.reduce((s,k)=> s + (dietState.prog[k]/dietState.goals[k])*100,0)/keys.length) : 0;
  document.getElementById('dietStatusFill').style.width = avg + '%';
}

/* ---------- BMI ---------- */
function calculateBMI(){
  const w = parseFloat(document.getElementById('weightInput').value);
  const hcm = parseFloat(document.getElementById('heightInput').value);
  if(isNaN(w) || isNaN(hcm) || hcm<=0) return alert('Enter valid weight & height');
  const m = hcm/100;
  const bmi = +(w/(m*m)).toFixed(1);
  let label = 'Normal';
  if(bmi < 18.5) label = 'Underweight';
  else if(bmi >= 25 && bmi < 30) label = 'Overweight';
  else if(bmi >= 30) label = 'Obese';
  document.getElementById('bmiResult').textContent = bmi;
  document.getElementById('bmiLabel').textContent = label;

  const pct = Math.min(100, Math.round((bmi/40)*100));
  drawRing('bmiCanvas', pct, pickColorForBMI(bmi), '');
}

/* ---------- Color helpers ---------- */
function pickColor(percent){
  if(percent < 35) return '#d97706';      // warm amber
  if(percent < 70) return '#c99b4b';      // gold
  return '#7c4a3b';                       // rich brown
}
function pickColorForBMI(bmi){
  if(bmi < 18.5) return '#a3d4ff';
  if(bmi < 25) return '#c99b4b';
  if(bmi < 30) return '#f59e0b';
  return '#ef4444';
}

/* ---------- Initialize default canvases (0%) ---------- */
window.addEventListener('load', ()=>{
  ['moodCanvas','exerciseCanvas','sleepCanvas','calorieCanvas','proteinCanvas','waterCanvas','bmiCanvas']
    .forEach(id => drawRing(id, 0, '#e0c6a1'));
});

/* ---------- Auto-hide navbar (hide on scroll down, show on scroll up) ---------- */
(function autoHideNav(){
  const nav = document.getElementById('topNav');
  if(!nav) return;
  let lastY = window.scrollY;
  let ticking = false;
  window.addEventListener('scroll', ()=> {
    const y = window.scrollY;
    if(!ticking){
      window.requestAnimationFrame(()=> {
        if(y > lastY && y > 80){ // scrolling down
          nav.classList.add('hidden');
        } else { // scrolling up
          nav.classList.remove('hidden');
        }
        lastY = y;
        ticking = false;
      });
      ticking = true;
    }
  }, {passive:true});
})();
