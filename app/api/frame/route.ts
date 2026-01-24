import {
  APP_DESCRIPTION,
  APP_NAME,
  APP_URL,
  FRAME_POST_URL,
  OG_IMAGE_URL,
} from "@/lib/constants";

const FRAME_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta property="fc:frame" content="vNext" />
    <meta property="fc:frame:image" content="${OG_IMAGE_URL}" />
    <meta property="fc:frame:image:aspect_ratio" content="1.91:1" />
    <meta property="fc:frame:button:1" content="Summon Core" />
    <meta property="fc:frame:button:1:action" content="post" />
    <meta property="fc:frame:button:2" content="Enter Void" />
    <meta property="fc:frame:button:2:action" content="link" />
    <meta property="fc:frame:button:2:target" content="${APP_URL}" />
    <meta property="fc:frame:post_url" content="${FRAME_POST_URL}" />
    <meta property="og:title" content="${APP_NAME}" />
    <meta
      property="og:description"
      content="${APP_DESCRIPTION}"
    />
    <meta property="og:image" content="${OG_IMAGE_URL}" />
    <meta property="og:url" content="${APP_URL}" />
  </head>
  <body></body>
</html>`;

const FRAME_HEADERS = {
  "Content-Type": "text/html; charset=utf-8",
  "Cache-Control": "no-store",
};

export async function GET() {
  return new Response(FRAME_HTML, {
    headers: FRAME_HEADERS,
  });
}

export async function POST() {
  return new Response(FRAME_HTML, {
    headers: FRAME_HEADERS,
  });
}
