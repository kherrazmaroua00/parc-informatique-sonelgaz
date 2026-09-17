const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  const token = authHeader.split(' ')[1]; // format: "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: 'Token manquant' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attaches { id_utilisateur, role, id_structure } to the request
    next(); // token valid, let the request continue to the controller
  } catch (error) {
    return res.status(403).json({ message: 'Token invalide ou expire' });
  }
}

function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acces reserve a l\'administrateur' });
  }
  next();
}

module.exports = { verifyToken, requireAdmin };