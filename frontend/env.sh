#!/bin/sh
# Environment variable injection script for runtime configuration

# Create a JavaScript file with environment variables
cat <<EOF > /usr/share/nginx/html/env-config.js
window._env_ = {
  REACT_APP_API_URL: "${REACT_APP_API_URL}",
  REACT_APP_GOOGLE_CLIENT_ID: "${REACT_APP_GOOGLE_CLIENT_ID}"
};
EOF

echo "Environment variables injected successfully"
