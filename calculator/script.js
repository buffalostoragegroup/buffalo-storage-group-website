(function () {
  'use strict';
  const root = document.querySelector('#bsg-storage-calculator');
  if (!root) return;

  const ITEMS = [
    ['small-box','Small box','Box','Boxes','BX',1.5,1.5,1.5,3,'#b9824b','box'],
    ['large-box','Large box','Large box','Boxes','LG',2,2,2,2,'#a86f3e','box'],
    ['tote','Storage tote','Tote','Boxes','TB',2,1.5,1.5,3,'#487b9d','tote'],
    ['sofa','Sofa','Sofa','Furniture','SO',7,3,3,1,'#2c6479','sofa'],
    ['loveseat','Loveseat','Loveseat','Furniture','LS',5,3,3,1,'#39768b','sofa'],
    ['chair','Armchair','Chair','Furniture','CH',3,3,3.5,1,'#4c8192','chair'],
    ['dining-table','Dining table','Table','Furniture','DT',5,3,2.5,1,'#805b3f','table'],
    ['coffee-table','Coffee table','Coffee table','Furniture','CT',4,2,1.5,1,'#8e6746','table'],
    ['dresser','Dresser','Dresser','Furniture','DR',4.5,2,3.5,1,'#74513c','dresser'],
    ['bookcase','Bookcase','Bookcase','Furniture','BC',3,1.25,6,1,'#72513a','shelf'],
    ['shelving','Shelving unit','Shelving','Furniture','SH',4,1.5,6,1,'#67737a','shelf'],
    ['desk','Desk','Desk','Office','DK',5,2.5,2.5,1,'#76583f','desk'],
    ['filing-cabinet','Filing cabinet','File cabinet','Office','FC',1.5,2,4,1,'#596a74','cabinet'],
    ['twin-mattress','Twin mattress','Twin bed','Bedroom','TW',3.25,6.25,1,1,'#d9d3c5','mattress'],
    ['queen-mattress','Queen mattress','Queen bed','Bedroom','QN',5,6.7,1,1,'#ded8ca','mattress'],
    ['bed-frame','Bed frame','Bed frame','Bedroom','BF',5,2,2,1,'#806047','bed-frame'],
    ['nightstand','Nightstand','Nightstand','Bedroom','NS',2,1.5,2,1,'#7c5940','dresser'],
    ['refrigerator','Refrigerator','Fridge','Appliances','RF',3,3,6,1,'#c8d1d6','appliance'],
    ['washer','Washer','Washer','Appliances','WA',2.5,2.7,3.5,1,'#c7d3d9','washer'],
    ['dryer','Dryer','Dryer','Appliances','DY',2.5,2.7,3.5,1,'#bbc9d0','washer'],
    ['freezer','Chest freezer','Freezer','Appliances','FZ',4,2.5,3,1,'#c7d2d7','freezer'],
    ['television','Television','TV','Electronics','TV',4,1,2.5,1,'#26333b','tv'],
    ['bicycle','Bicycle','Bike','Outdoor','BK',5.5,2,3.5,1,'#c4443c','bike'],
    ['lawn-mower','Lawn mower','Mower','Outdoor','LM',3,2,2.5,1,'#48794d','mower']
  ].map(([id,name,short,category,icon,width,depth,height,stack,color,model]) => ({id,name,short,category,icon,width,depth,height,stack,color,model}));

  const UNITS = [
    ['5x10','5 × 10',5,10,'a large walk-in closet','Often fits the contents of a studio or small one-bedroom apartment.'],
    ['10x10','10 × 10',10,10,'half of a one-car garage','A popular choice for the contents of a two-bedroom home.'],
    ['10x15','10 × 15',10,15,'a large bedroom','Room for a three-bedroom home, including major appliances.'],
    ['10x20','10 × 20',10,20,'a one-car garage','Ideal for a larger home, business inventory, or many bulky items.'],
    ['10x25','10 × 25',10,25,'an extra-deep garage','Suited to a four-bedroom home or large household move.'],
    ['10x30','10 × 30',10,30,'a long two-car garage bay','Our largest guide size for whole-home or commercial storage.']
  ].map(([id,label,width,depth,title,description]) => ({id,label,width,depth,title,description,capacity:width*depth*8}));

  const state = { quantities:{}, selectedUnit:'5x10', category:'All', query:'', rotation:-38, userComparing:false };
  const $ = selector => root.querySelector(selector);
  const volume = item => item.width*item.depth*item.height;
  const totalVolume = () => ITEMS.reduce((sum,item)=>sum+(state.quantities[item.id]||0)*volume(item),0);
  const unitById = id => UNITS.find(unit=>unit.id===id);

  function groups() {
    const result=[];
    ITEMS.forEach(item=>{
      let left=state.quantities[item.id]||0;
      while(left){const count=Math.min(left,item.stack);result.push({item,count,width:item.width,depth:item.depth,height:item.height*count});left-=count;}
    });
    return result.sort((a,b)=>b.width*b.depth-a.width*a.depth);
  }

  function pack(unit) {
    const step=.5, cols=Math.round(unit.width/step), rows=Math.round(unit.depth/step);
    const grid=Array.from({length:rows},()=>Array(cols).fill(false)), placements=[];
    let failed=false;
    function find(width,depth){
      const w=Math.ceil(width/step),d=Math.ceil(depth/step);
      for(let row=0;row<=rows-d;row++)for(let col=0;col<=cols-w;col++){
        let clear=true;
        for(let y=row;y<row+d&&clear;y++)for(let x=col;x<col+w;x++)if(grid[y][x]){clear=false;break;}
        if(clear)return{col,row,w,d};
      }
      return null;
    }
    groups().forEach(group=>{
      let spot=find(group.width,group.depth),rotated=false;
      if(!spot&&group.width!==group.depth){spot=find(group.depth,group.width);rotated=!!spot;}
      if(!spot){failed=true;return;}
      for(let y=spot.row;y<spot.row+spot.d;y++)for(let x=spot.col;x<spot.col+spot.w;x++)grid[y][x]=true;
      placements.push({...group,x:spot.col*step,y:spot.row*step,width:rotated?group.depth:group.width,depth:rotated?group.width:group.depth});
    });
    const occupied=grid.reduce((sum,row)=>sum+row.filter(Boolean).length,0)/(cols*rows);
    return{fits:!failed,placements,occupied};
  }

  function recommended(){return UNITS.find(unit=>totalVolume()<=unit.capacity*.82&&pack(unit).fits)||UNITS.at(-1);}

  function symbol(item){
    const details={sofa:'<i class="back"></i><i class="seat"></i>',chair:'<i class="back"></i><i class="seat"></i>',table:'<i class="top"></i><i class="legs"></i>',desk:'<i class="top"></i><i class="legs"></i>',dresser:'<i class="drawers"></i>',cabinet:'<i class="drawers"></i>',shelf:'<i class="shelves"></i>',mattress:'<i class="pillow"></i>',appliance:'<i class="handle"></i>',washer:'<i class="drum"></i>',tv:'<i class="screen"></i>',bike:'<i class="wheel one"></i><i class="wheel two"></i>',box:'<i class="tape"></i>',tote:'<i class="lid"></i>',freezer:'<i class="lid"></i>'};
    return `<span class="bsg-item-symbol model-${item.model}" style="--item-color:${item.color}" aria-hidden="true">${details[item.model]||''}</span>`;
  }

  function renderCategories(){const cats=['All',...new Set(ITEMS.map(i=>i.category))];$('#categoryFilters').innerHTML=cats.map(c=>`<button type="button" data-category="${c}" class="${c===state.category?'active':''}" aria-pressed="${c===state.category}">${c}</button>`).join('');}

  function renderItems(){
    const q=state.query.trim().toLowerCase();
    const shown=ITEMS.filter(i=>(state.category==='All'||i.category===state.category)&&(!q||`${i.name} ${i.category}`.toLowerCase().includes(q)));
    $('#itemGrid').innerHTML=shown.length?shown.map(i=>`<button class="bsg-item-button" type="button" data-add="${i.id}" aria-label="Add ${i.name}">${symbol(i)}<span>${i.short}</span>${state.quantities[i.id]?`<b>${state.quantities[i.id]}</b>`:''}</button>`).join(''):'<p class="bsg-no-results">No items match that search.</p>';
  }

  function renderSelected(){
    const selected=ITEMS.filter(i=>state.quantities[i.id]),count=selected.reduce((sum,i)=>sum+state.quantities[i.id],0);
    $('#itemTotal').textContent=count;$('#clearButton').disabled=!count;
    $('#selectedItems').innerHTML=selected.length?selected.map(i=>`<div class="bsg-selected-row">${symbol(i)}<span><strong>${i.name}</strong><small>${i.width}′ × ${i.depth}′ × ${i.height}′</small></span><div class="bsg-quantity"><button type="button" data-remove="${i.id}" aria-label="Remove one ${i.name}">−</button><span aria-label="Quantity ${state.quantities[i.id]}">${state.quantities[i.id]}</span><button type="button" data-add="${i.id}" aria-label="Add another ${i.name}">+</button></div></div>`).join(''):'<div class="bsg-empty-state"><span>+</span><p>Your unit is empty.<br>Add an item above to begin.</p></div>';
  }

  function objectDetails(model){const d={sofa:'<i class="detail back"></i><i class="detail arm left"></i><i class="detail arm right"></i>',chair:'<i class="detail back"></i><i class="detail arm left"></i><i class="detail arm right"></i>',table:'<i class="detail leg a"></i><i class="detail leg b"></i><i class="detail leg c"></i><i class="detail leg d"></i>',desk:'<i class="detail leg a"></i><i class="detail leg b"></i>',dresser:'<i class="detail drawer one"></i><i class="detail drawer two"></i><i class="detail drawer three"></i>',cabinet:'<i class="detail drawer one"></i><i class="detail drawer two"></i><i class="detail drawer three"></i>',shelf:'<i class="detail shelf one"></i><i class="detail shelf two"></i><i class="detail shelf three"></i>',washer:'<i class="detail washer-door"></i>',tv:'<i class="detail screen"></i>',bike:'<i class="detail bike-wheel one"></i><i class="detail bike-wheel two"></i><i class="detail bike-frame"></i>',box:'<i class="detail box-tape"></i>',tote:'<i class="detail tote-lid"></i>',freezer:'<i class="detail tote-lid"></i>',mattress:'<i class="detail mattress-line"></i>','bed-frame':'<i class="detail slats"></i>'};return d[model]||'';}

  function renderRoom(unit){
    const scale=Math.min(360/unit.width,300/unit.depth),room=$('#room');
    room.style.setProperty('--floor-width',`${unit.width*scale}px`);room.style.setProperty('--floor-depth',`${unit.depth*scale}px`);room.style.setProperty('--foot-scale',`${scale}px`);room.style.setProperty('--wall-height',`${Math.max(145,Math.min(190,scale*6))}px`);
    $('#backWallLabel').textContent=`${unit.width}′ wide`;
    const packing=pack(unit);
    $('#placedItems').innerHTML=packing.placements.map((p,n)=>`<div class="bsg-object model-${p.item.model}" title="${p.item.name}${p.count>1?` × ${p.count}`:''}" style="--left:${p.x*scale}px;--top:${p.y*scale}px;--width:${p.width*scale}px;--depth:${p.depth*scale}px;--oh:${Math.min(p.height,7)*scale*.78}px;--color:${p.item.color};--delay:${n*18}ms"><div class="bsg-object-body"><i class="face top"></i><i class="face front"></i><i class="face side"></i>${objectDetails(p.item.model)}<span>${p.item.short}${p.count>1?` ×${p.count}`:''}</span></div></div>`).join('');
    return packing;
  }

  function renderSummary(){
    const rec=recommended();if(!state.userComparing)state.selectedUnit=rec.id;
    const unit=unitById(state.selectedUnit),packing=renderRoom(unit),vol=totalVolume(),floorPct=packing.occupied*100,pct=Math.round(Math.max(vol/unit.capacity*100,floorPct)),count=Object.values(state.quantities).reduce((a,b)=>a+b,0);
    $('#recommendedSize').textContent=rec.label;$('#mobileRecommendedSize').textContent=rec.label;$('#roomLabel').textContent=`${unit.label} ft unit`;$('#capacityPercent').textContent=`${pct}%`;$('#meterFill').style.width=`${Math.min(pct,100)}%`;$('#capacityText').textContent=`${Math.round(vol)} of ${unit.capacity} cu. ft. • ${Math.round(floorPct)}% floor area`;$('#unitDescription').innerHTML=`<strong>Comparable to ${unit.title}</strong><br>${unit.description}`;$('#recommendReason').textContent=count?`Sized for ${count} selected item${count===1?'':'s'}, with packing room.`:'Start adding items to build your estimate.';$('#showRecommended').hidden=unit.id===rec.id;
    if(!count)$('#fitStatus').innerHTML='<span class="bsg-status-dot"></span><p><strong>Your room is ready</strong><span>Add items to see how they fit.</span></p>';
    else if(!packing.fits||pct>100)$('#fitStatus').innerHTML=`<span class="bsg-status-dot danger"></span><p><strong>This room is too small</strong><span>We recommend a ${rec.label} unit for this inventory.</span></p>`;
    else if(pct>82)$('#fitStatus').innerHTML='<span class="bsg-status-dot warning"></span><p><strong>This will be a tight fit</strong><span>Careful stacking will be needed, with limited access space.</span></p>';
    else $('#fitStatus').innerHTML=`<span class="bsg-status-dot"></span><p><strong>Your items fit this room</strong><span>About ${Math.max(0,100-pct)}% remains for access and packing space.</span></p>`;
    $('#unitButtons').innerHTML=UNITS.map(u=>`<button type="button" class="bsg-unit-button ${u.id===unit.id?'active':''} ${u.id===rec.id?'recommended':''}" data-unit="${u.id}" aria-pressed="${u.id===unit.id}">${u.label}${u.id===rec.id?'<small>Best fit</small>':''}</button>`).join('');
  }

  function render(){renderCategories();renderItems();renderSelected();renderSummary();}
  function change(id,delta){state.quantities[id]=Math.max(0,(state.quantities[id]||0)+delta);if(!state.quantities[id])delete state.quantities[id];state.userComparing=false;render();}

  root.addEventListener('click',event=>{const add=event.target.closest('[data-add]'),remove=event.target.closest('[data-remove]'),unit=event.target.closest('[data-unit]'),category=event.target.closest('[data-category]');if(add)change(add.dataset.add,1);else if(remove)change(remove.dataset.remove,-1);else if(unit){state.selectedUnit=unit.dataset.unit;state.userComparing=true;renderSummary();}else if(category){state.category=category.dataset.category;renderCategories();renderItems();}});
  $('#itemSearch').addEventListener('input',event=>{state.query=event.target.value;renderItems();});
  $('#clearButton').addEventListener('click',()=>{state.quantities={};state.userComparing=false;render();});
  $('#showRecommended').addEventListener('click',()=>{state.selectedUnit=recommended().id;state.userComparing=false;renderSummary();});
  $('#rotateLeft').addEventListener('click',()=>{state.rotation=Math.max(-64,state.rotation-8);$('#room').style.transform=`rotateX(58deg) rotateZ(${state.rotation}deg)`;});
  $('#rotateRight').addEventListener('click',()=>{state.rotation=Math.min(-12,state.rotation+8);$('#room').style.transform=`rotateX(58deg) rotateZ(${state.rotation}deg)`;});
  $('#resetView').addEventListener('click',()=>{state.rotation=-38;$('#room').style.transform='rotateX(58deg) rotateZ(-38deg)';});
  const cta=root.dataset.findUnitUrl||'https://buffalostoragegroup.com/#locations';$('#findUnitCta').href=cta;$('#mobileFindUnitCta').href=cta;
  render();
}());
