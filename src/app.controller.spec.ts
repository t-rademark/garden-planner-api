import { AppController } from './app.controller';

describe('AppController', () => {
  const controller = new AppController();

  it('returns the authenticated profile claims', () => {
    expect(
      controller.profile({
        user: {
          sub: 'auth0|user-a',
          aud: 'garden-planner-api',
          iss: 'https://example.auth0.com/',
        },
      }),
    ).toEqual({
      sub: 'auth0|user-a',
      aud: 'garden-planner-api',
      iss: 'https://example.auth0.com/',
    });
  });
});
