let isOpen = false;
export function closeMenu(){
    const style =  document.querySelector(".mobile_menu");
    if(!isOpen){
       style.style = `left:0;opacity:1`;
        isOpen = true;
    }else{
        style.style = `left:-142;opacity:0`;
        isOpen = false;
    }
}

let isCalenderOpen = false;
let isCalenderOpenOne = false;
export const ToggleCalener = (e,name) => {
    e.preventDefault();
    e.stopPropagation();
    const style =  document.querySelector(".calendar");
    const styleone =  document.querySelector(".calenderOne");
    console.log(styleone)
    console.log(name);
    if(name !== undefined && name === "one"){
        if(!isCalenderOpen){
            style.style = `display:block`;
            isCalenderOpen = true;
            isCalenderOpenOne = false;
         }else{
             style.style = `display:none`;
             isCalenderOpen = false;
         }
     
    }else if(name !== undefined && name === "two"){
        if(!isCalenderOpenOne){
            styleone.style = `display:block`;
            isCalenderOpenOne = true;
            isCalenderOpen = false;
         }else{
            styleone.style = `display:none`;
             isCalenderOpenOne = false;      
            isCalenderOpen = false;
             style.style = `display:none`;
         }
     
    }else{
        styleone.style = `display:block`;
        isCalenderOpenOne = true;
        isCalenderOpen = false;
    }
}
