import { Match, Mode, RouterType, Hooks } from "./types";
import { Listener } from "./types";

export function Router(mode?: Mode): RouterType {
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
    params,
    hooks,
  }: Listener) => {
    if (typeof params === "object") {
      params = { ...params, currentPath, previousPath, state: history.state };
    } else {
      params = { currentPath, previousPath, state: history.state };
    }

    if (isMatch(match, currentPath)) {
      if (hooks && hooks.onBeforeEnter) {
        await hooks.onBeforeEnter(params);
      }
      await onEnter(params);
    }

    hooks &&
      hooks.onLeave &&
      isMatch(match, previousPath) &&
      (await hooks.onLeave(params));
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
    params: {} = {},
    hooks?: Hooks,
  ) => {
    const id = generateId();

    const listener: Listener = {
      id,
      match,
      onEnter,
      hooks,
      params,
    };
    listeners.push(listener);
    handleListener(listener);

    return () => {
      listeners = listeners.filter((listener) => listener.id !== id);
    };
  };

  const go = (url: string, state?: typeof history.state) => {
    previousPath = currentPath;

    if (mode && mode === "history") {
      url = url.replace(location.origin, "") || "/";
      history.pushState(state, url, url);
      currentPath = location.pathname;
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
