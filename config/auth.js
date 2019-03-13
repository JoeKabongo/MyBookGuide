module.exports = {
    ensureAuthenticated: function(req, res, next){
        if(req.isAuthenticated()){
            return next();
        }
        req.flash('error_msg', 'please login to view this ressource');
        res.redirect('/users/login')
    }
}

