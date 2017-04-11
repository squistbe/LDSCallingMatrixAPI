var AuthenticationController = require('./controllers/authentication'),
    UnitController = require('./controllers/unit'),
    OrgController = require('./controllers/org'),
    TodoController = require('./controllers/todos'),
    UploadController = require('./controllers/upload'),
    express = require('express'),
    passportService = require('../config/passport'),
    passport = require('passport'),
    multer = require('multer');

var requireAuth = passport.authenticate('jwt', {session: false}),
    requireLogin = passport.authenticate('local', {session: false});

module.exports = function(app) {
    var apiRoutes = express.Router(),
        authRoutes = express.Router(),
        unitRoutes = express.Router(),
        orgRoutes = express.Router(),
        todoRoutes = express.Router(),
        uploadRoutes = express.Router();

    // Auth Routes
    apiRoutes.use('/auth', authRoutes);

    authRoutes.post('/register', AuthenticationController.register);
    authRoutes.post('/login', requireLogin, AuthenticationController.login);
    authRoutes.get('/protected', requireAuth, AuthenticationController.protected);

    // Unit Routes
    apiRoutes.use('/unit', unitRoutes);

    unitRoutes.get('/members', requireAuth, AuthenticationController.unitAuthorization, UnitController.getUnitMembers);
    unitRoutes.post('/', requireAuth, UnitController.createUnit);
    unitRoutes.delete('/', requireAuth, AuthenticationController.roleAuthorization(['editor']), UnitController.deleteUnit);

    // Org Routes
    apiRoutes.use('/org', orgRoutes);

    orgRoutes.get('/', requireAuth, AuthenticationController.unitAuthorization, OrgController.getOrgs);
    orgRoutes.get('/callings', requireAuth, AuthenticationController.unitAuthorization, OrgController.getOrgCallings);
    orgRoutes.post('/:orgId/calling', requireAuth, AuthenticationController.unitAuthorization, OrgController.addOrgCalling);
    orgRoutes.put('/:orgId/calling/:callingId', requireAuth, AuthenticationController.unitAuthorization, OrgController.updateOrgCalling);
    orgRoutes.delete('/:orgId/calling/:callingId', requireAuth, AuthenticationController.unitAuthorization, OrgController.removeOrgCalling);
    orgRoutes.delete('/:orgId/calling/:callingId/member/:memberId', requireAuth, AuthenticationController.unitAuthorization, OrgController.removeMemberFromCalling);
    orgRoutes.get('/calling/statuses', requireAuth, AuthenticationController.unitAuthorization, OrgController.getCallingStatuses);
    orgRoutes.put('/reorder', requireAuth, AuthenticationController.unitAuthorization, OrgController.reorderOrgs);

    // Upload Routes
    apiRoutes.use('/upload', uploadRoutes);

    uploadRoutes.post('/members',requireAuth, AuthenticationController.unitAuthorization, multer({dest: './uploads/'}).single('file'), UploadController.addMembers);

    // Set up routes
    app.use('/api', apiRoutes);
}
