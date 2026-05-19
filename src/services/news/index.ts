import { DummyNewsProvider } from "./dummyProvider";
import { NewsProvider } from "./provider";

export function getNewsProvider(): NewsProvider {
  return new DummyNewsProvider();
}
