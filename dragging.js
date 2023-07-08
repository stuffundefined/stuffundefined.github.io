let draggables = document.getElementsByClassName('movable')
for (element of draggables) {
    element.addEventListener('pointerdown', ev => {
        if (ev.target == element) {
            element.style.top = (ev.y - ev.offsetY + 150) + 'px';
            element.style.left = (ev.x - ev.offsetX + 150) + 'px';
        }
    })
    element.addEventListener('pointermove', ev => {
        if (ev.buttons && element.style.top && ev.target.tagName != 'A') {
            element.style.top = Number(element.style.top.substring(0, element.style.top.length - 2)) + ev.movementY + 'px';
            element.style.left = Number(element.style.left.substring(0, element.style.left.length - 2)) + ev.movementX + 'px';
        }
    })
}