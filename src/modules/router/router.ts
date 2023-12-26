import { Match } from "./types";
import { Listener } from "./types";

export function Router() {
  let listeners: Array<Listener> = [];
  let currentPath: string = location.pathname;
  let previousPath: string | null = null;

  const isMatch = (match: Match, path: string) =>
    (match instanceof RegExp && match.test(path)) ||
    (typeof match === "function" && match(path)) ||
    (typeof match === "string" && match === path);

  const handleListener = ({
    match,
    onEnter,
    onBeforeEnter,
    onLeave,
  }: Listener) => {
    const args = { currentPath, previousPath, state: history.state };
    if (isMatch(match, currentPath)) {
      if (onBeforeEnter) {
        onBeforeEnter();
      }
      onEnter(args);
    }
    onLeave && isMatch(match, previousPath) && onLeave();
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
  ) => {
    const id = generateId();
    console.log(match);

    const listener: Listener = { id, match, onEnter, onBeforeEnter, onLeave };
    listeners.push(listener);
    handleListener(listener);
  };

  const go = (url: string, state?: typeof history.state) => {
    previousPath = currentPath;
    history.pushState(state, url, url);
    currentPath = location.pathname;

    handleAllListeners();
  };

  window.addEventListener("popstate", function () {
    previousPath = currentPath;
    currentPath = location.pathname;
    handleAllListeners();
  });

  window.addEventListener("load", function () {
    document.body.addEventListener("click", (event: any) => {
      const element: Element = event.target;
      if (!element.matches("a")) {
        console.log(event);
        return;
      }

      event.preventDefault();

      let url: string = element.getAttribute("href");
      go(url);
    });
  });

  return { on, go };
}
