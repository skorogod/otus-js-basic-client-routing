import { waitFor } from "@testing-library/react";

import * as sinon from "ts-sinon";

import { Router } from "../modules/router/router";
import fs from "fs";
import path from "path";
import { Hooks, Match, RouterType } from "../modules/router/types";

const html = fs.readFileSync(path.resolve(__dirname, "../../index.html"));

beforeEach(() => {
  jest.clearAllMocks();
  document.documentElement.innerHTML = html.toString();
});

async function testAddRoute(
  router: RouterType,
  match: Match,
  onEnter: Function,
  testhref: string,
  hooks?: Hooks,
) {
  const event = new Event("load");
  dispatchEvent(event);

  const unsubscribe = router.on(match, onEnter, {}, hooks);

  const aboutLInk = document.querySelector(".about") as HTMLElement;

  try {
    if (aboutLInk) {
      aboutLInk.click();

      await waitFor(async () => {
        const href = document.location.href;
        expect(href).toBe(testhref);

        if (hooks) {
          expect(onEnter).toHaveBeenCalled();

          if (hooks.onBeforeEnter) {
            expect(hooks.onBeforeEnter).toHaveBeenCalled();
          }

          if (hooks.onLeave) {
            history.back();

            await waitFor(() => {
              expect(hooks.onLeave).toHaveBeenCalled();
            });
          }
        }
      });
    } else throw new Error("NOT FOUND");
  } finally {
    unsubscribe();
  }
}

describe("Router tests", () => {
  test("Router is a function", async () => {
    expect(Router).toBeInstanceOf(Function);
  });

  test("router creation test", async () => {
    const router = Router("history");
    expect(router).toBeInstanceOf(Object);
  });

  test("router hooks test", async () => {
    const router = Router("history");
    const onEnter = jest.fn();
    const onBeforeEnter = jest.fn();
    const onLeave = jest.fn();

    await testAddRoute(
      router,
      "/about",
      onEnter,
      document.location.href + "about",
      { onBeforeEnter, onLeave },
    );
  });

  test("router with hash API add route test", async () => {
    const router = Router("hash");
    const onEnter = jest.fn();
    await testAddRoute(
      router,
      "/about",
      onEnter,
      document.location.href + "#/about",
    );
  });
});
