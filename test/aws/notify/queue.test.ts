import { Testing } from "cdktf";
import "cdktf/lib/testing/adapters/jest";
import { AwsStack } from "../../../src/aws/aws-stack";
import * as notify from "../../../src/aws/notify";
import { Duration } from "../../../src/duration";

describe("Queue", () => {
  test("Should synth and match SnapShot", () => {
    // GIVEN
    const stack = new AwsStack();
    // WHEN
    new notify.Queue(stack, "HelloWorld");
    // THEN
    stack.prepareStack(); // may generate additional resources
    expect(Testing.synth(stack)).toMatchSnapshot();
  });
  test("Should synth and match SnapShot with prefix", () => {
    // GIVEN
    const stack = new AwsStack();
    // WHEN
    new notify.Queue(stack, "HelloWorld", {
      namePrefix: "hello-world",
      // encryption: QueueEncryption.KMS_MANAGED, //TODO: Re-add KMS encryption
      messageRetentionSeconds: Duration.days(14).toSeconds(),
      visibilityTimeoutSeconds: Duration.minutes(15).toSeconds(),
    });
    // THEN
    stack.prepareStack(); // may generate additional resources
    expect(Testing.synth(stack)).toMatchSnapshot();
  });
  test("Should synth with DLQ and match SnapShot", () => {
    // GIVEN
    const stack = new AwsStack();
    // WHEN
    const deadLetterQueue = new notify.Queue(stack, "DLQ", {
      // encryption: QueueEncryption.KMS_MANAGED, //TODO: Re-add KMS encryption
      messageRetentionSeconds: Duration.days(14).toSeconds(),
      visibilityTimeoutSeconds: Duration.minutes(15).toSeconds(),
    });
    new notify.Queue(stack, "Queue", {
      deadLetterQueue: {
        maxReceiveCount: 5,
        queue: deadLetterQueue,
      },
      // encryption: QueueEncryption.KMS_MANAGED, //TODO: Re-add KMS encryption
      messageRetentionSeconds: Duration.days(14).toSeconds(),
      visibilityTimeoutSeconds: Duration.minutes(15).toSeconds(),
    });
    // THEN
    stack.prepareStack(); // may generate additional resources
    expect(Testing.synth(stack)).toMatchSnapshot();
  });
  test("Should synth with fifo suffix and match SnapShot", () => {
    // GIVEN
    const stack = new AwsStack();
    // WHEN
    new notify.Queue(stack, "Queue", {
      namePrefix: "queue.fifo",
      // encryption: QueueEncryption.KMS_MANAGED, //TODO: Re-add KMS encryption
      messageRetentionSeconds: Duration.days(14).toSeconds(),
      visibilityTimeoutSeconds: Duration.minutes(15).toSeconds(),
    });
    // THEN
    stack.prepareStack(); // may generate additional resources
    expect(Testing.synth(stack)).toMatchSnapshot();
  });
  test("Should synth with contentBasedDeduplication and match SnapShot", () => {
    // GIVEN
    const stack = new AwsStack();
    // WHEN
    new notify.Queue(stack, "Queue", {
      // encryption: QueueEncryption.KMS_MANAGED, //TODO: Re-add KMS encryption
      contentBasedDeduplication: true,
      messageRetentionSeconds: Duration.days(14).toSeconds(),
      visibilityTimeoutSeconds: Duration.minutes(15).toSeconds(),
    });
    // THEN
    stack.prepareStack(); // may generate additional resources
    expect(Testing.synth(stack)).toMatchSnapshot();
  });
});
