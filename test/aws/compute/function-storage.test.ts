import { Testing } from "cdktf";
import "cdktf/lib/testing/adapters/jest";
import { Duration } from "../../../src/";
import { compute, storage, notify, AwsStack } from "../../../src/aws";

const lambdaProps = {
  code: new compute.InlineCode("foo"),
  handler: "index.handler",
  runtime: compute.Runtime.NODEJS_LATEST,
};
describe("Function with Storage", () => {
  test("Should synth and match SnapShot", () => {
    // GIVEN
    const stack = new AwsStack();
    // WHEN
    const fn = new compute.LambdaFunction(stack, "HelloWorld", lambdaProps);
    const bucket = new storage.Bucket(stack, "HelloWorldBucket", {
      namePrefix: "hello-world",
    });
    bucket.grantRead(fn);
    // THEN
    stack.prepareStack(); // required to add last minute resources to the stack
    expect(Testing.synth(stack)).toMatchSnapshot();
  });
});

describe("Function with event rules", () => {
  test("Should handle dependencies on permissions", () => {
    // GIVEN
    const stack = new AwsStack();
    // WHEN
    const fn = new compute.LambdaFunction(stack, "HelloWorld", lambdaProps);
    const rule = new notify.Rule(stack, "HelloWorldRule", {
      schedule: notify.Schedule.rate(Duration.days(1)),
    });
    rule.addTarget(new notify.targets.LambdaFunction(fn));
    // THEN
    stack.prepareStack(); // required to add last minute resources to the stack
    expect(Testing.synth(stack)).toMatchSnapshot();
  });
});
