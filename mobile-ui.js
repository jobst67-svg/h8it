(()=>{
  const coarse=()=>window.matchMedia('(max-width:760px), (pointer:coarse)').matches;
  const keys=()=>document.querySelector('.mobile-keys');
  function place(){
    if(!coarse()) return;
    const box=keys(); if(!box) return;
    const boot=document.querySelector('#boot');
    const gateOpen=boot && !boot.classList.contains('done');
    if(gateOpen){
      const gate=document.querySelector('.gate');
      if(gate && box.parentElement!==gate) gate.insertBefore(box,document.querySelector('#bootText'));
      box.classList.add('inline-mobile-keys');
      return;
    }
    const active=document.querySelector('.project.engaged');
    const prompt=active?.querySelector('.tile-prompt');
    if(prompt && active?.dataset.awaiting==='1'){
      if(box.previousElementSibling!==prompt) prompt.insertAdjacentElement('afterend',box);
      box.classList.add('inline-mobile-keys');
    }
  }
  setInterval(place,100);
})();
