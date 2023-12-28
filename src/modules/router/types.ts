export type Match = string | Function | RegExp;

export type Listener = {
  id: number;
  match: Match;
  onEnter: Function;
  onBeforeEnter?: Function;
  onLeave?: Function;
  params?: {};
};

export type Mode = "history" | "hash";

export type hookEvents = "beforeRequest";
