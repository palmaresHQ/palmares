import jest from 'jest';

class Test {
  testBuilder: TestBuilder;

  constructor(testBuilder: TestBuilder) {
    this.testBuilder = testBuilder;
  }

  runTests() {
    this.testBuilder.describe('Test', () => {});
  }
}

export default Test;
