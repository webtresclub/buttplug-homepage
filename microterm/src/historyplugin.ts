const history: string[] = [];
let idx = -1;


export default  {
        push(cmd: string) {
            if (cmd && (history.at(-1) !== cmd)) history.push(cmd);
            idx = history.length;
        },
        completeUp(input: string) {
            if (!history.length) return input;
            idx = Math.max(0, idx - 1);
            return history[idx] ?? '';
        },
        completeDown(input: string) {
            if (!history.length) return '';
            idx = Math.min(history.length, idx + 1);
            return history[idx] ?? '';
        }
    };