import { afterEach, describe, expect, it, vi } from "vitest";

import { sendMessage } from "@/lib/telegram";

describe("sendMessage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.TELEGRAM_BOT_TOKEN;
  });

  it("disables the link preview when requested", async () => {
    process.env.TELEGRAM_BOT_TOKEN = "test-token";
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    await sendMessage(123, "https://example.com", { disableLinkPreview: true });

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(JSON.parse(String(request.body))).toMatchObject({
      link_preview_options: { is_disabled: true },
    });
  });

  it("renders a URL as an inline keyboard button", async () => {
    process.env.TELEGRAM_BOT_TOKEN = "test-token";
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetchMock);

    await sendMessage(123, "Try this one", {
      linkButton: {
        text: "🔊 ฟังการออกเสียง",
        url: "https://translate.google.com/",
      },
    });

    const request = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(JSON.parse(String(request.body))).toMatchObject({
      reply_markup: {
        inline_keyboard: [[{
          text: "🔊 ฟังการออกเสียง",
          url: "https://translate.google.com/",
        }]],
      },
    });
  });
});
