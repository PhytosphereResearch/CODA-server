module.exports = {
  handleError: function (res) {
    return function (error) {
      console.log(error.message);
      return res.status(500).json({ error: error.message });
    };
  },
};
