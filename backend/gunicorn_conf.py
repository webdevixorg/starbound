import multiprocessing

# The socket file where Nginx will talk to Gunicorn
bind = "unix:/run/gunicorn/logivis.sock"

# Number of worker processes (usually 2 x cores + 1)
workers = multiprocessing.cpu_count() * 2 + 1

# Logging - using the directory we created earlier
accesslog = "/var/log/logivis/gunicorn-access.log"
errorlog = "/var/log/logivis/gunicorn-error.log"

# Worker class
worker_class = "sync"

# Restart workers if they take too long
timeout = 30