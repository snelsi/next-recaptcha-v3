"use client";

import React from "react";
import { useReCaptcha } from "./useReCaptcha.js";
import type { useReCaptchaProps } from "./useReCaptcha.js";

interface WithReCaptchaProps extends useReCaptchaProps {}

/** React HOC to generate ReCaptcha token
 * @example
 * withReCaptcha(MyComponent)
 */
function withReCaptcha<T extends WithReCaptchaProps = WithReCaptchaProps>(
  WrappedComponent: React.ComponentType<T>,
) {
  // Try to create a nice displayName for React Dev Tools.
  const displayName = WrappedComponent.displayName || WrappedComponent.name || "Component";

  // Creating the inner component. The calculated Props type here is the where the magic happens.
  const ComponentWithReCaptcha = (props: Omit<T, keyof WithReCaptchaProps>) => {
    const reCaptchaProps = useReCaptcha();

    // Pass current token and function to generate it to the component
    return <WrappedComponent {...reCaptchaProps} {...(props as T)} />;
  };

  ComponentWithReCaptcha.displayName = `withReCaptcha(${displayName})`;

  return ComponentWithReCaptcha;
}

export { withReCaptcha };
export type { WithReCaptchaProps };
