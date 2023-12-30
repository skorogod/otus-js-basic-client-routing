import { waitFor } from "@testing-library/react";

import { Router } from "../modules/router/router";
import fs from "fs";
import path from "path";
import { Match, RouterType } from "../modules/router/types";

const html = fs.readFileSync(path.resolve(__dirname, "../../index.html"));

beforeEach(() => {
  jest.clearAllMocks();
  document.documentElement.innerHTML = html.toString();
});

function testAddRoute(
  router: RouterType,
  match: Match,
  handler: Function,
  testhref: string,
) {
  const event = new Event("load");
  dispatchEvent(event);
  router.on(match, handler);

  const href = document.location.href;
  const aboutLInk = document.querySelector(".about") as HTMLElement;

  if (aboutLInk) {
    aboutLInk.click();
    waitFor(() => {
      expect(href).toBe(testhref);
    });
  } else throw new Error("NOT FOUND");
}

describe("Router tests", () => {
  const router = Router("history");
  test("Router is a function", () => {
    expect(Router).toBeInstanceOf(Function);
  });

  test("router creation test", () => {
    expect(router).toBeInstanceOf(Object);
  });

  test("router with history API add route test", () => {
    const router = Router("history");
    testAddRoute(
      router,
      "/about",
      () => console.log("About History"),
      document.location.href + "about",
    );
  });

  test("router with hash API add route test", () => {
    const router = Router("hash");
    testAddRoute(
      router,
      "/about",
      () => console.log("About History"),
      document.location.href + "/#/about",
    );
  });
});
