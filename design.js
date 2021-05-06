function $(elementID){
    return document.getElementById(elementID);
}
//UP BAR
$("moveUpBar").addEventListener('mouseenter',()=>{
    $("moveUpIcon").src="moveUpArrowHover.png";
})

$("moveUpBar").addEventListener('mouseleave',()=>{
    $("moveUpIcon").src="moveUpArrow.png";
})
//LEFT BAR
$("moveLeftBar").addEventListener('mouseenter',()=>{
    $("moveLeftIcon").src="moveLeftArrowHover.png";
})

$("moveLeftBar").addEventListener('mouseleave',()=>{
    $("moveLeftIcon").src="moveLeftArrow.png";
})
//RIGHT BAR
$("moveRightBar").addEventListener('mouseenter',()=>{
    $("moveRightIcon").src="moveRightArrowHover.png";
})

$("moveRightBar").addEventListener('mouseleave',()=>{
    $("moveRightIcon").src="moveRightArrow.png";
})
//DOWN BAR
$("moveDownBar").addEventListener('mouseenter',()=>{
    $("moveDownIcon").src="moveDownArrowHover.png";
})

$("moveDownBar").addEventListener('mouseleave',()=>{
    $("moveDownIcon").src="moveDownArrow.png";
})

//RANGE INPUT
const
	range = document.getElementById('stepValueInput'),
	rangeV = document.getElementById('stepValueDisplay'),
	setValue = (type)=>{
		if(type==="range"){
            rangeV.value=range.value;
        }else{
            range.value=rangeV.value;
        }
	};
document.addEventListener("DOMContentLoaded", setValue("range"));
range.addEventListener('input', ()=>setValue("range"));
rangeV.addEventListener('input',()=>setValue("input"))