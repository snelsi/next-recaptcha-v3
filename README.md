<h1>⭐ Next.js ReCaptcha V3</h1>

Straightforward solution for using ReCaptcha in your [Next.js](https://nextjs.org/) application.

[![npm package](https://img.shields.io/npm/v/next-recaptcha-v3/latest.svg)](https://www.npmjs.com/package/next-recaptcha-v3)
[![Bundle Size](https://img.shields.io/bundlephobia/min/next-recaptcha-v3?style=flat-square)](https://bundlephobia.com/result?p=next-recaptcha-v3)
![type definition](https://img.shields.io/npm/types/next-recaptcha-v3)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/snelsi/next-hubspot/blob/master/LICENSE)

🗜️ Tiny and Tree-Shakable

🥰 Written in TypeScript

🐅 Highly customizable

😎 Uses `next/script` component

## Install

```ssh
npm i next-recaptcha-v3
```

```ssh
pnpm i next-recaptcha-v3
```

```ssh
yarn add next-recaptcha-v3
```

## Pure ESM package

This package is [pure ESM](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c). It cannot be `require()`'d from CommonJS.

## Generate reCAPTCHA Key

To use ReCaptcha, you need to generate a `reCAPTCHA_site_key` for your site's domain. You can get one [here](https://www.google.com/recaptcha/intro/v3.html).

You can either add generated key as a [Next.js env variable](https://nextjs.org/docs/basic-features/environment-variables)

```ssh
NEXT_PUBLIC_RECAPTCHA_SITE_KEY="GTM-XXXXXXX"
```

or pass it directly to the `ReCaptchaProvider` using `reCaptchaKey` attribute.

## Getting Started

Wrap your application with `ReCaptchaProvider`.
It will load [ReCaptcha script](https://www.google.com/recaptcha/api.js) to your document.

```tsx
import { ReCaptchaProvider } from "next-recaptcha-v3";

const MyApp = ({ Component, pageProps }) => (
  <ReCaptchaProvider reCaptchaKey="[GTM-XXXXXXX]">
    <Component {...pageProps} />
  </ReCaptchaProvider>
);
```

`ReCaptchaProvider` uses [Next.js Script](https://nextjs.org/docs/basic-features/script) to add ReCaptcha script to the document.

## ReCaptchaProvider Props

| **Prop**        | **Type** | **Default** | **Required** | **Description**                                                                                                                                                  |
| --------------- | -------- | ----------- | ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| reCaptchaKey    | string   |             | ?            | Your reCAPTCHA key, get one from [here](https://www.google.com/recaptcha/about)                                                                                  |
| useEnterprise   | boolean  | false       |              | Set to `true` if you use [ReCaptcha Enterprise](https://cloud.google.com/recaptcha-enterprise)                                                                   |
| useRecaptchaNet | boolean  | false       |              | Set to `true` if you want to use `recaptcha.net` to load ReCaptcha script. [docs](https://developers.google.com/recaptcha/docs/faq#can-i-use-recaptcha-globally) |
| language        | string   |             |              | Optional [Language Code](https://developers.google.com/recaptcha/docs/language)                                                                                  |

You must pass `reCaptchaKey` if `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` env variable is not defined.

All extra props are passed directly to the Script tag, so you can use all props from the [next/script documentation](https://nextjs.org/docs/api-reference/next/script).

## Accessing global context props

You can access global `grecaptcha` object, script's loading state and other props by calling `useReCaptcha` hook:

```tsx
import { useReCaptcha } from "next-recaptcha-v3";

const {
  /** reCAPTCHA_site_key */
  reCaptchaKey,
  /** Global ReCaptcha object */
  grecaptcha,
  /** If `true`, ReCaptcha script has been loaded */
  isLoaded,
  /** If `true`, an error occurred while loading ReCaptcha script */
  isError,
  /** Error received while loading ReCaptcha script */
  error,
  /** Other hook props */
  ...otherProps
} = useReCaptcha();
```

### reCAPTCHA Enterprise

If you're using [reCAPTCHA Enterprise](https://cloud.google.com/recaptcha-enterprise), add `useEnterprise` to your `ReCaptchaProvider`. Checkout official quickstart guide [here](https://cloud.google.com/recaptcha-enterprise/docs/quickstart).

```tsx
import { ReCaptchaProvider } from "next-recaptcha-v3";

const MyApp = ({ Component, pageProps }) => (
  <ReCaptchaProvider useEnterprise>
    <Component {...pageProps} />
  </ReCaptchaProvider>
);
```

## Usage

When invoked, ReCaptcha will analyze the user's behavior and create a one-time [token](https://developers.google.com/recaptcha/docs/v3#programmatically_invoke_the_challenge). It can only be used once and is only valid for a couple of minutes, so you should generate it just before the actual validation.

Send the resulting token to the API request to your server. You can then decrypt the token using the ReCaptcha [/siteverify](https://developers.google.com/recaptcha/docs/verify) API and ignore the call if it came from a bot.

1. React Hook: `useReCaptcha` (recommended approach)

Use `executeRecaptcha` function returned from the `useReCaptcha` hook to generate token. Add a unique [action name](https://developers.google.com/recaptcha/docs/v3#actions) to better understand at what moment the token was generated.

> 🛈 Note: Actions might contain only alphanumeric characters, slashes, and underscores. Actions must not be user-specific.

```tsx
import { useState, useCallback } from "react";
import { useReCaptcha } from "next-recaptcha-v3";

const MyForm = () => {
  const [name, setName] = useState("");

  // Import 'executeRecaptcha' using 'useReCaptcha' hook
  const { executeRecaptcha } = useReCaptcha();

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      // Generate ReCaptcha token
      const token = await executeRecaptcha("form_submit");

      // Attach generated token to your API requests and validate it on the server
      fetch("/api/form-submit", {
        method: "POST",
        body: {
          data: { name },
          token,
        },
      });
    },
    [executeRecaptcha, name],
  );

  return (
    <form onSubmit={handleSubmit}>
      <input name="name" value={name} onChange={(e) => setName(e.target.value)} />
      <button type="submit">Submit</button>
    </form>
  );
};
```

2. `ReCaptcha` component

Alternatively, you can also generate token by using `ReCaptcha` component.

```tsx
import { useEffect, useState } from "react";
import { ReCaptcha } from "next-recaptcha-v3";
import { validateToken } from "./utils";

const MyPage = () => {
  const [token, setToken] = useState<string>(null);

  useEffect(() => {
    if (token) {
      // Validate token and make some actions if it's a bot
      validateToken(token);
    }
  }, [token]);

  return (
    <>
      <ReCaptcha onValidate={setToken} action="page_view" />
      <h1>Hello</h1>
    </>
  );
};
```

3. `withReCaptcha` HOC

```tsx
import { useEffect, useState } from "react";
import { withReCaptcha, WithReCaptchaProps } from "next-recaptcha-v3";
import { validateToken } from "./utils";

interface MyPageProps extends WithReCaptchaProps {}

const MyPage: React.FC<MyPageProps> = ({ isLoaded, executeRecaptcha }) => {
  const [token, setToken] = useState<string>(null);

  useEffect(() => {
    if (isLoaded) {
      const generateToken = async () => {
        const newToken = await executeRecaptcha("page_view");
        setToken(newToken);
      };
      generateToken();
    }
  }, [isLoaded, executeRecaptcha]);

  useEffect(() => {
    if (token) {
      // Validate token and make some actions if it's a bot
      validateToken(token);
    }
  }, [token]);

  return <h1>Hello</h1>;
};

export default withReCaptcha(MyPage);
```

## Helpful links

<details>
  <summary>
    List of helpful links, docs, guides and tutorials.
  </summary>

- [Google Developers Portal](https://developers.google.com/recaptcha/)
- [Video: Introducing reCAPTCHA v3](https://www.youtube.com/watch?v=tbvxFW4UJdU)
- [Blog: Introducing reCAPTCHA v3](https://developers.google.com/search/blog/2018/10/introducing-recaptcha-v3-new-way-to)
- [What is reCAPTCHA?](https://www.google.com/recaptcha/about/)
- [How To Add Google ReCAPTCHA V3 In A Next.Js Form](https://www.techomoro.com/how-to-add-google-recaptcha-v3-in-a-next-js-form/)
- [Integrating reCAPTCHA v3 with Next.js](https://dev.to/sumukhakb210/integrating-recaptcha-with-nextjs-4ig6)
- [Integrating reCAPTCHA v2 with Next.js](https://prateeksurana.me/blog/integrating-recaptcha-with-next/)
- [Github Repo: reCAPTCHA v3 with Next.js](https://github.com/kokou2kpadenou/recaptcha3-nextjs)
</details>

## TypeScript

The module is written in TypeScript and type definitions are included.

## Contributing

Contributions, issues and feature requests are welcome!

## Show your support

Give a ⭐️ if you like this project!

## LICENSE

[MIT](./LICENSE)
