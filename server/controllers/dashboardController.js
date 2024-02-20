/**
 * GET /
 * Dashboard
 */
exports.dashboard = async (req, res) => { 
    const locals = {
        title: "Dashboard",
        description: "Aplicativo de Notas.",
    }
    res.render('dashboard/index', {
        locals,
        layout:'../views/layouts/dashboard'
    });
}
