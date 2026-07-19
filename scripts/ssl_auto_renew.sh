#!/bin/bash
# Script to auto-renew SSL/TLS certificates using Certbot

# Ensure script is run as root
if [ "$EUID" -ne 0 ]; then
  echo "Please run as root"
  exit
fi

echo "Starting SSL/TLS certificate auto-renewal process..."

# Run certbot renew
certbot renew --quiet --no-self-upgrade

if [ $? -eq 0 ]; then
    echo "Certificates successfully checked/renewed."
    
    # Reload web server (Nginx or Apache) to apply new certificates if they were renewed
    if systemctl is-active --quiet nginx; then
        echo "Reloading Nginx..."
        systemctl reload nginx
    elif systemctl is-active --quiet apache2; then
        echo "Reloading Apache2..."
        systemctl reload apache2
    else
        echo "No supported web server found running to reload."
    fi
else
    echo "Error occurred during certificate renewal."
    exit 1
fi

echo "Auto-renewal process complete."
