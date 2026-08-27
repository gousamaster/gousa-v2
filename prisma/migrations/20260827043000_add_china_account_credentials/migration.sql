ALTER TABLE china_tramite_operativo
  ADD COLUMN IF NOT EXISTS correo_cuenta TEXT,
  ADD COLUMN IF NOT EXISTS contrasena_cuenta TEXT;
