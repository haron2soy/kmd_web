#!/bin/bash
# Load conda functions
source /home/haron/miniconda3/etc/profile.d/conda.sh
# Activate the environment
conda activate rsmc-env

# Run Gunicorn
exec /home/haron/miniconda3/envs/rsmc-env/bin/gunicorn \
    rsmc_config.config.wsgi:application \
    --workers 3 \
    --bind unix:/home/haron/kmd/kmd_web/web_service/web_service.sock \
    --access-logfile /home/haron/kmd/kmd_web/web_service/gunicorn_access.log \
    --error-logfile /home/haron/kmd/kmd_web/web_service/gunicorn_error.log
