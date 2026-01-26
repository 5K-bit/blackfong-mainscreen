import { NextRequest } from "next/server";
import {
  APP_DESCRIPTION,
  APP_NAME,
  APP_URL,
  FRAME_POST_URL,
  OG_IMAGE_URL,
} from "@/lib/constants";
import {
  generateFrameHTML,
  validateFrameRequest,
  handleFrameButtonClick,
  encodeFrameState,
  parseFrameState,
  FRAME_RESPONSE_HEADERS,
} from "@/lib/frames";

// Logging utility
function logFrame(level: "info" | "error", message: string, data?: Record<string, unknown> | Error | unknown) {
  const timestamp = new Date().toISOString();
  const logData = data instanceof Error ? { error: data.message } : data;
  console.log(`[${timestamp}] [Frame ${level.toUpperCase()}] ${message}`, logData || "");
}

// Frame response headers
const FRAME_HEADERS = FRAME_RESPONSE_HEADERS;

/**
 * GET request - Initial frame view with Frames v2
 */
export async function GET() {
  try {
    logFrame("info", "GET request received");

    const html = generateFrameHTML(
      {
        image: OG_IMAGE_URL,
        postUrl: FRAME_POST_URL,
        buttons: [
          {
            label: "🔥 Summon Core",
            action: "post",
          },
          {
            label: "🌀 Enter Void",
            action: "link",
            target: APP_URL,
          },
          {
            label: "📊 View Stats",
            action: "post",
          },
          {
            label: "💰 Buy BKFG",
            action: "link",
            target: `${APP_URL}?buy=true`,
          },
        ],
        aspectRatio: "1.91:1",
      },
      APP_NAME,
      APP_DESCRIPTION,
      APP_URL
    );

    return new Response(html, {
      headers: FRAME_HEADERS,
      status: 200,
    });
  } catch (error) {
    logFrame("error", "GET error", error);
    return new Response(
      generateFrameHTML(
        {
          image: OG_IMAGE_URL,
          postUrl: FRAME_POST_URL,
          buttons: [
            {
              label: "❌ Error",
              action: "post",
            },
          ],
        },
        APP_NAME,
        APP_DESCRIPTION,
        APP_URL
      ),
      {
        headers: FRAME_HEADERS,
        status: 500,
      }
    );
  }
}

/**
 * POST request - Handle Frames v2 interactions with validation
 */
export async function POST(request: NextRequest) {
  try {
    logFrame("info", "POST request received");

    // Parse request body
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      logFrame("error", "Invalid JSON body");
      return new Response(
        generateFrameHTML(
          {
            image: OG_IMAGE_URL,
            postUrl: FRAME_POST_URL,
            buttons: [
              {
                label: "❌ Invalid Request",
                action: "post",
              },
            ],
          },
          APP_NAME,
          APP_DESCRIPTION,
          APP_URL
        ),
        {
          headers: FRAME_HEADERS,
          status: 400,
        }
      );
    }

    // Validate frame request using Frames v2 validation
    const validation = await validateFrameRequest(body);

    if (!validation.valid) {
      logFrame("error", "Frame validation failed", validation.error);
      return new Response(
        generateFrameHTML(
          {
            image: OG_IMAGE_URL,
            postUrl: FRAME_POST_URL,
            buttons: [
              {
                label: "❌ Validation Failed",
                action: "post",
              },
              {
                label: "🔄 Try Again",
                action: "link",
                target: APP_URL,
              },
            ],
          },
          APP_NAME,
          APP_DESCRIPTION,
          APP_URL
        ),
        {
          headers: FRAME_HEADERS,
          status: 400,
        }
      );
    }

    // Extract data from validated request
    const untrustedData = (body?.untrustedData as Record<string, unknown>) || {};
    const buttonIndex = (untrustedData.buttonIndex as number) || 0;
    const fid = untrustedData.fid as number | undefined;
    const timestamp = untrustedData.timestamp as number | undefined;
    const network = ((untrustedData.network as Record<string, unknown>)?.name as string) || "unknown";

    logFrame("info", "Frame interaction", {
      buttonIndex,
      fid,
      network,
      timestamp,
    });

    // Parse current state if present
    const currentState = parseFrameState((body?.untrustedData as Record<string, unknown>)?.state as string | undefined);

    // Handle button interactions
    const buttonHandler = handleFrameButtonClick(buttonIndex, currentState);
    const nextState = buttonHandler.nextState
      ? encodeFrameState(buttonHandler.nextState)
      : undefined;

    let responseHTML: string;

    switch (buttonIndex) {
      case 1: // Summon Core
        responseHTML = generateFrameHTML(
          {
            image: OG_IMAGE_URL,
            postUrl: FRAME_POST_URL,
            buttons: [
              {
                label: "✨ Core Summoned",
                action: "post",
              },
              {
                label: "🔥 Burn BKFG",
                action: "link",
                target: APP_URL,
              },
              {
                label: "🔙 Back",
                action: "post",
              },
            ],
            state: nextState,
          },
          APP_NAME,
          APP_DESCRIPTION,
          APP_URL,
          fid ? `<p>Summoned by: FID ${fid}</p>` : undefined
        );
        break;

      case 2: // Enter Void - Redirect to main app
        responseHTML = generateFrameHTML(
          {
            image: OG_IMAGE_URL,
            postUrl: FRAME_POST_URL,
            buttons: [
              {
                label: "🌀 Entering Void",
                action: "link",
                target: APP_URL,
              },
            ],
          },
          APP_NAME,
          APP_DESCRIPTION,
          APP_URL
        );
        break;

      case 3: // View Stats
        responseHTML = generateFrameHTML(
          {
            image: OG_IMAGE_URL,
            postUrl: FRAME_POST_URL,
            buttons: [
              {
                label: "📈 Live Stats",
                action: "link",
                target: APP_URL,
              },
              {
                label: "🔥 Burn Tracker",
                action: "post",
              },
              {
                label: "🔙 Back",
                action: "post",
              },
            ],
            state: nextState,
          },
          APP_NAME,
          APP_DESCRIPTION,
          APP_URL,
          "<p>BKFG Protocol Statistics</p>"
        );
        break;

      case 4: // Buy BKFG
        responseHTML = generateFrameHTML(
          {
            image: OG_IMAGE_URL,
            postUrl: FRAME_POST_URL,
            buttons: [
              {
                label: "💰 Buy BKFG",
                action: "link",
                target: `${APP_URL}?buy=true`,
              },
              {
                label: "🔙 Back",
                action: "post",
              },
            ],
            state: nextState,
          },
          APP_NAME,
          APP_DESCRIPTION,
          APP_URL
        );
        break;

      default:
        // Return to home frame
        responseHTML = generateFrameHTML(
          {
            image: OG_IMAGE_URL,
            postUrl: FRAME_POST_URL,
            buttons: [
              {
                label: "🔥 Summon Core",
                action: "post",
              },
              {
                label: "🌀 Enter Void",
                action: "link",
                target: APP_URL,
              },
              {
                label: "📊 View Stats",
                action: "post",
              },
              {
                label: "💰 Buy BKFG",
                action: "link",
                target: `${APP_URL}?buy=true`,
              },
            ],
          },
          APP_NAME,
          APP_DESCRIPTION,
          APP_URL
        );
    }

    return new Response(responseHTML, {
      headers: FRAME_HEADERS,
      status: 200,
    });
  } catch (error) {
    logFrame("error", "POST error", error);

    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred";

    return new Response(
      generateFrameHTML(
        {
          image: OG_IMAGE_URL,
          postUrl: FRAME_POST_URL,
          buttons: [
            {
              label: "❌ Error Occurred",
              action: "post",
            },
            {
              label: "🔄 Try Again",
              action: "link",
              target: APP_URL,
            },
          ],
        },
        APP_NAME,
        APP_DESCRIPTION,
        APP_URL,
        `<p>${errorMessage}</p>`
      ),
      {
        headers: FRAME_HEADERS,
        status: 500,
      }
    );
  }
}
