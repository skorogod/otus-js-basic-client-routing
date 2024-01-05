export type Match = string | Function | RegExp;

export type Listener = {
  id: number;
  match: Match;
  onEnter: Function;
  hooks: Hooks;
  params?: {};
};

export type Hooks = {
  onBeforeEnter?: Function,
  onLeave?: Function,
}

export type Mode = "history" | "hash";

export type hookEvents = "beforeRequest";

export type RouterType = { on: Function; go: Function };
