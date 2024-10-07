var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

/* GET about page. */
router.get('/about', function(req, res, next) {
  const aboutData = {
    title: 'About Us',
    description: 'vro.',
    team: [
      { name: 'hi', role: 'vro' },
      { name: 'greetings', role: 'zro' },
      { name: 'hello', role: 'cro' }
    ]
  };
  res.render('about', aboutData);
});

module.exports = router;