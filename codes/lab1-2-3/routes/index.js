var express = require('express');
var router = express.Router();
const { checkLoginSession } = require('../middlewares/auth');

router.get('/', checkLoginSession, function (req, res) {
  res.render('index', { layout: 'home_layout' });
});

router.get('/admin', checkLoginSession, (req, res) => {
  if (req.session.role !== 'admin') {
    return res.status(403).send('Forbidden: admin role is required.');
  }
  res.render('admin');
})

router.get('/user', checkLoginSession, (req, res) => {
  if (req.session.role !== 'user') {
    return res.status(403).send('Forbidden: user role is required.');
  }
  res.render('user');
})

module.exports = router;
