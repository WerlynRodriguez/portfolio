import { beforeEach, describe, expect, it, vi } from 'vitest';
import { writeToClipboard } from './clipboard';

describe('writeToClipboard utility', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('uses navigator.clipboard.writeText when available', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    const host = {} as HTMLElement;
    const result = await writeToClipboard('hello world', host);
    expect(result).toBe(true);
    expect(writeTextMock).toHaveBeenCalledWith('hello world');
  });

  it('falls back to textarea and execCommand when clipboard API fails', async () => {
    const writeTextMock = vi
      .fn()
      .mockRejectedValue(new Error('Permission denied'));
    vi.stubGlobal('navigator', {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    const execCommandMock = vi.fn().mockReturnValue(true);
    const textareaMock = {
      value: '',
      readOnly: false,
      style: { cssText: '' },
      select: vi.fn(),
      setSelectionRange: vi.fn(),
      remove: vi.fn(),
    };
    const bodyMock = {
      appendChild: vi.fn(),
    };

    vi.stubGlobal('document', {
      activeElement: null,
      createElement: vi.fn().mockReturnValue(textareaMock),
      body: bodyMock,
      execCommand: execCommandMock,
    });

    const host = { parentElement: null } as unknown as HTMLElement;
    const result = await writeToClipboard('fallback test', host);
    expect(result).toBe(true);
    expect(execCommandMock).toHaveBeenCalledWith('copy');
    expect(textareaMock.select).toHaveBeenCalled();
    expect(textareaMock.setSelectionRange).toHaveBeenCalledWith(0, 13);
    expect(textareaMock.remove).toHaveBeenCalled();
  });
});
