(function(){
  const state = {
    img: null,
    zoom: 1,
    offsetX: 0,
    offsetY: 0,
    dragging:false,
    lastX:0, lastY:0,
    photoDataUrl: null,
    builderId: genId()
  };

  const TITLES = ["CLOUD ARCHITECT","FULL STACK BUILDER","AI ENGINEER","PROTOCOL DESIGNER","GROWTH HACKER","SMART CONTRACT DEV","DESIGN ENGINEER","INDIE HACKER","DEVREL BUILDER","SYSTEMS TINKERER","OPEN SOURCE MAINTAINER","PRODUCT ENGINEER"];

  function genId(){
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let s = "";
    for(let i=0;i<6;i++) s += chars[Math.floor(Math.random()*chars.length)];
    return "HHG26-" + s;
  }

  // ---------- Toast ----------
  const toast = document.getElementById('toast');
  const toastTitle = document.getElementById('toastTitle');
  const toastMsg = document.getElementById('toastMsg');
  let toastTimer = null;
  function showToast(title, msg){
    toastTitle.textContent = title;
    toastMsg.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(()=> toast.classList.remove('show'), 3200);
  }

  // ---------- Step navigation ----------
  const stepUpload = document.getElementById('stepUpload');
  const stepAdjust = document.getElementById('stepAdjust');
  const stepDetails = document.getElementById('stepDetails');
  function goTo(step){
    stepUpload.classList.toggle('hidden', step!=='upload');
    stepAdjust.classList.toggle('hidden', step!=='adjust');
    stepDetails.classList.toggle('hidden', step!=='details');
    window.scrollTo({top:0, behavior:'smooth'});
  }

  // ---------- Upload ----------
  const dropZone = document.getElementById('dropZone');
  const fileInput = document.getElementById('fileInput');
  const cameraInput = document.getElementById('cameraInput');
  const takePhotoBtn = document.getElementById('takePhotoBtn');

  dropZone.addEventListener('click', ()=> fileInput.click());
  takePhotoBtn.addEventListener('click', ()=> cameraInput.click());

  ['dragenter','dragover'].forEach(evt=>{
    dropZone.addEventListener(evt, e=>{ e.preventDefault(); dropZone.classList.add('dragover'); });
  });
  ['dragleave','drop'].forEach(evt=>{
    dropZone.addEventListener(evt, e=>{ e.preventDefault(); dropZone.classList.remove('dragover'); });
  });
  dropZone.addEventListener('drop', e=>{
    const f = e.dataTransfer.files[0];
    if(f) loadFile(f);
  });
  fileInput.addEventListener('change', e=>{ if(e.target.files[0]) loadFile(e.target.files[0]); });
  cameraInput.addEventListener('change', e=>{ if(e.target.files[0]) loadFile(e.target.files[0]); });

  function loadFile(file){
    if(file.size > 10*1024*1024){ showToast('Too large','Please choose a photo under 10 MB.'); return; }
    const reader = new FileReader();
    reader.onload = e=>{
      const img = new Image();
      img.onload = ()=>{
        state.img = img;
        state.zoom = 1;
        state.offsetX = 0;
        state.offsetY = 0;
        goTo('adjust');
        drawAdjust();
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  // ---------- Adjust ----------
  const adjustCanvas = document.getElementById('adjustCanvas');
  const actx = adjustCanvas.getContext('2d');
  const zoomSlider = document.getElementById('zoomSlider');
  const zoomVal = document.getElementById('zoomVal');
  const adjustFrame = document.getElementById('adjustFrame');

  function drawAdjust(){
    if(!state.img) return;
    const W = adjustCanvas.width, H = adjustCanvas.height;
    actx.clearRect(0,0,W,H);
    actx.fillStyle = '#04150d';
    actx.fillRect(0,0,W,H);

    const img = state.img;
    const baseScale = Math.max(W/img.width, H/img.height);
    const scale = baseScale * state.zoom;
    const dw = img.width*scale, dh = img.height*scale;
    const dx = (W-dw)/2 + state.offsetX;
    const dy = (H-dh)/2 + state.offsetY;
    actx.drawImage(img, dx, dy, dw, dh);
  }

  zoomSlider.addEventListener('input', ()=>{
    state.zoom = parseFloat(zoomSlider.value);
    zoomVal.textContent = state.zoom.toFixed(1)+'x';
    drawAdjust();
  });

  document.getElementById('resetZoomBtn').addEventListener('click', ()=>{
    state.zoom = 1; state.offsetX = 0; state.offsetY = 0;
    zoomSlider.value = 1; zoomVal.textContent = '1.0x';
    drawAdjust();
  });
  document.getElementById('cancelAdjustBtn').addEventListener('click', ()=> goTo('upload'));
  document.getElementById('changePhotoBtn').addEventListener('click', ()=> goTo('upload'));

  document.getElementById('looksGoodBtn').addEventListener('click', ()=>{
    state.photoDataUrl = adjustCanvas.toDataURL('image/png');
    const im = new Image();
    im.onload = ()=>{ state.photoImg = im; drawCard(); };
    im.src = state.photoDataUrl;
    goTo('details');
  });

  // drag to reposition
  function pointerDown(x,y){ state.dragging = true; state.lastX = x; state.lastY = y; }
  function pointerMove(x,y){
    if(!state.dragging) return;
    state.offsetX += (x - state.lastX);
    state.offsetY += (y - state.lastY);
    state.lastX = x; state.lastY = y;
    drawAdjust();
  }
  function pointerUp(){ state.dragging = false; }

  adjustFrame.addEventListener('mousedown', e=> pointerDown(e.clientX, e.clientY));
  window.addEventListener('mousemove', e=> pointerMove(e.clientX, e.clientY));
  window.addEventListener('mouseup', pointerUp);
  adjustFrame.addEventListener('touchstart', e=>{ const t=e.touches[0]; pointerDown(t.clientX,t.clientY); }, {passive:true});
  adjustFrame.addEventListener('touchmove', e=>{ const t=e.touches[0]; pointerMove(t.clientX,t.clientY); }, {passive:true});
  adjustFrame.addEventListener('touchend', pointerUp);

  // ---------- Details / Card render ----------
  const fName = document.getElementById('fName');
  const fRole = document.getElementById('fRole');
  const fLocation = document.getElementById('fLocation');
  const fStack = document.getElementById('fStack');
  const fTeam = document.getElementById('fTeam');
  const fInsta = document.getElementById('fInsta');
  const fLinkedin = document.getElementById('fLinkedin');
  const fEmail = document.getElementById('fEmail');
  const fTitle = document.getElementById('fTitle');

  [fName,fRole,fLocation,fStack,fTeam,fInsta,fLinkedin,fEmail,fTitle].forEach(el=>{
    el.addEventListener('input', drawCard);
  });

  document.getElementById('shuffleTitleBtn').addEventListener('click', ()=>{
    fTitle.value = TITLES[Math.floor(Math.random()*TITLES.length)];
    drawCard();
  });

  const cardCanvas = document.getElementById('cardCanvas');
  const cctx = cardCanvas.getContext('2d');

  let cardBgImage = null;
  const cardBg = new Image();
  cardBg.onload = ()=>{ cardBgImage = cardBg; drawCard(); };
  cardBg.onerror = ()=>{ cardBgImage = null; };
  cardBg.src = 'Sun rise.png';

  function roundRect(ctx,x,y,w,h,r){
    ctx.beginPath();
    ctx.moveTo(x+r,y);
    ctx.arcTo(x+w,y,x+w,y+h,r);
    ctx.arcTo(x+w,y+h,x,y+h,r);
    ctx.arcTo(x,y+h,x,y,r);
    ctx.arcTo(x,y,x+w,y,r);
    ctx.closePath();
  }

  function drawLaptopIcon(ctx,x,y,scale){
    ctx.save();
    ctx.translate(x,y);
    ctx.scale(scale,scale);
    ctx.strokeStyle = '#f6d13b';
    ctx.fillStyle = '#f6d13b';
    ctx.lineWidth = 2.4;
    roundRect(ctx,0,0,74,48,4); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(-8,52); ctx.lineTo(82,52); ctx.lineTo(74,62); ctx.lineTo(0,62); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(10,10); ctx.lineTo(64,10); ctx.lineTo(64,26); ctx.lineTo(10,26); ctx.closePath(); ctx.globalAlpha=0.35; ctx.fill(); ctx.globalAlpha=1;
    ctx.restore();
  }
  function drawBottleIcon(ctx,x,y,scale){
    ctx.save();
    ctx.translate(x,y);
    ctx.scale(scale,scale);
    ctx.strokeStyle = '#f6d13b';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(10,0); ctx.lineTo(10,10); ctx.lineTo(2,22); ctx.lineTo(2,70);
    ctx.arcTo(2,78,10,78,8); ctx.lineTo(22,78); ctx.arcTo(30,78,30,70,8);
    ctx.lineTo(30,22); ctx.lineTo(22,10); ctx.lineTo(22,0);
    ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(6,0); ctx.lineTo(26,0); ctx.stroke();
    ctx.restore();
  }

  function timeString(){
    const d = new Date();
    let h = d.getHours();
    const m = d.getMinutes().toString().padStart(2,'0');
    const ampm = h>=12?'PM':'AM';
    h = h%12; if(h===0) h=12;
    return h+':'+m+ampm;
  }

  function wrapAndDrawStack(ctx, items, x, y, maxWidth, lineHeight){
    ctx.font = '600 20px "JetBrains Mono", monospace';
    let line = '';
    let cy = y;
    for(let i=0;i<items.length;i++){
      const test = line ? line+', '+items[i] : items[i];
      if(ctx.measureText(test).width > maxWidth && line){
        ctx.fillText(line, x, cy);
        cy += lineHeight;
        line = items[i];
      } else {
        line = test;
      }
    }
    if(line) ctx.fillText(line, x, cy);
    return cy - y + lineHeight;
  }

  function drawCard(){
    const W = cardCanvas.width, H = cardCanvas.height;
    cctx.clearRect(0,0,W,H);

    // background
    roundRect(cctx,0,0,W,H,26);
    cctx.save();
    cctx.clip();
    if(cardBgImage){
      const bw = cardBgImage.width, bh = cardBgImage.height;
      const scale = Math.max(W/bw, H/bh);
      const dw = bw*scale, dh = bh*scale;
      const bx = (W-dw)/2, by = (H-dh)/2;
      cctx.drawImage(cardBgImage, bx, by, dw, dh);
    } else {
      const grad = cctx.createLinearGradient(0,0,W,H);
      grad.addColorStop(0,'#0c3d24');
      grad.addColorStop(1,'#0a3420');
      cctx.fillStyle = grad;
      cctx.fillRect(0,0,W,H);
    }
    // dark veil so text stays legible over the photo
    const veil = cctx.createLinearGradient(0,0,0,H);
    veil.addColorStop(0,'rgba(6,30,18,0.55)');
    veil.addColorStop(0.4,'rgba(6,30,18,0.32)');
    veil.addColorStop(1,'rgba(6,30,18,0.78)');
    cctx.fillStyle = veil;
    cctx.fillRect(0,0,W,H);
    cctx.restore();

    // pink side stripes
    [26, W-26-14].forEach(sx=>{
      cctx.fillStyle = '#ef1f7a';
      roundRect(cctx, sx, 34, 14, H-68, 7); cctx.fill();
      cctx.strokeStyle = '#f6d13b';
      cctx.lineWidth = 2;
      cctx.beginPath();
      cctx.moveTo(sx+7, 44); cctx.lineTo(sx+7, H-44);
      cctx.stroke();
    });

    // top meta
    cctx.textBaseline = 'alphabetic';
    cctx.fillStyle = '#f6d13b';
    cctx.font = '600 18px "JetBrains Mono", monospace';
    cctx.textAlign = 'left';
    cctx.fillText('GOA, INDIA', 70, 62);
    cctx.textAlign = 'right';
    cctx.fillText('28 - 31 OCT 2026', W-70, 62);

    // logo
    cctx.textAlign = 'center';
    cctx.fillStyle = '#f6d13b';
    cctx.font = '800 46px "Playfair Display", serif';
    cctx.fillText('HACKER', W/2 - 92, 96);
    cctx.fillText('HOUSE', W/2 + 92, 96);
    // goa badge
    cctx.save();
    cctx.translate(W/2, 78);
    cctx.rotate(-4*Math.PI/180);
    cctx.fillStyle = '#ef1f7a';
    roundRect(cctx, -46, -30, 92, 44, 10); cctx.fill();
    cctx.fillStyle = '#f6d13b';
    cctx.font = '700 30px "Caveat", cursive';
    cctx.textAlign = 'center';
    cctx.fillText('गोवा', 0, 3);
    cctx.restore();

    // photo circle
    const px = 140, py = 210, pr = 66;
    cctx.save();
    cctx.beginPath();
    cctx.arc(px,py,pr,0,Math.PI*2);
    cctx.closePath();
    cctx.fillStyle = '#123';
    cctx.fill();
    if(state.photoImg){
      cctx.clip();
      cctx.drawImage(state.photoImg, px-pr, py-pr, pr*2, pr*2);
    }
    cctx.restore();
    cctx.strokeStyle = '#f6d13b';
    cctx.lineWidth = 3;
    cctx.beginPath(); cctx.arc(px,py,pr,0,Math.PI*2); cctx.stroke();

    // builder badge + role pill
    cctx.textAlign = 'left';
    cctx.fillStyle = '#bcd3c1';
    cctx.font = '700 17px "JetBrains Mono", monospace';
    cctx.fillText('BUILDER', px+pr+22, py-32);

    const titleText = (fTitle.value || 'BUILDER').toUpperCase();
    cctx.font = '700 17px "JetBrains Mono", monospace';
    const tw = cctx.measureText(titleText).width;
    cctx.fillStyle = '#f6d13b';
    roundRect(cctx, px+pr+120, py-50, tw+28, 34, 17); cctx.fill();
    cctx.fillStyle = '#0c3d24';
    cctx.fillText(titleText, px+pr+134, py-27);

    // name
    const nameText = fName.value || 'YOUR NAME';
    cctx.fillStyle = '#f4efe3';
    cctx.font = '600 52px "Playfair Display", serif';
    cctx.fillText(nameText, px+pr+22, py+18);

    // details grid
    const colX1 = 70, colX2 = W/2 + 30;
    const labelOffset = 132;
    const rowGap = 42;
    let dy = py + pr + 66;
    cctx.font = '600 16px "JetBrains Mono", monospace';

    function detailRow(x, label, value, color){
      if(!value) return 0;
      cctx.fillStyle = '#9fc0a8';
      cctx.font = '700 14px "JetBrains Mono", monospace';
      cctx.fillText(label, x, dy);
      cctx.fillStyle = color || '#f4efe3';
      cctx.font = '600 20px "JetBrains Mono", monospace';
      cctx.fillText(value, x + labelOffset, dy);
      return 1;
    }

    if(detailRow(colX1, 'ROLE', fRole.value, '#f4efe3')) dy += rowGap;

    const stackItems = fStack.value ? fStack.value.split(',').map(s=>s.trim()).filter(Boolean) : [];
    if(stackItems.length){
      cctx.fillStyle = '#9fc0a8'; cctx.font='700 14px "JetBrains Mono", monospace';
      cctx.fillText('STACK', colX1, dy);
      cctx.fillStyle = '#f4efe3'; cctx.font = '600 20px "JetBrains Mono", monospace';
      const usedH = wrapAndDrawStack(cctx, stackItems, colX1+labelOffset, dy, 300, 27);
      dy += Math.max(rowGap, usedH+12);
    }
    if(detailRow(colX1, 'TEAM', fTeam.value)) dy += rowGap;
    if(detailRow(colX1, 'EMAIL', fEmail.value)) dy += rowGap;

    let dy2 = py + pr + 58;
    function rightRow(label, value, formatFn){
      if(!value) return;
      const oldDy = dy; dy = dy2;
      detailRow(colX2, label, formatFn ? formatFn(value) : value);
      dy = oldDy;
      dy2 += rowGap;
    }
    rightRow('LOCATION', fLocation.value);
    rightRow('INSTA', fInsta.value, v => '@'+v.replace('@',''));
    rightRow('LINKEDIN', fLinkedin.value, v => 'in/'+v.replace('in/',''));

    // footer
    cctx.textAlign = 'left';
    cctx.fillStyle = '#f6d13b';
    cctx.font = '800 34px "JetBrains Mono", monospace';
    cctx.fillText(timeString(), 70, H-54);
    cctx.font = '700 15px "JetBrains Mono", monospace';
    cctx.fillStyle = '#e9f2ea';
    cctx.fillText('STUDIO', 70, H-32);

    const idText = 'ID: ' + state.builderId;
    const hashText = '#FrameInGoa';
    cctx.font = '700 16px "JetBrains Mono", monospace';
    const idw = cctx.measureText(idText).width;
    const hashw = cctx.measureText(hashText).width;
    const badgeW = idw + hashw + 72;
    const badgeX = W/2 - 80;
    cctx.strokeStyle = 'rgba(246,209,59,0.5)';
    roundRect(cctx, badgeX, H-80, badgeW, 38, 19); cctx.stroke();
    cctx.fillStyle = '#f4efe3';
    cctx.fillText(idText, badgeX+22, H-55);
    cctx.fillStyle = '#f6d13b';
    cctx.fillText(hashText, badgeX+22+idw+26, H-55);

    drawLaptopIcon(cctx, W-260, H-140, 1.1);
    drawBottleIcon(cctx, W-160, H-150, 1.0);

    cctx.textAlign = 'left';
  }

  // redraw when the (async-loaded) photo actually decodes, and keep clock live
  setInterval(drawCard, 1000*30);
  const origLoad = () => drawCard();

  document.getElementById('saveAgainBtn').addEventListener('click', downloadCard);
  document.getElementById('downloadBtn').addEventListener('click', downloadCard);

  function downloadCard(){
    drawCard();
    setTimeout(()=>{
      const link = document.createElement('a');
      link.download = 'hacker-house-goa-id-card.png';
      link.href = cardCanvas.toDataURL('image/png');
      link.click();
      showToast('Your card is ready', 'Successfully downloaded to your device.');
    }, 60);
  }

  document.getElementById('postXBtn').addEventListener('click', ()=>{
    downloadCard();
    const name = fName.value || 'a builder';
    const text = `I'm ${name}, a ${fTitle.value || 'Builder'} joining Hacker House Goa 2026! 🌅 Got my Builder ID card — see you there. #FrameInGoa`;
    const url = 'https://twitter.com/intent/tweet?text=' + encodeURIComponent(text);
    setTimeout(()=>{
      window.open(url, '_blank');
      showToast('Card downloaded', 'Attach the downloaded image to your post on X.');
    }, 200);
  });

  // initial id refresh each time details step is reached is fine; keep simple.
})();