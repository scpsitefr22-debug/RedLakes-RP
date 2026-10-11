import { BadGatewayException, NotFoundException } from '@nestjs/common';
import { SkinsService } from './skins.service';

const textures = Buffer.from(
  JSON.stringify({
    textures: { SKIN: { url: 'http://textures.minecraft.net/texture/abc' } },
  }),
).toString('base64');

function reply(status: number, body?: unknown) {
  return {
    status,
    ok: status >= 200 && status < 300,
    json: () => Promise.resolve(body),
  } as Response;
}

const profile = reply(200, { id: 'uuid-1', name: 'Dellioss' });
const session = reply(200, {
  properties: [{ name: 'textures', value: textures }],
});

describe('SkinsService', () => {
  const realFetch = global.fetch;
  let fetchMock: jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers({ advanceTimers: true });
    fetchMock = jest.fn();
    global.fetch = fetchMock;
  });
  afterEach(() => {
    jest.useRealTimers();
    global.fetch = realFetch;
  });

  it('reads the skin from Mojang, in https', async () => {
    fetchMock.mockResolvedValueOnce(profile).mockResolvedValueOnce(session);
    const skin = await new SkinsService().find('Dellioss');
    expect(skin).toEqual({
      username: 'Dellioss',
      uuid: 'uuid-1',
      skinUrl: 'https://textures.minecraft.net/texture/abc',
      slim: false,
    });
  });

  it('retries once when Mojang rate-limits', async () => {
    fetchMock
      .mockResolvedValueOnce(reply(429))
      .mockResolvedValueOnce(profile)
      .mockResolvedValueOnce(session);
    await expect(new SkinsService().find('Dellioss')).resolves.toMatchObject({
      uuid: 'uuid-1',
    });
  });

  it('falls back to the second lookup when the first keeps failing', async () => {
    fetchMock
      .mockResolvedValueOnce(reply(429))
      .mockResolvedValueOnce(reply(429))
      .mockResolvedValueOnce(profile)
      .mockResolvedValueOnce(session);
    await new SkinsService().find('Dellioss');
    const urls = (fetchMock.mock.calls as [string][]).map(([url]) => url);
    expect(urls[2]).toContain('api.minecraftservices.com');
  });

  it('answers not found for an unknown name and caches it', async () => {
    fetchMock.mockResolvedValue(reply(404));
    const service = new SkinsService();
    await expect(service.find('zqxq_nope_42')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    await expect(service.find('zqxq_nope_42')).rejects.toBeInstanceOf(
      NotFoundException,
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('reports Mojang as unavailable and does not hammer it', async () => {
    fetchMock.mockResolvedValue(reply(503));
    const service = new SkinsService();
    await expect(service.find('Notch')).rejects.toBeInstanceOf(
      BadGatewayException,
    );
    const calls = fetchMock.mock.calls.length;
    await expect(service.find('Notch')).rejects.toBeInstanceOf(
      BadGatewayException,
    );
    expect(fetchMock.mock.calls.length).toBe(calls);
  });
});
