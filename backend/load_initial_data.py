import os
import django
from django.db import connection

# Initialize Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'system.settings')
django.setup()

def load_initial_data():
    sql_file_path = os.path.join('sample_data', 'initial_data.sql')
    with open(sql_file_path, 'r') as sql_file:
        sql_commands = sql_file.read()
        sql_statements = sql_commands.split(';')
        with connection.cursor() as cursor:
            for statement in sql_statements:
                if statement.strip():
                    cursor.execute(statement)
    print('Successfully loaded initial data from SQL file')

if __name__ == '__main__':
    load_initial_data()
