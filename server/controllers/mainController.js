/**
 * GET /
 * Homepage
 */
exports.homepage = async (req, res) => { 
    const locals = {
        title: "Notas",
        description: "Aplicativo de Notas.",
    }
    res.render('index', {
        locals,
        layout:'../views/layouts/front-page'
    });
}

/**
 * GET /
 * About
 */
exports.about = async (req, res) => { 
    const locals = {
        title: "About - Notas",
        description: "Aplicativo de Notas.",
    }
    res.render('about', locals);
}