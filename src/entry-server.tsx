import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import App from "./App";

export function render(url: string, initialData: any) {
  return renderToString(
    <StrictMode>
      <App initialData={initialData} initialUrl={url} />
    </StrictMode>
  );
}
