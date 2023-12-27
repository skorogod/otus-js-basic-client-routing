export type Match = string | Function | RegExp;

export type Listener = {
  id: number;
  match: Match;
  onEnter: Function;
  onBeforeEnter?: Function;
  onLeave?: Function;
};

export type Mode = "history" | "hash";
