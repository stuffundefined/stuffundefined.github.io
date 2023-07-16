let movables = document.getElementsByClassName('movable')
let folderLinks = document.getElementsByClassName('folder-link')
let folders = document.getElementsByClassName('folder')
let closers = document.getElementsByClassName('close')
let urlFolderList = () => (window.location.href.split('#').length > 1 ? window.location.href.split('#')[1].split(';'): [])
let maxZ = 4

for (id of urlFolderList()) {
    if(document.getElementById(id)) document.getElementById(id).style.display = 'unset'
}

for (el of folderLinks) {
    el.addEventListener('click', ev => {
        let el = ev.target
        let folderid = el.id.slice(3)
        document.getElementById(folderid).style.display = 'unset'
        console.log(urlFolderList())
        if(!urlFolderList().includes(folderid)) window.location.href += (urlFolderList()[0] == '' ? '' : (window.location.href.includes('#')?';':'#')) + folderid
    })
}

for (el of closers) {
    el.addEventListener('click', ev => {
        let el = ev.target
        el.parentNode.parentNode.style.display = 'none'
        window.location.href = window.location.href.split('#')[0] + '#' + urlFolderList().toSpliced(urlFolderList().indexOf(el.parentNode.id),1).join(';')
    })
}

for (el of movables) {
    if (el.id != 'center') {
        el.style.top = (Math.random()*(window.innerHeight/2)+window.innerHeight/4) + 'px'
        el.style.left = (Math.random()*(window.innerWidth/2)+window.innerWidth/4) + 'px'
        el.style['z-index'] = maxZ
    }
    el.addEventListener('pointerdown', ev => {
        if (ev.target.tagName != 'A' && !ev.target.classList.contains('close')) {
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
            el.style.top = Number(el.style.top.slice(0, el.style.top.length - 2)) + ev.movementY + 'px';
            el.style.left = Number(el.style.left.slice(0, el.style.left.length - 2)) + ev.movementX + 'px';
        }
    })
}