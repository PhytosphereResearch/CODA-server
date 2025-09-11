 const bufferToString = (buffer) => {
    if (!buffer || !buffer.data) {
        return '';
    }
    // @ts-expect-error typescript doesn't think uint16 is a number
    return String.fromCharCode.apply(null, new Uint16Array(buffer.data));
};

module.exports = { bufferToString }