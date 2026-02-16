import app from '../../api/index.js';

export const handler = async (event, context) => {
  // Remove trailing slash if not root
  if (event.path.endsWith('/') && event.path !== '/') {
    const target = event.path.slice(0, -1);
    return {
      statusCode: 301,
      headers: { Location: target },
    };
  }

  // Parse body
  let body = null;
  if (event.body) {
    try {
      body = JSON.parse(event.body);
    } catch (e) {
      body = event.body;
    }
  }

  // Create serverless request/response
  return new Promise((resolve, reject) => {
    const req = {
      method: event.httpMethod,
      url: event.path,
      headers: event.headers,
      body: body,
      query: event.queryStringParameters || {},
    };

    const res = {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: null,
      json: function(data) {
        this.body = JSON.stringify(data);
        return this;
      },
      status: function(code) {
        this.statusCode = code;
        return this;
      },
    };

    // Handle Express middleware
    const next = (err) => {
      if (err) {
        reject(err);
      } else {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: res.body || '{}',
        });
      }
    };

    // Use Express app
    app(req, res, next);
  });
};
