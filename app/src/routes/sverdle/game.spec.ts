import { describe, it, expect, beforeEach } from "vitest";
import { Game } from "./game";
import { words } from "./words.server";

describe("Game", () => {
  let game: Game;

  describe("new game", () => {
    beforeEach(() => {
      game = new Game();
    });

    it("initializes a new game", () => {
      expect(game.index).toBeTypeOf("number");
      expect(game.guesses).toEqual(["", "", "", "", "", ""]);
      expect(game.answers).toEqual([]);
      expect(game.answer).toBeTypeOf("string");
      expect(game.answer.length).toBe(5);
    });
  });

  describe("from serialized state", () => {
    it("initializes from a serialized string", () => {
      const word = words[10];
      const serialized = `10-abcde fghij-${"c____"} ${"_x___"}`;
      const game = new Game(serialized);
      expect(game.index).toBe(10);
      expect(game.answer).toBe(word);
      expect(game.guesses).toEqual(["abcde", "fghij", "", "", "", ""]);
      expect(game.answers).toEqual(["c____", "_x___"]);
    });
  });

  describe("enter", () => {
    beforeEach(() => {
      game = new Game();
      // force a known answer for predictable tests
      game.answer = "apple";
    });

    it("handles a valid guess", () => {
      const guess = ["a", "p", "p", "l", "e"];
      const result = game.enter(guess);
      expect(result).toBe(true);
      expect(game.guesses[0]).toBe("apple");
      expect(game.answers[0]).toBe("xxxxx");
    });

    it("handles an invalid guess", () => {
      const guess = ["q", "w", "e", "r", "t"]; // not a valid word
      const result = game.enter(guess);
      expect(result).toBe(false);
      expect(game.guesses[0]).toBe("");
      expect(game.answers.length).toBe(0);
    });

    it("computes answers correctly with mixed matches", () => {
      game.answer = "array";
      const guess = ["r", "a", "d", "a", "r"];
      const result = game.enter(guess);
      expect(result).toBe(true);
      expect(game.answers[0]).toBe("cc_xc");
    });

    it("handles duplicate letters correctly", () => {
      game.answer = "sleep";
      const guess = ["e", "e", "r", "i", "e"];
      const result = game.enter(guess);
      expect(result).toBe(true);
      expect(game.answers[0]).toBe("cc___");
    });
  });

  describe("toString", () => {
    it("serializes the game state", () => {
      game = new Game();
      game.index = 10;
      game.guesses = ["abcde", "fghij", "", "", "", ""];
      game.answers = ["c____", "_x___"];
      const expected = "10-abcde fghij-c____ _x___";
      expect(game.toString()).toBe(expected);
    });
  });
});
