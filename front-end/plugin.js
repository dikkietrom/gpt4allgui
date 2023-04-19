const pluginByName = {}
const pluginByDir = {}
const pluginById = {}
class Plugin {
    constructor(arg) {
        pluginByName[this.constructor.name] = this
        pluginById[this.config().id] = this
        try {
            throw new Error()
        } catch (error) {
            let dir = error.stack
            let part = '/KITT/plugins'
            dir = dir.substring(dir.indexOf(part) + part.length + 1)
            dir = dir.substring(0, dir.indexOf('/'))

            pluginByDir[dir] = this
            log('dir', dir)
        }

        //add it to the plugin select
        try {
            let sel = document.getElementById('plugin-impl')
            let opt = document.createElement('option')
            sel.appendChild(opt)
            opt.innerHTML = this.constructor.name
            opt.value = this.constructor.name
            if (this.config().role == 'CEO') {
                opt.selected = true
            }
        } catch (error) {
            err(error)
        }

    }
    speak(message) {}
    listen(message, container) {
        container.innerHTML += message
    }
    config() {
        return {}
    }
    exec(message) {
        throw new Error('exec not implemented for ' + this.config().name)
    }
    onBeforeSendHeaders(json) {}
    send(key, message) {
        this.webView.send(key, message)
    }
}

function plugin() {
    log('start')
    get('console-view').innerHTML = ''
    let s = span(currentInp.parentElement)
    s.style.cursor = 'pointer'
    s.innerHTML = currentInp.value
    s.onclick = function() {
        currentInp.value = this.innerHTML
        currentInp.focus()
    }
    currentInp.outerHTML = ''
    ipcRenderer.send('tts-kitt', selVal('voices'))
    let message = new Message()
    let content = currentInp.value.trim()
    let toc = 0
    if (content.charAt(0) == '/') {
        let spaceIndex = content.indexOf(' ')
        let pluginId = content.substring(1, spaceIndex == -1 ? content.length  : spaceIndex )
        message.to[0] = pluginById[pluginId]
        content = spaceIndex == -1 ? '' : content.substring(spaceIndex).trim()
    } else {
        message.to[0] = pluginById['ceo']

    }

    message.content = content

    message.from = pluginById['user']
    message.send()
}

function pluginReply(message) {
    try {
        log('plugin response : ', message)
        let pluginFrom = message.from
        let td = newPluginReplyRow(pluginFrom.config().name, 'plugin-id')
        message.to[0].listen(message, td)

        newInp()

    } catch (error) {
        err(error)
    }
}

function pluginReturn(append) {
    let ret = document.getElementById('layout')
    if (append.tagName != 'TR') {
        alert('pluginReturn() expects a TR element')
        return
    }
    if (append) {
        ret.appendChild(append)
    }

}


function newPluginReplyRow(who, cls) {
    let tr = document.createElement('tr')

    tr.height = 0
    let td = document.createElement('td')
    td.onclick = function(event) {
        if (tr.getElementsByClassName('speak').length == 0) {
            tr.style.display = 'none'
        }

    }
    td.className = '' + (cls ? cls : '')
    tr.appendChild(td)
    td.innerHTML = `${who} : `

    td = document.createElement('td')
    td.className = 'plugin-reply'
    td.colSpan = 2
    tr.appendChild(td)
    pluginReturn(tr)
    return td
}
function newInp(container) {

    let td = newPluginReplyRow('Me', 'chat-id')

    let inp = document.createElement('textarea')
    inp.className = 'speak'
    inp.onkeydown = (event)=>{
        textInputListener(this, event)
    }

    td.appendChild(inp)

    inp.value = ''
    inp.focus()
    document.body.scrollHeight = document.body.scrollTop
    currentInp = inp

}
function pluginImpl() {
    let sel = document.getElementById('plugin-impl')
    return pluginByName[sel.value]
}

function codeBlocks(arg) {
    let index = message.indexOf('```')
    let code = ''
    let ret = []
    if (index != -1) {

        while (index != -1) {
            let d = document.createElement('span')
            d.innerHTML = '[code return]'
            container.appendChild(d)
            code = message.substring(index + 3, message.indexOf('```', index + 3))
            message = message.substring(0, index) + message.substring(message.indexOf('```', index + 3) + 3)
            index = message.indexOf('```')
            d.innerHTML += '<pre onclick=eval(this.innerHTML) style=background-color:#fff7;padding:1em>' + code + '</pre>'
            code = code.trim()
            if (code.indexOf('python' == 0)) {
                ret.push(new Error("cannot directly execute python, include writing the python and executing it"))
            } else {
                ret.push(code)
            }

        }
    } else {
        return null
    }
    return ret

}