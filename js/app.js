const screens = {
  story: document.getElementById('screen-story'),
  fishing: document.getElementById('screen-fishing'),
  lesson: document.getElementById('screen-lesson')
};

const scenes = [
  {speaker:'Narrátor', avatar:'N', text:'A sokaság Jézushoz tódult, és hallgatta Isten igéjét.', choices:[]},
  {speaker:'Jézus', avatar:'J', text:'Evezz a mélyre.', choices:[]},
  {speaker:'Péter', avatar:'P', text:'Egész éjjel fáradtunk...', choices:[
    {t:'De a te szavadra', ok:true},
    {t:'Most nincs értelme', ok:false},
    {t:'Máskor megpróbáljuk', ok:false}
  ]},
  {speaker:'Narrátor', avatar:'N', text:'A hálók megteltek.', choices:[]},
  {speaker:'Jézus', avatar:'J', text:'Ne félj. Mostantól embereket fogsz halászni.', choices:[]}
];

let idx = 0;
const avatar = document.getElementById('avatar');
const speaker = document.getElementById('speaker');
const text = document.getElementById('storyText');
const choices = document.getElementById('choices');

function renderScene(){
  const s = scenes[idx];
  avatar.textContent = s.avatar;
  speaker.textContent = s.speaker;
  text.textContent = s.text;
  choices.innerHTML='';
  s.choices.forEach(c=>{
    const b=document.createElement('button');b.className='choice-btn';b.textContent=c.t;
    b.onclick=()=>{if(!c.ok){b.classList.add('disabled')}else{idx++;renderScene()}};
    choices.appendChild(b);
  });
  if(s.choices.length===0 && idx<scenes.length-1){setTimeout(()=>{idx++;renderScene()},2000)}
  if(idx===scenes.length-1){setTimeout(()=>{screens.story.classList.remove('active');screens.fishing.classList.add('active')},2000)}
}
renderScene();
