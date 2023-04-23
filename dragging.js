let center = document.getElementById('center')
center.addEventListener('pointerdown', ev => {
    center.style.top = (ev.y - ev.layerY + 150) + 'px';
    center.style.left = (ev.x - ev.layerX + 150) + 'px';
})
center.addEventListener('pointermove', ev => {
    if (ev.buttons) {
        center.style.top = Number(center.style.top.substring(0, center.style.top.length - 2)) + ev.movementY + 'px';
        center.style.left = Number(center.style.left.substring(0, center.style.left.length - 2)) + ev.movementX + 'px';
    }
})