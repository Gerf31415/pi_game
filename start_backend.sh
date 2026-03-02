#!/usr/bin/env bash
# Start the Django development server
set -e
cd "$(dirname "$0")/backend"
python3 manage.py migrate
python3 manage.py runserver 8000
