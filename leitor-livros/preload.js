const { contextBridge, ipcRenderer, webUtils } = require('electron')

const invoke = (ch, ...args) => ipcRenderer.invoke(ch, ...args)

contextBridge.exposeInMainWorld('api', {
    store: {
        get: name => invoke('store:get', name),
        set: (name, data) => invoke('store:set', name, data),
        delete: name => invoke('store:delete', name),
    },
    books: {
        pick: () => invoke('books:pick'),
        pickFolder: () => invoke('books:pickFolder'),
        importFiles: files => invoke('books:import', files.map(f => webUtils.getPathForFile(f))),
        remove: (fileName, id) => invoke('books:remove', fileName, id),
        saveCover: (id, data) => invoke('books:saveCover', id, data),
        showInFolder: fileName => invoke('books:showInFolder', fileName),
        pending: () => invoke('books:pending'),
        extractCBR: fileName => invoke('cbr:extract', fileName),
    },
    file: {
        saveText: opts => invoke('file:saveText', opts),
        openText: opts => invoke('file:openText', opts),
    },
    net: {
        translate: opts => invoke('net:translate', opts),
        dictionary: opts => invoke('net:dictionary', opts),
        wikipedia: opts => invoke('net:wikipedia', opts),
    },
    ai: {
        chat: (opts, onDelta) => {
            const reqId = Math.random().toString(36).slice(2)
            const listener = (_, msg) => { if (msg.reqId === reqId) onDelta?.(msg.delta) }
            ipcRenderer.on('ai:chunk', listener)
            const promise = invoke('ai:chat', { ...opts, reqId })
                .finally(() => ipcRenderer.removeListener('ai:chunk', listener))
            return { promise, abort: () => invoke('ai:abort', reqId) }
        },
        json: opts => invoke('ai:json', opts),
    },
    app: {
        toggleFullscreen: () => invoke('app:toggleFullscreen'),
        openExternal: url => invoke('app:openExternal', url),
        info: () => invoke('app:info'),
        openDataFolder: () => invoke('app:openDataFolder'),
        gpuStatus: () => invoke('app:gpuStatus'),
        relaunch: () => invoke('app:relaunch'),
        onFullscreen: cb => ipcRenderer.on('fullscreen', (_, v) => cb(v)),
        onOpenFiles: cb => ipcRenderer.on('open-files', (_, list) => cb(list)),
    },
})
