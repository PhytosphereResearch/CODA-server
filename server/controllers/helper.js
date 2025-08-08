module.exports = {
  handleError(res) {
    return function (error) {
      console.log("ERROR");
      console.log(error.message);
      return res.status(500).json({ error: error.message });
    };
  },
};
