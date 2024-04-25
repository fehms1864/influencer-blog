var records = [
  { id: 1, username: 'mschultz', password: 'password', displayName: 'Maxon Schultz', email: 'mschultz@example.com' },
  { id: 2, username: 'cpittman', password: '1234', displayName: 'Crystal Pittman', email: 'cpittman@example.com' },
  { id: 3, username: 'fhasan', password: 'birthday', displayName: 'Fehmina Hasan', email: 'fhasan@example.com' },
];

exports.findById = function(id, cb) {
  process.nextTick(function() {
    var idx = id - 1;
    if (records[idx]) {
      cb(null, records[idx]);
    } else {
      cb(new Error('User ' + id + ' does not exist'));
    }
  });
}

exports.findByUsername = function(username, cb) {
  process.nextTick(function() {
    for (var i = 0, len = records.length; i < len; i++) {
      var record = records[i];
      if (record.username === username) {
        return cb(null, record);
      }
    }
    return cb(null, null);
  });
}

exports.addUser = function(newUser, cb) {
  process.nextTick(function() {
    newUser.id = records.length + 1;
    records.push(newUser);
    cb(null, newUser);
  });
}

module.exports = exports;