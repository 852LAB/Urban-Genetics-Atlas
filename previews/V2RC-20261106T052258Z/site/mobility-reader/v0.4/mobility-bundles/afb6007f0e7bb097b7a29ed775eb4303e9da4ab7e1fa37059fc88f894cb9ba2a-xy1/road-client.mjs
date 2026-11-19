let worker;
let pending;
let queue = Promise.resolve();
let sequence = 0;

function send(message) {
    return new Promise((resolve, reject) => {
        const id = ++sequence;
        const timeout = setTimeout(() => {
            worker.terminate();
            worker = null;
            pending = null;
            reject(new Error('Browser road worker timed out'));
        }, 120000);
        pending = (error, result) => {
            clearTimeout(timeout);
            pending = null;
            if (error) reject(error);
            else resolve(result);
        };
        worker.postMessage({...message,id});
    });
}

async function ensureWorker() {
    if (worker) return;
    worker = new Worker(new URL('./road-worker.mjs', import.meta.url), {type:'module'});
    worker.onmessage = ({data}) => {
        if (data.id === sequence) pending?.(data.error ? new Error(data.error) : null, data.result);
    };
    worker.onerror = event => {
        worker.terminate();
        worker = null;
        pending?.(new Error(event.message || 'Browser road worker failed'));
    };
    try {
        await send({type:'initialize', assets:"https://pub-c831f6efbc4341068a1653dcf6c592b9.r2.dev/mobility-bundles/afb6007f0e7bb097b7a29ed775eb4303e9da4ab7e1fa37059fc88f894cb9ba2a-xy1/road-runtime/"});
    } catch (error) {
        worker?.terminate();
        worker = null;
        throw error;
    }
}

export function roadRequest(message) {
    const operation = queue.then(async () => {
        await ensureWorker();
        return send(message);
    });
    queue = operation.catch(() => {});
    return operation;
}
