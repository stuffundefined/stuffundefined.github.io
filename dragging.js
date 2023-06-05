let center = document.getElementById('center')
center.addEventListener('pointerdown', ev => {
    // console.log(ev.target)
    if (ev.target == center) {
        center.style.top = (ev.y - ev.offsetY + 150) + 'px';
        center.style.left = (ev.x - ev.offsetX + 150) + 'px';
    }
})
center.addEventListener('pointermove', ev => {
    console.log(ev.target.tagName)
    if (ev.buttons && center.style.top && ev.target.tagName != 'A') {
        center.style.top = Number(center.style.top.substring(0, center.style.top.length - 2)) + ev.movementY + 'px';
        center.style.left = Number(center.style.left.substring(0, center.style.left.length - 2)) + ev.movementX + 'px';
    }
})