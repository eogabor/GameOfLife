function $(elementID){
    return document.getElementById(elementID);
}
//UP BAR
$("moveUpBar").addEventListener('mouseenter',()=>{
    $("moveUpIcon").src="imgs/moveUpArrowHover.png";
})

$("moveUpBar").addEventListener('mouseleave',()=>{
    $("moveUpIcon").src="imgs/moveUpArrow.png";
})
//LEFT BAR
$("moveLeftBar").addEventListener('mouseenter',()=>{
    $("moveLeftIcon").src="imgs/moveLeftArrowHover.png";
})

$("moveLeftBar").addEventListener('mouseleave',()=>{
    $("moveLeftIcon").src="imgs/moveLeftArrow.png";
})
//RIGHT BAR
$("moveRightBar").addEventListener('mouseenter',()=>{
    $("moveRightIcon").src="imgs/moveRightArrowHover.png";
})

$("moveRightBar").addEventListener('mouseleave',()=>{
    $("moveRightIcon").src="imgs/moveRightArrow.png";
})
//DOWN BAR
$("moveDownBar").addEventListener('mouseenter',()=>{
    $("moveDownIcon").src="imgs/moveDownArrowHover.png";
})

$("moveDownBar").addEventListener('mouseleave',()=>{
    $("moveDownIcon").src="imgs/moveDownArrow.png";
})

//RANGE INPUT
const
	range = document.getElementById('stepValueInput'),
	rangeV = document.getElementById('stepValueDisplay'),
	setValue = (type)=>{
		if(type==="range"){
            rangeV.value=range.value;
        }else{
            let value=parseInt(rangeV.value);
            if(!Number.isInteger(value)){
                rangeV.value=11;
                return;
            }
            if(rangeV.value<1){
                range.value=1;
                rangeV.value=1;
            }else if(rangeV.value>20){
                range.value=20;
                rangeV.value=20;
            }else{
                range.value=rangeV.value;
            }
            
        }
	};
document.addEventListener("DOMContentLoaded", setValue("range"));
range.addEventListener('input', ()=>setValue("range"));
rangeV.addEventListener('input',()=>setValue("input"))