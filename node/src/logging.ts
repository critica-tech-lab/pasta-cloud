function debug(context: string, ...message: Array<any>) {
  console.debug("[debug]", `[${context}]`, ...message);
}

function error(context: string, ...message: Array<any>) {
  console.error("[error]", `[${context}]`, ...message);
}
function warn(context: string, ...message: Array<any>) {
  console.warn("[warning]", `[${context}]`, ...message);
}

export const log = {
  debug,
  error,
  warn,
};
