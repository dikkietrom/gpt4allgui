let currentInp
let replyLen = 0
init.cnt = 0

ipcRenderer.on('main-log', (event,mes)=>{

    console.log('main-log : ', mes)
}
);

ipcRenderer.on('chat-gpt4-api-hack-front', (event,arg)=>{
    // Send input data to the renderer process
    console.log('chat-gpt4-api-hack-main ipcRenderer', arg)
    ipcRenderer.send('chat-reply', arg);
    //document.body.innerHTML+=arg

}
);
ipcRenderer.on('did-tts', (event,arg)=>{

    didView.send('send-input-did', arg)

}
);

let gpt4View
let didView
let mjView
let googleView
document.addEventListener('DOMContentLoaded', ()=>{

    gpt4View = document.getElementById('gpt4-view');

    if (gpt4View) {
        gpt4View.addEventListener('dom-ready', ()=>{//gpt4View.openDevTools();
        }
        );
    }
    didView = document.getElementById('did-view');

    if (didView) {
        didView.addEventListener('dom-ready', ()=>{// didView.openDevTools();
        }
        );
    }
    mjView = document.getElementById('mj-view');

    if (mjView) {
        mjView.addEventListener('dom-ready', ()=>{//mjView.openDevTools();
        }
        );
    }
    googleView = document.getElementById('google-view');

    if (googleView) {
        googleView.addEventListener('dom-ready', ()=>{//mjView.openDevTools();
        }
        );
    }
}
);

function init() {
    document.getElementById('inp').focus()
    if (!currentInp) {
        currentInp = document.getElementById('inp')
    }

    let startupAudio = new Audio('tune.mp3')
    startupAudio.currentTime = 1;

    startupAudio.play();
    let chatImpl = document.getElementById('chat-impl')
    for (let p in chats) {
        let cht = chats[p]
        let option = document.createElement('option')
        chatImpl.appendChild(option)
        option.innerHTML = p
        option.chatImpl = cht
    }
    ipcRenderer.send('stts-main')
    ipcRenderer.send('gpt-models')
    //request plugin
    ipcRenderer.send('plugin-request')
}

//on plugin message
ipcRenderer.on('plugin-message', (event,dir)=>{

    console.log('plugin-message : ', dir)
    let script = document.createElement('script')
    let src = '../plugins/' + dir + '/index.js'
    console.log(src)
    script.src = src
    script.onload = ()=>{
        let plugin = chatsArr[chatsArr.length - 1]
        console.log('loaded plugin : ', dir, plugin)

        //add to the tabbar like <button class="tab" onclick="showTab(3)">Youtube</button>
        let tab = document.createElement('button')
        let tabbar = document.getElementById('webview-tab-bar')
        let length = tabbar.children.length
        tab.className = 'tab'
        tab.innerHTML = plugin.config().name
        tab.onclick = function() {
            showTab(length)

        }
        tabbar.appendChild(tab)

        addWebView(dir, plugin)

    }

    document.body.appendChild(script)

}
)

function addWebView(pluginDir, plugin) {
    //add the webview like
    //    <div class="tab-content">
    //       <div>
    //           <webview id="oa-view" src="https://open-assistant.io"></webview>
    //           <div class="button-bar">
    //               <button class="command" onclick="toggleWebView(this,'oa-view')">Show webview</button>
    //               <button class="command" onclick="toggleDevTools(this,'oa-view')">Debug</button>
    //           </div>
    //       </div>
    //   </div>
    let div = document.createElement('div')
    div.className = 'tab-content'
    let div2 = document.createElement('div')
    let webview = document.createElement('webview')
    plugin.webView = webview
    webview.id = pluginDir + '-view'
    webview.src = plugin.config().url
    webview.preload = '../plugins/' + pluginDir + '/preload.js'

    div2.appendChild(webview)
    let div3 = document.createElement('div')
    div3.className = 'button-bar'
    let button = document.createElement('button')
    button.className = 'command'
    button.innerHTML = 'Show webview'
    button.onclick = function() {
        toggleWebView(this, pluginDir + '-view')

    }
    div3.appendChild(button)
    let button2 = document.createElement('button')
    button2.className = 'command'
    button2.innerHTML = 'Debug'
    button2.onclick = function() {
        toggleDevTools(this, pluginDir + '-view')

    }
    div3.appendChild(button2)
    div2.appendChild(div3)
    div.appendChild(div2)
    document.getElementById('webviews').appendChild(div)
}

function setPreset(sel) {
    if (sel.value == 'google') {
        currentInp.value = `when I start a question with the word "search" then reply with search() and in between the braces all words after the first word in between single quotes no comments, no explain. Wrap it in a javascript code block. Complete this based upon what I just explained

                            Me : search apples
                            You : `
        chat()
    } else if (!sel.value) {
        currentInp.value = ``
    }
}
function textInputListener(input, event) {
    try {
        if (event.key === 'Enter') {
            chat()
            event.preventDefault();
            return false
        }
    } catch (error) {
        console.log(textInputListener.constructor.name, error)
    }
}
function text(txt) {
    let pre = document.createElement('span')
    pre.innerHTML = txt
    return pre

}
function selVal(id) {
    let sel = document.getElementById(id)
    return sel[sel.selectedIndex].value
}

function toggleWebView(button, id) {
    let webview = document.getElementById(id)
    if (webview.showing) {
        webview.style.height = '0px'
        button.innerHTML = 'Show webview'

        webview.showing = false
    } else {
        webview.style.height = '400px'
        button.innerHTML = 'Hide webview'
        button.style.position = 'relative'

        webview.showing = true
    }
}
function debug(but) {
    if (but.state === 'r') {
        but.innerHTML = 'Debug'
        but.state = 'd'
        ipcRenderer.send('debug-stop')
        return
    }
    but.innerHTML = 'Run'
    but.state = 'r'
    ipcRenderer.send('debug')
}
ipcRenderer.on('dev-tools-closed', (event,arg)=>{
    let but = document.getElementById('front-debug')
    but.innerHTML = 'Debug'
    but.state = 'd'
}
)
function debugMain(but) {
    if (but.state === 'r') {
        but.innerHTML = 'Debug main'
        but.state = 'd'
        ipcRenderer.send('debug-main-stop')
        return
    }
    but.innerHTML = 'Run main'
    but.state = 'r'
    ipcRenderer.send('debug-main')
}
function toggleDevTools(but, id) {
    if (but.state === 'r') {
        but.innerHTML = 'Debug'
        but.state = 'd'
        document.getElementById(id).closeDevTools()
        return
    }
    but.innerHTML = 'Run'
    but.state = 'r'
    document.getElementById(id).openDevTools()
}

function showTab(index) {
    // Hide all tab content
    let tabContents = document.getElementsByClassName('tab-content');
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove('active');
    }

    // Set the active tab
    let tabs = document.getElementsByClassName('tab');
    for (let i = 0; i < tabs.length; i++) {
        tabs[i].classList.remove('active');
    }
    tabs[index].classList.add('active');

    // Show the selected tab content
    tabContents[index].classList.add('active');
}

function search(txt) {
    googleView.send('send-input-all', txt)
}
