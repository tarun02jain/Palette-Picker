const generateBtn = document.querySelector(".generate");
const colorDivs = document.querySelectorAll(".color");
const sliders = document.querySelectorAll('input[type="range"]');
const currentHexes = document.querySelectorAll("h2");
const popup = document.querySelector(".copy-container");
const adjustButtons = document.querySelectorAll(".adjust");
const closeButtons = document.querySelectorAll(".close-adjustment");
const lockButtons = document.querySelectorAll(".lock");
let intitalClr;
let savedPalettes = [];

generateBtn.addEventListener('click',randomClrs);

sliders.forEach(slider => {
  slider.addEventListener("input", hslControls);
});

currentHexes.forEach(hex => {
  hex.addEventListener("click", ()=>{
    copyToClipboard(hex);
  })
})

colorDivs.forEach((div,index)=>{
  div.addEventListener("change", ()=>{
    updateTextUI(index);
  });
});

popup.addEventListener('transitionend', ()=>{
  const popupBox = popup.children[0];
  popup.classList.remove("active");
  popupBox.classList.remove("active");
});

adjustButtons.forEach((adjustButton,index) => {
  adjustButton.addEventListener("click", ()=>{
    getAdjust(index);
  });
});

closeButtons.forEach((button,index)=>{
  button.addEventListener('click', ()=>{
    closeAdjust(index);
  });
});

lockButtons.forEach((button,index) =>{
  button.addEventListener("click", e=>{
    lockDiv(index,e);
  });
});

function generateHex(){
  const hexColour = chroma.random();
  return hexColour;
}

function randomClrs(){
     intitalClr = [];
    colorDivs.forEach((div,index)=>{
      const hexText = div.children[0];
      const randomColor = generateHex();
      const icons = div.querySelectorAll(".controls button");
      if (div.classList.contains("locked")){
        intitalClr.push(hexText.innerText);
        return;
      }
      else{
        intitalClr.push(chroma(randomColor).hex());
      }

      div.style.backgroundColor = randomColor;
      hexText.innerText = randomColor;


      checkTextContrast(randomColor,hexText);
      for(const icon of icons){
        checkTextContrast(randomColor,icon);
      }

      const color = chroma(randomColor);
      const slider = div.querySelectorAll(".slider input");
      const hue = slider[0];
      const brightness = slider[1];
      const saturation = slider[2];

      colorizeSlider(color, hue, brightness, saturation);

    });

    resetInput();
}

function checkTextContrast(color , text){
  const luminance = chroma(color).luminance();
  if(luminance>0.5){
    text.style.color = "black";
  }
  else{
    text.style.color = "white";
  }
}

function colorizeSlider(color, hue, brightness, saturation){
  //scale Saturation
 
  const noSat = color.set("hsl.s", 0);
  const maxSat = color.set("hsl.s", 1);
  const scaleSat = chroma.scale([noSat,color,maxSat]);

  //scale brightness
  const midBright = color.set("hsl.l",0.5);
  const scaleBright = chroma.scale(["black", midBright, "white"]);

  //Update input Color
  saturation.style.backgroundImage = `linear-gradient(to right, ${scaleSat(0)}, ${scaleSat(1)})`;
  brightness.style.backgroundImage = `linear-gradient(to right, ${scaleBright(0)}, ${scaleBright(0.5)}, ${scaleBright(1)})`;
  hue.style.backgroundImage = `linear-gradient(to right, rgb(204,75,75),rgb(204,204,75),rgb(75,204,75),rgb(75,204,204),rgb(75,75,204),rgb(204,75,204),rgb(204,75,75))`;

}

function hslControls(e){
   const index =
   e.target.getAttribute("data-hue")||
   e.target.getAttribute("data-sat")||
   e.target.getAttribute("data-bright");

   const slider = e.target.parentElement.querySelectorAll('input[type = "range"]');
   const hue = slider[0];
   const saturation = slider[1];
   const brightness = slider[2];

   const bgColor = intitalClr[index];

   let color = chroma(bgColor)
    .set("hsl.s",saturation.value)
    .set("hsl.l",brightness.value)
    .set("hsl.h",hue.value);

    colorDivs[index].style.backgroundColor = color;
    colorizeSlider(color,hue,brightness,saturation);

}

function updateTextUI(index){
  const activeDiv = colorDivs[index];
  const color = chroma(activeDiv.style.backgroundColor);
  const textHex = activeDiv.querySelector("h2");
  const icons = activeDiv.querySelectorAll(".controls button");
  textHex.innerText = color.hex();

  checkTextContrast(color,textHex);
  for(const icon of icons){
    checkTextContrast(color,icon);
  }
}

function resetInput(){
  const sliders = document.querySelectorAll(".slider input");
  sliders.forEach(slider => {
    if (slider.name === "hue"){
        const hueColor = intitalClr[slider.getAttribute("data-hue")];
        const hueValue = chroma(hueColor).hsl()[0];
        slider.value = Math.floor(hueValue*100)/100;
    }
    if(slider.name === "brightness"){
      const brightColor = intitalClr[slider.getAttribute("data-bright")];
      const brightValue = chroma(brightColor).hsl()[2];
      slider.value = Math.floor(brightValue*100)/100;
    }
    if (slider.name === "saturation"){
      const satColor = intitalClr[slider.getAttribute("data-sat")];
      const satValue = chroma(satColor).hsl()[1];
      slider.value = Math.floor(satValue*100)/100;
    }
  });
}

function copyToClipboard(hex){
  const el = document.createElement("textarea");
  el.value = hex.innerText;
  document.body.appendChild(el);
  el.select();
  document.execCommand("copy");
  document.body.removeChild(el);

  //Pop up animation
  const popupBox = popup.children[0];
  popup.classList.add("active");
  popupBox.classList.add("active");

}

function getAdjust(index){
  const activeSlider = colorDivs[index].querySelector(".slider");
  activeSlider.classList.toggle("active");
}
function closeAdjust(index){
  const activeSlider = colorDivs[index].querySelector(".slider");
  activeSlider.classList.remove("active");

}

function lockDiv(index,e){
  const lockSVG = e.target.children[0];
  const activeDiv = colorDivs[index];
  activeDiv.classList.toggle("locked");

  if (lockSVG.classList.contains("fa-lock-open")){
    e.target.innerHTML =  '<i class="fas fa-lock"></i>';
  }
  else{
    e.target.innerHTML = `<i class="fas fa-lock-open"></i>`;
  }
}

randomClrs();

//Hadling Save Panel and local storage stuff
const saveBtn = document.querySelector(".save");
const popupd = document.querySelector(".save-container");
const closeSave = document.querySelector(".close-save");
const saveVal = document.querySelector(".save-name");
const submitSave = document.querySelector(".submit-save");
const popupl = document.querySelector(".library-container");
const libBtn = document.querySelector(".library");
const closeLib= document.querySelector(".close-library");


saveBtn.addEventListener("click", openSave);
closeSave.addEventListener("click", closeSaved);
submitSave.addEventListener("click", savePalette);
libBtn.addEventListener("click", openLib);
closeLib.addEventListener("click", closeLibr);


function openSave(){
  const popupBox = popupd.children[0];
  popupBox.classList.add("active");
  popupd.classList.add("active");
}
function closeSaved(){
  const popupBox = popupd.children[0];
  popupBox.classList.remove("active");
  popupd.classList.remove("active");
}
function savePalette(){
  const popupBox = popupd.children[0];
  popupBox.classList.remove("active");
  popupd.classList.remove("active");
  const palobj = JSON.parse(localStorage.getItem("palettes"));
  let paletteNr;
  if (palobj === null){
     paletteNr = savedPalettes.length;
  }
  else{
    paletteNr = palobj.length;
  }
  const name = saveVal.value;
  const colors = [];
  currentHexes.forEach(hex => {
    colors.push(hex.innerText);
  });
  savedPalettes.push({name, colors, paletteNr});

  storePalette(savedPalettes);
  saveVal.value = "";

  const saved = document.createElement("div");
  saved.classList.add("custom-palette");
  const title = document.createElement("h4");
  title.innerText = name;
  const preview = document.createElement("div");
  preview.classList.add("small-preview");
  colors.forEach(color=>{
    const smallDiv = document.createElement("div");
    smallDiv.style.backgroundColor = color;
    preview.appendChild(smallDiv);
  });
  const selectBtn = document.createElement("button");
  selectBtn.classList.add("select-palette");
  selectBtn.classList.add(paletteNr);
  selectBtn.innerText = "Select";

  selectBtn.addEventListener('click', e=>{
    closeLibr();
    const paletteInd = e.target.classList[1];
    intitalClr = [];
    savedPalettes[paletteInd].colors.forEach((color,ind) => {
      intitalClr.push(color);
      colorDivs[ind].style.backgroundColor = color;
      const text = colorDivs[ind].children[0];
      checkTextContrast(color,text);
      updateTextUI(ind);
       // Check if any colorDiv is locked and unlock it
      colorDivs.forEach((div, ind) => {
      if (div.classList.contains("locked")) {
      div.classList.remove("locked");
      const lockButton = lockButtons[ind];
      lockButton.innerHTML = '<i class="fas fa-lock-open"></i>';
    }
  });
    });
    resetInput();
  });

  saved.appendChild(title);
  saved.appendChild(preview);
  saved.appendChild(selectBtn);
  popupl.children[0].appendChild(saved);

}

function storePalette(savedPalettes){
  let local;
  if (localStorage.getItem("palettes") === null){
      local = [];
  }
  else{
    local = JSON.parse(localStorage.getItem("palettes"));
  }
  
  local.push(savedPalettes);
  localStorage.setItem("palettes" , JSON.stringify(local));
}

function openLib(){
  const popupBox = popupl.children[0];
  popupl.classList.add("active");
  popupBox.classList.add("active");
}

function closeLibr(){
  const popupBox = popupl.children[0];
  popupl.classList.remove("active");
  popupBox.classList.remove("active");
}

function getLocal(){
  if (localStorage.getItem("palettes") === null){
    local = [];
  }
  else{
    const objs = JSON.parse(localStorage.getItem("palettes"));
    savedPalettes = [...objs];
    // console.log(objs);
    objs.forEach((obj,index) => {
      // console.log(obj[index])
      const saved = document.createElement("div");
      saved.classList.add("custom-palette");
      const title = document.createElement("h4");
      title.innerText = obj[index].name;
      const preview = document.createElement("div");
      preview.classList.add("small-preview");
      obj[index].colors.forEach(color=>{
        const smallDiv = document.createElement("div");
        smallDiv.style.backgroundColor = color;
        preview.appendChild(smallDiv);
      });
      const selectBtn = document.createElement("button");
      selectBtn.classList.add("select-palette");
      selectBtn.classList.add(obj[index].paletteNr);
      selectBtn.innerText = "Select";
    
      selectBtn.addEventListener('click', e=>{
        closeLibr();
        const paletteInd = e.target.classList[1];
        intitalClr = [];
        console.log(objs);
        objs[paletteInd][index].colors.forEach((color,ind) => {
          intitalClr.push(color);
          colorDivs[ind].style.backgroundColor = color;
          const text = colorDivs[ind].children[0];
          checkTextContrast(color,text);
          updateTextUI(ind);
           // Check if any colorDiv is locked and unlock it
          colorDivs.forEach((div, ind) => {
          if (div.classList.contains("locked")) {
          div.classList.remove("locked");
          const lockButton = lockButtons[ind];
          lockButton.innerHTML = '<i class="fas fa-lock-open"></i>';
    }
  });
        });
        resetInput();
      });
    
      saved.appendChild(title);
      saved.appendChild(preview);
      saved.appendChild(selectBtn);
      popupl.children[0].appendChild(saved);
    
    });
  }
  
}
// localStorage.clear();
getLocal();
