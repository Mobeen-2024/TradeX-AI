import { DummyNewsProvider } from "./dummyProvider";
import { CryptoPanicProvider } from "./cryptoPanicProvider";
import { NewsProvider } from "./provider";

export function getNewsProvider(): NewsProvider {
  if (process.env.CRYPTOPANIC_API_KEY) {
    return new CryptoPanicProvider();
  }
  return new DummyNewsProvider();
}
