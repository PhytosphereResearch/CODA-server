const {
    InvalidTokenError,
} = require("express-oauth2-jwt-bearer");

const errorHandler = (error, request, response) => {
    if (error instanceof InvalidTokenError) {
        const message = "Bad credentials";

        response.status(error.status).json({ message });

        return;
    }

    const status = 500;
    const message = "Internal Server Error";

    response.status(status).json({ message });
};

module.exports = {
    errorHandler,
};
