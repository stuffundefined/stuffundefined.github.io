let draggables = document.getElementsByClassName('movable')
let maxZ = 3
console.log(draggables)
for (el of draggables) {
    el.addEventListener('pointerdown', ev => {
        if (ev.target.tagName != 'A') {
            let el = ev.target
            maxZ += 1;
            el.style['z-index'] = maxZ;
            el.style.top = (ev.y - ev.offsetY + el.offsetHeight/2) + 'px';
            el.style.left = (ev.x - ev.offsetX + el.offsetWidth/2) + 'px';
        }
    })
    el.addEventListener('pointermove', ev => {
        if (ev.buttons && ev.target.style.top && ev.target.tagName != 'A') {
            let el = ev.target
            el.style.top = Number(el.style.top.substring(0, el.style.top.length - 2)) + ev.movementY + 'px';
            el.style.left = Number(el.style.left.substring(0, el.style.left.length - 2)) + ev.movementX + 'px';
        }
    })
}