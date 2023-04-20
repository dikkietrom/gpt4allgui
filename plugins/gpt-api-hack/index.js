let currentInput
class Gpt4apiHack extends Plugin {
    constructor(arg) {
        super(arg)
    }

    config() {
        return {
            name: 'Gpt4ApiHack',
            description: 'Gpt4ApiHack',
            role: 'xCEO',
            active:true,
            url: "https://chat.openai.com/"
        }
    }
    onBeforeSendHeaders(arg) {
       try {
            // Send input data to the renderer process
            // log('plugin-gpt4-api-hack-reply arg : ', arg);

            let obj = arg
            let message = obj.input ? obj.input.trim() : ''
            log('onBeforeSendHeaders currentInput : ', currentInput);
            if (message && message != currentInput) {
                log('plugin-gpt4-api-hack ipcRenderer', message)
                if (message.indexOf(currentInput) != -1) {
                    log('plugin-gpt4-api-hack ipcRenderer', message)

                    message = message.substring(message.indexOf(currentInput) + currentInput.length)
                }
                let index = message.indexOf('```')
                let code = ''
                if (index != -1) {

                    while (index != -1) {
                        let d = document.createElement('span')
                        d.innerHTML = '[code return]'
                        container.appendChild(d)
                        code = message.substring(index + 3, message.indexOf('```', index + 3))
                        message = message.substring(0, index) + message.substring(message.indexOf('```', index + 3) + 3)
                        index = message.indexOf('```')
                        d.innerHTML += '<pre onclick=eval(this.innerHTML) style=background-color:#fff7;padding:1em>'+code+'</pre>'
                        code= code.trim()
                        if (code.indexOf('python'==0)) {
                            throw new Error("cannot directly execute python, include writing the python and executing it")
                        }
                        if (code.indexOf('javascript') == 0) {
                            code = code.substring(10)
                        } else if (code.indexOf('js') == 0 ) {
                            code = code.substring(2)
                        } else if (code.indexOf('html') == 0 || code.indexOf('<!DOCTYPE') == 0) {
                            code = '1==true'
                        }else if (code.indexOf('bash') == 0) {
                            ipcRenderer.send('bash', code.substring(4))
                            currentInp.value = code
                            return
                        }else if (code.indexOf('#!/bin/bash') == 0) {
                            //currentInp.value = code
                            ipcRenderer.send('bash', code)
                            return
                        }
                        try {
                            log('plugin-gpt4-api-hack-reply eval : ', code);
                            eval(code)
                        } catch (e) {
                            err(e)
                            currentInp.value = e.message
                            //setTimeout('run()', 500);
                        }
                    }
                } else {
                    let d = span(container)
                    d.innerHTML = message
                    //event.sender.send('plugin-gpt4-api-hack-reply', message);
                    log('plugin-gpt4-api-hack-reply selVal(\'voices\').value : ', selVal('voices'));
                    if (selVal('voices') ) {
                          ipcRenderer.send('tts', {
                                txt: message,
                                voice: selVal('voices')
                            })
                    }
                }

            }
        } catch (error) {
            err(error)
        }

    }
}


ipcRenderer.on('plugin-gpt4-api-hack-front', (event,arg)=>{
    // Send input data to the renderer process
    log('plugin-gpt4-api-hack-main ipcRenderer', arg)
    ipcRenderer.send('plugin-reply', arg);
    //document.body.innerHTML+=arg

}
);

function exec(command) {
    alert(command)
}

let gpt4apiHack = new Gpt4apiHack()
