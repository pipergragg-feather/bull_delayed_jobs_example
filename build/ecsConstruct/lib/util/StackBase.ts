import { Stack } from "@aws-cdk/core";

export abstract class StackBase extends Stack {
  // Implementation overridden by subclasses decorated with @exportsProps
  public getProps(): any {}
}
