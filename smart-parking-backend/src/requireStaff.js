// Guards staff/admin endpoints with a shared PIN when STAFF_PIN is set.
// With no STAFF_PIN (local dev) everything stays open.
export function requireStaff(req, res, next) {
  const pin = process.env.STAFF_PIN;
  if (!pin || req.get('x-staff-pin') === pin) return next();
  res.status(401).json({ error: 'Staff PIN required' });
}
