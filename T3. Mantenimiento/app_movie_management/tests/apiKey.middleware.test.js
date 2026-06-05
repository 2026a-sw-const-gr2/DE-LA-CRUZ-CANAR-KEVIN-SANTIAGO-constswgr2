const { crearApiKeyMiddleware } = require('../src/middlewares/apiKey.middleware');

function crearRespuesta() {
  return {
    status: jest.fn().mockReturnThis(),
    json: jest.fn(),
  };
}

describe('apiKey.middleware', () => {
  test('rechaza solicitudes sin cabecera', () => {
    const middleware = crearApiKeyMiddleware('secreto');
    const req = {
      method: 'GET',
      originalUrl: '/peliculas',
      ip: '127.0.0.1',
      header: jest.fn().mockReturnValue(''),
    };
    const res = crearRespuesta();
    const next = jest.fn();

    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Falta la cabecera X-FIS-EPN-KEY',
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('acepta solicitudes con cabecera valida', () => {
    const middleware = crearApiKeyMiddleware('secreto');
    const req = {
      method: 'GET',
      originalUrl: '/peliculas',
      ip: '127.0.0.1',
      header: jest.fn().mockReturnValue('secreto'),
    };
    const res = crearRespuesta();
    const next = jest.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});