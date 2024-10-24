const csrf = require('csurf');
//  Handles the core functionality of CSRF protection by generating and validating tokens.

const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

export default csrfProtection;