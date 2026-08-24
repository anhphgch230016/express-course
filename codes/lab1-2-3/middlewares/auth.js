//check login only
const checkLoginSession = (req, res, next) => {
   if (req.session.username) {
      return next();
   } else {
      return res.redirect('/auth/login');
   }
}

//check single role
const checkSingleSession = (req, res, next) => {
   if (!req.session.username) {
      return res.redirect('/auth/login');
   }

   if (req.session.role === 'admin') {
      return next();
   }

   return res.status(403).send('Forbidden: admin role is required.');
}

//check multiple roles
const checkMultipleSession = (allowedRoles) => (req, res, next) => {
   if (!req.session.username) {
      return res.redirect('/auth/login');
   }

   if (allowedRoles.includes(req.session.role)) {
      return next();
   }

   return res.status(403).send('Forbidden: you do not have permission to access this page.');
}

module.exports = {
   checkLoginSession,
   checkSingleSession,
   checkMultipleSession
}

