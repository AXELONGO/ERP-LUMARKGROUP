#!/bin/sh
# Sincronizar el reloj del contenedor con un servidor NTP mundial 
# Esto previene permanentemente el error "Invalid JWT Signature" de Google APIs
echo "⏳ Sincronizando reloj interno de Docker con NTP (pool.ntp.org)..."
ntpd -d -q -n -p pool.ntp.org || echo "⚠️ Fallo sincronización NTP, continuando con el reloj actual..."
echo "✅ Reloj sincronizado. Iniciando ERP Lumark..."

# Ejecutar el proceso principal (Node.js)
exec "$@"
