let worker;
let sequence = 0;
const pending = new Map();

function reset(error) {
    worker.terminate();
    worker = null;
    for (const finish of pending.values()) finish(error);
}

function getWorker() {
    if (worker) return worker;
    worker = new Worker(new URL('./walk-rail-worker.mjs', import.meta.url), {type:'module'});
    worker.onmessage = ({data}) => pending.get(data.id)?.(data.error ? new Error(data.error) : null,data.result);
    worker.onerror = event => reset(new Error(event.message || 'Walking and rail worker failed'));
    return worker;
}

export function walkRailRequest(message, signal) {
    if (signal?.aborted) return Promise.reject(new DOMException('Aborted','AbortError'));
    return new Promise((resolve, reject) => {
        const destination = getWorker();
        const id = ++sequence;
        const timeout = setTimeout(() => reset(new Error('Walking and rail worker timed out')),120000);
        const abort = () => finish(new DOMException('Aborted','AbortError'));
        function finish(error,result) {
            pending.delete(id);
            clearTimeout(timeout);
            signal?.removeEventListener('abort',abort);
            if (error) reject(error);
            else resolve(result);
        }
        pending.set(id,finish);
        signal?.addEventListener('abort',abort,{once:true});
        try {
            destination.postMessage({...message,id});
        } catch (error) {
            finish(error);
        }
    });
}
