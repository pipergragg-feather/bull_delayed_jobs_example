echo 'export EB_ENVIRONMENT="worker-qa"' >> $BASH_ENV
echo 'export EB_APPLICATION_NAME="worker"' >> $BASH_ENV
echo 'export NODE_ENV="qa"' >> $BASH_ENV
source $BASH_ENV