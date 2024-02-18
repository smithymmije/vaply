/**
 * GET /
 * Homepage
 */
exports.homepage = async (req, res) => { 
    const locals = {
        title: "Notas",
        description: "Aplicativo de Notas.",
    }

    res.render('index', locals);
}