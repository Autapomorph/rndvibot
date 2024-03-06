/* eslint-disable */
try {
  var host = process.env.MONGO_RS_HOST || '127.0.0.1';

  var config = {
    _id: 'rs0',
    version: 1,
    members: [
      {
        _id: 0,
        host,
        priority: 1,
      },
    ],
  };

  rs.initiate(config, { force: true });
  rs.status();
} catch (e) {
  rs.status().ok;
}
