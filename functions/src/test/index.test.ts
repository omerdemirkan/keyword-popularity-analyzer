import "jest";
import * as functionsTest from "firebase-functions-test";

export const testEnv = functionsTest(
  {
    databaseURL: "https://social-ping-b6c71.firebaseio.com",
    projectId: "social-ping-b6c71",
  },
  require.resolve("../../service-account.json")
);

describe("test environment", () => {
  it("should exist", () => {
    expect(testEnv).toBeTruthy();
  });
});
