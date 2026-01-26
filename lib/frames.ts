// Frames v2 Configuration
export const FRAMES_V2_CONFIG = {
  version: "vNext" as const,
  aspectRatio: "1.91:1" as const,
};

// Types for Frame message and request
export interface FrameMessage {
  untrustedData: {
    fid: number;
    url: string;
    messageHash: string;
    timestamp: number;
    network: {
      chain: string;
      name: string;
    };
    buttonIndex: number;
    inputText?: string;
    castId?: {
      fid: number;
      hash: string;
    };
    state?: string;
  };
  trustedData?: {
    messageBytes: string;
  };
}

// Types for Frame state management
export interface FrameState {
  action?: string;
  fid?: number;
  timestamp?: number;
  previous?: FrameState;
}

export interface FrameButton {
  label: string;
  action?: "post" | "post_redirect" | "link" | "mint";
  target?: string;
}

export interface FrameMetadata {
  image: string;
  postUrl?: string;
  buttons?: FrameButton[];
  inputText?: string;
  aspectRatio?: "1.91:1" | "1:1";
  state?: string;
}

/**
 * Validate incoming frame request using Frames v2 validation
 */
export async function validateFrameRequest(
  body: unknown
): Promise<{ valid: boolean; data?: Record<string, unknown>; error?: string }> {
  try {
    if (!body || typeof body !== "object") {
      return { valid: false, error: "Invalid request body" };
    }

    const frameRequest = body as FrameMessage;

    // Basic validation of frame message structure
    if (!frameRequest.untrustedData) {
      return { valid: false, error: "Missing untrusted data" };
    }

    const { fid, buttonIndex, timestamp } = frameRequest.untrustedData;

    // Validate required fields
    if (typeof fid !== "number") {
      return { valid: false, error: "Invalid FID" };
    }

    if (typeof buttonIndex !== "number" || buttonIndex < 0) {
      return { valid: false, error: "Invalid button index" };
    }

    if (typeof timestamp !== "number") {
      return { valid: false, error: "Invalid timestamp" };
    }

    // Optional: validate timestamp is not too old (within 5 minutes)
    const now = Math.floor(Date.now() / 1000);
    if (now - timestamp > 300) {
      return { valid: false, error: "Frame message expired" };
    }

    // Note: For full cryptographic validation of trustedData.messageBytes,
    // you would need to use the Farcaster Hub or @farcaster/frame-core
    // This is a basic structural validation for now

    return { valid: true, data: frameRequest.untrustedData };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : "Validation error",
    };
  }
}

/**
 * Generate HTML meta tags for Frames v2
 */
export function generateFrameMetaTags(metadata: FrameMetadata): string[] {
  const tags: string[] = [];

  // Core frame metadata
  tags.push(`<meta property="fc:frame" content="${FRAMES_V2_CONFIG.version}" />`);
  tags.push(`<meta property="fc:frame:image" content="${metadata.image}" />`);
  tags.push(
    `<meta property="fc:frame:image:aspect_ratio" content="${
      metadata.aspectRatio || FRAMES_V2_CONFIG.aspectRatio
    }" />`
  );

  // Post URL
  if (metadata.postUrl) {
    tags.push(`<meta property="fc:frame:post_url" content="${metadata.postUrl}" />`);
  }

  // Input field
  if (metadata.inputText) {
    tags.push(`<meta property="fc:frame:input:text" content="${metadata.inputText}" />`);
  }

  // State (for multi-step frames)
  if (metadata.state) {
    tags.push(`<meta property="fc:frame:state" content="${metadata.state}" />`);
  }

  // Buttons
  if (metadata.buttons && metadata.buttons.length > 0) {
    metadata.buttons.forEach((button, index) => {
      const buttonIndex = index + 1;
      tags.push(
        `<meta property="fc:frame:button:${buttonIndex}" content="${escapeHtml(button.label)}" />`
      );

      if (button.action) {
        tags.push(
          `<meta property="fc:frame:button:${buttonIndex}:action" content="${button.action}" />`
        );
      }

      if (button.target) {
        tags.push(
          `<meta property="fc:frame:button:${buttonIndex}:target" content="${escapeHtml(button.target)}" />`
        );
      }
    });
  }

  return tags;
}

/**
 * Generate Open Graph meta tags for social previews
 */
export function generateOGMetaTags(
  title: string,
  description: string,
  image: string,
  url: string
): string[] {
  return [
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta property="og:image" content="${image}" />`,
    `<meta property="og:url" content="${url}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeHtml(title)}" />`,
    `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
    `<meta name="twitter:image" content="${image}" />`,
  ];
}

/**
 * Generate complete frame HTML response
 */
export function generateFrameHTML(
  metadata: FrameMetadata,
  appName: string,
  appDescription: string,
  appUrl: string,
  content?: string
): string {
  const frameMetaTags = generateFrameMetaTags(metadata);
  const ogMetaTags = generateOGMetaTags(appName, appDescription, metadata.image, appUrl);

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(appName)}</title>
    ${frameMetaTags.join("\n    ")}
    ${ogMetaTags.join("\n    ")}
  </head>
  <body>
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; font-family: monospace; background: #000; color: #0f0;">
      <h1>${escapeHtml(appName)}</h1>
      <p>${escapeHtml(appDescription)}</p>
      ${content ? `<div>${content}</div>` : ""}
    </div>
  </body>
</html>`;
}

/**
 * Escape HTML special characters to prevent injection
 */
export function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (char) => map[char]);
}

/**
 * Parse and decode frame state
 */
export function parseFrameState(stateJson?: string): FrameState | null {
  if (!stateJson) return null;
  try {
    return JSON.parse(stateJson);
  } catch {
    return null;
  }
}

/**
 * Encode frame state to JSON string
 */
export function encodeFrameState(state: FrameState): string {
  return JSON.stringify(state);
}

/**
 * Handle frame button click routing
 */
export function handleFrameButtonClick(
  buttonIndex: number,
  currentState?: FrameState
): { action: string; nextState?: FrameState } {
  const state: FrameState = currentState || {};

  switch (buttonIndex) {
    case 1:
      return {
        action: "summon",
        nextState: { ...state, action: "summoned", timestamp: Date.now() },
      };
    case 2:
      return {
        action: "void",
        nextState: { ...state, action: "void", timestamp: Date.now() },
      };
    case 3:
      return {
        action: "stats",
        nextState: { ...state, action: "stats", timestamp: Date.now() },
      };
    case 4:
      return {
        action: "buy",
        nextState: { ...state, action: "buy", timestamp: Date.now() },
      };
    default:
      return { action: "unknown" };
  }
}

/**
 * Response headers for Frame endpoints
 */
export const FRAME_RESPONSE_HEADERS = {
  "Content-Type": "text/html; charset=utf-8",
  "Cache-Control": "max-age=0, must-revalidate, no-store, no-cache",
};
