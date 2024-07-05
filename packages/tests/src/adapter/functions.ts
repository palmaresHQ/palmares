export default class TestFunctionsAdapter {
  getDescribe(descriptionName: string, callback: () => void) {
    throw new Error('Not implemented');
  }

  getTest(testName: string, callback: () => Promise<void>) {
    throw new Error('Not implemented');
  }
}
