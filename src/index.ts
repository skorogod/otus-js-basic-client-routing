import { Router } from "./modules/router/router";

const router = Router("hash");

const createRender =
  (content: string) =>
  (...args: any[]) => {
    console.info(`${content} args=${JSON.stringify(args)}`);

    const root = document.getElementById("root");

    if (root) {
      root.innerHTML = `<h2>${content}</h2>`;
    }
  };

const unsubscribe = router.on(
  /.*/,
  createRender("/.*"),
  () => console.log("before Enter"),
  () => console.log("LEAVE"),
);
router.on(
  "/about",
  createRender("ABOUT"),
  () => console.log("ENTER ABOUT"),
  () => console.log("LEAVE ABOUT"),
);
router.on("/checkAsync", createRender("ASYNC"), async () => {
  setTimeout(() => console.log("check async"), 10000);
});

router.on("/index", createRender("index"), async () => {
  setTimeout(() => console.log("check index"), 10000);
});
unsubscribe();
