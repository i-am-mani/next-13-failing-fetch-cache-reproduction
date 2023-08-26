/* eslint-disable no-console */
import * as React from "react";
import "./globals.css";

function formatDecimal(
  value: number,
  cultureCode: string,
  maxFractionDigits: number = 0,
  minFractionDigits: number = 0
) {
  return new Intl.NumberFormat(cultureCode, {
    style: "decimal",
    maximumFractionDigits: maxFractionDigits,
    minimumFractionDigits: minFractionDigits,
  }).format(value);
}

async function benchmark(fn: Promise<any>) {
  const start = performance.now();
  const response = await fn;
  const end = performance.now();
  return {
    ts: `${formatDecimal(end - start, "en", 3)} ms`,
    output: response,
  };
}

async function fetchInvokeSingleUrl(
  cache: "force-cache" | "no-store",
  url: string
) {
  return fetch(url, {
    cache: cache,
    next: {
      tags: ["tags"],
    },
  }).then((response) => response.text());
}

async function fetchCloudflareCDN(
  cache: "force-cache" | "no-store",
  files: any
): Promise<any> {
  const requests = files.map(async (file: any) => {
    const ts = await benchmark(
      fetch(file.url, {
        cache: cache,
        next: {
          tags: ["tags"],
        },
      }).then((response) => response.text())
    );

    return `${file.namespace}: ${ts.ts}`;
  });

  return Promise.all(requests);
}

const groupBUrls = [
  {
    namespace: "react",
    url: "https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/cjs/react-jsx-dev-runtime.development.js",
  },
  {
    namespace: "react-router",
    url: "https://cdnjs.cloudflare.com/ajax/libs/react-router/6.15.0/react-router.development.js",
  },
  {
    namespace: "react-is",
    url: "https://cdnjs.cloudflare.com/ajax/libs/react-is/18.2.0/cjs/react-is.development.js",
  },
  {
    namespace: "jquery",
    url: "https://cdn.jsdelivr.net/npm/jquery@3.7.0/dist/jquery.min.js",
  },
  {
    namespace: "slick-carousel",
    url: "https://cdn.jsdelivr.net/npm/slick-carousel@1.8.1/slick/slick.min.js",
  },
];

export default async function Page(props: any) {
  const cache = props.searchParams.cache || "no-store";
  const indexResponse = await benchmark(
    fetchInvokeSingleUrl(cache, "https://jsonplaceholder.typicode.com/todos/1")
  );
  const groupOfRandomUrls = await benchmark(
    fetchCloudflareCDN(cache, groupBUrls)
  );

  return (
    <div className="space-y-6 p-20">
      <p className="text-3xl font-semibold">Cache: {cache}</p>
      <div className="space-x-2 space-y-4">
        <div className="flex gap-x-4 text-lg font-medium">
          <p>FETCH Single API call</p>
          <p>{indexResponse.ts}</p>
        </div>
        <hr />
      </div>
      <hr />
      <div className="flex gap-x-4 text-lg font-medium">
        <p>FETCH - Parallel group of API (cloudflare + jsdelivr)</p>
        <p>{groupOfRandomUrls.ts}</p>
      </div>
      <hr />
      <div className="ml-10">
        <p className="text-xl font-semibold">List of calls</p>
        <div>
          {
            <ul className="grid grid-cols-4">
              {groupOfRandomUrls.output.map((ts: any, index: number) => (
                <li key={index}>{ts}</li>
              ))}
            </ul>
          }
        </div>
      </div>
    </div>
  );
}
