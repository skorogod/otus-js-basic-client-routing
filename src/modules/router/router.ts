import { Match, Mode } from "./types";
import { Listener } from "./types";

export function Router(mode?: Mode) {
  let listeners: Array<Listener> = [];
  let currentPath: string = location.pathname;
  let previousPath: string | null = null;

  const isMatch = (match: Match, path: string) =>
    (match instanceof RegExp && match.test(path)) ||
    (typeof match === "function" && match(path)) ||
    (typeof match === "string" && match === path);

  const handleListener = async ({
    match,
    onEnter,
    onBeforeEnter,
    onLeave,
    params,
  }: Listener) => {
    if (typeof params === "object") {
      params = { ...params, currentPath, previousPath, state: history.state };
    } else {
      params = { currentPath, previousPath, state: history.state };
    }

    if (isMatch(match, currentPath)) {
      if (onBeforeEnter) {
        await onBeforeEnter(params);
      }
      await onEnter(params);
    }
    onLeave && isMatch(match, previousPath) && (await onLeave(params));
  };

  const handleAllListeners = () => listeners.forEach(handleListener);

  const generateId = () => {
    const getRandomNumber = () =>
      Math.floor(Math.random() * listeners.length * 1000);
    const doesExist = (id: number) =>
      listeners.find((listener) => listener.id === id);

    let id = getRandomNumber();
    while (doesExist(id)) {
      id = getRandomNumber();
    }
    return id;
  };

  const on = (
    match: Match,
    onEnter: Function,
    onBeforeEnter?: Function,
    onLeave?: Function,
    params?: {},
  ) => {
    const id = generateId();

    const listener: Listener = {
      id,
      match,
      onEnter,
      onBeforeEnter,
      onLeave,
      params,
    };
    listeners.push(listener);
    handleListener(listener);
  };

  const go = (url: string, state?: typeof history.state) => {
    previousPath = currentPath;

    if (mode && mode === "history") {
      history.pushState(state, url, url);
      handleAllListeners();
    } else {
      location.hash = url;
    }
  };

  window.addEventListener("popstate", function () {
    previousPath = currentPath;
    currentPath = location.pathname;
    handleAllListeners();
  });

  window.addEventListener("hashchange", () => {
    let match = location.href.match(/\/#(.*)$/);
    currentPath = match ? match[1] : "/";
    handleAllListeners();
  });

  window.addEventListener("load", function () {
    document.body.addEventListener("click", (event: any) => {
      const element: Element = event.target;
      if (!element.matches("a")) {
        return;
      }

      event.preventDefault();

      let url: string;

      url = element.getAttribute("href");

      go(url);
    });
  });

  return { on, go };
}
