var AuthenticationController = require('./controllers/authentication'),
    OrgController = require('./controllers/org'),
    TodoController = require('./controllers/todos'),
    express = require('express'),
    passportService = require('../config/passport'),
    passport = require('passport');

var requireAuth = passport.authenticate('jwt', {session: false}),
    requireLogin = passport.authenticate('local', {session: false});

module.exports = function(app) {

    var apiRoutes = express.Router(),
        authRoutes = express.Router(),
        orgRoutes = express.Router(),
        todoRoutes = express.Router();

    // Auth Routes
    apiRoutes.use('/auth', authRoutes);

    authRoutes.post('/register', AuthenticationController.register);
    authRoutes.post('/login', requireLogin, AuthenticationController.login);
    authRoutes.get('/protected', requireAuth, AuthenticationController.protected);

    // Org Routes
    apiRoutes.use('/org', orgRoutes);

    orgRoutes.get('/', requireAuth, AuthenticationController.roleAuthorization(['reader','creator','editor']), OrgController.getOrgs);
    orgRoutes.get('/:org_id', requireAuth, AuthenticationController.roleAuthorization(['reader','creator','editor']), OrgController.getOrgById);
    orgRoutes.post('/', requireAuth, OrgController.createOrg);
    orgRoutes.delete('/', requireAuth, AuthenticationController.roleAuthorization(['editor']), OrgController.deleteOrg);

    // Todo Routes
    apiRoutes.use('/todos', todoRoutes);

    todoRoutes.get('/', requireAuth, AuthenticationController.roleAuthorization(['reader','creator','editor']), TodoController.getTodos);
    todoRoutes.post('/', requireAuth, AuthenticationController.roleAuthorization(['creator','editor']), TodoController.createTodo);
    todoRoutes.delete('/:todo_id', requireAuth, AuthenticationController.roleAuthorization(['editor']), TodoController.deleteTodo);

    // Set up routes
    app.use('/api', apiRoutes);

}
